"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Cpu, Gpu, Resolution } from "@/types";

type Detection = {
  gpu: Gpu;
  cpu: Cpu;
  ramGb: number;
  resolution: Resolution;
  renderer: string;
  confidence: "cao" | "vừa" | "ước lượng";
  notes: string[];
};

type Props = {
  cpus: Cpu[];
  gpus: Gpu[];
  current: {
    cpuSlug: string;
    gpuSlug: string;
    ramGb: number;
    resolution: Resolution;
  };
};

const gpuAliases: Array<{ pattern: RegExp; keywords: string[] }> = [
  { pattern: /rtx\s*4090/i, keywords: ["4090"] },
  { pattern: /rtx\s*4080/i, keywords: ["4080"] },
  { pattern: /rtx\s*4070/i, keywords: ["4070"] },
  { pattern: /rtx\s*4060/i, keywords: ["4060"] },
  { pattern: /rtx\s*3070/i, keywords: ["3070"] },
  { pattern: /rtx\s*3060/i, keywords: ["3060"] },
  { pattern: /rtx\s*3050/i, keywords: ["3050"] },
  { pattern: /rtx\s*2050/i, keywords: ["2050"] },
  { pattern: /gtx\s*1660/i, keywords: ["1660"] },
  { pattern: /gtx\s*1650/i, keywords: ["1650"] },
  { pattern: /gtx\s*1060/i, keywords: ["1060"] },
  { pattern: /gtx\s*1050\s*ti/i, keywords: ["1050", "ti"] },
  { pattern: /gtx\s*1050/i, keywords: ["1050"] },
  { pattern: /gtx\s*950/i, keywords: ["950"] },
  { pattern: /gtx\s*750\s*ti/i, keywords: ["750", "ti"] },
  { pattern: /gt\s*730/i, keywords: ["730"] },
  { pattern: /rx\s*7600/i, keywords: ["7600"] },
  { pattern: /rx\s*6700/i, keywords: ["6700"] },
  { pattern: /rx\s*6650/i, keywords: ["6650"] },
  { pattern: /rx\s*6600/i, keywords: ["6600"] },
  { pattern: /rx\s*580/i, keywords: ["580"] },
  { pattern: /rx\s*570/i, keywords: ["570"] },
  { pattern: /rx\s*560/i, keywords: ["560"] },
  { pattern: /rx\s*550/i, keywords: ["550"] },
  { pattern: /vega\s*8/i, keywords: ["vega", "8"] },
  { pattern: /iris\s*xe/i, keywords: ["iris", "xe"] },
  { pattern: /uhd\s*620/i, keywords: ["uhd", "620"] },
  { pattern: /hd\s*4000/i, keywords: ["hd", "4000"] },
];

