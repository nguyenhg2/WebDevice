import type { Resolution, SpecBlock, Status } from "@/types";
import { clamp } from "@/lib/utils";

export interface CompatibilityResult {
  status: Status;
  estimatedFps: number;
  recommendedSetting: string;
  bottleneck: string;
  upgradeAdvice: string[];
}

const factor: Record<Resolution, number> = { "720p": 1.5, "1080p": 1, "1440p": 0.65, "4k": 0.35 };

export function estimateFps(gpuBenchmark: number, gameGpuMin: number, gameGpuRec: number, resolution: Resolution): number {
  const ratio = gpuBenchmark >= gameGpuRec ? gpuBenchmark / gameGpuRec : (gpuBenchmark / Math.max(gameGpuMin, 1)) * 0.62;
  return Math.round(clamp(52 * ratio * factor[resolution], 12, 180));
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

export function classifyGame(
  userGpuBenchmark: number,
  userCpuBenchmark: number,
  userRamGb: number,
  userResolution: Resolution,
  gameMinSpecs: SpecBlock,
  gameRecSpecs: SpecBlock,
): CompatibilityResult {
  const meetsRec = userGpuBenchmark >= gameRecSpecs.gpuBenchmark && userCpuBenchmark >= gameRecSpecs.cpuBenchmark && userRamGb >= gameRecSpecs.ramGb;
  const meetsMin = userGpuBenchmark >= gameMinSpecs.gpuBenchmark && userCpuBenchmark >= gameMinSpecs.cpuBenchmark && userRamGb >= gameMinSpecs.ramGb;
  const estimatedFps = estimateFps(userGpuBenchmark, gameMinSpecs.gpuBenchmark, gameRecSpecs.gpuBenchmark, userResolution);
  const status: Status = meetsRec ? "smooth" : meetsMin ? "playable" : "not_recommended";

  return {
    status,
    estimatedFps: status === "smooth" ? Math.max(50, estimatedFps) : status === "playable" ? clamp(estimatedFps, 30, 50) : Math.min(29, estimatedFps),
    recommendedSetting: status === "smooth" ? (estimatedFps > 80 ? "Ultra" : "High") : status === "playable" ? "Medium" : "Low",
    bottleneck: getBottleneck(userGpuBenchmark, userCpuBenchmark, userRamGb, status === "smooth" ? gameRecSpecs : gameMinSpecs),
    upgradeAdvice: getUpgradeAdvice({ gpuScore: userGpuBenchmark, cpuScore: userCpuBenchmark, ramGb: userRamGb }, { minSpecs: gameMinSpecs, recSpecs: gameRecSpecs }),
  };
}
