export const ESTIMATED_FPS_SOURCE = "FPS noi bo; uoc tinh tu cau hinh chinh thuc, diem GPU va gioi han engine";

const smoothFpsFloor = 55;
const playableFpsFloor = 30;
const defaultResolution = "1080p";

const baseProfiles = {
  esports: {
    targetMediumAtRecommended: 95,
    ratioCap: 9,
    exponent: 0.5,
    preferredSetting: "Medium",
    multipliers: { Low: 1.16, Medium: 1, High: 0.86, Ultra: 0.74 },
    caps: { Low: 480, Medium: 420, High: 360, Ultra: 310 },
    onePercentLowRatio: 0.7,
  },
  light: {
    targetMediumAtRecommended: 78,
    ratioCap: 6,
    exponent: 0.45,
    preferredSetting: null,
    multipliers: { Low: 1.22, Medium: 1, High: 0.82, Ultra: 0.68 },
    caps: { Low: 360, Medium: 310, High: 260, Ultra: 220 },
    onePercentLowRatio: 0.68,
  },
  normal: {
    targetMediumAtRecommended: 68,
    ratioCap: 4.8,
    exponent: 0.42,
    preferredSetting: null,
    multipliers: { Low: 1.22, Medium: 1, High: 0.82, Ultra: 0.66 },
    caps: { Low: 280, Medium: 230, High: 190, Ultra: 160 },
    onePercentLowRatio: 0.67,
  },
  modern: {
    targetMediumAtRecommended: 62,
    ratioCap: 4,
    exponent: 0.4,
    preferredSetting: null,
    multipliers: { Low: 1.2, Medium: 1, High: 0.8, Ultra: 0.64 },
    caps: { Low: 230, Medium: 190, High: 155, Ultra: 130 },
    onePercentLowRatio: 0.66,
  },
  demanding: {
    targetMediumAtRecommended: 56,
    ratioCap: 3.4,
    exponent: 0.38,
    preferredSetting: null,
    multipliers: { Low: 1.18, Medium: 1, High: 0.78, Ultra: 0.62 },
    caps: { Low: 180, Medium: 150, High: 120, Ultra: 100 },
    onePercentLowRatio: 0.64,
  },
  capped60: {
    targetMediumAtRecommended: 58,
    ratioCap: 2.2,
    exponent: 0.35,
    preferredSetting: null,
    multipliers: { Low: 1.05, Medium: 1, High: 0.94, Ultra: 0.88 },
    caps: { Low: 60, Medium: 60, High: 60, Ultra: 60 },
    onePercentLowRatio: 0.82,
  },
};

const gameProfileOverrides = {
  valorant: {
    base: "esports",
    targetMediumAtRecommended: 115,
    ratioCap: 10,
    exponent: 0.55,
    caps: { Low: 500, Medium: 430, High: 370, Ultra: 320 },
  },
  "counter-strike-2": {
    base: "esports",
    targetMediumAtRecommended: 92,
    ratioCap: 10,
    exponent: 0.5,
    caps: { Low: 370, Medium: 320, High: 280, Ultra: 240 },
  },
  "rocket-league": {
    base: "esports",
    targetMediumAtRecommended: 110,
    ratioCap: 8,
    exponent: 0.52,
    caps: { Low: 430, Medium: 360, High: 310, Ultra: 260 },
  },
  "overwatch-2": {
    base: "esports",
    targetMediumAtRecommended: 90,
    ratioCap: 7,
    caps: { Low: 340, Medium: 300, High: 260, Ultra: 220 },
  },
  "world-of-tanks": {
    base: "light",
    targetMediumAtRecommended: 90,
    ratioCap: 6,
    caps: { Low: 320, Medium: 280, High: 240, Ultra: 200 },
  },
  "war-thunder": {
    base: "light",
    targetMediumAtRecommended: 88,
    ratioCap: 6,
    caps: { Low: 320, Medium: 280, High: 235, Ultra: 200 },
  },
  "minecraft-dungeons": {
    base: "light",
    targetMediumAtRecommended: 82,
    ratioCap: 6,
    caps: { Low: 320, Medium: 280, High: 230, Ultra: 200 },
  },
  "dota-2": {
    base: "light",
    targetMediumAtRecommended: 82,
    ratioCap: 6,
    caps: { Low: 300, Medium: 260, High: 220, Ultra: 190 },
  },
  "lien-minh-huyen-thoai": {
    base: "esports",
    targetMediumAtRecommended: 100,
    ratioCap: 9,
    caps: { Low: 430, Medium: 370, High: 320, Ultra: 280 },
  },
  "fifa-online-4": {
    base: "light",
    targetMediumAtRecommended: 86,
    caps: { Low: 300, Medium: 260, High: 220, Ultra: 190 },
  },
  "genshin-impact": { base: "capped60" },
  "elden-ring": { base: "capped60" },
};

const competitiveKeywords = [
  "fps",
  "ban sung",
  "battle royale",
  "moba",
  "esports",
];

