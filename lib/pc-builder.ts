import { benchmarks, cpus, devices, games, gpus } from "@/lib/data";
import { clamp } from "@/lib/utils";
import type { Cpu, Device, Game, Gpu, Resolution } from "@/types";

export type BuildUsage = "gaming" | "streaming";
export type GraphicsQuality = "low" | "medium" | "high" | "ultra";

export interface PcBuilderInput {
  budgetVnd: number;
  gameSlugs: string[];
  resolution: Resolution;
  targetFps: number;
  quality: GraphicsQuality;
  usage: BuildUsage;
  preferLaptop: boolean;
}

export interface GamePerformance {
  game: Game;
  fps: number;
  status: "pass" | "near" | "miss";
}

export interface ComponentBuild {
  gpu: Gpu;
  cpu: Cpu;
  ramGb: number;
  storageGb: number;
  estimatedPriceVnd: number;
  budgetStatus: "within" | "stretch" | "over";
  minFps: number;
  averageFps: number;
  performance: GamePerformance[];
  notes: string[];
}

export interface DeviceRecommendation {
  device: Device;
  matchedGpu?: Gpu;
  matchedCpu?: Cpu;
  minFps: number;
  averageFps: number;
  budgetStatus: "within" | "stretch" | "over";
  performance: GamePerformance[];
  notes: string[];
}

export interface PcBuilderPlan {
  input: PcBuilderInput;
  selectedGames: Game[];
  primaryBuild: ComponentBuild;
  alternativeBuilds: ComponentBuild[];
  deviceRecommendations: DeviceRecommendation[];
  requiredRamGb: number;
  requiredStorageGb: number;
}

const defaultGameSlugs = ["counter-strike-2", "valorant", "fortnite", "grand-theft-auto-v", "cyberpunk-2077"];
const qualityFpsKey: Record<GraphicsQuality, "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra"> = {
  low: "fpsLow",
  medium: "fpsMedium",
  high: "fpsHigh",
  ultra: "fpsUltra",
};
const qualityDemand: Record<GraphicsQuality, number> = { low: 0.72, medium: 1, high: 1.28, ultra: 1.55 };
const resolutionDemand: Record<Resolution, number> = { "720p": 0.72, "1080p": 1, "1440p": 1.45, "4k": 2.3 };
const cpuResolutionDemand: Record<Resolution, number> = { "720p": 1.08, "1080p": 1, "1440p": 0.96, "4k": 0.92 };
export const popularBuilderGames = games
  .filter((game) => defaultGameSlugs.includes(game.slug) || benchmarks.some((row) => row.gameSlug === game.slug))
  .sort((a, b) => {
    const aDefault = defaultGameSlugs.indexOf(a.slug);
    const bDefault = defaultGameSlugs.indexOf(b.slug);
    if (aDefault !== -1 || bDefault !== -1) return (aDefault === -1 ? 99 : aDefault) - (bDefault === -1 ? 99 : bDefault);
    return benchmarkCount(b.slug) - benchmarkCount(a.slug);
  })
  .slice(0, 18);

export function createPcBuilderPlan(input: Partial<PcBuilderInput>): PcBuilderPlan {
  const normalizedInput = normalizeBuilderInput(input);
  const selectedGames = selectGames(normalizedInput.gameSlugs);
  const requiredRamGb = getRequiredRam(normalizedInput, selectedGames);
  const requiredStorageGb = getRequiredStorage(selectedGames);
  const componentBuilds = rankComponentBuilds(normalizedInput, selectedGames, requiredRamGb, requiredStorageGb);
  const deviceRecommendations = rankDevices(normalizedInput, selectedGames);
  const primaryBuild = componentBuilds[0];

  return {
    input: normalizedInput,
    selectedGames,
    primaryBuild,
    alternativeBuilds: pickAlternatives(componentBuilds, primaryBuild),
    deviceRecommendations,
    requiredRamGb,
    requiredStorageGb,
  };
}

