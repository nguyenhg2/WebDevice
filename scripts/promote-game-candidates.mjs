import fs from "node:fs";
import path from "node:path";
import { buildEstimatedBenchmarkRow, ESTIMATED_FPS_SOURCE } from "./lib/fps-estimator.mjs";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const gpusPath = path.join(root, "data", "gpus.json");
const benchmarksPath = path.join(root, "data", "benchmarks.json");
const imagesPath = path.join(root, "data", "game-images.json");
const candidatesPath = path.join(root, "data", "game-expansion-candidates.json");

const limit = Number.parseInt(process.env.PROMOTE_GAME_LIMIT || "50", 10);
const sleepMs = Number.parseInt(process.env.PROMOTE_GAME_DELAY_MS || "180", 10);
const now = new Date().toISOString();
const sourceLabel = ESTIMATED_FPS_SOURCE;
const requestHeaders = {
  "User-Agent": "Fpsviet.com game promoter (Steam official metadata; internal FPS estimates)",
  Accept: "application/json,text/plain,*/*",
};

const games = readJson(gamesPath);
const gpus = readJson(gpusPath);
const benchmarks = readJson(benchmarksPath);
const images = readJson(imagesPath);
const candidates = readJson(candidatesPath);

const existingSlugKeys = new Set(games.map((game) => compact(game.slug)));
const existingNameKeys = new Set(games.map((game) => compact(game.name)));
const benchmarkKeys = new Set(benchmarks.map((row) => `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`));
const promoted = [];
const skipped = [];

const queue = candidates
  .filter((candidate) => !candidate.inCatalog)
  .filter((candidate) => !existingSlugKeys.has(compact(candidate.slug)) && !existingNameKeys.has(compact(candidate.name)))
  .sort((a, b) => b.referenceSites.length - a.referenceSites.length || a.name.localeCompare(b.name, "en"));

