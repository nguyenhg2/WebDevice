import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import DeviceCard from "@/components/DeviceCard";
import FastImage from "@/components/FastImage";
import GameCard from "@/components/GameCard";
import { toBenchmarkTableRow } from "@/lib/benchmark-links";
import { classifyGame } from "@/lib/compatibility-engine";
import { benchmarks, devices, findGpu, games } from "@/lib/data";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ gpuSlug: string }> }) {
  const { gpuSlug } = await params;
  const gpu = findGpu(gpuSlug);
  return { title: gpu ? `${gpu.name} chơi được game gì?` : "Không tìm thấy GPU" };
}

export default async function GpuDetail({ params }: { params: Promise<{ gpuSlug: string }> }) {
  const { gpuSlug } = await params;
  const gpu = findGpu(gpuSlug);
  if (!gpu) {
    return (
      <main className="container page-section">
        <h1 className="text-3xl font-black">Không tìm thấy GPU</h1>
      </main>
    );
  }

  const gpuBenchmarks = benchmarks.filter((row) => row.gpuSlug === gpu.slug);
  const rows = games
    .map((game) => {
      const benchmark = gpuBenchmarks.find((row) => row.gameSlug === game.slug && row.resolution === "1080p");
      return {
        game,
        ...classifyGame(gpu.benchmarkScore, 15000, 16, "1080p", game.minSpecs, game.recSpecs, benchmark),
      };
    })
    .sort((a, b) => b.estimatedFps - a.estimatedFps);
  const smoothCount = rows.filter((row) => row.status === "smooth").length;
  const matchingDevices = devices.filter((device) => device.gpu === gpu.name).slice(0, 6);

  return (
    <main className="container page-section">
      <Breadcrumb items={[{ href: "/", label: "Trang chủ" }, { href: "/gpu", label: "GPU" }, { href: "#", label: gpu.name }]} />
      <header className="mt-4 grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
        <div>
          <p className="eyebrow">GPU</p>
          <h1 className="mt-2 text-4xl font-black">{gpu.name} chơi được game gì?</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-gray-300">Danh sách game phù hợp ở 1080p và setting nên dùng.</p>
        </div>
        <div className="surface overflow-hidden">
          <div className="image-frame relative aspect-[16/9] overflow-hidden">
            <FastImage src={gpu.imageUrl} alt={"Ảnh minh họa " + gpu.name} fill sizes="380px" quality={62} className="object-cover" priority />
          </div>
          <div className="grid grid-cols-2 gap-3 p-4 text-sm">
            <Metric label="Game mượt" value={smoothCount.toLocaleString("vi-VN")} />
            <Metric label="VRAM" value={`${gpu.vram ?? 0}GB`} />
            <Metric label="Loại" value={gpu.isLaptop ? "Laptop" : "Desktop"} />
            <Metric label="FPS rows" value={gpuBenchmarks.length.toLocaleString("vi-VN")} />
          </div>
        </div>
      </header>

      <section className="mt-8">
        <h2 className="text-2xl font-black">Game phù hợp nhất</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {rows.slice(0, 16).map((row) => (
            <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />
          ))}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-2xl font-black">Bảng FPS</h2>
        <div className="mt-4">
          <BenchmarkTable rows={gpuBenchmarks.slice(0, 100).map(toBenchmarkTableRow)} highlightGpu={gpu.slug} />
        </div>
      </section>

      {matchingDevices.length ? (
        <section className="mt-10">
          <h2 className="text-2xl font-black">Laptop/PC có GPU này</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {matchingDevices.map((device) => (
              <DeviceCard key={device.slug} device={device} />
            ))}
          </div>
        </section>
      ) : null}
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
