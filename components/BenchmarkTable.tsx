import { gpus } from "@/lib/data";
import type { Benchmark } from "@/types";

export default function BenchmarkTable({ rows, highlightGpu }: { rows: Benchmark[]; highlightGpu?: string }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[720px] border-collapse text-sm"><thead><tr className="border-b"><th className="p-2 text-left">GPU</th><th>Độ phân giải</th><th>Low</th><th>Medium</th><th>High</th><th>Ultra</th><th>Setting</th><th>Video</th></tr></thead><tbody>{rows.map((row, index) => { const gpu = gpus.find((item) => item.slug === row.gpuSlug); return <tr key={index} className={"border-b " + (highlightGpu === row.gpuSlug ? "bg-blue-50 dark:bg-blue-950" : "")}><td className="p-2 font-semibold">{gpu?.name ?? row.gpuSlug}</td><td>{row.resolution}</td><td>{row.fpsLow}</td><td>{row.fpsMedium}</td><td>{row.fpsHigh}</td><td>{row.fpsUltra}</td><td>{row.recommendedSetting}</td><td><a className="text-blue-600" href={row.videoTestUrl ?? "#"} target="_blank" rel="nofollow">Xem</a></td></tr>; })}</tbody></table></div>;
}
