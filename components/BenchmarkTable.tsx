import { gpus } from "@/lib/data";
import type { Benchmark } from "@/types";

const settingLabel: Record<string, string> = {
  Low: "Thấp",
  Medium: "Trung bình",
  High: "Cao",
  Ultra: "Rất cao",
  "Thấp": "Thấp",
  "Trung bình": "Trung bình",
  "Cao": "Cao",
  "Rất cao": "Rất cao",
};

export function viSetting(setting: string) {
  return settingLabel[setting] ?? setting;
}

export default function BenchmarkTable({ rows, highlightGpu }: { rows: Benchmark[]; highlightGpu?: string }) {
  return <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-gray-700"><table className="w-full min-w-[820px] table-fixed border-collapse text-sm"><colgroup><col className="w-[260px]" /><col className="w-[120px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[82px]" /><col className="w-[130px]" /><col className="w-[80px]" /></colgroup><thead className="bg-slate-50 dark:bg-gray-800"><tr className="border-b border-slate-200 dark:border-gray-700"><th className="p-3 text-left font-black">GPU</th><th className="p-3 text-left font-black">Độ phân giải</th><th className="p-3 text-right font-black">Thấp</th><th className="p-3 text-right font-black">Trung bình</th><th className="p-3 text-right font-black">Cao</th><th className="p-3 text-right font-black">Rất cao</th><th className="p-3 text-left font-black">Thiết lập</th><th className="p-3 text-center font-black">Video</th></tr></thead><tbody>{rows.map((row, index) => { const gpu = gpus.find((item) => item.slug === row.gpuSlug); return <tr key={index} className={"border-b border-slate-100 last:border-0 dark:border-gray-800 " + (highlightGpu === row.gpuSlug ? "bg-blue-50 dark:bg-blue-950" : "bg-white dark:bg-gray-900")}><td className="p-3 font-semibold">{gpu?.name ?? row.gpuSlug}</td><td className="p-3">{row.resolution}</td><td className="p-3 text-right tabular-nums">{row.fpsLow}</td><td className="p-3 text-right tabular-nums">{row.fpsMedium}</td><td className="p-3 text-right tabular-nums">{row.fpsHigh}</td><td className="p-3 text-right tabular-nums">{row.fpsUltra}</td><td className="p-3">{viSetting(row.recommendedSetting)}</td><td className="p-3 text-center"><a className="font-semibold text-blue-600" href={row.videoTestUrl ?? "#"} target="_blank" rel="nofollow">Xem</a></td></tr>; })}</tbody></table></div>;
}