export function normalizeBuilderInput(input: Partial<PcBuilderInput>): PcBuilderInput {
  const rawBudget = Number.isFinite(input.budgetVnd) ? input.budgetVnd ?? 15_000_000 : 15_000_000;
  const budgetVnd = clamp(Math.round(rawBudget), 4_000_000, 120_000_000);
  const rawTargetFps = Number.isFinite(input.targetFps) ? input.targetFps ?? 60 : 60;
  const targetFps = [60, 90, 120, 144, 240].includes(rawTargetFps) ? rawTargetFps : 60;
  const resolution = input.resolution && ["720p", "1080p", "1440p", "4k"].includes(input.resolution) ? input.resolution : "1080p";
  const quality = input.quality && ["low", "medium", "high", "ultra"].includes(input.quality) ? input.quality : "high";
  const usage = input.usage === "streaming" ? "streaming" : "gaming";
  const gameSlugs = input.gameSlugs?.filter((slug) => games.some((game) => game.slug === slug)).slice(0, 5) ?? defaultGameSlugs.slice(0, 3);

  return {
    budgetVnd,
    gameSlugs: gameSlugs.length ? gameSlugs : defaultGameSlugs.slice(0, 3),
    resolution,
    targetFps,
    quality,
    usage,
    preferLaptop: Boolean(input.preferLaptop),
  };
}

function rankComponentBuilds(input: PcBuilderInput, selectedGames: Game[], ramGb: number, storageGb: number): ComponentBuild[] {
  const candidates: Array<ComponentBuild & { score: number }> = [];

  for (const gpu of gpus) {
    if (gpu.category === "integrated" && input.resolution !== "720p" && input.quality !== "low") continue;
    if (input.preferLaptop && !gpu.isLaptop) continue;

    for (const cpu of cpus) {
      const estimatedPriceVnd = estimateBuildPrice(gpu, cpu, ramGb, storageGb, input);
      const performance = selectedGames.map((game) => scoreGame(game, gpu.benchmarkScore, cpu.benchmarkScore, ramGb, input, gpu.slug));
      const minFps = Math.min(...performance.map((item) => item.fps));
      const averageFps = Math.round(performance.reduce((sum, item) => sum + item.fps, 0) / performance.length);
      const budgetStatus = getBudgetStatus(estimatedPriceVnd, input.budgetVnd);
      const passCount = performance.filter((item) => item.status === "pass").length;
      const cpuGpuBalance = Math.min(gpu.benchmarkScore / Math.max(cpu.benchmarkScore, 1), 1.75);
      const pricePenalty = estimatedPriceVnd > input.budgetVnd ? ((estimatedPriceVnd - input.budgetVnd) / input.budgetVnd) * 55 : 0;
      const underSpendPenalty = estimatedPriceVnd < input.budgetVnd * 0.55 && minFps < input.targetFps * 1.35 ? 8 : 0;
      const laptopPenalty = gpu.isLaptop && !input.preferLaptop ? 5 : 0;
      const score =
        passCount * 32 +
        clamp(minFps / input.targetFps, 0, 1.9) * 38 +
        clamp(averageFps / input.targetFps, 0, 2) * 16 +
        clamp(cpuGpuBalance, 0.55, 1.35) * 8 -
        pricePenalty -
        underSpendPenalty -
        laptopPenalty;

      candidates.push({
        gpu,
        cpu,
        ramGb,
        storageGb,
        estimatedPriceVnd,
        budgetStatus,
        minFps,
        averageFps,
        performance,
        notes: buildNotes(input, gpu, cpu, ramGb, storageGb, performance, estimatedPriceVnd),
        score,
      });
    }
  }

  return candidates
    .sort((a, b) => b.score - a.score || a.estimatedPriceVnd - b.estimatedPriceVnd)
    .map(({ score: _score, ...candidate }) => candidate)
    .slice(0, 60);
}