export default function SystemDetector({ cpus, gpus, current }: Props) {
  const router = useRouter();
  const [detection, setDetection] = useState<Detection | null>(null);
  const [error, setError] = useState("");
  const selectedSummary = useMemo(() => {
    const gpu = gpus.find((item) => item.slug === current.gpuSlug);
    const cpu = cpus.find((item) => item.slug === current.cpuSlug);
    return `${gpu?.name ?? "GPU"} · ${cpu?.name ?? "CPU"} · ${current.ramGb}GB RAM · ${current.resolution}`;
  }, [cpus, current, gpus]);

  function detect() {
    setError("");
    try {
      const renderer = getGpuRenderer();
      const cores = navigator.hardwareConcurrency || 4;
      const ramGb = normalizeRam((navigator as Navigator & { deviceMemory?: number }).deviceMemory);
      const gpu = chooseGpu(gpus, renderer);
      const cpu = chooseCpu(cpus, cores);
      const resolution = chooseResolution(gpu, ramGb);
      const notes = [
        renderer ? `GPU trình duyệt báo: ${renderer}` : "Trình duyệt không cho đọc tên GPU, hệ thống dùng mức ước lượng an toàn.",
        `CPU ước lượng theo ${cores} luồng xử lý trình duyệt báo; trình duyệt không cung cấp tên CPU thật.`,
        `RAM trình duyệt báo khoảng ${ramGb}GB.`,
      ];
      setDetection({
        gpu,
        cpu,
        ramGb,
        resolution,
        renderer: renderer || "Không đọc được",
        confidence: renderer ? "vừa" : "ước lượng",
        notes,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể tự nhận diện cấu hình trên trình duyệt này.");
    }
  }

  function applyDetection() {
    if (!detection) return;
    const params = new URLSearchParams({
      gpu: detection.gpu.slug,
      cpu: detection.cpu.slug,
      ram: String(detection.ramGb),
      res: detection.resolution,
    });
    router.push(`/tra-cuu?${params}`);
  }

  return (
    <section className="card mt-5 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Không biết cấu hình máy?</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">
            Bấm tự nhận diện để trình duyệt ước lượng CPU, GPU, RAM và chọn cấu hình gần nhất trong dữ liệu.
          </p>
          <p className="mt-2 text-xs text-slate-500">Đang chọn: {selectedSummary}</p>
        </div>
        <button type="button" className="btn" onClick={detect}>
          Tự nhận diện máy này
        </button>
      </div>

      {error ? <p className="mt-3 rounded-md border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">{error}</p> : null}

      {detection ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_220px]">
          <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <Info label="GPU gần nhất" value={detection.gpu.name} />
            <Info label="CPU gần nhất" value={detection.cpu.name} />
            <Info label="RAM" value={`${detection.ramGb}GB`} />
            <Info label="Độ tin cậy" value={detection.confidence} />
          </dl>
          <button type="button" className="rounded-md border px-4 py-2 text-sm font-bold hover:bg-slate-50 dark:hover:bg-gray-800" onClick={applyDetection}>
            Áp dụng cấu hình này
          </button>
          <ul className="text-xs text-slate-500 lg:col-span-2">
            {detection.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-gray-700">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-bold">{value}</dd>
    </div>
  );
}

function getGpuRenderer() {
  const canvas = document.createElement("canvas");
  const gl = (canvas.getContext("webgl") || canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
  if (!gl) return "";
  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
  if (!debugInfo) return "";
  return String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL) || "");
}

function chooseGpu(gpus: Gpu[], renderer: string) {
  const lower = renderer.toLowerCase();
  for (const alias of gpuAliases) {
    if (!alias.pattern.test(renderer)) continue;
    const matched = gpus.find((gpu) => alias.keywords.every((keyword) => gpu.name.toLowerCase().includes(keyword)));
    if (matched) return matched;
  }
  if (/intel/i.test(renderer)) {
    if (/iris/i.test(renderer)) return gpus.find((gpu) => gpu.slug.includes("iris-xe")) ?? gpus[0];
    if (/hd\s*4000/i.test(renderer)) return gpus.find((gpu) => gpu.slug.includes("hd-4000")) ?? gpus[0];
    return gpus.find((gpu) => gpu.slug.includes("uhd-620")) ?? gpus[0];
  }
  if (/amd|radeon/i.test(renderer)) {
    if (/graphics|vega|apu/i.test(renderer)) return gpus.find((gpu) => gpu.slug.includes("vega-8")) ?? gpus[0];
    return gpus.find((gpu) => gpu.slug.includes("rx-580")) ?? gpus[0];
  }
  if (/nvidia|geforce/i.test(renderer)) return gpus.find((gpu) => gpu.slug.includes("gtx-1650")) ?? gpus[0];
  if (lower.includes("apple")) return gpus.find((gpu) => gpu.slug.includes("iris-xe")) ?? gpus[0];
  return gpus.find((gpu) => gpu.slug.includes("uhd-620")) ?? gpus[0];
}

function chooseCpu(cpus: Cpu[], cores: number) {
  const targetScore = cores >= 20 ? 27000 : cores >= 16 ? 22000 : cores >= 12 ? 16000 : cores >= 8 ? 9000 : cores >= 4 ? 4800 : 3600;
  return [...cpus].sort((a, b) => Math.abs(a.benchmarkScore - targetScore) - Math.abs(b.benchmarkScore - targetScore))[0] ?? cpus[0];
}

function normalizeRam(deviceMemory?: number) {
  if (!deviceMemory) return 8;
  if (deviceMemory <= 4) return 4;
  if (deviceMemory <= 8) return 8;
  if (deviceMemory <= 16) return 16;
  return 32;
}

function chooseResolution(gpu: Gpu, ramGb: number): Resolution {
  if (gpu.benchmarkScore >= 24000 && ramGb >= 16) return "1440p";
  if (gpu.benchmarkScore < 3000 || ramGb <= 4) return "720p";
  return "1080p";
}
