import Link from "next/link";
import type { Gpu } from "@/types";

const categoryLabel: Record<string, string> = {
  integrated: "iGPU",
  low: "Cơ bản",
  mid: "Tầm trung",
  high: "Mạnh",
  ultra: "Rất mạnh",
};

export default function GpuCard({ gpu, count }: { gpu: Gpu; count?: number }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={"/gpu/" + gpu.slug} className="line-clamp-2 font-black hover:text-teal-700 dark:hover:text-teal-300">
            {gpu.name}
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            {gpu.brand} · {gpu.vram ?? 0}GB VRAM
          </p>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-black text-slate-700 dark:bg-gray-800 dark:text-gray-200">
          {gpu.isLaptop ? "Laptop" : "Desktop"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Metric label="Hạng" value={categoryLabel[gpu.category] ?? gpu.category} />
        <Metric label="Điểm" value={shortNumber(gpu.benchmarkScore)} />
        <Metric label="Game" value={(count ?? 0).toLocaleString("vi-VN")} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric p-2">
      <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  );
}

function shortNumber(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}