function rankDevices(input: PcBuilderInput, selectedGames: Game[]): DeviceRecommendation[] {
  return devices
    .map((device) => {
      const matchedGpu = findGpuByName(device.gpu);
      const matchedCpu = findCpuByName(device.cpu);
      const gpuScore = matchedGpu?.benchmarkScore ?? (matchedCpu?.integratedGpu ? 1700 : 0);
      const cpuScore = matchedCpu?.benchmarkScore ?? inferCpuScore(device.cpu);
      const performance = selectedGames.map((game) => scoreGame(game, gpuScore, cpuScore, device.ramGb, input, matchedGpu?.slug));
      const minFps = Math.min(...performance.map((item) => item.fps));
      const averageFps = Math.round(performance.reduce((sum, item) => sum + item.fps, 0) / performance.length);
      const budgetStatus = getBudgetStatus(device.priceVnd, input.budgetVnd);
      const passCount = performance.filter((item) => item.status === "pass").length;
      const typeBonus = input.preferLaptop ? (device.type.toLowerCase().includes("laptop") ? 10 : -8) : device.type.toLowerCase().includes("laptop") ? -4 : 5;
      const pricePenalty = device.priceVnd > input.budgetVnd ? ((device.priceVnd - input.budgetVnd) / input.budgetVnd) * 50 : 0;
      const score =
        passCount * 32 +
        clamp(minFps / input.targetFps, 0, 1.8) * 36 +
        clamp(averageFps / input.targetFps, 0, 2) * 14 +
        typeBonus -
        pricePenalty;

      return {
        device,
        matchedGpu,
        matchedCpu,
        minFps,
        averageFps,
        budgetStatus,
        performance,
        notes: deviceNotes(device, input, performance),
        score,
      };
    })
    .sort((a, b) => b.score - a.score || a.device.priceVnd - b.device.priceVnd)
    .slice(0, 6)
    .map(({ score: _score, ...item }) => item);
}

function scoreGame(game: Game, gpuScore: number, cpuScore: number, ramGb: number, input: PcBuilderInput, gpuSlug?: string): GamePerformance {
  const measuredFps = gpuSlug ? measuredBenchmarkFps(game.slug, gpuSlug, input.resolution, input.quality) : 0;
  const fps =
    measuredFps > 0
      ? adjustMeasuredFps(measuredFps, input)
      : estimateGameFps(game, gpuScore, cpuScore, ramGb, input);
  const roundedFps = Math.round(clamp(fps, 6, 260));
  const status = roundedFps >= input.targetFps ? "pass" : roundedFps >= input.targetFps * 0.82 ? "near" : "miss";
  return { game, fps: roundedFps, status };
}

function estimateGameFps(game: Game, gpuScore: number, cpuScore: number, ramGb: number, input: PcBuilderInput): number {
  const gpuNeed = game.recSpecs.gpuBenchmark * resolutionDemand[input.resolution] * qualityDemand[input.quality];
  const cpuNeed =
    game.recSpecs.cpuBenchmark *
    cpuResolutionDemand[input.resolution] *
    (input.targetFps >= 120 ? 1.18 : 1) *
    (input.usage === "streaming" ? 1.22 : 1);
  const ramNeed = Math.max(game.recSpecs.ramGb, getRequiredRam(input, [game]));
  const gpuRatio = gpuScore / Math.max(gpuNeed, 1);
  const cpuRatio = cpuScore / Math.max(cpuNeed, 1);
  const ramRatio = ramGb / Math.max(ramNeed, 1);
  const fpsMultiplier = Math.pow(Math.max(input.targetFps, 60) / 60, 0.16);
  const balancedRatio = Math.min(gpuRatio, cpuRatio * 1.06, ramRatio < 1 ? ramRatio * 0.82 : 1.45);
  return 60 * balancedRatio / fpsMultiplier;
}

function measuredBenchmarkFps(gameSlug: string, gpuSlug: string, resolution: Resolution, quality: GraphicsQuality): number {
  const row = benchmarks.find((item) => item.gameSlug === gameSlug && item.gpuSlug === gpuSlug && item.resolution === resolution);
  if (!row) return 0;
  const exact = row[qualityFpsKey[quality]];
  if (exact > 0) return exact;
  const mediumAnchored = row.fpsMedium || row.fpsHigh || row.fpsUltra || row.fpsLow;
  if (!mediumAnchored) return 0;
  const targetScale = { low: 1.18, medium: 1, high: 0.78, ultra: 0.62 }[quality];
  return mediumAnchored * targetScale;
}

