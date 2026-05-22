export type Status = "smooth" | "playable" | "not_recommended";
export type Resolution = "720p" | "1080p" | "1440p" | "4k";
export type PriceRange = "duoi-10-trieu" | "10-15-trieu" | "15-20-trieu" | "20-30-trieu" | "tren-30-trieu";
export interface SpecBlock { cpuName: string; gpuName: string; cpuBenchmark: number; gpuBenchmark: number; ramGb: number; storageGb: number; }
export interface Game { name: string; slug: string; steamId: string | null; genres: string[]; sizeGb: number; price: number | null; isFree: boolean; description: string; coverImage: string | null; officialUrl: string | null; minSpecs: SpecBlock; recSpecs: SpecBlock; }
export interface Gpu { name: string; slug: string; brand: string; benchmarkScore: number; category: string; tdp: number | null; vram: number | null; priceRangeVnd: string; isLaptop: boolean; commonInVietnam: boolean; }
export interface Cpu { name: string; slug: string; brand: string; benchmarkScore: number; cores: number; threads: number; generation: string; socket: string | null; integratedGpu: string | null; priceRangeVnd: string; commonInVietnam: boolean; }
export interface Device { name: string; slug: string; type: string; brand: string; cpu: string; gpu: string; ramGb: number; storageGb: number; storageType: string; screenSize: number | null; screenResolution: string | null; priceVnd: number; priceRange: PriceRange; shopeeUrl: string | null; tikiUrl: string | null; phongvuUrl: string | null; gearvnUrl: string | null; imageUrl: string | null; }
export interface Benchmark { gameSlug: string; gpuSlug: string; resolution: Resolution; fpsLow: number; fpsMedium: number; fpsHigh: number; fpsUltra: number; recommendedSetting: string; status: Status; videoTestUrl: string | null; source: string; }
export interface BlogPost { title: string; slug: string; content: string; excerpt: string; category: string; tags: string[]; metaTitle: string; metaDescription: string; publishedAt: string; }
export type ExternalSourceStatus = "imported" | "partial" | "blocked" | "disabled" | "error";
export type ExternalFpsConfidence = "matched" | "partial" | "raw";
export interface ExternalFpsSample {
  id: string;
  source: string;
  sourceName: string;
  sourceUrl: string;
  gameName: string;
  gameSlug: string | null;
  cpuName: string;
  gpuName: string;
  gpuSlug: string | null;
  ramGb: number | null;
  fpsLow: number;
  fpsAverage: number;
  fpsHigh: number;
  normalizedFps: number;
  confidence: ExternalFpsConfidence;
  importedAt: string;
}
export interface DataSourceStatus {
  key: string;
  name: string;
  url: string;
  robotsUrl: string;
  status: ExternalSourceStatus;
  checkedAt: string;
  recordsImported: number;
  recordsDiscovered?: number;
  notes: string[];
}
