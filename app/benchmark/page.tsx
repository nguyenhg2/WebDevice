import Link from "next/link";
import BenchmarkTable from "@/components/BenchmarkTable";
import FastImage from "@/components/FastImage";
import { bestBenchmarkFps, toBenchmarkTableRow } from "@/lib/benchmark-links";
import { benchmarks, games, gpus } from "@/lib/data";

export const metadata = {
  title: "Benchmark FPS game và GPU",
  description: "Bảng FPS tham khảo theo game, GPU, độ phân giải và setting đề xuất.",
};

export default function BenchmarkPage() {
  const gameStats = games
    .map((game) => {
      const rows = benchmarks.filter((row) => row.gameSlug === game.slug);
      const avgFps = rows.length ? Math.round(rows.reduce((sum, row) => sum + bestBenchmarkFps(row), 0) / rows.length) : 0;
      return { game, rows, avgFps };
    })
    .filter((item) => item.rows.length)
    .sort((a, b) => b.avgFps - a.avgFps);

  const gpuStats = gpus
    .map((gpu) => ({ gpu, rows: benchmarks.filter((row) => row.gpuSlug === gpu.slug).length }))
    .filter((item) => item.rows)
    .sort((a, b) => b.gpu.benchmarkScore - a.gpu.benchmarkScore)
    .slice(0, 8);

  const featuredRows = benchmarks
    .filter((row) => row.resolution === "1080p")
    .sort((a, b) => bestBenchmarkFps(b) - bestBenchmarkFps(a))
    .slice(0, 100);

  return (
    <main>
      <header className="bg-slate-950 text-white">
        <div className="container py-10">
          <p className="text-sm font-black uppercase text-teal-300">FPS Benchmark</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-black">Bảng FPS theo game và card đồ họa</h1>
          <p className="mt-4 max-w-2xl text-slate-200">Xem nhanh FPS 1080p, setting đề xuất và mở video benchmark khi cần kiểm chứng.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-3">
            <Stat label="Game" value={gameStats.length.toLocaleString("vi-VN")} />
            <Stat label="GPU" value={gpuStats.length.toLocaleString("vi-VN")} />
            <Stat label="Cặp FPS" value={benchmarks.length.toLocaleString("vi-VN")} />
          </div>
        </div>
      </header>

      <div className="container page-section">
        <section>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Bảng chính</p>
              <h2 className="mt-2 text-3xl font-black">FPS 1080p nổi bật</h2>
            </div>
            <Link href="/tra-cuu" className="btn-secondary">
              Kiểm tra máy
            </Link>
          </div>
          <div className="mt-5">
            <BenchmarkTable rows={featuredRows.map(toBenchmarkTableRow)} />
          </div>
        </section>

        <aside className="mt-10 grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)]">
          <section className="surface p-4">
            <h2 className="text-xl font-black">Game FPS cao</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {gameStats.slice(0, 6).map(({ game, avgFps }) => (
                <Link key={game.slug} href={`/game/${game.slug}`} className="grid grid-cols-[80px_1fr] gap-3 rounded-lg border border-slate-200 p-2 hover:border-teal-300 dark:border-gray-700">
                  <div className="image-frame relative aspect-[16/9] overflow-hidden rounded">
                    <FastImage src={game.coverImage} alt="" fill sizes="80px" quality={45} className="object-cover" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-bold">{game.name}</p>
                    <p className="text-sm text-slate-500">{avgFps} FPS TB</p>
                  </div>
                </Link>
              ))}
            </div>
          </section>

          <section className="surface p-4">
            <h2 className="text-xl font-black">GPU mạnh</h2>
            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-1">
              {gpuStats.map(({ gpu }) => (
                <Link key={gpu.slug} href={`/gpu/${gpu.slug}`} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold hover:border-teal-300 dark:border-gray-700">
                  {gpu.name}
                </Link>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
