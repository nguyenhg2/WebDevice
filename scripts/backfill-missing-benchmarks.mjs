import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const gpusPath = path.join(root, "data", "gpus.json");
const benchmarksPath = path.join(root, "data", "benchmarks.json");
const now = new Date().toISOString();
const sourceLabel = "FPS noi bo; uoc tinh tu cau hinh chinh thuc va thang diem GPU";

const games = readJson(gamesPath);
const gpus = readJson(gpusPath);
const benchmarks = readJson(benchmarksPath);
const benchmarkKeys = new Set(benchmarks.map((row) => keyFor(row.gameSlug, row.gpuSlug, row.resolution)));
const added = [];

for (const game of games) {
  for (const gpu of gpus) {
    const key = keyFor(game.slug, gpu.slug, "1080p");
    if (benchmarkKeys.has(key)) continue;

    const row = buildBenchmarkRow(game, gpu);
    benchmarks.push(row);
    benchmarkKeys.add(key);
    added.push(key);
  }
}

writeJson(benchmarksPath, benchmarks);

console.log(`Added ${added.length} missing benchmark rows.`);
console.log(`Benchmarks: ${benchmarks.length}`);

function buildBenchmarkRow(game, gpu) {
  const minGpu = positiveNumber(game.minSpecs?.gpuBenchmark) ? game.minSpecs.gpuBenchmark : 3000;
  const recGpu = positiveNumber(game.recSpecs?.gpuBenchmark) ? game.recSpecs.gpuBenchmark : Math.max(9000, minGpu * 1.65);
  const fpsMedium = estimateFps(gpu.benchmarkScore, minGpu, recGpu);
  const fpsLow = clamp(Math.round(fpsMedium * 1.24), 8, 240);
  const fpsHigh = clamp(Math.round(fpsMedium * 0.82), 0, 220);
  const fpsUltra = clamp(Math.round(fpsMedium * 0.64), 0, 200);
  const recommendedSetting = fpsUltra >= 55 ? "Ultra" : fpsHigh >= 55 ? "High" : fpsMedium >= 35 ? "Medium" : "Low";
  const avgFps = recommendedSetting === "Ultra" ? fpsUltra : recommendedSetting === "High" ? fpsHigh : recommendedSetting === "Medium" ? fpsMedium : fpsLow;

  return {
    gameSlug: game.slug,
    gpuSlug: gpu.slug,
    resolution: "1080p",
    fpsLow,
    fpsMedium,
    fpsHigh,
    fpsUltra,
    recommendedSetting,
    status: avgFps >= 55 ? "smooth" : avgFps >= 30 ? "playable" : "not_recommended",
    videoTestUrl: null,
    source: sourceLabel,
    setting: recommendedSetting,
    avgFps,
    onePercentLow: Math.max(1, Math.round(avgFps * 0.68)),
    confidence: "estimated",
    updatedAt: now,
  };
}

function estimateFps(gpuBenchmark, minGpu, recGpu) {
  const ratio = gpuBenchmark >= recGpu ? gpuBenchmark / Math.max(recGpu, 1) : (gpuBenchmark / Math.max(minGpu, 1)) * 0.62;
  return clamp(Math.round(52 * ratio), 8, 180);
}

function keyFor(gameSlug, gpuSlug, resolution) {
  return `${gameSlug}|${gpuSlug}|${resolution}`;
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
