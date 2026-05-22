import Image from "next/image";
import Link from "next/link";
import BenchmarkTable from "@/components/BenchmarkTable";
import { benchmarks, gameSources, games, gpus } from "@/lib/data";

export const metadata = {
  title: "Benchmark FPS game và GPU",
  description: "Bảng benchmark FPS theo game, GPU, độ phân giải và nguồn kiểm chứng.",
};

export default function BenchmarkPage() {
  const gameStats = games
    .map((game) => {
      const rows = benchmarks.filter((row) => row.gameSlug === game.slug);
      const avgFps = rows.length ? Math.round(rows.reduce((sum, row) => sum + bestFps(row), 0) / rows.length) : 0;
      return { game, rows, avgFps };
    })
    .filter((item) => item.rows.length)
    .sort((a, b) => b.rows.length - a.rows.length);

  const allGpuStats = gpus
    .map((gpu) => ({ gpu, rows: benchmarks.filter((row) => row.gpuSlug === gpu.slug).length }))
    .filter((item) => item.rows)
    .sort((a, b) => b.rows - a.rows);
  const gpuStats = allGpuStats.slice(0, 10);

  const dropReferenceCount = gameSources.filter((source) => source.source === "dropreference").length;
  const featuredRows = benchmarks
    .filter((row) => row.resolution === "1080p")
    .sort((a, b) => bestFps(b) - bestFps(a))
    .slice(0, 80);

  return (
    <section>
      <header className="bg-slate-950 text-white">
        <div className="container py-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">FPS Benchmark</p>
          <h1 className="mt-3 text-4xl font-black">Bảng đo FPS theo game và card đồ họa</h1>
          <p className="mt-4 max-w-3xl text-slate-200">
            Tập trung vào dữ liệu có nguồn: benchmark DropReference, Technical.city/Notebookcheck, Steam và trang chính thức. Dùng bảng này để kiểm tra nhanh card nào đạt mức FPS mong muốn trước khi mua máy hoặc nâng cấp.
          </p>
          <div className="mt-7 grid gap-3 sm:grid-cols-4">
            <Stat label="Game có FPS" value={gameStats.length.toLocaleString("vi-VN")} />
            <Stat label="Dòng benchmark" value={benchmarks.length.toLocaleString("vi-VN")} />
            <Stat label="GPU có dữ liệu" value={allGpuStats.length.toLocaleString("vi-VN")} />
            <Stat label="Nguồn DropReference" value={dropReferenceCount.toLocaleString("vi-VN")} />
          </div>
        </div>
      </header>

      <div className="container py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
          <main>
            <h2 className="text-2xl font-black">Game benchmark nổi bật</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              {gameStats.slice(0, 8).map(({ game, rows, avgFps }) => (
                <Link key={game.slug} href={`/game/${game.slug}`} className="card grid grid-cols-[120px_1fr] overflow-hidden hover:border-blue-300">
                  <div className="relative min-h-28 bg-slate-100 dark:bg-gray-800">
                    {game.coverImage ? <Image src={game.coverImage} alt={game.name} fill sizes="120px" className="object-cover" /> : null}
                  </div>
                  <div className="p-4">
                    <h3 className="font-black">{game.name}</h3>
                    <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{rows.length} dòng FPS · trung bình {avgFps} FPS</p>
                    <p className="mt-3 text-sm font-semibold text-blue-700 dark:text-blue-300">Xem cấu hình và gallery</p>
                  </div>
                </Link>
              ))}
            </div>

            <h2 className="mt-10 text-2xl font-black">Bảng FPS 1080p</h2>
            <div className="mt-4">
              <BenchmarkTable rows={featuredRows} />
            </div>
          </main>

          <aside className="space-y-6">
            <div className="card p-4">
              <h2 className="text-xl font-black">GPU được đo nhiều</h2>
              <div className="mt-4 grid gap-3">
                {gpuStats.map(({ gpu, rows }) => (
                  <Link key={gpu.slug} href={`/gpu/${gpu.slug}`} className="rounded-md border border-slate-200 p-3 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
                    <span className="font-bold">{gpu.name}</span>
                    <span className="mt-1 block text-sm text-slate-500">{rows} dòng FPS · điểm {gpu.benchmarkScore.toLocaleString("vi-VN")}</span>
                  </Link>
                ))}
              </div>
            </div>
            <div className="card p-4">
              <h2 className="text-xl font-black">Nguồn dữ liệu</h2>
              <p className="mt-3 text-sm text-slate-600 dark:text-gray-300">
                FPS thực tế được ưu tiên khi có nguồn benchmark. Các game chưa có số đo trực tiếp vẫn dùng engine ước tính cấu hình của dự án.
              </p>
              <Link href="/fps-samples" className="mt-4 inline-flex rounded-md border px-3 py-2 text-sm font-bold hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-800">
                Xem mẫu FPS ngoài
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}

function bestFps(row: { fpsLow: number; fpsMedium: number; fpsHigh: number; fpsUltra: number }) {
  return row.fpsUltra || row.fpsHigh || row.fpsMedium || row.fpsLow;
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}