for (const candidate of queue) {
  if (promoted.length >= limit) break;

  try {
    const steam = await findSteamGame(candidate);
    await sleep(sleepMs);
    if (!steam) {
      skipped.push({ slug: candidate.slug, reason: "no-steam-match" });
      continue;
    }

    const game = buildGame(candidate.slug, steam.appid, steam.details);
    if (!game.coverImage || images[game.slug]?.length === 0) {
      skipped.push({ slug: candidate.slug, reason: "missing-image" });
      continue;
    }

    games.push(game);
    images[game.slug] = steamGallery(steam.appid, steam.details);
    for (const row of buildBenchmarkRows(game)) {
      const key = `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`;
      if (benchmarkKeys.has(key)) continue;
      benchmarks.push(row);
      benchmarkKeys.add(key);
    }

    candidate.inCatalog = true;
    candidate.existingGameSlug = game.slug;
    candidate.status = "promoted-with-official-metadata-and-internal-fps-estimate";
    candidate.promotedAt = now;
    promoted.push({ slug: game.slug, name: game.name, steamId: game.steamId });
    console.log(`promoted ${game.slug}: ${game.name}`);
  } catch (error) {
    skipped.push({ slug: candidate.slug, reason: error instanceof Error ? error.message : String(error) });
    console.log(`skipped ${candidate.slug}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

writeJson(gamesPath, games);
writeJson(imagesPath, images);
writeJson(benchmarksPath, benchmarks);
writeJson(candidatesPath, candidates);

console.log(`Promoted ${promoted.length} games.`);
console.log(`Skipped ${skipped.length} candidates.`);
console.log(`Games: ${games.length}`);
console.log(`Benchmarks: ${benchmarks.length}`);

function buildGame(slug, appid, details) {
  const genres = Array.isArray(details.genres) && details.genres.length
    ? details.genres.map((genre) => translateGenre(genre.description)).filter(Boolean).slice(0, 5)
    : ["Game PC"];
  const minSpecs = parseSpec(details.pc_requirements?.minimum, {
    cpuName: "CPU 4 nhan pho thong",
    gpuName: "GPU pho thong ho tro DirectX 11",
    cpuBenchmark: 4500,
    gpuBenchmark: 3000,
    ramGb: 8,
    storageGb: 50,
  });
  const recSpecs = parseSpec(details.pc_requirements?.recommended || details.pc_requirements?.minimum, {
    cpuName: "CPU 6 nhan hoac tot hon",
    gpuName: "GPU gaming tam trung",
    cpuBenchmark: Math.max(9000, minSpecs.cpuBenchmark * 1.45),
    gpuBenchmark: Math.max(9000, minSpecs.gpuBenchmark * 1.65),
    ramGb: Math.max(8, minSpecs.ramGb),
    storageGb: minSpecs.storageGb,
  });
  const isFree = Boolean(details.is_free);
  const price = isFree ? 0 : normalizeSteamPrice(details.price_overview);
  const name = cleanText(details.name) || titleFromSlug(slug);

  return {
    name,
    slug,
    steamId: String(appid),
    genres,
    sizeGb: Math.max(positiveNumber(recSpecs.storageGb) ? recSpecs.storageGb : 50, positiveNumber(minSpecs.storageGb) ? minSpecs.storageGb : 50),
    price,
    isFree,
    description: buildDescription(name, genres, isFree),
    coverImage: details.header_image || `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
    officialUrl: `https://store.steampowered.com/app/${appid}/`,
    minSpecs,
    recSpecs,
  };
}

function buildBenchmarkRows(game) {
  return gpus.map((gpu) => buildEstimatedBenchmarkRow(game, gpu, { updatedAt: now, source: sourceLabel }));
}

async function findSteamGame(candidate) {
  const searchUrl = new URL("https://store.steampowered.com/api/storesearch/");
  searchUrl.searchParams.set("term", candidate.name);
  searchUrl.searchParams.set("cc", "us");
  searchUrl.searchParams.set("l", "english");
  const search = await fetchJson(searchUrl);
  const items = Array.isArray(search.items) ? search.items : [];
  const candidateKey = normalizedTitle(candidate.name);
  const match = items.find((item) => normalizedTitle(item.name) === candidateKey) ?? items.find((item) => compact(item.name) === compact(candidate.name));
  if (!match?.id) return null;

  const details = await getSteamDetails(String(match.id));
  if (!details) return null;
  const detailsKey = normalizedTitle(details.name);
  if (detailsKey !== candidateKey && compact(details.name) !== compact(candidate.name)) return null;

  return { appid: String(match.id), details };
}

async function getSteamDetails(appid) {
  const detailsUrl = new URL("https://store.steampowered.com/api/appdetails");
  detailsUrl.searchParams.set("appids", appid);
  detailsUrl.searchParams.set("cc", "us");
  detailsUrl.searchParams.set("l", "english");
  detailsUrl.searchParams.set("filters", "basic,genres,price_overview,pc_requirements,screenshots");
  const payload = await fetchJson(detailsUrl);
  const entry = payload?.[appid];
  if (!entry?.success || entry.data?.type !== "game") return null;
  return entry.data;
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

function steamGallery(appid, details) {
  return unique([
    details.header_image,
    details.capsule_image,
    details.capsule_imagev5,
    details.background_raw || details.background,
    ...(details.screenshots || []).flatMap((shot) => [shot.path_full, shot.path_thumbnail]),
    `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/header.jpg`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/capsule_616x353.jpg`,
    `https://cdn.akamai.steamstatic.com/steam/apps/${appid}/library_600x900.jpg`,
  ]).slice(0, 12);
}

function parseSpec(html, fallback) {
  const text = stripHtml(html);
  const names = extractSpecNames(text);
  const ramGb = pickNumber(text, [
    /(\d+(?:\.\d+)?)\s*gb\s*(?:ram|memory)/i,
    /memory:?\s*(\d+(?:\.\d+)?)\s*gb/i,
  ]);
  const storageGb = pickNumber(text, [
    /(\d+(?:\.\d+)?)\s*gb\s*(?:available space|storage|hard drive|hdd|ssd)/i,
    /storage:?\s*(\d+(?:\.\d+)?)\s*gb/i,
  ]);

  return {
    cpuName: names.cpuName || fallback.cpuName,
    gpuName: names.gpuName || fallback.gpuName,
    cpuBenchmark: estimateCpuScore(names.cpuName || fallback.cpuName, fallback.cpuBenchmark),
    gpuBenchmark: estimateGpuScore(names.gpuName || fallback.gpuName, fallback.gpuBenchmark),
    ramGb: positiveNumber(ramGb) ? ramGb : fallback.ramGb,
    storageGb: positiveNumber(storageGb) ? storageGb : fallback.storageGb,
  };
}

function extractSpecNames(text) {
  const compactText = cleanText(text).replace(/\s+/g, " ");
  const cpu = compactText.match(/(?:processor|cpu):?\s*([^.;\n]+?)(?:memory|graphics|video|gpu|directx|storage|$)/i)?.[1]?.trim() || "";
  const gpu = compactText.match(/(?:graphics|video card|gpu):?\s*([^.;\n]+?)(?:directx|network|storage|sound|additional|$)/i)?.[1]?.trim() || "";
  return {
    cpuName: truncateSpec(cpu),
    gpuName: truncateSpec(gpu),
  };
}

function estimateGpuScore(name, fallback) {
  const text = compact(name);
  const exact = gpus.find((gpu) => text.includes(compact(gpu.name)) || compact(gpu.name).includes(text));
  if (exact) return exact.benchmarkScore;
  if (/rtx4090|rx7900/.test(text)) return 39000;
  if (/rtx4080|rx7800|rtx5080/.test(text)) return 33000;
  if (/rtx4070|rx7700|rx6800|rtx3080/.test(text)) return 26000;
  if (/rtx3070|rtx4060ti|rx6700|rx7600/.test(text)) return 21000;
  if (/rtx3060|rtx2060|rx6600|gtx1080/.test(text)) return 16000;
  if (/gtx1660|gtx1070|rx580|rx570|gtx1060/.test(text)) return 10500;
  if (/gtx1050|gtx960|gtx970|rx470|rx560/.test(text)) return 6500;
  if (/intel|uhd|iris|vega/.test(text)) return 2500;
  return Math.round(fallback);
}

function estimateCpuScore(name, fallback) {
  const text = compact(name);
  const exact = readJson(path.join(root, "data", "cpus.json")).find((cpu) => text.includes(compact(cpu.name)) || compact(cpu.name).includes(text));
  if (exact) return exact.benchmarkScore;
  if (/i913|i914|i912|ryzen979|ryzen778/.test(text)) return 30000;
  if (/i712|i713|i711|ryzen758|ryzen777|ryzen770/.test(text)) return 24000;
  if (/i510|i511|i512|i513|ryzen556|ryzen536|ryzen550/.test(text)) return 17000;
  if (/i78700|i79700|ryzen52600|ryzen53600/.test(text)) return 13000;
  if (/i56600|i58400|i59400|ryzen51400|ryzen51600/.test(text)) return 9000;
  if (/i3|fx|athlon|pentium/.test(text)) return 4500;
  return Math.round(fallback);
}

function normalizeSteamPrice(priceOverview) {
  if (!priceOverview) return null;
  const raw = Number(priceOverview.final ?? priceOverview.initial);
  if (!Number.isFinite(raw)) return null;
  return Math.round(raw / 100);
}

function buildDescription(name, genres, isFree) {
  const genreText = genres.slice(0, 3).join(", ").toLowerCase() || "game PC";
  return `${name} la game ${genreText}. Trang nay tong hop anh chinh thuc, cau hinh toi thieu, cau hinh de xuat va FPS tham khao noi bo de nguoi dung kiem tra cau hinh truoc khi tai hoac mua game.`;
}

function translateGenre(genre) {
  const map = {
    Action: "Hanh dong",
    Adventure: "Phieu luu",
    Casual: "Giai tri",
    Indie: "Doc lap",
    Racing: "Dua xe",
    RPG: "Nhap vai",
    Simulation: "Mo phong",
    Sports: "The thao",
    Strategy: "Chien thuat",
    "Free To Play": "Mien phi",
    "Massively Multiplayer": "Nhieu nguoi choi",
  };
  return map[genre] || genre;
}

function stripHtml(value) {
  return cleanText(value)
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function pickNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function normalizedTitle(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/\biv\b/g, "4")
    .replace(/\bv\b/g, "5")
    .replace(/\bvi\b/g, "6")
    .replace(/\bii\b/g, "2")
    .replace(/\biii\b/g, "3")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function compact(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "");
}

function titleFromSlug(slug) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function truncateSpec(value) {
  const text = cleanText(value);
  return text.length > 120 ? `${text.slice(0, 117)}...` : text;
}

function unique(values) {
  const seen = new Set();
  const output = [];
  for (const value of values) {
    const clean = cleanText(value);
    if (!clean || seen.has(clean)) continue;
    seen.add(clean);
    output.push(clean);
  }
  return output;
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function cleanText(value) {
  return String(value ?? "").trim();
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
