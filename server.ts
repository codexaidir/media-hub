import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { randomUUID } from 'crypto';

// Initialize env before anything else
dotenv.config();

const ALLOWED_ORIGINS = [
  process.env.APP_URL || 'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://localhost:5173',
];

const BLOCKED_HOSTS = [
  'localhost', '127.0.0.1', '0.0.0.0',
  '169.254.169.254',  // AWS metadata
  'metadata.google.internal',
  '10.', '192.168.',
  '172.16.', '172.17.', '172.18.', '172.19.', '172.20.', '172.21.',
  '172.22.', '172.23.', '172.24.', '172.25.', '172.26.', '172.27.',
  '172.28.', '172.29.', '172.30.', '172.31.',
];

function isValidTargetUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== 'http:' && u.protocol !== 'https:') return false;
    for (const blocked of BLOCKED_HOSTS) {
      if (u.hostname === blocked || u.hostname.startsWith(blocked)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
function rateLimit(ip: string, maxRequests = 20, windowMs = 60000): boolean {
  const now = Date.now();
  let entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + windowMs });
    return false;
  }
  entry.count++;
  return entry.count > maxRequests;
}

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  filename: string;
  resolution?: string;
  size?: number;
  type: 'image' | 'video';
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT || 3000);
  const HOST = process.env.HOST || '0.0.0.0';

  // Security middleware
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    next();
  });

  app.use(express.json());

  // CORS - restricted to allowed origins
  app.use((req, res, next) => {
    const origin = req.headers.origin ?? '';
    if (ALLOWED_ORIGINS.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }
    next();
  });

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API Route for Analyzing URL (local dev only — production uses Supabase Edge Function)
  app.get('/api/analyze', async (req, res) => {
    const url = req.query.url as string;
    const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';

    if (!url) {
      return res.status(400).json({ type: 'error', message: 'URL is required' });
    }

    if (!isValidTargetUrl(url)) {
      return res.status(400).json({ type: 'error', message: 'Invalid URL' });
    }

    if (rateLimit(clientIp)) {
      return res.status(429).json({ type: 'error', message: 'Too many requests. Please wait a moment.' });
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    const sendProgress = (stage: string, message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'progress', stage, message })}\n\n`);
    };

    const sendComplete = (media: MediaItem[]) => {
      res.write(`data: ${JSON.stringify({ type: 'complete', media })}\n\n`);
      res.end();
    };

    const sendError = (message: string) => {
      res.write(`data: ${JSON.stringify({ type: 'error', message })}\n\n`);
      res.end();
    };

    try {
      sendProgress('stage1', 'Analyzing URL...');
      await new Promise((r) => setTimeout(r, 1500));

      sendProgress('stage2', 'Scanning page...');

      let html = '';
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
          },
          timeout: 10000,
        });
        html = response.data;
      } catch (err) {
        throw new Error('Failed to fetch the webpage. It might be protected or invalid.');
      }

      await new Promise((r) => setTimeout(r, 1500));
      sendProgress('stage3', 'Finding downloadable media...');

      const $ = cheerio.load(html);
      const mediaItems: MediaItem[] = [];
      const seenUrls = new Set<string>();

      const addMedia = (itemUrl: string, type: 'image' | 'video', filenameHint: string = 'media', element?: any) => {
        if (!itemUrl || itemUrl.startsWith('data:')) return;

        let fullUrl = itemUrl;
        try {
          if (itemUrl.startsWith('//')) {
            fullUrl = `https:${itemUrl}`;
          } else if (itemUrl.startsWith('/')) {
            const baseUrl = new URL(url).origin;
            fullUrl = `${baseUrl}${itemUrl}`;
          }
        } catch(e) {
          return;
        }

        if (seenUrls.has(fullUrl)) return;

        const lowerUrl = fullUrl.toLowerCase();
        if (lowerUrl.includes('favicon') || 
            lowerUrl.includes('logo') || 
            lowerUrl.includes('icon') || 
            lowerUrl.includes('.svg') ||
            lowerUrl.includes('badge') ||
            lowerUrl.includes('payment') ||
            lowerUrl.includes('sponsor')) return;

        if (element) {
          const classAttr = ($(element).attr('class') || '').toLowerCase();
          const altAttr = ($(element).attr('alt') || '').toLowerCase();
          
          if (classAttr.includes('logo') || classAttr.includes('icon') || classAttr.includes('badge') || classAttr.includes('brand') || classAttr.includes('related')) return;
          if (altAttr.includes('logo') || altAttr.includes('icon') || altAttr.includes('badge') || altAttr.includes('brand')) return;

          const width = parseInt($(element).attr('width') || '0', 10);
          const height = parseInt($(element).attr('height') || '0', 10);
          if ((width > 0 && width < 150) || (height > 0 && height < 150)) {
            return;
          }
        }

        seenUrls.add(fullUrl);

        const id = randomUUID();
        let ext = type === 'image' ? 'jpg' : 'mp4';
        if (lowerUrl.includes('.png')) ext = 'png';
        if (lowerUrl.includes('.webp')) ext = 'webp';
        if (lowerUrl.includes('.gif')) ext = 'gif';

        mediaItems.push({
          id,
          url: fullUrl,
          thumbnail: type === 'image' ? fullUrl : 'https://placehold.co/400x300/000000/FFFFFF/png?text=Video',
          filename: `${filenameHint}-${id.slice(0, 5)}.${ext}`,
          type
        });
      };

      // 1. Open Graph
      const ogImage = $('meta[property="og:image"]').attr('content');
      if (ogImage) addMedia(ogImage, 'image', 'og-image');
      
      const ogVideo = $('meta[property="og:video"]').attr('content');
      if (ogVideo) addMedia(ogVideo, 'video', 'og-video');
      
      const twitterImage = $('meta[name="twitter:image"]').attr('content');
      if (twitterImage) addMedia(twitterImage, 'image', 'tw-image');

      // 2. Main content images
      $('main img, article img, .gallery img, .product img, .product-single__media img').each((_, el) => {
        const src = $(el).attr('src') || $(el).attr('data-src');
        if (src) addMedia(src, 'image', 'content-img', el);
      });

      // 3. Fallback generic images
      if (mediaItems.length === 0) {
         $('img').each((i, el) => {
            if (i >= 30) return;
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) addMedia(src, 'image', 'img', el);
         });
      }
      
      // 4. Video tags
      $('video source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) addMedia(src, 'video', 'content-vid', el);
      });

      // 5. Fallback regex
      if (mediaItems.length === 0) {
        const urlRegex = /(https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp|gif|mp4|webm)(?:[?&#][^"'\s\\]*)?)/gi;
        const matches = html.match(urlRegex);
        if (matches) {
          const uniqueUrls = [...new Set(matches)];
          uniqueUrls.slice(0, 30).forEach((matchUrl) => {
             const type = matchUrl.match(/\.(mp4|webm)/i) ? 'video' : 'image';
             addMedia(matchUrl, type, 'extracted');
          });
        }
      }

      // 6. YouTube mock
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        addMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video', 'yt-mock');
        addMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'video', 'yt-mock2');
      }

      await new Promise((r) => setTimeout(r, 1500));
      sendProgress('stage4', 'Preparing results...');
      
      await new Promise((r) => setTimeout(r, 1000));
      sendProgress('stage5', 'Completed');

      await new Promise((r) => setTimeout(r, 1000));
      sendComplete(mediaItems);

    } catch (error: any) {
      console.error(error);
      sendError(error.message || 'An unexpected error occurred.');
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Ensure storage bucket (non-blocking — don't crash server if it fails)
  try {
    const { ensureStorageBucket } = await import('./src/lib/supabaseAdmin.js');
    await ensureStorageBucket().catch((err: any) => {
      console.warn('Failed to ensure storage bucket (non-critical):', err.message);
    });
  } catch (err) {
    console.warn('Storage bucket setup skipped (supabaseAdmin not available):', err);
  }

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
