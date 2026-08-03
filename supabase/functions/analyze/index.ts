import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://www.gptimagen.online",
  "https://gptimagen.online",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

const BLOCKED_HOSTS = [
  "localhost",
  "127.0.0.1",
  "0.0.0.0",
  "169.254.169.254",  // AWS metadata
  "metadata.google.internal",
  "10.",
  "192.168.",
  "172.16.",
  "172.17.",
  "172.18.",
  "172.19.",
  "172.20.",
  "172.21.",
  "172.22.",
  "172.23.",
  "172.24.",
  "172.25.",
  "172.26.",
  "172.27.",
  "172.28.",
  "172.29.",
  "172.30.",
  "172.31.",
];

function getCorsHeaders(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  const allowed = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowed,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
}

function isValidUrl(urlStr: string): boolean {
  try {
    const u = new URL(urlStr);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    for (const blocked of BLOCKED_HOSTS) {
      if (u.hostname === blocked || u.hostname.startsWith(blocked)) return false;
    }
    return true;
  } catch {
    return false;
  }
}

interface MediaItem {
  id: string;
  url: string;
  thumbnail: string;
  filename: string;
  resolution?: string;
  size?: number;
  type: "image" | "video";
}

function extractMedia(html: string, sourceUrl: string): MediaItem[] {
  const mediaItems: MediaItem[] = [];
  const seenUrls = new Set<string>();

  const addMedia = (
    itemUrl: string,
    type: "image" | "video",
    filenameHint = "media"
  ) => {
    if (!itemUrl || itemUrl.startsWith("data:")) return;

    let fullUrl = itemUrl;
    try {
      if (itemUrl.startsWith("//")) {
        fullUrl = `https:${itemUrl}`;
      } else if (itemUrl.startsWith("/")) {
        fullUrl = `${new URL(sourceUrl).origin}${itemUrl}`;
      }
    } catch {
      return;
    }

    const lowerUrl = fullUrl.toLowerCase();
    if (
      lowerUrl.includes("favicon") ||
      lowerUrl.includes("logo") ||
      lowerUrl.includes("icon") ||
      lowerUrl.includes(".svg") ||
      lowerUrl.includes("badge") ||
      lowerUrl.includes("payment") ||
      lowerUrl.includes("sponsor")
    )
      return;

    if (seenUrls.has(fullUrl)) return;
    seenUrls.add(fullUrl);

    const id = crypto.randomUUID();
    let ext = type === "image" ? "jpg" : "mp4";
    if (lowerUrl.includes(".png")) ext = "png";
    if (lowerUrl.includes(".webp")) ext = "webp";
    if (lowerUrl.includes(".gif")) ext = "gif";

    mediaItems.push({
      id,
      url: fullUrl,
      thumbnail: type === "image" ? fullUrl : "",
      filename: `${filenameHint}-${id.slice(0, 5)}.${ext}`,
      type,
    });
  };

  // 1. Open Graph & Twitter
  const ogImageMatch = html.match(
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogImageMatch) addMedia(ogImageMatch[1], "image", "og-image");

  const ogVideoMatch = html.match(
    /<meta[^>]+property=["']og:video["'][^>]+content=["']([^"']+)["']/i
  );
  if (ogVideoMatch) addMedia(ogVideoMatch[1], "video", "og-video");

  const twitterImageMatch = html.match(
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["']/i
  );
  if (twitterImageMatch) addMedia(twitterImageMatch[1], "image", "tw-image");

  // 2. <img> tags inside main/article/gallery
  const imgTagRegex = /<img[^>]+src=["']([^"']+)["']/gi;
  const contentAreaRegex =
    /<(?:main|article)[^>]*>[\s\S]*?<\/\1>/gi;
  const contentAreas = html.match(contentAreaRegex);

  if (contentAreas) {
    for (const area of contentAreas) {
      let match: RegExpExecArray | null;
      const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
      while ((match = imgRegex.exec(area)) !== null) {
        addMedia(match[1], "image", "content-img");
      }
    }
  }

  // 3. Fallback: all img tags if none found
  if (mediaItems.length === 0) {
    let match: RegExpExecArray | null;
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let count = 0;
    while ((match = imgRegex.exec(html)) !== null && count < 30) {
      addMedia(match[1], "image", "img");
      count++;
    }
  }

  // 4. <video source> tags
  const srcRegex = /<source[^>]+src=["']([^"']+)["'][^>]*type=["']video\//gi;
  let vidMatch: RegExpExecArray | null;
  while ((vidMatch = srcRegex.exec(html)) !== null) {
    addMedia(vidMatch[1], "video", "content-vid");
  }

  // 5. Fallback regex for raw URLs
  if (mediaItems.length === 0) {
    const urlRegex =
      /(https?:\/\/[^"'\s\\]+\.(?:jpg|jpeg|png|webp|gif|mp4|webm)(?:[?&#][^"'\s\\]*)?)/gi;
    const matches = html.match(urlRegex);
    if (matches) {
      const unique = [...new Set(matches)];
      unique.slice(0, 30).forEach((matchUrl) => {
        const type = /\.(mp4|webm)/i.test(matchUrl) ? "video" : "image";
        addMedia(matchUrl, type, "extracted");
      });
    }
  }

  // 6. YouTube mock (since actual streams are obfuscated)
  if (sourceUrl.includes("youtube.com") || sourceUrl.includes("youtu.be")) {
    addMedia(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      "video",
      "yt-mock"
    );
    addMedia(
      "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      "video",
      "yt-mock2"
    );
  }

  return mediaItems;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { status: 200, headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: getCorsHeaders(req),
    });
  }

  try {
    const body = await req.json();
    const { url } = body as { url?: string };

    if (!url || typeof url !== "string") {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    if (!isValidUrl(url)) {
      return new Response(
        JSON.stringify({ error: "Invalid URL. Must be a valid http/https URL." }),
        { status: 400, headers: getCorsHeaders(req) }
      );
    }

    // Fetch the target page
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    let html: string;
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        },
        signal: controller.signal,
        redirect: "follow",
      });
      html = await response.text();
    } catch (err) {
      clearTimeout(timeout);
      const msg =
        err instanceof DOMException && err.name === "AbortError"
          ? "Request timed out. The website may be too slow or blocking requests."
          : "Failed to fetch the webpage. It might be protected, invalid, or blocking server-side requests.";
      return new Response(JSON.stringify({ error: msg }), {
        status: 422,
        headers: getCorsHeaders(req),
      });
    } finally {
      clearTimeout(timeout);
    }

    const media = extractMedia(html, url);

    return new Response(JSON.stringify({ media }), {
      status: 200,
      headers: getCorsHeaders(req),
    });
  } catch (error) {
    console.error("Analyze error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred." }),
      { status: 500, headers: getCorsHeaders(req) }
    );
  }
});
