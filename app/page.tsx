import Image from "next/image";
import Link from "next/link";
import GameCard from "@/components/GameCard";
import GpuCard from "@/components/GpuCard";
import DeviceCard from "@/components/DeviceCard";
import { benchmarks, blogPosts, cpus, devices, games, gpus } from "@/lib/data";

export default function Home() {
  const benchmarkCounts = countBy(benchmarks.map((row) => row.gameSlug));
  const gpuBenchmarkCounts = countBy(benchmarks.map((row) => row.gpuSlug));
  const benchmarkedGames = games
    .filter((game) => benchmarkCounts.get(game.slug))
    .sort((a, b) => (benchmarkCounts.get(b.slug) ?? 0) - (benchmarkCounts.get(a.slug) ?? 0));
  const heroGame = benchmarkedGames.find((game) => game.coverImage) ?? games.find((game) => game.coverImage);
  const topGpus = [...gpus].sort((a, b) => b.benchmarkScore - a.benchmarkScore).slice(0, 6);

  return (
    <div>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        {heroGame?.coverImage ? (
          <Image src={heroGame.coverImage} alt="" fill priority sizes="100vw" className="object-cover opacity-30" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-950/45" />
        <div className="container relative grid gap-8 py-10 lg:grid-cols-[1fr_420px] lg:py-14">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-cyan-300">Maynaychoiduoc.vn</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight lg:text-6xl">Máy này chơi được game gì?</h1>
            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-200">
              Tra CPU, GPU, RAM để xem game chơi được, FPS tham khảo, setting đề xuất và thiết bị phù hợp. Dữ liệu hiện có được ghép từ Steam, website chính thức và benchmark DropReference.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-4">
              <StatPill label="Game" value={games.length.toLocaleString("vi-VN")} />
              <StatPill label="GPU/card" value={gpus.length.toLocaleString("vi-VN")} />
              <StatPill label="Dòng FPS" value={benchmarks.length.toLocaleString("vi-VN")} />
              <StatPill label="Game có FPS" value={benchmarkedGames.length.toLocaleString("vi-VN")} />
            </div>
          </div>

          <form action="/tra-cuu" className="rounded-lg border border-white/15 bg-white/10 p-4 shadow-2xl backdrop-blur">
            <h2 className="text-xl font-black">Kiểm tra cấu hình</h2>
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
                <select name="cpu" className="input text-slate-950" defaultValue={cpus[10]?.slug ?? cpus[0]?.slug}>
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
                  Độ phân giải
                  <select name="res" className="input text-slate-950" defaultValue="1080p">
                    <option value="720p">720p</option>
                    <option value="1080p">1080p</option>
                    <option value="1440p">1440p</option>
                    <option value="4k">4K</option>
                  </select>
                </label>
              </div>
              <button className="btn w-full bg-cyan-400 text-slate-950 hover:bg-cyan-300">Xem game chơi được</button>
              <Link href="/build-pc" className="rounded-md border border-white/25 px-3 py-2 text-center text-sm font-bold hover:bg-white/10">
                Build PC theo ngân sách
              </Link>
            </div>
          </form>
        </div>
      </section>

      <section className="container py-10">
        <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
          <div>
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-bold uppercase text-blue-700 dark:text-blue-300">Benchmark catalog</p>
                <h2 className="mt-1 text-2xl font-black">Game có dữ liệu FPS thực tế</h2>
              </div>
              <Link href="/benchmark" className="font-bold text-blue-700 dark:text-blue-300">Xem bảng benchmark</Link>
            </div>
            <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {benchmarkedGames.slice(0, 8).map((game) => (
                <GameCard key={game.slug} game={game} />
              ))}
            </div>
          </div>

          <aside className="rounded-lg border border-slate-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="text-xl font-black">Bắt đầu nhanh</h2>
            <div className="mt-4 grid gap-3">
              <QuickLink href="/tra-cuu" title="Máy này chơi được game gì?" description="Chọn cấu hình rồi xem toàn bộ game chơi mượt, chơi được và không khuyến nghị." />
              <QuickLink href="/build-pc" title="Build PC theo game" description="Chọn ngân sách, game mục tiêu và nhận cấu hình đề xuất." />
              <QuickLink href="/chon-game" title="Xem từng game" description="Tra cấu hình, ảnh và FPS theo từng tựa game." />
            </div>
          </aside>
        </div>

        <section className="mt-12">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase text-blue-700 dark:text-blue-300">Card đồ họa</p>
              <h2 className="mt-1 text-2xl font-black">GPU hiệu năng cao và phổ biến</h2>
            </div>
            <Link href="/gpu" className="font-bold text-blue-700 dark:text-blue-300">Tất cả GPU</Link>
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topGpus.map((gpu) => (
              <GpuCard key={gpu.slug} gpu={gpu} count={gpuBenchmarkCounts.get(gpu.slug) ?? 0} />
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-black">Laptop gaming theo tầm giá</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {devices.slice(0, 6).map((device) => (
              <DeviceCard key={device.slug} device={device} />
            ))}
          </div>
        </section>

        <section className="mt-12 grid gap-6 lg:grid-cols-[1fr_340px]">
          <div>
            <h2 className="text-2xl font-black">Tìm game theo nhu cầu</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {[
                ["Game miễn phí", "/game-mien-phi-cho-may-yeu"],
                ["Game nhẹ dưới 5GB", "/game-nhe-duoi-5gb"],
                ["Laptop không card rời", "/laptop-khong-card-roi-choi-game-gi"],
                ["Laptop dưới 15 triệu", "/laptop-duoi-15trieu-choi-duoc-game-gi"],
                ["RAM 8GB chơi gì", "/ram/8"],
              ].map(([label, href]) => (
                <Link className="rounded-lg border border-slate-200 bg-white p-4 font-bold hover:border-blue-300 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900" key={href} href={href}>
                  {label}
                </Link>
              ))}
            </div>
          </div>
          <aside>
            <h2 className="text-2xl font-black">Bài viết mới</h2>
            <div className="mt-4 grid gap-3">
              {blogPosts.slice(0, 4).map((post) => (
                <Link className="rounded-lg border border-slate-200 bg-white p-4 font-bold hover:text-blue-700 dark:border-gray-700 dark:bg-gray-900" key={post.slug} href={"/blog/" + post.slug}>
                  {post.title}
                </Link>
              ))}
            </div>
          </aside>
        </section>
      </section>
    </div>
  );
}

function countBy(values: string[]) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return counts;
}

function popularGpuSlug(fallback: string) {
  return gpus.find((gpu) => gpu.slug === fallback)?.slug ?? gpus[0]?.slug;
}

function StatPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/15 bg-white/10 p-3">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 text-2xl font-black">{value}</p>
    </div>
  );
}

function QuickLink({ href, title, description }: { href: string; title: string; description: string }) {
  return (
    <Link href={href} className="rounded-md border border-slate-200 p-3 hover:border-blue-300 hover:text-blue-700 dark:border-gray-700">
      <span className="block font-black">{title}</span>
      <span className="mt-1 block text-sm text-slate-600 dark:text-gray-300">{description}</span>
    </Link>
  );
}
