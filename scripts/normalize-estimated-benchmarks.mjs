import fs from "node:fs";
import path from "node:path";
import { buildEstimatedBenchmarkRow, ESTIMATED_FPS_SOURCE } from "./lib/fps-estimator.mjs";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const gpusPath = path.join(root, "data", "gpus.json");
const benchmarksPath = path.join(root, "data", "benchmarks.json");
const updatedAt = process.env.BENCHMARK_UPDATED_AT || new Date().toISOString();

const games = readJson(gamesPath);
const gpus = readJson(gpusPath);
const benchmarks = readJson(benchmarksPath);
const gamesBySlug = new Map(games.map((game) => [game.slug, game]));
const gpusBySlug = new Map(gpus.map((gpu) => [gpu.slug, gpu]));

let normalized = 0;
let skipped = 0;

const nextBenchmarks = benchmarks.map((row) => {
  if (row.confidence !== "estimated") return row;

  const game = gamesBySlug.get(row.gameSlug);
  const gpu = gpusBySlug.get(row.gpuSlug);
  if (!game || !gpu) {
    skipped += 1;
    return row;
  }

  normalized += 1;
  return buildEstimatedBenchmarkRow(game, gpu, {
    resolution: row.resolution || "1080p",
    videoTestUrl: row.videoTestUrl ?? null,
    source: ESTIMATED_FPS_SOURCE,
    updatedAt,
  });
});

writeJson(benchmarksPath, nextBenchmarks);

console.log(`Normalized ${normalized} estimated benchmark rows.`);
if (skipped) console.log(`Skipped ${skipped} rows with missing game or GPU references.`);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}