export function buildEstimatedBenchmarkRow(game, gpu, options = {}) {
  const values = estimateBenchmarkValues(game, gpu);
  const updatedAt = options.updatedAt ?? new Date().toISOString();

  return {
    gameSlug: game.slug,
    gpuSlug: gpu.slug,
    resolution: options.resolution ?? defaultResolution,
    fpsLow: values.fpsLow,
    fpsMedium: values.fpsMedium,
    fpsHigh: values.fpsHigh,
    fpsUltra: values.fpsUltra,
    recommendedSetting: values.recommendedSetting,
    status: values.status,
    videoTestUrl: options.videoTestUrl ?? null,
    source: options.source ?? ESTIMATED_FPS_SOURCE,
    setting: values.recommendedSetting,
    avgFps: values.avgFps,
    onePercentLow: values.onePercentLow,
    confidence: "estimated",
    updatedAt,
  };
}

export function estimateBenchmarkValues(game, gpu) {
  const profile = resolveGameProfile(game);
  const minGpu = positiveNumber(game?.minSpecs?.gpuBenchmark) ? game.minSpecs.gpuBenchmark : 3000;
  const recGpu = positiveNumber(game?.recSpecs?.gpuBenchmark) ? game.recSpecs.gpuBenchmark : Math.max(9000, minGpu * 1.65);
  const medium = estimateMediumFps(Number(gpu?.benchmarkScore || 0), minGpu, recGpu, profile);
  const fpsLow = presetFps(medium, "Low", profile);
  const fpsMedium = presetFps(medium, "Medium", profile);
  const fpsHigh = presetFps(medium, "High", profile);
  const fpsUltra = presetFps(medium, "Ultra", profile);
  const fpsBySetting = { Low: fpsLow, Medium: fpsMedium, High: fpsHigh, Ultra: fpsUltra };
  const recommendedSetting = chooseRecommendedSetting(fpsBySetting, profile.preferredSetting);
  const avgFps = fpsBySetting[recommendedSetting];
  const onePercentLow = clamp(Math.round(avgFps * profile.onePercentLowRatio), 1, avgFps);

  return {
    fpsLow,
    fpsMedium,
    fpsHigh,
    fpsUltra,
    recommendedSetting,
    avgFps,
    onePercentLow,
    status: avgFps >= smoothFpsFloor && onePercentLow >= 35 ? "smooth" : avgFps >= playableFpsFloor && onePercentLow >= 20 ? "playable" : "not_recommended",
  };
}

export function resolveGameProfile(game) {
  const override = gameProfileOverrides[game?.slug];
  const baseName = override?.base ?? inferBaseProfile(game);
  const base = baseProfiles[baseName] ?? baseProfiles.normal;
  if (!override) return base;

  return {
    ...base,
    ...override,
    caps: { ...base.caps, ...(override.caps ?? {}) },
    multipliers: { ...base.multipliers, ...(override.multipliers ?? {}) },
  };
}

function inferBaseProfile(game) {
  const recGpu = positiveNumber(game?.recSpecs?.gpuBenchmark) ? game.recSpecs.gpuBenchmark : 9000;
  const text = normalizeText(`${game?.slug ?? ""} ${game?.name ?? ""} ${(game?.genres ?? []).join(" ")}`);

  if (competitiveKeywords.some((keyword) => text.includes(keyword)) && recGpu <= 14000) return "esports";
  if (recGpu <= 8500) return "light";
  if (recGpu <= 13000) return "normal";
  if (recGpu <= 18000) return "modern";
  return "demanding";
}

function estimateMediumFps(gpuScore, minGpu, recGpu, profile) {
  const safeGpuScore = Math.max(Number(gpuScore) || 0, 1);
  const minRatio = safeGpuScore / Math.max(minGpu, 1);
  const recRatio = safeGpuScore / Math.max(recGpu, 1);
  const target = profile.targetMediumAtRecommended;

  if (recRatio >= 1) {
    return target * Math.pow(Math.min(recRatio, profile.ratioCap), profile.exponent);
  }

  if (minRatio >= 1) {
    const progress = clamp((recRatio - 0.35) / 0.65, 0, 1);
    return 28 + (target - 28) * progress;
  }

  return 10 + clamp(minRatio, 0, 1) * 20;
}

function presetFps(medium, setting, profile) {
  const value = Math.round(medium * profile.multipliers[setting]);
  return clamp(value, 0, profile.caps[setting]);
}

function chooseRecommendedSetting(fps, preferredSetting) {
  if (preferredSetting && fps[preferredSetting] >= playableFpsFloor) return preferredSetting;

  for (const setting of ["Ultra", "High", "Medium", "Low"]) {
    if (fps[setting] >= smoothFpsFloor) return setting;
  }
  for (const setting of ["Ultra", "High", "Medium", "Low"]) {
    if (fps[setting] >= playableFpsFloor) return setting;
  }
  return "Low";
}

function positiveNumber(value) {
  return Number.isFinite(value) && value > 0;
}

function normalizeText(value) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}
