import { Cpu, Gauge } from "lucide-react";
import Link from "next/link";
import FastImage from "@/components/FastImage";
import type { Gpu } from "@/types";
import type { ReactNode } from "react";

const categoryLabel: Record<string, string> = {
  integrated: "iGPU",
  low: "Cơ bản",
  mid: "Tầm trung",
  high: "Mạnh",
  ultra: "Rất mạnh",
};

export default function GpuCard({ gpu, count }: { gpu: Gpu; count?: number }) {
  return (
    <article className="card group h-full overflow-hidden">
      <Link href={"/gpu/" + gpu.slug} className="block">
        <div className="image-frame relative aspect-[16/9] overflow-hidden">
          <FastImage
            src={gpu.imageUrl}
            alt={"Ảnh minh họa " + gpu.name}
            fill
            sizes="(min-width:1024px) 340px, (min-width:640px) 45vw, 92vw"
            quality={64}
            className="object-cover transition duration-300 group-hover:scale-[1.025]"
          />
          <span className="absolute left-3 top-3 rounded-md bg-white/94 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-sm backdrop-blur dark:bg-gray-950/88 dark:text-white">
            {gpu.isLaptop ? "Laptop" : "Desktop"}
          </span>
        </div>
      </Link>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <Link href={"/gpu/" + gpu.slug} className="line-clamp-2 font-black leading-snug hover:text-teal-700 dark:hover:text-teal-300">
              {gpu.name}
            </Link>
            <p className="mt-2 text-sm font-semibold text-slate-500 dark:text-gray-400">
              {gpu.brand} · {gpu.vram ?? 0}GB VRAM
            </p>
          </div>
          <p className="rounded-md bg-slate-100 px-2.5 py-1 text-sm font-black tabular-nums text-slate-900 dark:bg-gray-800 dark:text-white">{shortNumber(gpu.benchmarkScore)}</p>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Metric icon={<Gauge aria-hidden size={15} />} label="Hạng" value={categoryLabel[gpu.category] ?? gpu.category} />
          <Metric icon={<Cpu aria-hidden size={15} />} label="Game" value={(count ?? 0).toLocaleString("vi-VN")} />
        </div>
      </div>
    </article>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div className="metric p-2.5">
      <p className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-gray-400">
        {icon}
        {label}
      </p>
      <p className="mt-1 truncate font-black">{value}</p>
    </div>
  );
}

function shortNumber(value: number) {
  return value >= 1000 ? `${Math.round(value / 1000)}k` : String(value);
}
