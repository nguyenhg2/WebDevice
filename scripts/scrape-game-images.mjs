import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const gamesPath = path.join(ROOT, "data", "games.json");
const imagesPath = path.join(ROOT, "data", "game-images.json");

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value) {
  return String(value)
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function isGoodImage(url) {
  return /^https?:\/\//i.test(url) && !/favicon|icon|logo|sprite|avatar/i.test(url);
}

function absolutizeUrl(baseUrl, value) {
  if (!value) return "";
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return "";
  }
}

async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn image importer (local project)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn image importer (local project)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

async function steamImages(steamId) {
  if (!steamId) return [];
  const url = `https://store.steampowered.com/api/appdetails?appids=${steamId}&filters=basic,screenshots`;
  const payload = await fetchJson(url);
  const data = payload?.[steamId]?.data;
  const images = [];
  if (data?.header_image) images.push(data.header_image);
  for (const screenshot of data?.screenshots ?? []) {
    if (screenshot?.path_full) images.push(screenshot.path_full);
  }
  return images;
}

async function openGraphImages(pageUrl) {
  if (!pageUrl) return [];
  const html = await fetchText(pageUrl);
  const images = [];
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/gi,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/gi,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/gi,
  ];
  for (const pattern of patterns) {
    for (const match of html.matchAll(pattern)) {
      const image = absolutizeUrl(pageUrl, decodeHtml(match[1]));
      if (image) images.push(image);
    }
  }
  return images;
}

function dedupeImages(images, coverImage) {
  const seen = new Set();
  const result = [];
  for (const image of images) {
    if (!isGoodImage(image)) continue;
    const key = image.split("?")[0].toLowerCase();
    if (coverImage && key === coverImage.split("?")[0].toLowerCase()) continue;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(image);
  }
  return result.slice(0, 8);
}

async function main() {
  const games = JSON.parse(await fs.readFile(gamesPath, "utf8"));
  const output = {};
  const failures = [];

  for (const game of games) {
    const images = [];
    try {
      images.push(...await steamImages(game.steamId));
    } catch (error) {
      failures.push(`${game.slug} steam: ${error instanceof Error ? error.message : String(error)}`);
    }

    try {
      images.push(...await openGraphImages(game.officialUrl));
    } catch (error) {
      if (!game.steamId) failures.push(`${game.slug} og: ${error instanceof Error ? error.message : String(error)}`);
    }

    const clean = dedupeImages(images, game.coverImage);
    if (clean.length) output[game.slug] = clean;
    console.log(`${game.name}: ${clean.length} images`);
    await sleep(350);
  }

  if (Object.keys(output).length === 0) {
    throw new Error("No game images were scraped; keeping existing data untouched.");
  }

  await fs.writeFile(imagesPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Wrote image galleries for ${Object.keys(output).length} games.`);
  if (failures.length) console.log(`Failures:\n${failures.slice(0, 40).join("\n")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
