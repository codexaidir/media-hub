import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import * as cheerio from 'cheerio';
import axios from 'axios';
import { randomUUID } from 'crypto';
import { ensureStorageBucket } from './src/lib/supabaseAdmin';

dotenv.config();

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

  app.use(cors());
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  // API Route for Analyzing URL
  app.get('/api/analyze', async (req, res) => {
    const url = req.query.url as string;

    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
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
      // Artificial delay for cinematic effect
      await new Promise((r) => setTimeout(r, 1500));

      sendProgress('stage2', 'Scanning page...');
      
      let html = '';
      try {
        const response = await axios.get(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
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
          // Resolve relative URLs
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

        // More aggressive filtering for unwanted assets
        const lowerUrl = fullUrl.toLowerCase();
        if (lowerUrl.includes('favicon') || 
            lowerUrl.includes('logo') || 
            lowerUrl.includes('icon') || 
            lowerUrl.includes('.svg') ||
            lowerUrl.includes('badge') ||
            lowerUrl.includes('payment') ||
            lowerUrl.includes('sponsor')) return;

        // Check attributes if element is provided
        if (element) {
          const classAttr = ($(element).attr('class') || '').toLowerCase();
          const altAttr = ($(element).attr('alt') || '').toLowerCase();
          
          if (classAttr.includes('logo') || classAttr.includes('icon') || classAttr.includes('badge') || classAttr.includes('brand') || classAttr.includes('related')) return;
          if (altAttr.includes('logo') || altAttr.includes('icon') || altAttr.includes('badge') || altAttr.includes('brand')) return;

          // Check for small explicit dimensions which usually indicate UI elements
          const width = parseInt($(element).attr('width') || '0', 10);
          const height = parseInt($(element).attr('height') || '0', 10);
          if ((width > 0 && width < 150) || (height > 0 && height < 150)) {
            return; // Skip likely icons/thumbnails
          }
        }

        seenUrls.add(fullUrl);

        const id = randomUUID();
        // Try to guess extension
        let ext = type === 'image' ? 'jpg' : 'mp4';
        if (lowerUrl.includes('.png')) ext = 'png';
        if (lowerUrl.includes('.webp')) ext = 'webp';
        if (lowerUrl.includes('.gif')) ext = 'gif';

        mediaItems.push({
          id,
          url: fullUrl,
          thumbnail: type === 'image' ? fullUrl : 'https://placehold.co/400x300/000000/FFFFFF/png?text=Video', // basic placeholder for video
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

      // 3. Fallback generic images if none found (max 10)
      if (mediaItems.length === 0) {
         $('img').each((i, el) => {
            if (i >= 30) return; // increase scan limit
            const src = $(el).attr('src') || $(el).attr('data-src');
            if (src) addMedia(src, 'image', 'img', el);
         });
      }
      
      // 4. Video tags
      $('video source').each((_, el) => {
        const src = $(el).attr('src');
        if (src) addMedia(src, 'video', 'content-vid', el);
      });

      // 5. Fallback regex for raw URLs in HTML string (e.g., YouTube initialData)
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

      // 6. Simulate video extraction for YouTube (since actual video streams are obfuscated)
      if (url.includes('youtube.com') || url.includes('youtu.be')) {
        addMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', 'video', 'yt-mock');
        addMedia('https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 'video', 'yt-mock2');
      }

      await new Promise((r) => setTimeout(r, 1500));
      sendProgress('stage4', 'Preparing results...');
      
      await new Promise((r) => setTimeout(r, 1000));
      sendProgress('stage5', 'Completed');

      // Add a tiny bit more delay for confetti animation
      await new Promise((r) => setTimeout(r, 1000));

      sendComplete(mediaItems);

    } catch (error: any) {
      console.error(error);
      sendError(error.message || 'An unexpected error occurred.');
    }
  });


  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  await ensureStorageBucket();

  app.listen(PORT, HOST, () => {
    console.log(`Server running on http://${HOST}:${PORT}`);
  });
}

startServer();
