import Link from "next/link";
import FastImage from "@/components/FastImage";
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
    <article className="card overflow-hidden">
      <Link href={"/gpu/" + gpu.slug} className="block">
        <div className="image-frame relative aspect-[16/9] overflow-hidden">
          <FastImage
            src={gpu.imageUrl}
            alt={"Ảnh minh họa " + gpu.name}
            fill
            sizes="(min-width:1024px) 320px, (min-width:640px) 45vw, 92vw"
            quality={58}
            className="object-cover"
          />
          <span className="absolute left-2 top-2 rounded-md bg-white/94 px-2 py-1 text-[11px] font-black text-slate-950 backdrop-blur dark:bg-gray-950/88 dark:text-white">
            {gpu.isLaptop ? "Laptop" : "Desktop"}
          </span>
        </div>
      </Link>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
          <Link href={"/gpu/" + gpu.slug} className="line-clamp-2 font-black hover:text-teal-700 dark:hover:text-teal-300">
            {gpu.name}
          </Link>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">
            {gpu.brand} · {gpu.vram ?? 0}GB VRAM
          </p>
          </div>
          <p className="text-right text-sm font-black text-teal-700 dark:text-teal-300">{shortNumber(gpu.benchmarkScore)}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Metric label="Hạng" value={categoryLabel[gpu.category] ?? gpu.category} />
          <Metric label="Game" value={(count ?? 0).toLocaleString("vi-VN")} />
        </div>
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
