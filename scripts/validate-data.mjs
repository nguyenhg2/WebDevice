import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const allowedResolutions = new Set(["720p", "1080p", "1440p", "4k"]);
const allowedStatuses = new Set(["smooth", "playable", "not_recommended"]);
const allowedSettings = new Set(["Low", "Medium", "High", "Ultra"]);
const allowedBenchmarkConfidence = new Set(["measured", "matched", "manual", "estimated"]);
const maxBenchmarkFps = 1200;
const blockedSourcePattern = /dropreference|pcgamebenchmark|howmanyfps|technical\.city|notebookcheck/i;

const errors = [];
const warnings = [];

const games = readJson("data/games.json");
const gpus = readJson("data/gpus.json");
const cpus = readJson("data/cpus.json");
const devices = readJson("data/devices.json");
const benchmarks = readJson("data/benchmarks.json");
const blogPosts = readJson("data/blog-posts.json");
const gameImages = readJson("data/game-images.json");
const gameAliases = readJson("data/game-aliases.json");
const gameExpansionCandidates = readJson("data/game-expansion-candidates.json", []);
const disabledSourceFiles = [
  ["data/external-fps-samples.json", readJson("data/external-fps-samples.json")],
  ["data/data-source-status.json", readJson("data/data-source-status.json")],
  ["data/game-sources.json", readJson("data/game-sources.json")],
  ["data/game-image-sources.json", readJson("data/game-image-sources.json")],
  ["data/game-image-source-packs.json", readJson("data/game-image-source-packs.json")],
];

validateUniqueSlug("game", games);
validateUniqueSlug("gpu", gpus);
validateUniqueSlug("cpu", cpus);
validateUniqueSlug("device", devices);
validateUniqueSlug("blog", blogPosts);

const gameSlugs = new Set(games.map((game) => game.slug));
const gpuSlugs = new Set(gpus.map((gpu) => gpu.slug));
const cpuSlugs = new Set(cpus.map((cpu) => cpu.slug));

for (const game of games) validateGame(game);
for (const gpu of gpus) validateGpu(gpu);
for (const cpu of cpus) validateCpu(cpu);
for (const device of devices) validateDevice(device);
for (const benchmark of benchmarks) validateBenchmark(benchmark);
for (const post of blogPosts) validateBlogPost(post);
for (const row of gameAliases) validateGameAlias(row);
for (const row of gameExpansionCandidates) validateGameExpansionCandidate(row);
for (const [file, value] of disabledSourceFiles) validateDisabledSourceFile(file, value);

const benchmarkKeys = new Set();
for (const row of benchmarks) {
  const key = `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`;
  if (benchmarkKeys.has(key)) errors.push(`Duplicate benchmark key: ${key}`);
  benchmarkKeys.add(key);
}

const benchmarkedGames = new Set(benchmarks.map((row) => row.gameSlug));
const benchmarkedGpus = new Set(benchmarks.map((row) => row.gpuSlug));

printSummary();

if (errors.length) {
  console.error("\nData validation failed:");
  for (const error of errors.slice(0, 80)) console.error(`- ${error}`);
  if (errors.length > 80) console.error(`- ... ${errors.length - 80} more errors`);
  process.exit(1);
}

if (warnings.length) {
  console.warn("\nData validation warnings:");
  for (const warning of warnings.slice(0, 40)) console.warn(`- ${warning}`);
  if (warnings.length > 40) console.warn(`- ... ${warnings.length - 40} more warnings`);
}

console.log("Data validation passed.");

