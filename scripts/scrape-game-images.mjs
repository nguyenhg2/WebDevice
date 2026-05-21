import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const gamesPath = path.join(ROOT, "data", "games.json");
const imagesPath = path.join(ROOT, "data", "game-images.json");
const sourcesPath = path.join(ROOT, "data", "game-image-sources.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const REQUEST_TIMEOUT_MS = 18000;

const officialImageSourceOverrides = {
  fortnite: [
    "https://www.fortnite.com/gallery?category=Screenshots",
    "https://store.epicgames.com/en-US/p/fortnite?lang=en-US",
  ],
  "fifa-online-4": [
    "https://fconline.garena.vn/",
    "https://play.google.com/store/apps/details?id=com.garena.game.fo4mvn&hl=vi&gl=VN",
    "https://apps.apple.com/vn/app/fc-online-m-by-ea-sports/id1427414541",
  ],
};

function decodeHtml(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripTracking(url) {
  try {
    const parsed = new URL(url);
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^(utm_|fbclid|gclid|accountingTag)/i.test(key)) parsed.searchParams.delete(key);
    }
    return parsed.toString();
  } catch {
    return url;
  }
}

function absolutizeUrl(baseUrl, value) {
  if (!value) return "";
  const clean = decodeHtml(value).trim();
  if (!clean || clean.startsWith("data:") || clean.startsWith("blob:")) return "";
  try {
    return stripTracking(new URL(clean, baseUrl).toString());
  } catch {
    return "";
  }
}

function isGoodImage(url, source) {
  const isRemote = /^https?:\/\//i.test(url);
  const isLocal = url.startsWith("/images/");
  if (!isRemote && !isLocal) return false;
  if (source === "catalog-cover") {
    if (!/\.(avif|gif|jpe?g|png|svg|webp)(\?|#|$)/i.test(url)) return false;
  } else if (!/\.(avif|jpe?g|png|webp)(\?|#|$)/i.test(url)) {
    return false;
  }
  if (source !== "catalog-cover" && /favicon|apple-touch-icon|icon[-_.]?\d|sprite|avatar|badge|logo|mark|emblem|social|facebook|twitter|youtube|discord|steamdeck|controller|rating|esrb|pegi/i.test(url)) return false;
  if (isRemote && /(?:^|[?&])(w|width|h|height)=([1-9]\d?|1\d\d)(?:&|$)/i.test(url)) return false;
  if (source !== "catalog-cover" && /\/(icons?|logos?|avatars?|badges?)\//i.test(url)) return false;
  if (source !== "catalog-cover" && /visualwebsiteoptimizer|\/_next\/static\/node_modules\/|\/assets\/(?:media|link|player|download)-square\.svg|\/puzzle\/b\.png/i.test(url)) return false;
  if (source === "official-site" && !/(cmsassets|rgpub|sanity|hoyoverse|fastcdn|upload-static|minecraft|garena|garenanow|cdn|media|images?|screens?|screenshot|gallery|wallpaper|hero|banner|background|key-art|news|assets|content|dam)/i.test(url)) return false;
  return true;
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": "Maynaychoiduoc.vn image importer (local project; official sources only)",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "application/json,text/plain,*/*",
    },
  });
  clearTimeout(timeout);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  const response = await fetch(url, {
    signal: controller.signal,
    headers: {
      "User-Agent": "Maynaychoiduoc.vn image importer (local project; official sources only)",
      "Accept-Language": "en-US,en;q=0.9",
      Accept: "text/html,application/xhtml+xml,*/*",
    },
  });
  clearTimeout(timeout);
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function pushImage(items, url, source, sourceUrl) {
  if (!url) return;
  items.push({ url, source, sourceUrl });
}

async function steamImages(steamId) {
  if (!steamId) return [];
  const items = [];
  const storeUrl = `https://store.steampowered.com/app/${steamId}/`;
  const cdnBase = `https://cdn.akamai.steamstatic.com/steam/apps/${steamId}`;
  for (const asset of [
    "header.jpg",
    "capsule_616x353.jpg",
    "capsule_467x181.jpg",
    "library_600x900.jpg",
    "library_hero.jpg",
    "hero_capsule.jpg",
    "page_bg_generated_v6b.jpg",
  ]) {
    pushImage(items, `${cdnBase}/${asset}`, "steam-cdn-pattern", storeUrl);
  }

  const apiUrl = `https://store.steampowered.com/api/appdetails?appids=${steamId}&filters=basic,screenshots`;
  try {
    const payload = await fetchJson(apiUrl);
    const data = payload?.[steamId]?.data;

    pushImage(items, data?.header_image, "steam-store-api", storeUrl);
    pushImage(items, data?.capsule_image, "steam-store-api", storeUrl);
    pushImage(items, data?.capsule_imagev5, "steam-store-api", storeUrl);
    pushImage(items, data?.background_raw || data?.background, "steam-store-api", storeUrl);

    for (const screenshot of data?.screenshots ?? []) {
      pushImage(items, screenshot?.path_full, "steam-screenshot", storeUrl);
      pushImage(items, screenshot?.path_thumbnail, "steam-screenshot", storeUrl);
    }
  } catch {
    // Keep deterministic CDN candidates even when Steam API blocks or times out.
  }

  try {
    const html = await fetchText(storeUrl);
    for (const image of extractOfficialImages(storeUrl, html)) {
      pushImage(items, image, "steam-store-html", storeUrl);
    }
  } catch {
    // Store HTML is a bonus source; Steam API/CDN candidates remain usable.
  }

  return items;
}

function extractSrcsetImages(baseUrl, value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim().split(/\s+/)[0])
    .map((src) => absolutizeUrl(baseUrl, src))
    .filter(Boolean);
}

function extractJsonLdImages(baseUrl, html) {
  const images = [];
  for (const match of html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      collectJsonImages(JSON.parse(decodeHtml(match[1])), images, baseUrl);
    } catch {
      // Ignore malformed JSON-LD.
    }
  }
  return images;
}

