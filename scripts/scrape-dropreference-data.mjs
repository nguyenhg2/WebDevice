import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const BASE_URL = "https://dropreference.com";
const LIST_URL = `${BASE_URL}/en/benchmarks`;
const GPU_STOCK_URL = `${BASE_URL}/en/stock/gpu`;
const REQUEST_TIMEOUT_MS = 12000;
const DISCOVERY_PAGE_COUNT = Number.parseInt(process.env.DROPREFERENCE_DISCOVERY_PAGES || "50", 10);
const MAX_GAME_PAGES = Number.parseInt(process.env.DROPREFERENCE_MAX_GAMES || "0", 10);
const SLEEP_MS = Number.parseInt(process.env.DROPREFERENCE_DELAY_MS || "650", 10);

const gamesPath = path.join(ROOT, "data", "games.json");
const benchmarksPath = path.join(ROOT, "data", "benchmarks.json");
const gpusPath = path.join(ROOT, "data", "gpus.json");
const gameImagesPath = path.join(ROOT, "data", "game-images.json");
const gameImageSourcesPath = path.join(ROOT, "data", "game-image-sources.json");
const gameSourcesPath = path.join(ROOT, "data", "game-sources.json");

const seedBenchmarkSlugs = [
  "arc-raiders",
  "battlefield-6",
  "delta-force",
  "monster-hunter-wilds",
  "resident-evil-requiem",
  "doom-the-dark-ages",
  "the-first-descendant",
  "once-human",
  "black-myth-wukong",
  "god-of-war-ragnarok",
  "star-wars-jedi-survivor",
  "hogwarts-legacy",
  "cyberpunk-2077",
  "counter-strike-2",
  "fortnite",
  "marvel-rivals",
  "ready-or-not",
  "escape-from-tarkov",
  "satisfactory",
  "ark-survival-ascended",
  "microsoft-flight-simulator",
  "red-dead-redemption-2",
  "elden-ring",
];

const genreTranslations = new Map([
  ["Adventure", "Phiêu lưu"],
  ["Arcade", "Arcade"],
  ["Fighting", "Đối kháng"],
  ["MOBA", "MOBA"],
  ["Platform", "Đi cảnh"],
  ["Puzzle", "Giải đố"],
  ["Racing", "Đua xe"],
  ["Role-playing (RPG)", "Nhập vai"],
  ["Role-playing", "Nhập vai"],
  ["RPG", "Nhập vai"],
  ["Shooter", "Bắn súng"],
  ["Simulator", "Mô phỏng"],
  ["Simulation", "Mô phỏng"],
  ["Sport", "Thể thao"],
  ["Strategy", "Chiến thuật"],
  ["Tactical", "Chiến thuật"],
]);

const manualGpuAliases = new Map([
  ["RTX 5090", "nvidia-rtx-5090"],
  ["RTX 5080", "nvidia-rtx-5080"],
  ["RTX 5070 TI", "nvidia-rtx-5070-ti"],
  ["RTX 5070", "nvidia-rtx-5070"],
  ["RTX 5060 TI", "nvidia-rtx-5060-ti"],
  ["RTX 5060", "nvidia-rtx-5060"],
  ["RTX 5050", "nvidia-rtx-5050"],
  ["RTX 4090", "nvidia-rtx-4090"],
  ["RTX 4080", "nvidia-rtx-4080"],
  ["RTX 4080 SUPER", "nvidia-rtx-4080-super"],
  ["RTX 4070 TI SUPER", "nvidia-rtx-4070-ti-super"],
  ["RTX 4070 TI", "nvidia-rtx-4070-ti"],
  ["RTX 4070 SUPER", "nvidia-rtx-4070-super"],
  ["RTX 4070", "nvidia-rtx-4070"],
  ["RTX 4060 TI", "nvidia-rtx-4060-ti"],
  ["RTX 4060", "nvidia-rtx-4060"],
  ["RTX 3090 TI", "nvidia-rtx-3090-ti"],
  ["RTX 3090", "nvidia-rtx-3090"],
  ["RTX 3080 TI", "nvidia-rtx-3080-ti"],
  ["RTX 3080", "nvidia-rtx-3080"],
  ["RTX 3070 TI", "nvidia-rtx-3070-ti"],
  ["RTX 3070", "nvidia-rtx-3070"],
  ["RTX 3060 TI", "nvidia-rtx-3060-ti"],
  ["RTX 3060", "nvidia-rtx-3060"],
  ["RTX 3050", "nvidia-rtx-3050"],
  ["RTX 2080 TI", "nvidia-rtx-2080-ti"],
  ["RTX 2080 SUPER", "nvidia-rtx-2080-super"],
  ["RTX 2080", "nvidia-rtx-2080"],
  ["RTX 2070 SUPER", "nvidia-rtx-2070-super"],
  ["RTX 2070", "nvidia-rtx-2070"],
  ["RTX 2060 SUPER", "nvidia-rtx-2060-super"],
  ["RTX 2060", "nvidia-rtx-2060"],
  ["GTX 1660 SUPER", "nvidia-gtx-1660-super"],
  ["GTX 1660 TI", "nvidia-gtx-1660-ti"],
  ["GTX 1660", "nvidia-gtx-1660"],
  ["GTX 1650 SUPER", "nvidia-gtx-1650-super"],
  ["GTX 1650", "nvidia-gtx-1650"],
  ["GTX 1050 TI", "nvidia-gtx-1050-ti"],
  ["GTX 1050", "nvidia-gtx-1050"],
  ["7900 XTX", "amd-radeon-rx-7900-xtx"],
  ["7900 XT", "amd-radeon-rx-7900-xt"],
  ["7900 GRE", "amd-radeon-rx-7900-gre"],
  ["7800 XT", "amd-radeon-rx-7800-xt"],
  ["7700 XT", "amd-radeon-rx-7700-xt"],
  ["7600 XT", "amd-radeon-rx-7600-xt"],
  ["7600", "amd-radeon-rx-7600"],
  ["9070 XT", "amd-radeon-rx-9070-xt"],
  ["9070", "amd-radeon-rx-9070"],
  ["9060 XT", "amd-radeon-rx-9060-xt"],
  ["6950 XT", "amd-radeon-rx-6950-xt"],
  ["6900 XT", "amd-radeon-rx-6900-xt"],
  ["6800 XT", "amd-radeon-rx-6800-xt"],
  ["6800", "amd-radeon-rx-6800"],
  ["6750 XT", "amd-radeon-rx-6750-xt"],
  ["6700 XT", "amd-radeon-rx-6700-xt"],
  ["6700", "amd-radeon-rx-6700"],
  ["6650 XT", "amd-radeon-rx-6650-xt"],
  ["6600 XT", "amd-radeon-rx-6600-xt"],
  ["6600", "amd-radeon-rx-6600"],
  ["6500 XT", "amd-radeon-rx-6500-xt"],
  ["6400", "amd-radeon-rx-6400"],
  ["580", "amd-radeon-rx-580"],
  ["570", "amd-radeon-rx-570"],
  ["560", "amd-radeon-rx-560"],
  ["550", "amd-radeon-rx-550"],
  ["B580", "intel-arc-b580"],
  ["B570", "intel-arc-b570"],
  ["A770", "intel-arc-a770"],
  ["A750", "intel-arc-a750"],
  ["A580", "intel-arc-a580"],
  ["A380", "intel-arc-a380"],
]);