function validateGame(game) {
  requireText(game.slug, `Game missing slug: ${game.name || "(unnamed)"}`);
  requireText(game.name, `Game ${game.slug} missing name`);
  requireText(game.description, `Game ${game.slug} missing description`);
  if (!Array.isArray(game.genres) || !game.genres.length) errors.push(`Game ${game.slug} missing genres`);
  if (!positiveNumber(game.sizeGb)) errors.push(`Game ${game.slug} has invalid sizeGb`);
  if (!game.coverImage) errors.push(`Game ${game.slug} missing coverImage`);
  else validateAssetOrUrl(game.coverImage, `Game ${game.slug} coverImage`);
  if (!game.officialUrl || !isHttpUrl(game.officialUrl)) errors.push(`Game ${game.slug} has invalid officialUrl`);
  validateSpecBlock(game.minSpecs, `Game ${game.slug} minSpecs`);
  validateSpecBlock(game.recSpecs, `Game ${game.slug} recSpecs`);
  for (const image of gameImages[game.slug] || []) validateAssetOrUrl(image, `Game ${game.slug} gallery image`);
}

function validateGpu(gpu) {
  requireText(gpu.slug, `GPU missing slug: ${gpu.name || "(unnamed)"}`);
  requireText(gpu.name, `GPU ${gpu.slug} missing name`);
  if (!positiveNumber(gpu.benchmarkScore)) errors.push(`GPU ${gpu.slug} has invalid benchmarkScore`);
  if (!gpu.brand) errors.push(`GPU ${gpu.slug} missing brand`);
}

function validateCpu(cpu) {
  requireText(cpu.slug, `CPU missing slug: ${cpu.name || "(unnamed)"}`);
  requireText(cpu.name, `CPU ${cpu.slug} missing name`);
  if (!positiveNumber(cpu.benchmarkScore)) errors.push(`CPU ${cpu.slug} has invalid benchmarkScore`);
}

function validateDevice(device) {
  requireText(device.slug, `Device missing slug: ${device.name || "(unnamed)"}`);
  requireText(device.name, `Device ${device.slug} missing name`);
  if (device.imageUrl) validateAssetOrUrl(device.imageUrl, `Device ${device.slug} imageUrl`);
}

function validateBenchmark(row) {
  const key = `${row.gameSlug}|${row.gpuSlug}|${row.resolution}`;
  if (!gameSlugs.has(row.gameSlug)) errors.push(`Benchmark ${key} references missing game`);
  if (!gpuSlugs.has(row.gpuSlug)) errors.push(`Benchmark ${key} references missing GPU`);
  if (!allowedResolutions.has(row.resolution)) errors.push(`Benchmark ${key} has invalid resolution`);
  if (!allowedStatuses.has(row.status)) errors.push(`Benchmark ${key} has invalid status`);
  if (!allowedSettings.has(row.recommendedSetting)) errors.push(`Benchmark ${key} has invalid recommendedSetting`);
  if (!Number.isInteger(row.avgFps) || row.avgFps < 0 || row.avgFps > maxBenchmarkFps) errors.push(`Benchmark ${key} has invalid avgFps`);
  if (row.onePercentLow !== null && row.onePercentLow !== undefined && (!Number.isInteger(row.onePercentLow) || row.onePercentLow < 0 || row.onePercentLow > maxBenchmarkFps)) errors.push(`Benchmark ${key} has invalid onePercentLow`);
  for (const field of ["fpsLow", "fpsMedium", "fpsHigh", "fpsUltra"]) {
    if (!Number.isInteger(row[field]) || row[field] < 0 || row[field] > maxBenchmarkFps) errors.push(`Benchmark ${key} has invalid ${field}`);
  }
  if (!row.source) errors.push(`Benchmark ${key} missing source`);
  if (blockedSourcePattern.test(row.source)) errors.push(`Benchmark ${key} contains blocked external source label`);
  if ("sourceUrl" in row) errors.push(`Benchmark ${key} should not contain sourceUrl; keep only videoTestUrl`);
  if (!allowedBenchmarkConfidence.has(row.confidence)) errors.push(`Benchmark ${key} has invalid confidence`);
  if (!row.updatedAt || Number.isNaN(Date.parse(row.updatedAt))) errors.push(`Benchmark ${key} has invalid updatedAt`);
  if (row.videoTestUrl) {
    if (!isHttpUrl(row.videoTestUrl)) errors.push(`Benchmark ${key} has invalid videoTestUrl`);
    if (!isVideoUrl(row.videoTestUrl)) errors.push(`Benchmark ${key} videoTestUrl is not an approved video URL`);
  }
}

