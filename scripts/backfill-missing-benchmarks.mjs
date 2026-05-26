import fs from "node:fs";
import path from "node:path";
import { buildEstimatedBenchmarkRow, ESTIMATED_FPS_SOURCE } from "./lib/fps-estimator.mjs";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const gpusPath = path.join(root, "data", "gpus.json");
const benchmarksPath = path.join(root, "data", "benchmarks.json");
const now = new Date().toISOString();
const sourceLabel = ESTIMATED_FPS_SOURCE;

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
  return buildEstimatedBenchmarkRow(game, gpu, { updatedAt: now, source: sourceLabel });
}

function keyFor(gameSlug, gpuSlug, resolution) {
  return `${gameSlug}|${gpuSlug}|${resolution}`;
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