function adjustMeasuredFps(fps: number, input: PcBuilderInput): number {
  const usageTax = input.usage === "streaming" ? 0.9 : 1;
  const targetTax = input.targetFps >= 144 ? 0.96 : 1;
  return fps * usageTax * targetTax;
}

function pickAlternatives(builds: ComponentBuild[], primary: ComponentBuild): ComponentBuild[] {
  const alternatives: ComponentBuild[] = [];
  const seen = new Set([`${primary.gpu.slug}:${primary.cpu.slug}`]);
  const push = (candidate: ComponentBuild | undefined) => {
    if (!candidate) return;
    const key = `${candidate.gpu.slug}:${candidate.cpu.slug}`;
    if (seen.has(key)) return;
    seen.add(key);
    alternatives.push(candidate);
  };

  push(builds.find((build) => build.estimatedPriceVnd < primary.estimatedPriceVnd * 0.86 && build.minFps >= primary.minFps * 0.82));
  push(builds.find((build) => build.minFps > primary.minFps * 1.12 && build.estimatedPriceVnd <= primary.estimatedPriceVnd * 1.22));
  for (const build of builds) {
    if (alternatives.length >= 3) break;
    push(build);
  }

  return alternatives.slice(0, 3);
}

function estimateBuildPrice(gpu: Gpu, cpu: Cpu, ramGb: number, storageGb: number, input: PcBuilderInput): number {
  const gpuPrice = gpu.category === "integrated" ? 0 : priceFromRange(gpu.priceRangeVnd, "gpu");
  const cpuPrice = priceFromRange(cpu.priceRangeVnd, "cpu") * (input.usage === "streaming" ? 1.08 : 1);
  const ramPrice = ramGb <= 8 ? 520_000 : ramGb <= 16 ? 920_000 : ramGb <= 32 ? 1_750_000 : 3_250_000;
  const storagePrice = storageGb <= 512 ? 900_000 : storageGb <= 1024 ? 1_450_000 : 2_650_000;
  const boardPrice = cpu.priceRangeVnd === "15trieu+" ? 3_600_000 : cpu.priceRangeVnd === "7-15trieu" ? 2_500_000 : 1_650_000;
  const psuPrice = Math.max(950_000, Math.min(3_400_000, 900_000 + (gpu.tdp ?? 120) * 8_000));
  const caseCoolingPrice = gpu.priceRangeVnd === "15trieu+" || cpu.priceRangeVnd === "15trieu+" ? 2_600_000 : 1_450_000;
  const assemblyBuffer = 850_000;
  return Math.round(gpuPrice + cpuPrice + ramPrice + storagePrice + boardPrice + psuPrice + caseCoolingPrice + assemblyBuffer);
}

function priceFromRange(range: string, kind: "gpu" | "cpu"): number {
  const priceMap: Record<string, { gpu: number; cpu: number }> = {
    "0-3trieu": { gpu: 1_650_000, cpu: 1_450_000 },
    "3-7trieu": { gpu: 4_800_000, cpu: 4_400_000 },
    "7-15trieu": { gpu: 10_800_000, cpu: 9_600_000 },
    "15trieu+": { gpu: 18_500_000, cpu: 16_000_000 },
  };
  return priceMap[range]?.[kind] ?? (kind === "gpu" ? 5_500_000 : 4_800_000);
}

function getRequiredRam(input: PcBuilderInput, selectedGames: Game[]): number {
  const gameNeed = Math.max(...selectedGames.map((game) => game.recSpecs.ramGb), 8);
  const qualityNeed = input.resolution === "4k" || input.quality === "ultra" || input.usage === "streaming" ? 32 : 16;
  return Math.max(gameNeed, qualityNeed);
}

function getRequiredStorage(selectedGames: Game[]): number {
  const gameStorage = selectedGames.reduce((sum, game) => sum + game.sizeGb, 0) + 180;
  if (gameStorage > 1024) return 2048;
  if (gameStorage > 420) return 1024;
  return 512;
}

