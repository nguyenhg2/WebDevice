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
    <section className="container py-8">
      <header className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div>
          <p className="text-sm font-bold uppercase text-blue-700 dark:text-blue-300">GPU database</p>
          <h1 className="mt-2 text-3xl font-black">Danh sách GPU và card đồ họa</h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-gray-300">
            Ưu tiên các GPU có benchmark FPS thực tế, sau đó sắp theo điểm hiệu năng để người dùng dễ chọn card khi tra cứu game.
          </p>
        </div>
        <div className="card grid grid-cols-2 gap-3 p-4 text-sm">
          <Metric label="GPU/card" value={gpus.length.toLocaleString("vi-VN")} />
          <Metric label="Có FPS" value={[...fpsCounts.keys()].length.toLocaleString("vi-VN")} />
        </div>
      </header>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sortedGpus.map((gpu) => (
          <GpuCard key={gpu.slug} gpu={gpu} count={fpsCounts.get(gpu.slug) ?? 0} />
        ))}
      </div>
    </section>
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
