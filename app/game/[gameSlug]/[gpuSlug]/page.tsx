import Link from "next/link";
import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import FpsBar from "@/components/FpsBar";
import { toBenchmarkTableRow } from "@/lib/benchmark-links";
import { classifyGame } from "@/lib/compatibility-engine";
import { benchmarks, findGame, findGpu } from "@/lib/data";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

export default async function GameGpu({ params }: { params: Promise<{ gameSlug: string; gpuSlug: string }> }) {
  const { gameSlug, gpuSlug } = await params;
  const game = findGame(gameSlug);
  const gpu = findGpu(gpuSlug);
  if (!game || !gpu) {
    return (
      <main className="container page-section">
        <h1 className="text-3xl font-black">Không tìm thấy dữ liệu</h1>
      </main>
    );
  }

  const rows = benchmarks.filter((row) => row.gameSlug === game.slug && row.gpuSlug === gpu.slug);
  const benchmark = rows.find((row) => row.resolution === "1080p");
  const result = classifyGame(gpu.benchmarkScore, 15000, 16, "1080p", game.minSpecs, game.recSpecs, benchmark);

  return (
    <main className="container page-section">
      <Breadcrumb items={[{ href: "/", label: "Trang chủ" }, { href: `/game/${game.slug}`, label: game.name }, { href: "#", label: gpu.name }]} />
      <div className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section>
          <p className="eyebrow">Kết quả FPS</p>
          <h1 className="mt-2 text-4xl font-black">
            {game.name} trên {gpu.name}
          </h1>
          <div className="surface mt-6 p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <CompatibilityBadge status={result.status} />
                <p className="mt-4 text-5xl font-black">{result.estimatedFps} FPS</p>
                <p className="mt-2 text-slate-600 dark:text-gray-300">Gợi ý setting: {result.recommendedSetting}</p>
              </div>
              <Link href={`/tra-cuu?gpu=${gpu.slug}&ram=16&res=1080p`} className="btn">
                So thêm game khác
              </Link>
            </div>
            <div className="mt-5">
              <FpsBar fps={result.estimatedFps} />
            </div>
          </div>
        </section>

        <aside className="surface p-4">
          <h2 className="text-xl font-black">Thông tin GPU</h2>
          <dl className="mt-4 grid gap-3 text-sm">
            <Info label="GPU" value={gpu.name} />
            <Info label="VRAM" value={`${gpu.vram ?? 0}GB`} />
            <Info label="Loại" value={gpu.isLaptop ? "Laptop" : "Desktop"} />
          </dl>
        </aside>
      </div>

      <section className="mt-10">
        <h2 className="text-2xl font-black">Bảng FPS</h2>
        <div className="mt-4">
          <BenchmarkTable rows={rows.map(toBenchmarkTableRow)} highlightGpu={gpu.slug} />
        </div>
      </section>
    </main>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-slate-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 font-semibold">{value}</dd>
    </div>
  );
}
