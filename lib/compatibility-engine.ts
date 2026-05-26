import type { Benchmark, Resolution, SpecBlock, Status } from "@/types";
import { clamp } from "@/lib/utils";

export interface CompatibilityResult {
  status: Status;
  estimatedFps: number;
  recommendedSetting: string;
  bottleneck: string;
  upgradeAdvice: string[];
}

type BenchmarkHint = Pick<
  Benchmark,
  "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra" | "recommendedSetting" | "setting" | "status" | "avgFps" | "onePercentLow" | "confidence"
>;

type Ratios = {
  gpuMin: number;
  cpuMin: number;
  ramMin: number;
  gpuRec: number;
  cpuRec: number;
  ramRec: number;
};

type Setting = "Low" | "Medium" | "High" | "Ultra";
type FpsBySetting = Record<Setting, number>;

const resolutionGpuDemand: Record<Resolution, number> = { "720p": 0.72, "1080p": 1, "1440p": 1.45, "4k": 2.35 };
const resolutionCpuDemand: Record<Resolution, number> = { "720p": 1.08, "1080p": 1, "1440p": 0.96, "4k": 0.92 };
const resolutionRamExtra: Record<Resolution, number> = { "720p": 0, "1080p": 0, "1440p": 2, "4k": 4 };
const settingOrder: Setting[] = ["Ultra", "High", "Medium", "Low"];
const smoothFpsFloor = 55;
const smoothOnePercentLowFloor = 35;
const playableFpsFloor = 30;
const playableOnePercentLowFloor = 20;

export function estimateFps(gpuBenchmark: number, gameGpuMin: number, gameGpuRec: number, resolution: Resolution): number {
  const adjustedMin = Math.max(1, gameGpuMin * resolutionGpuDemand[resolution]);
  const adjustedRec = Math.max(1, gameGpuRec * resolutionGpuDemand[resolution]);
  const minRatio = gpuBenchmark / adjustedMin;
  const recRatio = gpuBenchmark / adjustedRec;

  if (recRatio >= 1) return Math.round(clamp(58 * Math.sqrt(Math.min(recRatio, 3)), smoothFpsFloor, 180));
  if (minRatio >= 1) return Math.round(clamp(32 + clamp((recRatio - 0.45) / 0.55, 0, 1) * 23, playableFpsFloor, 58));
  return Math.round(clamp(16 + minRatio * 18, 8, 34));
}

export function getBottleneck(gpuScore: number, cpuScore: number, ramGb: number, gameSpecs: SpecBlock): string {
  const ratios = [
    { name: "GPU", ratio: gpuScore / Math.max(gameSpecs.gpuBenchmark, 1) },
    { name: "CPU", ratio: cpuScore / Math.max(gameSpecs.cpuBenchmark, 1) },
    { name: "RAM", ratio: ramGb / Math.max(gameSpecs.ramGb, 1) },
  ].sort((a, b) => a.ratio - b.ratio);
  const weakest = ratios[0];

  if (weakest.ratio >= 1.08) return "Không có nghẽn rõ rệt";
  if (weakest.ratio >= 1) return `${weakest.name} gần chạm ngưỡng`;
  return `${weakest.name} là điểm yếu chính`;
}

