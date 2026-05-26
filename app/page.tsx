import Image from "next/image";
import Link from "next/link";
import DeviceCard from "@/components/DeviceCard";
import GameCard from "@/components/GameCard";
import GpuCard from "@/components/GpuCard";
import SearchBar from "@/components/SearchBar";
import { bestBenchmarkFps } from "@/lib/benchmark-links";
import { benchmarks, cpus, devices, games, gpus } from "@/lib/data";

const featuredSlugs = [
  "black-myth-wukong",
  "cyberpunk-2077",
  "counter-strike-2",
  "elden-ring",
  "baldurs-gate-3",
  "marvel-rivals",
  "gta-v",
  "forza-horizon-5",
];

export default function Home() {
  const heroGame =
    games.find((game) => game.slug === "black-myth-wukong") ??
    games.find((game) => game.slug === "cyberpunk-2077") ??
    games.find((game) => game.coverImage);
  const gameRows = pickFeaturedGames();
  const gpuCounts = countBy(benchmarks.map((row) => row.gpuSlug));
  const topGpus = [...gpus]
    .sort((a, b) => (gpuCounts.get(b.slug) ?? 0) - (gpuCounts.get(a.slug) ?? 0) || b.benchmarkScore - a.benchmarkScore)
    .slice(0, 6);
  const laptopPicks = devices.slice(0, 3);

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {heroGame?.coverImage ? <Image src={heroGame.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-32" /> : null}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.96),rgba(15,23,42,.88),rgba(15,23,42,.48))]" />
        <div className="container relative grid gap-8 py-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:py-16">
          <div>
            <p className="text-sm font-black uppercase text-teal-300">Máy này chơi được game gì?</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight lg:text-6xl">Tra FPS trước khi tải game hoặc mua máy</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-200">
              Chọn cấu hình của bạn để xem game nào chơi mượt, setting nên dùng và laptop/PC phù hợp.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/tra-cuu" className="btn bg-teal-400 text-slate-950 hover:bg-teal-300">
                Kiểm tra máy
              </Link>
              <Link href="/chon-game" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                Chọn game
              </Link>
              <Link href="/laptop" className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950">
                Xem laptop
              </Link>
            </div>
            <div className="mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HeroMetric label="Game" value={games.length.toLocaleString("vi-VN")} />
              <HeroMetric label="GPU" value={gpus.length.toLocaleString("vi-VN")} />
              <HeroMetric label="Cặp FPS" value={benchmarks.length.toLocaleString("vi-VN")} />
            </div>
          </div>

          <form action="/tra-cuu" className="surface border-white/15 bg-white/10 p-4 text-white backdrop-blur">
            <h2 className="text-xl font-black">Kiểm tra nhanh</h2>
            <div className="mt-4 grid gap-3">
              <label className="grid gap-1 text-sm font-semibold">
                GPU
                <select name="gpu" className="input text-slate-950" defaultValue={popularGpuSlug("nvidia-rtx-3060")}>
                  {gpus.map((gpu) => (
                    <option key={gpu.slug} value={gpu.slug}>
                      {gpu.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold">
                CPU
                <select name="cpu" className="input text-slate-950" defaultValue={cpus.find((cpu) => cpu.slug.includes("i5-12400"))?.slug ?? cpus[0]?.slug}>
                  {cpus.map((cpu) => (
                    <option key={cpu.slug} value={cpu.slug}>
                      {cpu.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid gap-3 sm:grid-cols-2">
                <label className="grid gap-1 text-sm font-semibold">
                  RAM
                  <select name="ram" className="input text-slate-950" defaultValue="16">
                    <option value="8">8GB</option>
                    <option value="16">16GB</option>
                    <option value="32">32GB</option>
                  </select>
                </label>
                <label className="grid gap-1 text-sm font-semibold">
                  Màn hình
                  <select name="res" className="input text-slate-950" defaultValue="1080p">
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4k">4K</option>
                  </select>
                </label>
              </div>
              <button className="btn w-full bg-teal-400 text-slate-950 hover:bg-teal-300">Xem kết quả</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container page-section">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Game phổ biến</p>
                <h2 className="mt-2 text-3xl font-black">Chọn game, xem ngay cấu hình</h2>
              </div>
              <Link href="/chon-game" className="btn-secondary">
                Xem tất cả
              </Link>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {gameRows.map(({ game, fps, setting }) => (
                <GameCard key={game.slug} game={game} fps={fps} setting={setting} status={fps >= 60 ? "smooth" : fps >= 30 ? "playable" : "not_recommended"} />
              ))}
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="surface p-4">
              <h2 className="text-xl font-black">Tìm nhanh</h2>
              <div className="mt-3">
                <SearchBar />
              </div>
              <div className="mt-4 grid gap-2">
                <QuickLink href="/game-mien-phi-cho-may-yeu" label="Game miễn phí" />
                <QuickLink href="/laptop-khong-card-roi-choi-game-gi" label="Laptop không card rời" />
                <QuickLink href="/build-pc" label="Build PC theo game" />
              </div>
            </div>
            <div className="surface p-4">
              <h2 className="text-xl font-black">Luồng sử dụng</h2>
              <div className="mt-4 grid gap-3 text-sm">
                <Step number="1" title="Chọn cấu hình" />
                <Step number="2" title="Xem game chơi mượt" />
                <Step number="3" title="Mua/nâng cấp đúng nhu cầu" />
              </div>
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">Laptop và PC</p>
              <h2 className="mt-2 text-3xl font-black">Gợi ý máy dễ chốt đơn</h2>
            </div>
            <Link href="/laptop" className="btn-secondary">
              Xem laptop
            </Link>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {laptopPicks.map((device) => (
              <DeviceCard key={device.slug} device={device} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="eyebrow">GPU</p>
              <h2 className="mt-2 text-3xl font-black">Card đồ họa đang có nhiều dữ liệu</h2>
            </div>
            <Link href="/gpu" className="btn-secondary">
              Xem GPU
            </Link>
          </div>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topGpus.map((gpu) => (
              <GpuCard key={gpu.slug} gpu={gpu} count={gpuCounts.get(gpu.slug) ?? 0} />
            ))}
          </div>
        </section>
      </section>
    </main>
  );
}

function pickFeaturedGames() {
  const selected = featuredSlugs.map((slug) => games.find((game) => game.slug === slug)).filter(Boolean) as typeof games;
  const fallback = selected.length >= 8 ? selected : [...selected, ...games.filter((game) => !selected.some((item) => item.slug === game.slug))].slice(0, 8);
  return fallback.slice(0, 8).map((game) => {
    const row = benchmarks
      .filter((benchmark) => benchmark.gameSlug === game.slug && benchmark.resolution === "1080p")
      .sort((a, b) => bestBenchmarkFps(b) - bestBenchmarkFps(a))[0];
    return { game, fps: row ? bestBenchmarkFps(row) : 0, setting: row?.recommendedSetting ?? "Medium" };
  });
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function popularGpuSlug(fallback: string) {
  return gpus.find((gpu) => gpu.slug === fallback)?.slug ?? gpus[0]?.slug;
}

function HeroMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3 backdrop-blur">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold hover:border-teal-300 hover:text-teal-700 dark:border-gray-700 dark:hover:text-teal-300">
      {label}
    </Link>
  );
}

function Step({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-3">
      <span className="grid h-7 w-7 place-items-center rounded-full bg-teal-100 text-xs font-black text-teal-800 dark:bg-teal-950 dark:text-teal-200">{number}</span>
      <span className="font-semibold text-slate-700 dark:text-gray-200">{title}</span>
    </div>
  );
}
