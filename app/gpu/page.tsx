import GpuCard from "@/components/GpuCard";
import { benchmarks, gpus } from "@/lib/data";

export default function GpuList() {
  const fpsCounts = new Map<string, number>();
  for (const row of benchmarks) fpsCounts.set(row.gpuSlug, (fpsCounts.get(row.gpuSlug) ?? 0) + 1);
  const sortedGpus = [...gpus].sort((a, b) => {
    const countDelta = (fpsCounts.get(b.slug) ?? 0) - (fpsCounts.get(a.slug) ?? 0);
    return countDelta || b.benchmarkScore - a.benchmarkScore;
  });

  return (
    <main className="container page-section">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="eyebrow">GPU database</p>
          <h1 className="mt-2 text-4xl font-black">Danh sách GPU</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-gray-300">Chọn card đồ họa để xem những game phù hợp và FPS tham khảo.</p>
        </div>
        <div className="surface grid grid-cols-2 gap-3 p-4 text-sm">
          <Metric label="GPU" value={gpus.length.toLocaleString("vi-VN")} />
          <Metric label="Có FPS" value={[...fpsCounts.keys()].length.toLocaleString("vi-VN")} />
        </div>
      </header>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sortedGpus.map((gpu) => (
          <GpuCard key={gpu.slug} gpu={gpu} count={fpsCounts.get(gpu.slug) ?? 0} />
        ))}
      </div>
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}
