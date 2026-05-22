import Link from "next/link";
import type { Gpu } from "@/types";

export default function GpuCard({ gpu, count }: { gpu: Gpu; count?: number }) {
  return (
    <article className="card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Link href={"/gpu/" + gpu.slug} className="font-bold hover:text-blue-600">
            {gpu.name}
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            {gpu.brand} · {gpu.vram ?? 0}GB VRAM · {gpu.category}
          </p>
        </div>
        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-black text-slate-700 dark:bg-gray-800 dark:text-gray-200">
          {gpu.isLaptop ? "Laptop" : "Desktop"}
        </span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <Metric label="Điểm GPU" value={gpu.benchmarkScore.toLocaleString("vi-VN")} />
        <Metric label="FPS có sẵn" value={(count ?? 0).toLocaleString("vi-VN")} />
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-gray-700">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
