import type { Benchmark, Resolution, SpecBlock, Status } from "@/types";
import { clamp } from "@/lib/utils";

export interface CompatibilityResult {
  status: Status;
  estimatedFps: number;
  recommendedSetting: string;
  bottleneck: string;
  upgradeAdvice: string[];
}

type BenchmarkHint = Pick<Benchmark, "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra" | "recommendedSetting" | "status">;

const legacyResolutionFactor: Record<Resolution, number> = { "720p": 1.5, "1080p": 1, "1440p": 0.65, "4k": 0.35 };
const gpuDemandByResolution: Record<Resolution, number> = { "720p": 0.72, "1080p": 1, "1440p": 1.45, "4k": 2.35 };
const cpuDemandByResolution: Record<Resolution, number> = { "720p": 1.08, "1080p": 1, "1440p": 0.96, "4k": 0.92 };
const ramExtraByResolution: Record<Resolution, number> = { "720p": 0, "1080p": 0, "1440p": 2, "4k": 4 };

export function estimateFps(gpuBenchmark: number, gameGpuMin: number, gameGpuRec: number, resolution: Resolution): number {
  const ratio = gpuBenchmark >= gameGpuRec ? gpuBenchmark / gameGpuRec : (gpuBenchmark / Math.max(gameGpuMin, 1)) * 0.62;
  return Math.round(clamp(52 * ratio * legacyResolutionFactor[resolution], 12, 180));
}

export function getBottleneck(gpuScore: number, cpuScore: number, ramGb: number, gameSpecs: SpecBlock): string {
  const gaps = [
    { name: "GPU", gap: gameSpecs.gpuBenchmark - gpuScore },
    { name: "CPU", gap: gameSpecs.cpuBenchmark - cpuScore },
    { name: "RAM", gap: gameSpecs.ramGb - ramGb },
  ].sort((a, b) => b.gap - a.gap);
  const top = gaps[0];
  return top.gap <= 0 ? "Không có điểm nghẽn rõ rệt" : top.name === "RAM" ? "RAM là điểm nghẽn chính" : `${top.name} là điểm nghẽn chính`;
}

export function getUpgradeAdvice(config: { gpuScore: number; cpuScore: number; ramGb: number }, target: { minSpecs: SpecBlock; recSpecs: SpecBlock }): string[] {
  const advice: string[] = [];
  if (config.gpuScore < target.recSpecs.gpuBenchmark) advice.push("Nâng GPU lên nhóm GTX 1650, RX 580 hoặc cao hơn nếu chơi 1080p.");
  if (config.cpuScore < target.recSpecs.cpuBenchmark) advice.push("Ưu tiên CPU 6 nhân như Core i5 đời 10 trở lên hoặc Ryzen 5.");
  if (config.ramGb < target.recSpecs.ramGb) advice.push(`Nâng RAM lên ${target.recSpecs.ramGb}GB, chi phí thường từ 400.000đ đến 1.200.000đ.`);
  return advice.length ? advice : ["Cấu hình hiện tại đã phù hợp, nên giữ driver và Windows ổn định."];
}

function getResolutionAdjustedSpecs(specs: SpecBlock, resolution: Resolution): SpecBlock {
  return {
    ...specs,
    gpuBenchmark: Math.round(specs.gpuBenchmark * gpuDemandByResolution[resolution]),
    cpuBenchmark: Math.round(specs.cpuBenchmark * cpuDemandByResolution[resolution]),
    ramGb: specs.ramGb + ramExtraByResolution[resolution],
  };
}

function fpsFromBenchmark(benchmark: BenchmarkHint): number {
  const setting = benchmark.recommendedSetting.toLowerCase();
  if (setting.includes("ultra")) return benchmark.fpsUltra;
  if (setting.includes("high")) return benchmark.fpsHigh;
  if (setting.includes("medium")) return benchmark.fpsMedium;
  return benchmark.fpsLow;
}

function statusFromFps(fps: number): Status {
  if (fps >= 55) return "smooth";
  if (fps >= 30) return "playable";
  return "not_recommended";
}

function lowerStatus(a: Status, b: Status): Status {
  const rank: Record<Status, number> = { smooth: 2, playable: 1, not_recommended: 0 };
  return rank[a] <= rank[b] ? a : b;
}

function estimateFpsWithSystem(
  userGpuBenchmark: number,
  userCpuBenchmark: number,
  userRamGb: number,
  minSpecs: SpecBlock,
  recSpecs: SpecBlock,
): number {
  const gpuRatio = userGpuBenchmark / Math.max(recSpecs.gpuBenchmark, 1);
  const cpuRatio = userCpuBenchmark / Math.max(recSpecs.cpuBenchmark, 1);
  const ramRatio = userRamGb / Math.max(recSpecs.ramGb, 1);
  const balancedRatio = Math.min(gpuRatio, cpuRatio * 1.08, ramRatio < 1 ? ramRatio * 0.9 : 1.35);
  const minRatio = Math.min(
    userGpuBenchmark / Math.max(minSpecs.gpuBenchmark, 1),
    userCpuBenchmark / Math.max(minSpecs.cpuBenchmark, 1),
    userRamGb / Math.max(minSpecs.ramGb, 1),
  );
  const fps = balancedRatio >= 1 ? 60 * balancedRatio : 30 + Math.max(0, minRatio - 1) * 28;
  return Math.round(clamp(fps, 8, 180));
}

export function classifyGame(
  userGpuBenchmark: number,
  userCpuBenchmark: number,
  userRamGb: number,
  userResolution: Resolution,
  gameMinSpecs: SpecBlock,
  gameRecSpecs: SpecBlock,
  benchmark?: BenchmarkHint,
): CompatibilityResult {
  const adjustedMinSpecs = getResolutionAdjustedSpecs(gameMinSpecs, userResolution);
  const adjustedRecSpecs = getResolutionAdjustedSpecs(gameRecSpecs, userResolution);
  const meetsRec =
    userGpuBenchmark >= adjustedRecSpecs.gpuBenchmark &&
    userCpuBenchmark >= adjustedRecSpecs.cpuBenchmark &&
    userRamGb >= adjustedRecSpecs.ramGb;
  const meetsMin =
    userGpuBenchmark >= adjustedMinSpecs.gpuBenchmark &&
    userCpuBenchmark >= adjustedMinSpecs.cpuBenchmark &&
    userRamGb >= adjustedMinSpecs.ramGb;
  const estimatedFps = benchmark
    ? fpsFromBenchmark(benchmark)
    : estimateFpsWithSystem(userGpuBenchmark, userCpuBenchmark, userRamGb, adjustedMinSpecs, adjustedRecSpecs);
  const hardwareStatus: Status = meetsRec ? "smooth" : meetsMin ? "playable" : "not_recommended";
  const status = lowerStatus(hardwareStatus, statusFromFps(estimatedFps));

  return {
    status,
    estimatedFps: Math.round(clamp(estimatedFps, 8, 180)),
    recommendedSetting:
      benchmark?.recommendedSetting ?? (status === "smooth" ? (estimatedFps > 90 ? "Ultra" : "High") : status === "playable" ? "Medium" : "Low"),
    bottleneck: getBottleneck(userGpuBenchmark, userCpuBenchmark, userRamGb, status === "smooth" ? adjustedRecSpecs : adjustedMinSpecs),
    upgradeAdvice: getUpgradeAdvice({ gpuScore: userGpuBenchmark, cpuScore: userCpuBenchmark, ramGb: userRamGb }, { minSpecs: gameMinSpecs, recSpecs: gameRecSpecs }),
  };
}