function validateBlogPost(post) {
  requireText(post.slug, `Blog missing slug: ${post.title || "(untitled)"}`);
  for (const field of ["title", "excerpt", "content", "category", "metaTitle", "metaDescription", "publishedAt"]) {
    requireText(post[field], `Blog ${post.slug} missing ${field}`);
  }
  if (post.publishedAt && Number.isNaN(Date.parse(post.publishedAt))) errors.push(`Blog ${post.slug} has invalid publishedAt`);
  if (!String(post.content || "").includes("/tra-cuu")) warnings.push(`Blog ${post.slug} does not link to /tra-cuu`);
}

function validateGameAlias(row) {
  if (!gameSlugs.has(row.gameSlug)) errors.push(`Game alias target missing: ${row.gameSlug}`);
  const aliases = [row.alias, row.sourceSlug, ...(row.aliases || [])].filter(Boolean);
  if (!aliases.length) errors.push(`Game alias ${row.gameSlug} has no aliases`);
}

function validateGameExpansionCandidate(row) {
  requireText(row.slug, "Game expansion candidate missing slug");
  requireText(row.name, `Game expansion candidate ${row.slug || "(unknown)"} missing name`);
  if ("fps" in row || "avgFps" in row || "sourceUrl" in row || "url" in row) {
    errors.push(`Game expansion candidate ${row.slug} must not store FPS or external source URLs`);
  }
}

function validateDisabledSourceFile(file, value) {
  const count = Array.isArray(value) ? value.length : value && typeof value === "object" ? Object.keys(value).length : 0;
  if (count > 0) errors.push(`${file} must stay empty because external source catalogs are disabled`);
}

function validateSpecBlock(specs, label) {
  if (!specs || typeof specs !== "object") {
    errors.push(`${label} missing`);
    return;
  }
  for (const field of ["cpuName", "gpuName"]) requireText(specs[field], `${label} missing ${field}`);
  for (const field of ["cpuBenchmark", "gpuBenchmark", "ramGb", "storageGb"]) {
    if (!positiveNumber(specs[field])) errors.push(`${label} has invalid ${field}`);
  }
}

function validateUniqueSlug(label, rows) {
  const seen = new Set();
  for (const row of rows) {
    if (seen.has(row.slug)) errors.push(`Duplicate ${label} slug: ${row.slug}`);
    seen.add(row.slug);
  }
}

function validateAssetOrUrl(value, label) {
  if (isHttpUrl(value)) {
    if (blockedSourcePattern.test(value)) errors.push(`${label} uses blocked external source domain`);
    return;
  }
  if (typeof value === "string" && value.startsWith("/")) {
    const filePath = path.join(root, "public", value.slice(1));
    if (!fs.existsSync(filePath)) warnings.push(`${label} points to missing local asset: ${value}`);
    return;
  }
  errors.push(`${label} is not a valid URL or public asset path`);
}

function requireText(value, message) {
  if (typeof value !== "string" || !value.trim()) errors.push(message);
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function isHttpUrl(value) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isVideoUrl(value) {
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return /(?:youtube\.com|youtu\.be|vimeo\.com|bilibili\.com)$/i.test(host);
  } catch {
    return false;
  }
}

function readJson(file, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") return fallback;
    errors.push(`${file}: ${error instanceof Error ? error.message : String(error)}`);
    return fallback;
  }
}

function printSummary() {
  console.log(
    [
      `Games: ${games.length} (${benchmarkedGames.size} with benchmark)`,
      `GPUs: ${gpus.length} (${benchmarkedGpus.size} with benchmark)`,
      `CPUs: ${cpus.length}`,
      `Devices: ${devices.length}`,
      `Benchmarks: ${benchmarks.length}`,
      `Blog posts: ${blogPosts.length}`,
      `Game expansion candidates: ${gameExpansionCandidates.length}`,
      "External source catalogs: disabled",
    ].join("\n"),
  );
}
