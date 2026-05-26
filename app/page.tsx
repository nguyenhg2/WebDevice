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
  const gameRows = pickFeaturedGames();
  const highlightRows = gameRows.slice(0, 5);
  const gpuCounts = countBy(benchmarks.map((row) => row.gpuSlug));
  const topGpus = [...gpus]
    .sort((a, b) => (gpuCounts.get(b.slug) ?? 0) - (gpuCounts.get(a.slug) ?? 0) || b.benchmarkScore - a.benchmarkScore)
    .slice(0, 6);
  const laptopPicks = devices.slice(0, 3);

  return (
    <main>
      <section className="border-b border-slate-200 bg-white dark:border-gray-800 dark:bg-gray-950">
        <div className="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_430px] lg:py-12">
          <div className="self-center">
            <p className="eyebrow">Fpsviet.com</p>
            <h1 className="mt-3 max-w-4xl text-4xl font-black leading-tight tracking-normal lg:text-6xl">
              Tra FPS nhanh, chọn game và máy đúng nhu cầu
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 dark:text-gray-300">
              Nhập cấu hình đang dùng để xem game nào mượt, game nào cần giảm setting và phần cứng nào nên nâng cấp trước.
            </p>
            <div className="mt-6 max-w-2xl">
              <SearchBar />
            </div>
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HomeMetric label="Game" value={games.length.toLocaleString("vi-VN")} tone="teal" />
              <HomeMetric label="GPU" value={gpus.length.toLocaleString("vi-VN")} tone="blue" />
              <HomeMetric label="FPS" value={benchmarks.length.toLocaleString("vi-VN")} tone="amber" />
            </div>
          </div>

          <form action="/tra-cuu" className="surface p-4 shadow-none">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="eyebrow">Kiểm tra máy</p>
                <h2 className="mt-1 text-2xl font-black">Cấu hình của bạn</h2>
              </div>
              <Link href="/build-pc" className="rounded-md border border-slate-200 px-3 py-2 text-sm font-black text-slate-700 hover:border-teal-300 hover:text-teal-700 dark:border-gray-700 dark:text-gray-200">
                Build PC
              </Link>
            </div>
            <div className="mt-5 grid gap-3">
              <ConfigSelect label="GPU" name="gpu" defaultValue={popularGpuSlug("nvidia-rtx-3060")} options={gpus.map((gpu) => [gpu.slug, gpu.name])} />
              <ConfigSelect
                label="CPU"
                name="cpu"
                defaultValue={cpus.find((cpu) => cpu.slug.includes("i5-12400"))?.slug ?? cpus[0]?.slug}
                options={cpus.map((cpu) => [cpu.slug, cpu.name])}
              />
              <div className="grid gap-3 sm:grid-cols-2">
                <ConfigSelect label="RAM" name="ram" defaultValue="16" options={[["8", "8GB"], ["16", "16GB"], ["32", "32GB"]]} />
                <ConfigSelect label="Màn hình" name="res" defaultValue="1080p" options={[["720p", "720p"], ["1080p", "1080p"], ["1440p", "1440p"], ["4k", "4K"]]} />
              </div>
              <button className="btn w-full">Xem kết quả</button>
            </div>
          </form>
        </div>
      </section>

      <section className="container page-section">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0">
            <SectionHeader eyebrow="Game phổ biến" title="Chọn game, xem ngay cấu hình" href="/chon-game" action="Xem tất cả" />
            <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {gameRows.map(({ game, fps, setting }) => (
                <GameCard key={game.slug} game={game} fps={fps} setting={setting} status={fps >= 55 ? "smooth" : fps >= 30 ? "playable" : "not_recommended"} />
              ))}
            </div>
          </div>

          <aside className="surface h-fit p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="eyebrow">FPS cao</p>
                <h2 className="mt-1 text-xl font-black">Top game dễ chơi</h2>
              </div>
              <Link href="/benchmark" className="text-sm font-black text-teal-700 hover:text-teal-600 dark:text-teal-300">
                Bảng FPS
              </Link>
            </div>
            <div className="mt-4 divide-y divide-slate-200 dark:divide-gray-800">
              {highlightRows.map(({ game, fps, setting }) => (
                <Link key={game.slug} href={"/game/" + game.slug} className="grid grid-cols-[minmax(0,1fr)_72px] gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="min-w-0">
                    <span className="line-clamp-1 font-black">{game.name}</span>
                    <span className="mt-1 block text-xs font-semibold text-slate-500 dark:text-gray-400">{setting}</span>
                  </span>
                  <span className="text-right text-lg font-black tabular-nums text-slate-950 dark:text-white">{fps}</span>
                </Link>
              ))}
            </div>
            <div className="mt-5 grid gap-2">
              <QuickLink href="/game-mien-phi-cho-may-yeu" label="Game miễn phí" />
              <QuickLink href="/laptop-khong-card-roi-choi-game-gi" label="Laptop không card rời" />
              <QuickLink href="/build-pc" label="Build PC theo game" />
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <SectionHeader eyebrow="Laptop và PC" title="Gợi ý máy dễ chốt đơn" href="/laptop" action="Xem laptop" />
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {laptopPicks.map((device) => (
              <DeviceCard key={device.slug} device={device} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <SectionHeader eyebrow="GPU" title="Card đồ họa đang có nhiều dữ liệu" href="/gpu" action="Xem GPU" />
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

function ConfigSelect({ label, name, defaultValue, options }: { label: string; name: string; defaultValue?: string; options: string[][] }) {
  return (
    <label className="grid gap-1 text-sm font-semibold">
      {label}
      <select name={name} className="input" defaultValue={defaultValue}>
        {options.map(([value, text]) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
    </label>
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

function HomeMetric({ label, value, tone }: { label: string; value: string; tone: "teal" | "blue" | "amber" }) {
  const toneClass = {
    teal: "border-teal-200 bg-teal-50 text-teal-800 dark:border-teal-900 dark:bg-teal-950/40 dark:text-teal-200",
    blue: "border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-200",
    amber: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200",
  }[tone];

  return (
    <div className={"rounded-lg border p-3 " + toneClass}>
      <p className="text-xs font-black uppercase opacity-75">{label}</p>
      <p className="mt-1 text-2xl font-black tabular-nums">{value}</p>
    </div>
  );
}

function SectionHeader({ eyebrow, title, href, action }: { eyebrow: string; title: string; href: string; action: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 text-2xl font-black tracking-normal md:text-3xl">{title}</h2>
      </div>
      <Link href={href} className="btn-secondary">
        {action}
      </Link>
    </div>
  );
}

function QuickLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold hover:border-teal-300 hover:bg-teal-50 hover:text-teal-700 dark:border-gray-700 dark:hover:bg-gray-800 dark:hover:text-teal-300">
      {label}
    </Link>
  );
}