const dropReferenceGpuCatalog = [
  { name: "AMD Radeon RX 6400", slug: "amd-radeon-rx-6400", brand: "AMD", benchmarkScore: 6000, category: "low", tdp: 53, vram: 4, priceRangeVnd: "0-3trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6500 XT", slug: "amd-radeon-rx-6500-xt", brand: "AMD", benchmarkScore: 9200, category: "mid", tdp: 107, vram: 4, priceRangeVnd: "3-7trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA GTX 1650 Super", slug: "nvidia-gtx-1650-super", brand: "NVIDIA", benchmarkScore: 9700, category: "mid", tdp: 100, vram: 4, priceRangeVnd: "3-7trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA GTX 1660", slug: "nvidia-gtx-1660", brand: "NVIDIA", benchmarkScore: 11500, category: "mid", tdp: 120, vram: 6, priceRangeVnd: "3-7trieu", isLaptop: false, commonInVietnam: true },
  { name: "Intel Arc A580", slug: "intel-arc-a580", brand: "Intel", benchmarkScore: 13000, category: "high", tdp: 185, vram: 8, priceRangeVnd: "3-7trieu", isLaptop: false, commonInVietnam: false },
  { name: "NVIDIA RTX 2060", slug: "nvidia-rtx-2060", brand: "NVIDIA", benchmarkScore: 14000, category: "high", tdp: 160, vram: 6, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "Intel Arc A750", slug: "intel-arc-a750", brand: "Intel", benchmarkScore: 15000, category: "high", tdp: 225, vram: 8, priceRangeVnd: "3-7trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6600 XT", slug: "amd-radeon-rx-6600-xt", brand: "AMD", benchmarkScore: 16200, category: "high", tdp: 160, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 2060 Super", slug: "nvidia-rtx-2060-super", brand: "NVIDIA", benchmarkScore: 16200, category: "high", tdp: 175, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7600 XT", slug: "amd-radeon-rx-7600-xt", brand: "AMD", benchmarkScore: 17200, category: "high", tdp: 165, vram: 16, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "Intel Arc A770", slug: "intel-arc-a770", brand: "Intel", benchmarkScore: 17400, category: "high", tdp: 225, vram: 16, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 2070", slug: "nvidia-rtx-2070", brand: "NVIDIA", benchmarkScore: 17600, category: "high", tdp: 175, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6700", slug: "amd-radeon-rx-6700", brand: "AMD", benchmarkScore: 18200, category: "high", tdp: 175, vram: 10, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 2070 Super", slug: "nvidia-rtx-2070-super", brand: "NVIDIA", benchmarkScore: 18300, category: "high", tdp: 215, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "Intel Arc B570", slug: "intel-arc-b570", brand: "Intel", benchmarkScore: 18500, category: "high", tdp: 150, vram: 10, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: false },
  { name: "NVIDIA RTX 2080", slug: "nvidia-rtx-2080", brand: "NVIDIA", benchmarkScore: 18800, category: "high", tdp: 215, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA GTX 1080 Ti", slug: "nvidia-gtx-1080-ti", brand: "NVIDIA", benchmarkScore: 19000, category: "high", tdp: 250, vram: 11, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5050", slug: "nvidia-rtx-5050", brand: "NVIDIA", benchmarkScore: 19500, category: "high", tdp: 130, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 2080 Super", slug: "nvidia-rtx-2080-super", brand: "NVIDIA", benchmarkScore: 19900, category: "high", tdp: 250, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3060 Ti", slug: "nvidia-rtx-3060-ti", brand: "NVIDIA", benchmarkScore: 20600, category: "high", tdp: 200, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "Intel Arc B580", slug: "intel-arc-b580", brand: "Intel", benchmarkScore: 21000, category: "high", tdp: 190, vram: 12, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: false },
  { name: "NVIDIA RTX 2080 Ti", slug: "nvidia-rtx-2080-ti", brand: "NVIDIA", benchmarkScore: 22000, category: "high", tdp: 250, vram: 11, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4060 Ti", slug: "nvidia-rtx-4060-ti", brand: "NVIDIA", benchmarkScore: 22900, category: "high", tdp: 160, vram: 16, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6750 XT", slug: "amd-radeon-rx-6750-xt", brand: "AMD", benchmarkScore: 23000, category: "high", tdp: 250, vram: 12, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6800", slug: "amd-radeon-rx-6800", brand: "AMD", benchmarkScore: 23800, category: "high", tdp: 250, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3070 Ti", slug: "nvidia-rtx-3070-ti", brand: "NVIDIA", benchmarkScore: 24000, category: "high", tdp: 290, vram: 8, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 9060 XT", slug: "amd-radeon-rx-9060-xt", brand: "AMD", benchmarkScore: 24500, category: "high", tdp: 160, vram: 16, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5060", slug: "nvidia-rtx-5060", brand: "NVIDIA", benchmarkScore: 24600, category: "high", tdp: 145, vram: 8, priceRangeVnd: "7-15trieu", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3080", slug: "nvidia-rtx-3080", brand: "NVIDIA", benchmarkScore: 25500, category: "high", tdp: 320, vram: 10, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7700 XT", slug: "amd-radeon-rx-7700-xt", brand: "AMD", benchmarkScore: 26000, category: "high", tdp: 245, vram: 12, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5060 Ti", slug: "nvidia-rtx-5060-ti", brand: "NVIDIA", benchmarkScore: 27000, category: "ultra", tdp: 180, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3080 Ti", slug: "nvidia-rtx-3080-ti", brand: "NVIDIA", benchmarkScore: 27200, category: "ultra", tdp: 350, vram: 12, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3090", slug: "nvidia-rtx-3090", brand: "NVIDIA", benchmarkScore: 27700, category: "ultra", tdp: 350, vram: 24, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6800 XT", slug: "amd-radeon-rx-6800-xt", brand: "AMD", benchmarkScore: 28000, category: "ultra", tdp: 300, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6900 XT", slug: "amd-radeon-rx-6900-xt", brand: "AMD", benchmarkScore: 29200, category: "ultra", tdp: 300, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7800 XT", slug: "amd-radeon-rx-7800-xt", brand: "AMD", benchmarkScore: 30200, category: "ultra", tdp: 263, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7900 GRE", slug: "amd-radeon-rx-7900-gre", brand: "AMD", benchmarkScore: 30500, category: "ultra", tdp: 260, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 6950 XT", slug: "amd-radeon-rx-6950-xt", brand: "AMD", benchmarkScore: 31200, category: "ultra", tdp: 335, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4070 Super", slug: "nvidia-rtx-4070-super", brand: "NVIDIA", benchmarkScore: 30500, category: "ultra", tdp: 220, vram: 12, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4070 Ti", slug: "nvidia-rtx-4070-ti", brand: "NVIDIA", benchmarkScore: 32200, category: "ultra", tdp: 285, vram: 12, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4070 Ti Super", slug: "nvidia-rtx-4070-ti-super", brand: "NVIDIA", benchmarkScore: 33400, category: "ultra", tdp: 285, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 3090 Ti", slug: "nvidia-rtx-3090-ti", brand: "NVIDIA", benchmarkScore: 34000, category: "ultra", tdp: 450, vram: 24, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5070", slug: "nvidia-rtx-5070", brand: "NVIDIA", benchmarkScore: 34500, category: "ultra", tdp: 220, vram: 12, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 9070", slug: "amd-radeon-rx-9070", brand: "AMD", benchmarkScore: 35000, category: "ultra", tdp: 220, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4080 Super", slug: "nvidia-rtx-4080-super", brand: "NVIDIA", benchmarkScore: 36500, category: "ultra", tdp: 320, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7900 XT", slug: "amd-radeon-rx-7900-xt", brand: "AMD", benchmarkScore: 36800, category: "ultra", tdp: 315, vram: 20, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 4090", slug: "nvidia-rtx-4090", brand: "NVIDIA", benchmarkScore: 39200, category: "ultra", tdp: 450, vram: 24, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5070 Ti", slug: "nvidia-rtx-5070-ti", brand: "NVIDIA", benchmarkScore: 39500, category: "ultra", tdp: 300, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 9070 XT", slug: "amd-radeon-rx-9070-xt", brand: "AMD", benchmarkScore: 40500, category: "ultra", tdp: 304, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "AMD Radeon RX 7900 XTX", slug: "amd-radeon-rx-7900-xtx", brand: "AMD", benchmarkScore: 41200, category: "ultra", tdp: 355, vram: 24, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5080", slug: "nvidia-rtx-5080", brand: "NVIDIA", benchmarkScore: 45500, category: "ultra", tdp: 360, vram: 16, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
  { name: "NVIDIA RTX 5090", slug: "nvidia-rtx-5090", brand: "NVIDIA", benchmarkScore: 59000, category: "ultra", tdp: 575, vram: 32, priceRangeVnd: "15trieu+", isLaptop: false, commonInVietnam: true },
];

const dropReferenceFreeGameSlugs = new Set([
  "delta-force",
  "marvel-rivals",
  "once-human",
  "the-first-descendant",
]);

const ignoredBenchmarkSlugs = new Set([
  "build-a-pc-new",
  "build-pc",
  "home",
  "stock",
]);

const manualBenchmarkSlugAliases = new Map([
  ["assassin-s-creed-odyssey", ["assassins-creed-odyssey"]],
  ["assassin-s-creed-valhalla", ["assassins-creed-valhalla"]],
  ["lien-minh-huyen-thoai", ["league-of-legends"]],
  ["resident-evil-4-remake", ["resident-evil-4"]],
  ["the-witcher-3", ["the-witcher-3-wild-hunt"]],
  ["dot-kich", ["crossfire"]],
  ["fifa-online-4", ["fc-online", "fifa-online-4"]],
]);

const extraBenchmarkSlugs = [
  "assassins-creed-shadows",
  "call-of-duty-black-ops-6",
  "crimson-desert",
  "death-stranding-2",
  "final-fantasy-vii-rebirth",
  "ghost-of-tsushima",
  "indiana-jones-and-the-great-circle",
  "kingdom-come-deliverance-2",
  "starfield",
  "stalker-2-heart-of-chornobyl",
  "the-last-of-us-part-i",
  "the-last-of-us-part-ii-remastered",
  "valorant",
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Maynaychoiduoc.vn DropReference importer (local project; source attribution retained)",
        "Accept-Language": "en-US,en;q=0.9",
        Accept: "text/html,application/xhtml+xml,*/*",
      },
    });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    return response.text();
  } finally {
    clearTimeout(timeout);
  }
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function stripHtml(value) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageToLines(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<\/(h[1-6]|p|li|tr|td|th|div|section)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toUpperCase()
    .replace(/\b(NVIDIA|AMD|RADEON|GEFORCE|INTEL|GRAPHICS|GPU)\b/g, " ")
    .replace(/[-_]/g, " ")
    .replace(/\b(2GB|3GB|4GB|6GB|8GB|10GB|11GB|12GB|16GB|20GB|24GB|32GB)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function slugify(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function resolveUrl(baseUrl, value) {
  const clean = decodeHtml(value).trim();
  if (!clean || clean.startsWith("data:") || clean.startsWith("blob:")) return "";
  try {
    return new URL(clean, baseUrl).toString();
  } catch {
    return "";
  }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function sourceUrlForSlug(slug) {
  return `${BASE_URL}/en/benchmarks/${slug}`;
}

function extractBenchmarkUrls(html, currentUrl) {
  const urls = [];
  const pattern = /<a\b[^>]+href=["']([^"']*\/en\/benchmarks\/([^"'?#/]+)[^"']*)["']/gi;
  for (const match of html.matchAll(pattern)) {
    const url = resolveUrl(currentUrl, match[1]);
    if (!url) continue;
    const slug = url.match(/\/en\/benchmarks\/([^/?#]+)/)?.[1];
    if (!slug || slug === "benchmarks" || ignoredBenchmarkSlugs.has(slug)) continue;
    urls.push(sourceUrlForSlug(slug));
  }
  return unique(urls);
}

function extractBenchmarkPageCount(html) {
  const text = stripHtml(html);
  const explicit = text.match(/Page\s+\d+\s+of\s+(\d+)/i);
  if (explicit) return Number(explicit[1]) || 0;

  let maxPage = 0;
  for (const match of html.matchAll(/(?:[?&]page=|\/page\/)(\d+)/gi)) {
    maxPage = Math.max(maxPage, Number(match[1]) || 0);
  }
  return maxPage;
}

function localBenchmarkCandidateSlugs(games) {
  const slugs = new Set([...seedBenchmarkSlugs, ...extraBenchmarkSlugs]);
  for (const game of games) {
    slugs.add(game.slug);
    slugs.add(slugify(game.name));
    for (const alias of manualBenchmarkSlugAliases.get(game.slug) ?? []) slugs.add(alias);
  }
  return [...slugs].filter((slug) => slug && !ignoredBenchmarkSlugs.has(slug));
}

async function discoverBenchmarkUrls(games = []) {
  const urls = new Set(localBenchmarkCandidateSlugs(games).map(sourceUrlForSlug));
  const listPages = [LIST_URL];
  let discoveredPageCount = 1;

  try {
    const firstHtml = await fetchText(LIST_URL);
    for (const url of extractBenchmarkUrls(firstHtml, LIST_URL)) urls.add(url);
    discoveredPageCount = Math.max(1, extractBenchmarkPageCount(firstHtml));
  } catch (error) {
    console.log(`DropReference list skipped ${LIST_URL}: ${error instanceof Error ? error.message : String(error)}`);
  }

  const pageLimit = Math.max(discoveredPageCount, DISCOVERY_PAGE_COUNT);
  for (let page = 2; page <= pageLimit; page += 1) listPages.push(`${LIST_URL}?page=${page}`);

  for (const listUrl of listPages) {
    if (listUrl === LIST_URL) continue;
    try {
      const html = await fetchText(listUrl);
      const before = urls.size;
      for (const url of extractBenchmarkUrls(html, listUrl)) urls.add(url);
      if (pageLimit > discoveredPageCount && urls.size === before && listUrl.includes("?page=")) {
        const page = Number(new URL(listUrl).searchParams.get("page"));
        if (page > discoveredPageCount + 2) break;
      }
      await sleep(150);
    } catch (error) {
      console.log(`DropReference list skipped ${listUrl}: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  try {
    const sitemap = await fetchText(`${BASE_URL}/sitemap.xml`);
    for (const match of sitemap.matchAll(/<loc>(https:\/\/dropreference\.com\/en\/benchmarks\/[^<]+)<\/loc>/gi)) {
      const slug = decodeHtml(match[1]).match(/\/en\/benchmarks\/([^/?#]+)/)?.[1];
      if (slug) urls.add(sourceUrlForSlug(slug));
    }
  } catch {
    // Sitemap is a bonus discovery path; the list page and seed slugs are enough.
  }

  const discovered = [...urls].sort();
  return MAX_GAME_PAGES > 0 ? discovered.slice(0, MAX_GAME_PAGES) : discovered;
}

function textMeta(html, name) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+name=["']${escaped}["'][^>]+content=["']([^"']+)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${escaped}["']`, "i"),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match) return decodeHtml(match[1]).trim();
  }
  return "";
}

function lineAfter(lines, label, start = 0) {
  const index = lines.findIndex((line, i) => i >= start && line.toLowerCase() === label.toLowerCase());
  if (index < 0) return "";
  return lines[index + 1] || "";
}

function lineAfterOrInline(lines, label, start = 0) {
  const lowerLabel = label.toLowerCase();
  for (let index = start; index < lines.length; index += 1) {
    const line = lines[index];
    const lowerLine = line.toLowerCase();
    if (lowerLine === lowerLabel) return lines[index + 1] || "";
    if (lowerLine.startsWith(`${lowerLabel} `)) return line.slice(label.length).trim();
  }
  return "";
}

function sectionLines(lines, startPattern, endPatterns) {
  const start = lines.findIndex((line) => startPattern.test(line));
  if (start < 0) return [];
  const end = lines.findIndex((line, index) => index > start && endPatterns.some((pattern) => pattern.test(line)));
  return lines.slice(start + 1, end > start ? end : lines.length);
}

function cleanBenchmarkTitle(value) {
  return String(value || "")
    .replace(/\s+FPS Benchmark[\s\S]*$/i, "")
    .replace(/\s+Benchmark[\s\S]*$/i, "")
    .replace(/\s+GPU Performance[\s\S]*$/i, "")
    .replace(/\s+System Requirements[\s\S]*$/i, "")
    .replace(/[\u2122\u00ae]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function titleFromSlug(slug) {
  return String(slug || "")
    .split("-")
    .filter(Boolean)
    .map((part) => (part.length <= 3 ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function parseGameTitle(html, lines, fallbackSlug) {
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = cleanBenchmarkTitle(stripHtml(h1?.[1] || ""));
  if (title && !/DropReference|Settings|Language/i.test(title)) return title.replace(/^#+\s*/, "").trim();

  const lineTitle = lines
    .map(cleanBenchmarkTitle)
    .find((line) => line.length > 2 && line.length < 90 && !/DropReference|Menu|Home|Benchmarks|FPS|Language/i.test(line));
  return lineTitle || titleFromSlug(fallbackSlug);
}

function parseGenres(raw) {
  const text = String(raw || "").trim();
  const genres = [];
  for (const [source, translated] of genreTranslations) {
    if (new RegExp(`\\b${source.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i").test(text)) genres.push(translated);
  }
  if (/Survival|Horror/i.test(text)) genres.push("Sinh tồn");
  if (/Action/i.test(text)) genres.push("Hành động");
  return unique(genres).slice(0, 5);
}

function parseSpecBlock(lines, heading) {
  const block = sectionLines(lines, new RegExp(`^${heading}$`, "i"), [/^### /, /^## /, /^Storyline$/i, /^Information$/i]);
  const text = block.join("\n");
  const cpuName = firstMatch(text, /PROCESSOR\s+([^\n]+)/i) || "CPU 6 nhân hoặc tốt hơn";
  const gpuName = firstMatch(text, /GRAPHICS\s+([^\n]+)/i) || "GPU hỗ trợ DirectX 12";
  const memory = Number(firstMatch(text, /MEMORY\s+(\d+)\s*GB/i)) || 8;
  const storage = Number(firstMatch(text, /(?:STORAGE|HARD DRIVE|DISK SPACE)\s+(\d+)\s*GB/i)) || (heading === "Recommended configuration" ? 80 : 50);

  return {
    cpuName: cleanupSpec(cpuName),
    gpuName: cleanupSpec(gpuName),
    cpuBenchmark: estimateCpuBenchmark(cpuName, heading),
    gpuBenchmark: estimateGpuBenchmark(gpuName, heading),
    ramGb: memory,
    storageGb: storage,
  };
}

function firstMatch(text, pattern) {
  const match = text.match(pattern);
  return match ? match[1].trim() : "";
}

function cleanupSpec(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s*,\s*/g, ", ")
    .trim();
}

function estimateCpuBenchmark(value, heading) {
  const text = String(value || "").toLowerCase();
  if (/ryzen\s*9|core\s*i9/.test(text)) return 26000;
  if (/ryzen\s*7|core\s*i7/.test(text)) return 17000;
  if (/ryzen\s*5|core\s*i5/.test(text)) return 10500;
  if (/ryzen\s*3|core\s*i3/.test(text)) return 6200;
  if (/fx-|athlon/.test(text)) return 3200;
  if (/pentium|core\s*2/.test(text)) return 1300;
  return heading === "Recommended configuration" ? 9000 : 4500;
}

function estimateGpuBenchmark(value, heading) {
  const text = String(value || "").toLowerCase();
  if (/rtx\s*4090|rx\s*7900/.test(text)) return 33000;
  if (/rtx\s*4080|rx\s*7800/.test(text)) return 27000;
  if (/rtx\s*4070|rx\s*7700/.test(text)) return 22000;
  if (/rtx\s*3070|rtx\s*4060|rx\s*6700|rx\s*7600/.test(text)) return 17000;
  if (/rtx\s*3060|rx\s*6600|rtx\s*2070|rx\s*5700/.test(text)) return 12500;
  if (/gtx\s*1660|gtx\s*1070|rx\s*580/.test(text)) return 8000;
  if (/gtx\s*1050\s*ti|rx\s*560|arc\s*a380/.test(text)) return 3900;
  if (/gtx\s*1050|gt\s*1030|gt\s*730|intel/.test(text)) return 1800;
  return heading === "Recommended configuration" ? 9000 : 3000;
}

function extractImages(html, pageUrl, title) {
  const images = [];
  for (const metaName of ["og:image", "twitter:image"]) {
    const image = resolveUrl(pageUrl, textMeta(html, metaName));
    if (isGoodImage(image, title)) images.push(image);
  }

  for (const match of html.matchAll(/<(?:img|source)\b[^>]+(?:src|data-src|srcset)=["']([^"']+)["'][^>]*>/gi)) {
    const raw = decodeHtml(match[1]).split(",").map((part) => part.trim().split(/\s+/)[0]);
    for (const value of raw) {
      const image = resolveUrl(pageUrl, value);
      if (isGoodImage(image, title)) images.push(image);
    }
  }

  return unique(images).slice(0, 10);
}

function isGoodImage(url, title) {
  if (!/^https?:\/\//i.test(url)) return false;
  if (!/\.(avif|jpe?g|png|webp)(\?|#|$)/i.test(url)) return false;
  if (/favicon|logo|icon|avatar|badge|sprite|flag|discord|twitter|instagram|youtube|telegram/i.test(url)) return false;
  if (title && new RegExp(slugify(title).replace(/-/g, ".*"), "i").test(url)) return true;
  return /dropreference|cdn|image|img|assets|screens?|cover|poster|hero|banner|capsule/i.test(url);
}

function extractExternalUrl(html, pageUrl) {
  const candidates = [];
  for (const match of html.matchAll(/<a\b[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)) {
    const href = resolveUrl(pageUrl, match[1]);
    const label = stripHtml(match[2]);
    if (!href || href.includes("dropreference.com")) continue;
    candidates.push({ href, label });
  }

  const preferred = candidates.find((item) => /Steam|Epic Games|PlayStation|Xbox|Official|Wiki/i.test(item.label)) || candidates[0];
  return preferred?.href || pageUrl;
}

function parseSteamId(url) {
  return url.match(/store\.steampowered\.com\/app\/(\d+)/i)?.[1] ?? null;
}

function parseDropReferencePage(url, html, gpus) {
  const lines = pageToLines(html);
  const slug = url.match(/\/en\/benchmarks\/([^/?#]+)/)?.[1] || "";
  if (ignoredBenchmarkSlugs.has(slug)) throw new Error(`Ignored non-game benchmark slug: ${slug}`);
  const title = parseGameTitle(html, lines, slug);
  if (/^Build a PC\b|^PC Builder\b|^DropReference\b/i.test(title)) throw new Error(`Ignored non-game benchmark title: ${title}`);
  const releaseDate = lineAfterOrInline(lines, "Release Date");
  const year = Number((releaseDate || lines[lines.indexOf(title) + 1] || "").match(/\b(20\d{2}|19\d{2})\b/)?.[1]) || null;
  const genreLine = lineAfterOrInline(lines, "Games");
  const overview = sectionLines(lines, /^Overview$/i, [/^System Requirements$/i]).join(" ");
  const description =
    overview ||
    textMeta(html, "description") ||
    `${title} là game có dữ liệu cấu hình và FPS tham khảo từ DropReference.`;
  const images = extractImages(html, url, title);
  const officialUrl = extractExternalUrl(html, url);
  const minSpecs = parseSpecBlock(lines, "Minimum configuration");
  const recSpecs = parseSpecBlock(lines, "Recommended configuration");
  const genres = parseGenres(genreLine);
  const gameSlug = slugify(title) || slug;
  const isFree = dropReferenceFreeGameSlugs.has(gameSlug);
  const fpsRows = parseFpsRows(lines, title, gameSlug, url, gpus);

  return {
    game: {
      name: title,
      slug: gameSlug,
      steamId: parseSteamId(officialUrl),
      genres: genres.length ? genres : ["Hành động"],
      sizeGb: Math.max(minSpecs.storageGb, recSpecs.storageGb),
      price: isFree ? 0 : null,
      isFree,
      description: description.slice(0, 800),
      coverImage: images[0] ?? null,
      officialUrl,
      minSpecs,
      recSpecs,
    },
    images,
    fpsRows,
    sourceUrl: url,
    updatedAt: new Date().toISOString(),
    year,
  };
}

function buildGpuAliasMap(gpus) {
  const aliases = new Map();
  const slugSet = new Set(gpus.map((gpu) => gpu.slug));

  function add(alias, slug) {
    const key = normalizeKey(alias);
    if (key && slugSet.has(slug)) aliases.set(key, slug);
  }

  for (const gpu of gpus) {
    add(gpu.name, gpu.slug);
    add(gpu.name.replace(/\b(NVIDIA|AMD|Radeon|GeForce|Intel|Graphics)\b/gi, ""), gpu.slug);

    const rtx = gpu.name.match(/\b(RTX|GTX)\s*\d{3,4}(?:\s*(?:Ti|Super))*\b/i)?.[0];
    if (rtx) add(rtx, gpu.slug);

    const rx = gpu.name.match(/\bRX\s*\d{3,4}(?:\s*(?:XT|XTX|GRE))?\b/i)?.[0];
    if (rx) {
      add(rx, gpu.slug);
      add(rx.replace(/^RX\s*/i, ""), gpu.slug);
    }

    const arc = gpu.name.match(/\b(?:Arc\s*)?[AB]\d{3}\b/i)?.[0];
    if (arc) {
      add(arc, gpu.slug);
      add(arc.replace(/^Arc\s*/i, ""), gpu.slug);
    }
  }

  for (const [alias, slug] of manualGpuAliases) add(alias, slug);
  return aliases;
}

function cleanGpuLabel(line) {
  return String(line || "")
    .replace(/^Image:\s*/i, "")
    .replace(/^#+\s*/, "")
    .replace(/^\d+\s+/, "")
    .replace(/\s+from\s+[\d,.]+\s*[€$£].*$/i, "")
    .replace(/\s+\d+\s*[€$£].*$/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseFpsRows(lines, title, gameSlug, sourceUrl, gpus) {
  const aliasMap = buildGpuAliasMap(gpus);
  const start = lines.findIndex((line) => new RegExp(`${escapeRegex(title)}.*FPS Benchmark|FPS Benchmark.*GPU Performance`, "i").test(line));
  if (start < 0) return [];
  const end = lines.findIndex((line, index) => index > start && /^###\s*Filter Options$|^Filter Options$/i.test(line));
  const section = lines.slice(start, end > start ? end : lines.length);
  const rows = [];
  let pendingGpuSlug = "";
  let pendingGpuLabel = "";
  let pendingAvg = null;

  for (const line of section) {
    const fpsMatch = line.match(/^(\d+)\s*FPS$/i);
    if (fpsMatch && pendingGpuSlug) {
      const fps = Number(fpsMatch[1]);
      if (pendingAvg === null) {
        pendingAvg = fps;
      } else {
        rows.push(buildBenchmarkRow(gameSlug, pendingGpuSlug, pendingAvg, fps, sourceUrl));
        pendingGpuSlug = "";
        pendingGpuLabel = "";
        pendingAvg = null;
      }
      continue;
    }

    if (/^[-+]?\d+(?:\.\d+)?%\s*FPS$/i.test(line) || /Avg \/ 1% Low|NVIDIA|AMD|INTEL/i.test(line)) continue;

    const label = cleanGpuLabel(line);
    const key = normalizeKey(label);
    const gpuSlug = aliasMap.get(key);
    if (gpuSlug && label !== pendingGpuLabel) {
      pendingGpuSlug = gpuSlug;
      pendingGpuLabel = label;
      pendingAvg = null;
    }
  }

  return rows;
}

function buildBenchmarkRow(gameSlug, gpuSlug, avgFps, onePercentLow, sourceUrl) {
  const row = {
    gameSlug,
    gpuSlug,
    resolution: "1080p",
    fpsLow: onePercentLow,
    fpsMedium: avgFps,
    fpsHigh: 0,
    fpsUltra: 0,
    recommendedSetting: "Medium",
    status: avgFps >= 55 ? "smooth" : avgFps >= 30 ? "playable" : "not_recommended",
    videoTestUrl: sourceUrl,
    source: "DropReference FPS benchmark (1080p medium; avg FPS stored in Medium, 1% low stored in Low)",
  };
  return row;
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function mergeGame(games, nextGame) {
  const existing = games.find((game) => game.slug === nextGame.slug);
  if (!existing) {
    games.push(nextGame);
    return "created";
  }

  if (!existing.coverImage && nextGame.coverImage) existing.coverImage = nextGame.coverImage;
  if (!existing.officialUrl && nextGame.officialUrl) existing.officialUrl = nextGame.officialUrl;
  if (!existing.steamId && nextGame.steamId) existing.steamId = nextGame.steamId;
  return "updated";
}

function mergeImages(gameImages, imageSources, slug, images, sourceUrl) {
  if (!images.length) return;
  const existing = gameImages[slug] ?? [];
  gameImages[slug] = unique([...existing, ...images]).slice(0, 12);

  const previous = imageSources[slug] ?? [];
  const previousUrls = new Set(previous.map((item) => item.url));
  for (const url of images) {
    if (previousUrls.has(url)) continue;
    previous.push({ url, source: "dropreference", sourceUrl });
  }
  imageSources[slug] = previous;
}

function mergeGameSource(gameSources, game, sourceUrl, updatedAt) {
  const index = gameSources.findIndex((item) => item.slug === game.slug && item.source === "dropreference");
  const next = {
    slug: game.slug,
    name: game.name,
    source: "dropreference",
    url: sourceUrl,
    updatedAt,
    note: "Parsed DropReference game detail page for metadata, images, system requirements and FPS benchmark attribution.",
  };
  if (index >= 0) gameSources[index] = next;
  else gameSources.push(next);
}

function mergeBenchmarks(benchmarks, rows) {
  const byKey = new Map(benchmarks.map((row) => [`${row.gameSlug}|${row.gpuSlug}|${row.resolution}`, row]));
  let created = 0;
  let updated = 0;

  for (const row of rows) {
    const key = `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`;
    const existing = byKey.get(key);
    if (!existing) {
      benchmarks.push(row);
      byKey.set(key, row);
      created += 1;
      continue;
    }

    existing.fpsLow = mergeFps(existing.fpsLow, row.fpsLow);
    existing.fpsMedium = mergeFps(existing.fpsMedium, row.fpsMedium);
    existing.videoTestUrl = existing.videoTestUrl || row.videoTestUrl;
    if (!existing.source.includes("DropReference")) existing.source = `${existing.source}; ${row.source}`;
    updated += 1;
  }

  benchmarks.sort((a, b) =>
    a.gameSlug.localeCompare(b.gameSlug) ||
    a.gpuSlug.localeCompare(b.gpuSlug) ||
    a.resolution.localeCompare(b.resolution),
  );

  return { created, updated };
}

function mergeFps(current, next) {
  if (!current) return next;
  if (!next) return current;
  return Math.round((current + next) / 2);
}

function removeIgnoredBenchmarkData(games, benchmarks, gameImages, gameImageSources, gameSources) {
  const beforeGames = games.length;
  for (let index = games.length - 1; index >= 0; index -= 1) {
    if (ignoredBenchmarkSlugs.has(games[index].slug)) games.splice(index, 1);
  }

  for (let index = benchmarks.length - 1; index >= 0; index -= 1) {
    if (ignoredBenchmarkSlugs.has(benchmarks[index].gameSlug)) benchmarks.splice(index, 1);
  }

  for (const slug of ignoredBenchmarkSlugs) {
    delete gameImages[slug];
    delete gameImageSources[slug];
  }

  for (let index = gameSources.length - 1; index >= 0; index -= 1) {
    if (ignoredBenchmarkSlugs.has(gameSources[index].slug)) gameSources.splice(index, 1);
  }

  return beforeGames - games.length;
}

function extractDropReferenceGpuStockNames(html) {
  const names = [];
  for (const line of pageToLines(html)) {
    const label = cleanGpuLabel(line);
    if (/^(?:RTX|GTX|RX)\s*\d|^\d{4}\s*(?:XT|XTX|GRE)?$|^(?:Arc\s*)?[AB]\d{3}$/i.test(label)) {
      names.push(label);
    }
  }
  return unique(names);
}

async function ensureDropReferenceGpuCatalog(gpus) {
  let stockNames = [];
  try {
    stockNames = extractDropReferenceGpuStockNames(await fetchText(GPU_STOCK_URL));
  } catch (error) {
    console.log(`DropReference GPU stock skipped: ${error instanceof Error ? error.message : String(error)}`);
  }

  const existingSlugs = new Set(gpus.map((gpu) => gpu.slug));
  let created = 0;

  for (const gpu of dropReferenceGpuCatalog) {
    if (existingSlugs.has(gpu.slug)) continue;
    gpus.push({ ...gpu });
    existingSlugs.add(gpu.slug);
    created += 1;
  }

  return { created, stockNames: stockNames.length };
}

async function main() {
  const [games, gpus, benchmarks, gameImages, gameImageSources, gameSources] = await Promise.all([
    readJson(gamesPath, []),
    readJson(gpusPath, []),
    readJson(benchmarksPath, []),
    readJson(gameImagesPath, {}),
    readJson(gameImageSourcesPath, {}),
    readJson(gameSourcesPath, []),
  ]);

  const removedIgnoredGames = removeIgnoredBenchmarkData(games, benchmarks, gameImages, gameImageSources, gameSources);
  const gpuCatalogStats = await ensureDropReferenceGpuCatalog(gpus);
  const urls = await discoverBenchmarkUrls(games);
  if (!urls.length) throw new Error("No DropReference benchmark pages discovered.");

  let createdGames = 0;
  let updatedGames = 0;
  let createdBenchmarks = 0;
  let updatedBenchmarks = 0;
  const failures = [];

  for (const url of urls) {
    try {
      const html = await fetchText(url);
      const result = parseDropReferencePage(url, html, gpus);
      const status = mergeGame(games, result.game);
      if (status === "created") createdGames += 1;
      else updatedGames += 1;
      mergeImages(gameImages, gameImageSources, result.game.slug, result.images, result.sourceUrl);
      mergeGameSource(gameSources, result.game, result.sourceUrl, result.updatedAt);
      const benchmarkStats = mergeBenchmarks(benchmarks, result.fpsRows);
      createdBenchmarks += benchmarkStats.created;
      updatedBenchmarks += benchmarkStats.updated;
      console.log(`${result.game.name}: ${result.images.length} images, ${result.fpsRows.length} FPS rows`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/^Ignored non-game benchmark/.test(message)) {
        console.log(`No DropReference benchmark page for ${url}`);
      } else {
        failures.push(`${url}: ${message}`);
        console.log(`Skipped ${url}: ${message}`);
      }
    }
    await sleep(SLEEP_MS);
  }

  if (!createdGames && !updatedGames && !createdBenchmarks && !updatedBenchmarks && !gpuCatalogStats.created) {
    throw new Error("DropReference scrape produced no usable data; keeping existing files untouched.");
  }

  await Promise.all([
    writeJson(gamesPath, games),
    writeJson(gpusPath, gpus),
    writeJson(benchmarksPath, benchmarks),
    writeJson(gameImagesPath, gameImages),
    writeJson(gameImageSourcesPath, gameImageSources),
    writeJson(gameSourcesPath, gameSources),
  ]);

  console.log(`GPU catalog added: ${gpuCatalogStats.created}, DropReference stock names seen: ${gpuCatalogStats.stockNames}.`);
  if (removedIgnoredGames) console.log(`Ignored non-game rows removed: ${removedIgnoredGames}.`);
  console.log(`DropReference complete. Games created: ${createdGames}, games touched: ${updatedGames}.`);
  console.log(`Benchmarks created: ${createdBenchmarks}, benchmarks merged: ${updatedBenchmarks}.`);
  if (failures.length) console.log(`Failures:\n${failures.join("\n")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