function buildNotes(
  input: PcBuilderInput,
  gpu: Gpu,
  cpu: Cpu,
  ramGb: number,
  storageGb: number,
  performance: GamePerformance[],
  priceVnd: number,
): string[] {
  const notes: string[] = [];
  const misses = performance.filter((item) => item.status === "miss");
  if (misses.length === 0) notes.push(`Đạt mục tiêu ${input.targetFps} FPS cho nhóm game đã chọn ở ${input.resolution}.`);
  else notes.push(`Cần hạ setting ở ${misses.map((item) => item.game.name).slice(0, 2).join(", ")} để giữ FPS ổn định.`);
  if (priceVnd <= input.budgetVnd) notes.push("Nằm trong ngân sách, còn dư cho màn hình hoặc nâng SSD.");
  else if (priceVnd <= input.budgetVnd * 1.12) notes.push("Vượt nhẹ ngân sách nhưng đáng cân nhắc nếu ưu tiên FPS.");
  else notes.push("Vượt ngân sách, phù hợp làm mốc nâng cấp hơn là cấu hình mua ngay.");
  if (gpu.vram && gpu.vram < 8 && (input.resolution === "1440p" || input.resolution === "4k")) notes.push("VRAM dưới 8GB không lý tưởng cho texture cao ở 1440p/4K.");
  if (input.usage === "streaming" && cpu.cores < 6) notes.push("Streaming nên ưu tiên CPU 6 nhân trở lên.");
  notes.push(`${ramGb}GB RAM và SSD ${storageGb >= 1024 ? storageGb / 1024 + "TB" : storageGb + "GB"} đủ rộng cho các game đã chọn.`);
  return notes;
}

function deviceNotes(device: Device, input: PcBuilderInput, performance: GamePerformance[]): string[] {
  const notes: string[] = [];
  const passCount = performance.filter((item) => item.status === "pass").length;
  notes.push(`${passCount}/${performance.length} game đạt mục tiêu ${input.targetFps} FPS.`);
  notes.push(device.priceVnd <= input.budgetVnd ? "Giá nằm trong ngân sách." : "Giá cao hơn ngân sách đã chọn.");
  if (device.ramGb < 16) notes.push("Nên nâng RAM lên 16GB nếu có thể.");
  if (input.preferLaptop && !device.type.toLowerCase().includes("laptop")) notes.push("Đây là PC desktop, không phải laptop.");
  return notes;
}

function selectGames(gameSlugs: string[]): Game[] {
  const selected = gameSlugs.map((slug) => games.find((game) => game.slug === slug)).filter((game): game is Game => Boolean(game));
  return selected.length ? selected : defaultGameSlugs.map((slug) => games.find((game) => game.slug === slug)).filter((game): game is Game => Boolean(game));
}

function benchmarkCount(gameSlug: string): number {
  return benchmarks.filter((row) => row.gameSlug === gameSlug).length;
}

function getBudgetStatus(priceVnd: number, budgetVnd: number): "within" | "stretch" | "over" {
  if (priceVnd <= budgetVnd) return "within";
  if (priceVnd <= budgetVnd * 1.12) return "stretch";
  return "over";
}

function findGpuByName(name: string): Gpu | undefined {
  const key = normalizeHardwareName(name);
  return gpus.find((gpu) => normalizeHardwareName(gpu.name) === key) ?? gpus.find((gpu) => key.includes(normalizeHardwareName(gpu.name)));
}

function findCpuByName(name: string): Cpu | undefined {
  const key = normalizeHardwareName(name);
  return cpus.find((cpu) => normalizeHardwareName(cpu.name) === key) ?? cpus.find((cpu) => key.includes(normalizeHardwareName(cpu.name)));
}

function inferCpuScore(name: string): number {
  const key = normalizeHardwareName(name);
  const family = cpus.find((cpu) => key.includes(normalizeHardwareName(cpu.name).slice(0, 14)));
  return family?.benchmarkScore ?? 5200;
}

function normalizeHardwareName(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\b(nvidia|amd|radeon|intel|core|geforce|graphics|gpu|cpu)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}
