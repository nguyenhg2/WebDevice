import type { Benchmark } from "@/types";

const videoHosts = [/youtube\.com$/i, /youtu\.be$/i, /vimeo\.com$/i, /bilibili\.com$/i];

export type BenchmarkTableRow = Pick<
  Benchmark,
  "gameSlug" | "gpuSlug" | "resolution" | "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra" | "recommendedSetting" | "avgFps" | "videoTestUrl"
>;

export function toBenchmarkTableRow(row: Benchmark): BenchmarkTableRow {
  return {
    gameSlug: row.gameSlug,
    gpuSlug: row.gpuSlug,
    resolution: row.resolution,
    fpsLow: row.fpsLow,
    fpsMedium: row.fpsMedium,
    fpsHigh: row.fpsHigh,
    fpsUltra: row.fpsUltra,
    recommendedSetting: row.recommendedSetting,
    avgFps: row.avgFps,
    videoTestUrl: row.videoTestUrl,
  };
}

export function isVideoUrl(value?: string | null) {
  if (!value) return false;
  try {
    const host = new URL(value).hostname.replace(/^www\./, "");
    return videoHosts.some((pattern) => pattern.test(host));
  } catch {
    return false;
  }
}

export function getBenchmarkVideoUrl(row: Pick<Benchmark, "videoTestUrl">) {
  return isVideoUrl(row.videoTestUrl) ? row.videoTestUrl : null;
}

export function buildVideoSearchUrl(input: { gameName: string; gpuName: string }) {
  const query = `${input.gameName} ${input.gpuName} FPS benchmark`;
  return `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
}

export function bestBenchmarkFps(row: Pick<Benchmark, "fpsLow" | "fpsMedium" | "fpsHigh" | "fpsUltra" | "avgFps">) {
  return row.avgFps || row.fpsUltra || row.fpsHigh || row.fpsMedium || row.fpsLow;
}