export function getUpgradeAdvice(config: { gpuScore: number; cpuScore: number; ramGb: number }, target: { minSpecs: SpecBlock; recSpecs: SpecBlock }): string[] {
  const advice: string[] = [];
  const ratios = buildRatios(config.gpuScore, config.cpuScore, config.ramGb, target.minSpecs, target.recSpecs);

  if (ratios.gpuMin < 1) advice.push("GPU đang dưới mức tối thiểu của một số game; ưu tiên nâng GPU trước.");
  else if (ratios.gpuRec < 1) advice.push("GPU đạt mức chơi được, nhưng nên nâng lên nhóm mạnh hơn nếu muốn 60 FPS ổn định.");

  if (ratios.cpuMin < 1) advice.push("CPU đang dưới mức tối thiểu; game thế giới mở và bắn súng đông người dễ bị tụt FPS.");
  else if (ratios.cpuRec < 1) advice.push("CPU đủ chơi, nhưng CPU 6 nhân đời mới sẽ giúp FPS ổn định hơn.");

  if (ratios.ramMin < 1) advice.push(`RAM dưới mức tối thiểu ${target.minSpecs.ramGb}GB; cần nâng RAM trước khi kỳ vọng chơi ổn định.`);
  else if (ratios.ramRec < 1) advice.push(`Nên nâng RAM lên ${target.recSpecs.ramGb}GB để giảm giật khung hình.`);

  return advice.length ? advice : ["Cấu hình hiện tại phù hợp. Nên giữ driver GPU và Windows ổn định để tránh tụt FPS."];
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
  const ratios = buildRatios(userGpuBenchmark, userCpuBenchmark, userRamGb, adjustedMinSpecs, adjustedRecSpecs);
  const preferredSetting = benchmark ? preferredSettingFromBenchmark(benchmark) : undefined;
  const fpsBySetting = benchmark
    ? applySystemPenalty(fpsBySettingFromBenchmark(benchmark), ratios)
    : fpsBySettingFromEstimate(userGpuBenchmark, userCpuBenchmark, userRamGb, adjustedMinSpecs, adjustedRecSpecs);
  const recommendedSetting = chooseRecommendedSetting(fpsBySetting, preferredSetting);
  const estimatedFps = Math.round(clamp(fpsBySetting[recommendedSetting], 8, 220));
  const onePercentLow = estimateOnePercentLow(estimatedFps, benchmark, ratios);
  const status = classifyStatus(estimatedFps, onePercentLow, ratios, Boolean(benchmark));

  return {
    status,
    estimatedFps,
    recommendedSetting,
    bottleneck: getBottleneck(userGpuBenchmark, userCpuBenchmark, userRamGb, status === "smooth" ? adjustedRecSpecs : adjustedMinSpecs),
    upgradeAdvice: getUpgradeAdvice({ gpuScore: userGpuBenchmark, cpuScore: userCpuBenchmark, ramGb: userRamGb }, { minSpecs: adjustedMinSpecs, recSpecs: adjustedRecSpecs }),
  };
}

function getResolutionAdjustedSpecs(specs: SpecBlock, resolution: Resolution): SpecBlock {
  return {
    ...specs,
    gpuBenchmark: Math.round(specs.gpuBenchmark * resolutionGpuDemand[resolution]),
    cpuBenchmark: Math.round(specs.cpuBenchmark * resolutionCpuDemand[resolution]),
    ramGb: specs.ramGb + resolutionRamExtra[resolution],
  };
}

function buildRatios(gpuScore: number, cpuScore: number, ramGb: number, minSpecs: SpecBlock, recSpecs: SpecBlock): Ratios {
  return {
    gpuMin: gpuScore / Math.max(minSpecs.gpuBenchmark, 1),
    cpuMin: cpuScore / Math.max(minSpecs.cpuBenchmark, 1),
    ramMin: ramGb / Math.max(minSpecs.ramGb, 1),
    gpuRec: gpuScore / Math.max(recSpecs.gpuBenchmark, 1),
    cpuRec: cpuScore / Math.max(recSpecs.cpuBenchmark, 1),
    ramRec: ramGb / Math.max(recSpecs.ramGb, 1),
  };
}

function fpsBySettingFromBenchmark(benchmark: BenchmarkHint): FpsBySetting {
  const preferredSetting = preferredSettingFromBenchmark(benchmark);
  const avgFps = positiveFps(benchmark.avgFps);
  const fps: FpsBySetting = {
    Low: positiveFps(benchmark.fpsLow) ?? 0,
    Medium: positiveFps(benchmark.fpsMedium) ?? 0,
    High: positiveFps(benchmark.fpsHigh) ?? 0,
    Ultra: positiveFps(benchmark.fpsUltra) ?? 0,
  };

  if (preferredSetting && avgFps) fps[preferredSetting] = avgFps;
  if (!fps.Medium && avgFps && !preferredSetting) fps.Medium = avgFps;
  if (!fps.High && fps.Medium) fps.High = Math.round(fps.Medium * 0.82);
  if (!fps.Ultra && fps.High) fps.Ultra = Math.round(fps.High * 0.78);

  return fps;
}

function fpsBySettingFromEstimate(
  userGpuBenchmark: number,
  userCpuBenchmark: number,
  userRamGb: number,
  minSpecs: SpecBlock,
  recSpecs: SpecBlock,
): FpsBySetting {
  const ratios = buildRatios(userGpuBenchmark, userCpuBenchmark, userRamGb, minSpecs, recSpecs);
  const weakestMinRatio = Math.min(ratios.gpuMin, ratios.cpuMin, ratios.ramMin);
  const balancedRecRatio = Math.min(ratios.gpuRec, ratios.cpuRec * 1.08, ratios.ramRec < 1 ? ratios.ramRec * 0.92 : 1.45);
  const mediumFps =
    balancedRecRatio >= 1
      ? 58 * Math.sqrt(Math.min(balancedRecRatio, 3.2))
      : weakestMinRatio >= 1
        ? 32 + clamp((balancedRecRatio - 0.45) / 0.55, 0, 1) * 23
        : 16 + clamp(weakestMinRatio, 0, 1) * 18;

  return {
    Low: Math.round(clamp(mediumFps * 1.24, 8, 240)),
    Medium: Math.round(clamp(mediumFps, 8, 220)),
    High: Math.round(clamp(mediumFps * 0.82, 6, 200)),
    Ultra: Math.round(clamp(mediumFps * 0.64, 4, 180)),
  };
}

