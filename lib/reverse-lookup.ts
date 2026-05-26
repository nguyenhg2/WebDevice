import { benchmarks, devices, findGame, gpus } from "@/lib/data";
import { classifyGame } from "@/lib/compatibility-engine";
import { getBenchmarkVideoUrl } from "@/lib/benchmark-links";
import type { PriceRange } from "@/types";
const cpuScore = (name: string) => name.includes("i7") || name.includes("Ryzen 7") ? 26000 : name.includes("i5") || name.includes("Ryzen 5") ? 17000 : 8500;
export function getRecommendedConfigs(gameSlug: string) { return ["duoi-10-trieu","10-15-trieu","15-20-trieu","20-30-trieu","tren-30-trieu"].map((range) => ({ range, devices: getCompatibleDevices(gameSlug, range as PriceRange).slice(0, 3) })); }
export function getCompatibleDevices(gameSlug: string, budget?: PriceRange) { const game = findGame(gameSlug); if (!game) return []; return devices.filter((d) => !budget || d.priceRange === budget).filter((d) => { const gpu = gpus.find((x) => x.name === d.gpu); if (!gpu) return false; return classifyGame(gpu.benchmarkScore, cpuScore(d.cpu), d.ramGb, "1080p", game.minSpecs, game.recSpecs).status !== "not_recommended"; }); }
export function getBenchmarkVideos(gameSlug: string, gpuSlug?: string) { return benchmarks.filter((b) => b.gameSlug === gameSlug && (!gpuSlug || b.gpuSlug === gpuSlug) && getBenchmarkVideoUrl(b)).slice(0, 12); }
export function getBenchmarkTable(gameSlug: string) { return benchmarks.filter((b) => b.gameSlug === gameSlug).sort((a,b) => (gpus.find((g) => g.slug === a.gpuSlug)?.benchmarkScore ?? 0) - (gpus.find((g) => g.slug === b.gpuSlug)?.benchmarkScore ?? 0)); }
