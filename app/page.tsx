import { ArrowRight, BarChart3, Cpu, Gamepad2, Laptop, MonitorCheck, Wrench } from "lucide-react";
import Link from "next/link";
import ConfigCombobox from "@/components/ConfigCombobox";
import DeviceCard from "@/components/DeviceCard";
import FastImage from "@/components/FastImage";
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
  "grand-theft-auto-v",
  "forza-horizon-5",
];

export default function Home() {
  const gameRows = pickFeaturedGames();
  const heroRows = gameRows.slice(0, 3);
  const highlightRows = gameRows.slice(0, 5);
  const gpuCounts = countBy(benchmarks.map((row) => row.gpuSlug));
  const topGpus = [...gpus]
    .sort((a, b) => (gpuCounts.get(b.slug) ?? 0) - (gpuCounts.get(a.slug) ?? 0) || b.benchmarkScore - a.benchmarkScore)
    .slice(0, 6);
  const laptopPicks = devices.slice(0, 3);

  return (
    <main>
      <section className="border-b border-slate-200/80 bg-white/74 dark:border-gray-800 dark:bg-gray-950/50">
        <div className="container grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_460px] lg:py-12">
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
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="/tra-cuu" className="btn">
                <MonitorCheck aria-hidden size={18} strokeWidth={2.5} />
                Kiểm tra máy
              </Link>
              <Link href="/build-pc" className="btn-secondary">
                <Wrench aria-hidden size={18} strokeWidth={2.4} />
                Build PC theo game
              </Link>
            </div>
            <div className="mt-6 grid max-w-2xl gap-3 sm:grid-cols-3">
              <HomeMetric icon={<Gamepad2 aria-hidden size={18} />} label="Game" value={games.length.toLocaleString("vi-VN")} />
              <HomeMetric icon={<Cpu aria-hidden size={18} />} label="GPU" value={gpus.length.toLocaleString("vi-VN")} />
              <HomeMetric icon={<BarChart3 aria-hidden size={18} />} label="Mẫu FPS" value={benchmarks.length.toLocaleString("vi-VN")} />
            </div>
          </div>

          <div className="grid gap-4">
            <form action="/tra-cuu" className="surface p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Kiểm tra máy</p>
                  <h2 className="mt-1 text-2xl font-black">Cấu hình của bạn</h2>
                </div>
                <Link href="/benchmark" className="btn-secondary min-h-10 px-3 py-2 text-sm">
                  Bảng FPS
                </Link>
              </div>
              <div className="mt-5 grid gap-3">
                <ConfigCombobox
                  label="GPU"
                  name="gpu"
                  defaultValue={defaultGpuSlug("nvidia-rtx-3060")}
                  placeholder="Gõ RTX 3060, GTX 1650, RX 6600..."
                  options={gpus.map((gpu) => ({
                    value: gpu.slug,
                    label: gpu.name,
                    meta: `${gpu.brand} · ${gpu.vram ?? 0}GB · ${shortNumber(gpu.benchmarkScore)} điểm`,
                  }))}
                />
                <ConfigCombobox
                  label="CPU"
                  name="cpu"
                  defaultValue={cpus.find((cpu) => cpu.slug.includes("i5-12400"))?.slug ?? cpus[0]?.slug}
                  placeholder="Gõ i5, Ryzen 5, 12400F..."
                  options={cpus.map((cpu) => ({
                    value: cpu.slug,
                    label: cpu.name,
                    meta: `${cpu.cores} nhân/${cpu.threads} luồng · ${shortNumber(cpu.benchmarkScore)} điểm`,
                  }))}
                />
                <div className="grid gap-3 sm:grid-cols-2">
                  <ConfigSelect label="RAM" name="ram" defaultValue="16" options={[["8", "8GB"], ["16", "16GB"], ["32", "32GB"]]} />
                  <ConfigSelect label="Màn hình" name="res" defaultValue="1080p" options={[["720p", "720p"], ["1080p", "1080p"], ["1440p", "1440p"], ["4k", "4K"]]} />
                </div>
                <button className="btn w-full">
                  Xem kết quả
                  <ArrowRight aria-hidden size={18} strokeWidth={2.5} />
                </button>
              </div>
            </form>

            <div className="surface overflow-hidden">
              <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-4 py-3 dark:border-gray-800">
                <div>
                  <p className="text-xs font-black uppercase text-slate-500 dark:text-gray-400">Đang được tra nhiều</p>
                  <p className="mt-0.5 font-black">Game nổi bật</p>
                </div>
                <Link href="/chon-game" className="text-sm font-black text-teal-700 hover:text-teal-600 dark:text-teal-300">
                  Xem game
                </Link>
              </div>
              <div className="grid gap-0 divide-y divide-slate-200 dark:divide-gray-800">
                {heroRows.map(({ game, fps, setting }) => (
                  <Link key={game.slug} href={"/game/" + game.slug} className="grid grid-cols-[86px_minmax(0,1fr)_64px] items-center gap-3 px-4 py-3 hover:bg-slate-50 dark:hover:bg-gray-900">
                    <span className="image-frame relative aspect-[16/9] overflow-hidden rounded-md">
                      <FastImage src={game.coverImage} alt={"Ảnh bìa " + game.name} fill sizes="86px" quality={58} className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="line-clamp-1 font-black">{game.name}</span>
                      <span className="mt-1 block truncate text-xs font-semibold text-slate-500 dark:text-gray-400">{setting}</span>
                    </span>
                    <span className="text-right">
                      <span className="block text-lg font-black tabular-nums">{fps}</span>
                      <span className="text-xs font-bold text-slate-500 dark:text-gray-400">FPS</span>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
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
              <QuickLink href="/game-nhe-duoi-10gb" label="Game nhẹ dưới 10GB" />
            </div>
          </aside>
        </div>
      </section>

      <section className="soft-band">
        <div className="container grid gap-4 py-8 md:grid-cols-3">
          <QuickPath href="/tra-cuu" icon={<MonitorCheck aria-hidden size={22} />} title="Tra cứu cấu hình" text="Chọn GPU, CPU, RAM và độ phân giải để lọc game phù hợp." />
          <QuickPath href="/build-pc" icon={<Wrench aria-hidden size={22} />} title="Build PC theo game" text="Xem phần cứng nên ưu tiên khi muốn chơi một game cụ thể." />
          <QuickPath href="/laptop" icon={<Laptop aria-hidden size={22} />} title="Tìm laptop gaming" text="Lọc máy theo khoảng giá và cấu hình phổ biến tại Việt Nam." />
        </div>
      </section>

      <section className="container page-section">
        <SectionHeader eyebrow="Laptop và PC" title="Gợi ý máy dễ chốt đơn" href="/laptop" action="Xem laptop" />
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {laptopPicks.map((device) => (
            <DeviceCard key={device.slug} device={device} />
          ))}
        </div>

        <div className="mt-12">
          <SectionHeader eyebrow="GPU" title="Card đồ họa đang có nhiều dữ liệu" href="/gpu" action="Xem GPU" />
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topGpus.map((gpu) => (
              <GpuCard key={gpu.slug} gpu={gpu} count={gpuCounts.get(gpu.slug) ?? 0} />
            ))}
          </div>
        </div>
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
  const selected = featuredSlugs
    .map((slug) => games.find((game) => game.slug === slug))
    .filter((game): game is (typeof games)[number] => Boolean(game));
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

function shortNumber(value: number) {
  return value >= 1000 ? `${Math.round(value / 100) / 10}k` : String(value);
}

function defaultGpuSlug(fallback: string) {
  return gpus.find((gpu) => gpu.slug === fallback)?.slug ?? gpus[0]?.slug;
}

function HomeMetric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="metric flex items-center gap-3">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-teal-50 text-teal-700 dark:bg-teal-950/50 dark:text-teal-200">{icon}</span>
      <span>
        <span className="block text-xs font-black uppercase text-slate-500 dark:text-gray-400">{label}</span>
        <span className="mt-0.5 block text-2xl font-black tabular-nums">{value}</span>
      </span>
    </div>
  );
}

function SectionHeader({ eyebrow, title, href, action }: { eyebrow: string; title: string; href: string; action: string }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="section-heading mt-2 tracking-normal">{title}</h2>
      </div>
      <Link href={href} className="btn-secondary">
        {action}
        <ArrowRight aria-hidden size={17} strokeWidth={2.5} />
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

function QuickPath({ href, icon, title, text }: { href: string; icon: React.ReactNode; title: string; text: string }) {
  return (
    <Link href={href} className="grid gap-3 rounded-lg border border-slate-200 bg-white/72 p-4 hover:border-teal-300 hover:bg-white dark:border-gray-800 dark:bg-gray-950/52 dark:hover:border-teal-500">
      <span className="grid h-11 w-11 place-items-center rounded-lg bg-slate-950 text-white dark:bg-white dark:text-slate-950">{icon}</span>
      <span>
        <span className="block font-black">{title}</span>
        <span className="mt-1 block text-sm leading-6 text-slate-600 dark:text-gray-300">{text}</span>
      </span>
    </Link>
  );
}