function applySystemPenalty(fps: FpsBySetting, ratios: Ratios): FpsBySetting {
  const cpuPenalty = componentPenalty(ratios.cpuMin, ratios.cpuRec);
  const ramPenalty = componentPenalty(ratios.ramMin, ratios.ramRec);
  const penalty = Math.min(cpuPenalty, ramPenalty);

  return {
    Low: Math.round(fps.Low * penalty),
    Medium: Math.round(fps.Medium * penalty),
    High: Math.round(fps.High * penalty),
    Ultra: Math.round(fps.Ultra * penalty),
  };
}

function componentPenalty(minRatio: number, recRatio: number) {
  if (minRatio < 1) return clamp(0.48 + minRatio * 0.42, 0.42, 0.9);
  if (recRatio < 1) return clamp(0.9 + recRatio * 0.1, 0.9, 1);
  return 1;
}

function chooseRecommendedSetting(fps: FpsBySetting, preferredSetting?: Setting): Setting {
  if (preferredSetting) {
    for (const setting of settingsAbove(preferredSetting)) {
      if (fps[setting] >= smoothFpsFloor) return setting;
    }
    if (fps[preferredSetting] >= playableFpsFloor) return preferredSetting;
  }

  for (const setting of settingOrder) {
    if (fps[setting] >= smoothFpsFloor) return setting;
  }
  for (const setting of settingOrder) {
    if (fps[setting] >= playableFpsFloor) return setting;
  }
  if (preferredSetting && fps[preferredSetting] > 0) return preferredSetting;
  return "Low";
}

function estimateOnePercentLow(fps: number, benchmark: BenchmarkHint | undefined, ratios: Ratios) {
  const benchmarkLow = benchmark?.onePercentLow && benchmark.onePercentLow > 0 ? benchmark.onePercentLow : null;
  const base = benchmarkLow ? Math.min(benchmarkLow, fps) : Math.round(fps * 0.68);
  const bottleneckPenalty = Math.min(componentPenalty(ratios.cpuMin, ratios.cpuRec), componentPenalty(ratios.ramMin, ratios.ramRec));
  return Math.round(clamp(base * bottleneckPenalty, 1, fps));
}

function classifyStatus(fps: number, onePercentLow: number, ratios: Ratios, hasBenchmark: boolean): Status {
  const weakestMinRatio = Math.min(ratios.gpuMin, ratios.cpuMin, ratios.ramMin);
  const criticalHardwareGap = weakestMinRatio < 0.55;
  const severeHardwareGap = weakestMinRatio < (hasBenchmark ? 0.72 : 0.85);
  const belowMinimum = ratios.gpuMin < 1 || ratios.cpuMin < 1 || ratios.ramMin < 1;

  if (fps < playableFpsFloor || onePercentLow < playableOnePercentLowFloor) return "not_recommended";
  if (criticalHardwareGap && (fps < 45 || onePercentLow < 30)) return "not_recommended";
  if (severeHardwareGap && !hasBenchmark) return "not_recommended";
  if (fps >= smoothFpsFloor && onePercentLow >= smoothOnePercentLowFloor && (!belowMinimum || weakestMinRatio >= 0.85)) return "smooth";
  return "playable";
}

function preferredSettingFromBenchmark(benchmark: BenchmarkHint): Setting | undefined {
  const value = benchmark.setting || benchmark.recommendedSetting;
  return isSetting(value) ? value : undefined;
}

function isSetting(value: string | undefined): value is Setting {
  return value === "Low" || value === "Medium" || value === "High" || value === "Ultra";
}

function positiveFps(value: number | null | undefined) {
  return Number.isFinite(value) && Number(value) > 0 ? Number(value) : undefined;
}

function settingsAbove(setting: Setting): Setting[] {
  if (setting === "Low") return ["Ultra", "High", "Medium"];
  if (setting === "Medium") return ["Ultra", "High"];
  if (setting === "High") return ["Ultra"];
  return [];
}