function collectJsonImages(value, images, baseUrl) {
  if (!value) return;
  if (typeof value === "string") {
    const image = absolutizeUrl(baseUrl, value);
    if (image) images.push(image);
    return;
  }
  if (Array.isArray(value)) {
    for (const item of value) collectJsonImages(item, images, baseUrl);
    return;
  }
  if (typeof value !== "object") return;
  for (const key of ["image", "thumbnail", "thumbnailUrl", "screenshot", "logo"]) {
    if (key in value) collectJsonImages(value[key], images, baseUrl);
  }
}

function extractOfficialImages(baseUrl, html) {
  const images = [];
  const attrPatterns = [
    /<meta[^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image|twitter:image:src|image)["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["'](?:og:image|og:image:secure_url|twitter:image|twitter:image:src|image)["'][^>]*>/gi,
    /<link[^>]+rel=["'](?:image_src|preload)["'][^>]+href=["']([^"']+)["'][^>]*>/gi,
    /<img[^>]+(?:src|data-src|data-original|data-lazy-src|data-fullsrc|data-full|data-image)=["']([^"']+)["'][^>]*>/gi,
    /<(?:source|img)[^>]+(?:srcset|data-srcset|data-lazy-srcset)=["']([^"']+)["'][^>]*>/gi,
    /<div[^>]+(?:data-background|data-bg|data-bgset)=["']([^"']+)["'][^>]*>/gi,
    /(?:background|background-image)\s*:\s*url\(([^)]+)\)/gi,
    /["'](https?:\/\/[^"']+\.(?:avif|gif|jpe?g|png|webp)(?:\?[^"']*)?)["']/gi,
  ];

  for (const pattern of attrPatterns) {
    for (const match of html.matchAll(pattern)) {
      const raw = decodeHtml(match[1]).trim().replace(/^["']|["']$/g, "");
      if (raw.includes(",") || /\s+\d+[wx]\b/.test(raw)) {
        images.push(...extractSrcsetImages(baseUrl, raw));
      } else {
        const image = absolutizeUrl(baseUrl, raw);
        if (image) images.push(image);
      }
    }
  }

  images.push(...extractJsonLdImages(baseUrl, html));
  return images;
}

async function officialSiteImages(pageUrl) {
  if (!pageUrl) return [];
  const html = await fetchText(pageUrl);
  return extractOfficialImages(pageUrl, html).map((url) => ({ url, source: "official-site", sourceUrl: pageUrl }));
}

function officialImageUrlsForGame(game) {
  const urls = new Set();
  if (game.officialUrl) urls.add(game.officialUrl);
  for (const url of officialImageSourceOverrides[game.slug] ?? []) urls.add(url);
  return [...urls];
}

async function officialImagesForGame(game) {
  const items = [];
  const errors = [];

  for (const url of officialImageUrlsForGame(game)) {
    try {
      items.push(...await officialSiteImages(url));
    } catch (error) {
      errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  return { items, errors };
}

function scoreImage(item, coverImage) {
  const url = item.url.toLowerCase();
  let score = 0;
  if (item.source === "steam-screenshot") score += 35;
  if (item.source === "steam-store-api") score += 28;
  if (item.source === "steam-store-html") score += 24;
  if (item.source === "steam-cdn-pattern") score += 18;
  if (item.source === "official-site") score += 22;
  if (item.source === "catalog-cover") score += 4;
  if (/screenshot|ss_|gallery|media|screen|carousel|wallpaper|hero|background|capsule|header/.test(url)) score += 12;
  if (/library_600x900|capsule_467x181|thumbnail|thumb|small/.test(url)) score -= 8;
  if (coverImage && url.split("?")[0] === coverImage.split("?")[0].toLowerCase()) score -= 30;
  return score;
}

function dedupeImages(items, coverImage) {
  const byKey = new Map();
  for (const item of items) {
    if (!isGoodImage(item.url, item.source)) continue;
    const key = item.url.split("?")[0].toLowerCase();
    const existing = byKey.get(key);
    if (!existing || scoreImage(item, coverImage) > scoreImage(existing, coverImage)) byKey.set(key, item);
  }

  return [...byKey.values()]
    .sort((a, b) => scoreImage(b, coverImage) - scoreImage(a, coverImage))
    .slice(0, 12);
}

async function main() {
  const games = JSON.parse(await fs.readFile(gamesPath, "utf8"));
  const galleries = {};
  const sources = {};
  const failures = [];

  for (const game of games) {
    const items = [];
    const gameFailures = [];
    if (game.coverImage) {
      pushImage(items, game.coverImage, "catalog-cover", game.officialUrl || "data/games.json");
    }

    try {
      items.push(...await steamImages(game.steamId));
    } catch (error) {
      gameFailures.push(`steam: ${error instanceof Error ? error.message : String(error)}`);
    }

    const official = await officialImagesForGame(game);
    items.push(...official.items);
    if (official.items.length === 0 && official.errors.length) {
      gameFailures.push(`official: ${official.errors.join("; ")}`);
    }

    const clean = dedupeImages(items, game.coverImage);
    if (clean.length) {
      galleries[game.slug] = clean.map((item) => item.url);
      sources[game.slug] = clean.map((item) => ({ url: item.url, source: item.source, sourceUrl: item.sourceUrl }));
      if (process.env.SCRAPE_VERBOSE_FAILURES === "1" && gameFailures.length) {
        failures.push(`${game.slug} ${gameFailures.join("; ")}`);
      }
    } else if (gameFailures.length) {
      failures.push(`${game.slug} ${gameFailures.join("; ")}`);
    }

    const sourceCount = new Set(clean.map((item) => item.source)).size;
    console.log(`${game.name}: ${clean.length} images from ${sourceCount} source types`);
    await sleep(350);
  }

  if (Object.keys(galleries).length === 0) {
    throw new Error("No game images were scraped; keeping existing data untouched.");
  }

  await fs.writeFile(imagesPath, `${JSON.stringify(galleries, null, 2)}\n`, "utf8");
  await fs.writeFile(sourcesPath, `${JSON.stringify(sources, null, 2)}\n`, "utf8");
  console.log(`Wrote image galleries for ${Object.keys(galleries).length} games.`);
  if (failures.length) console.log(`Failures:\n${failures.slice(0, 80).join("\n")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
