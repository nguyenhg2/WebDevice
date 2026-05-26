import Image from "next/image";
import Link from "next/link";
import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import DeviceCard from "@/components/DeviceCard";
import FpsBar from "@/components/FpsBar";
import { bestBenchmarkFps, buildVideoSearchUrl, getBenchmarkVideoUrl, toBenchmarkTableRow } from "@/lib/benchmark-links";
import { findGame, gameImages, gpus } from "@/lib/data";
import { getBenchmarkTable, getCompatibleDevices } from "@/lib/reverse-lookup";
import { formatGamePrice } from "@/lib/utils";

export const revalidate = 86400;
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;
  const game = findGame(gameSlug);
  return {
    title: game ? `${game.name} - cấu hình và FPS` : "Không tìm thấy game",
    description: game ? `Xem cấu hình yêu cầu, FPS tham khảo và laptop/PC phù hợp cho ${game.name}.` : "Game không tồn tại",
    openGraph: game ? { images: game.coverImage ? [game.coverImage] : [] } : undefined,
  };
}

export default async function GameDetail({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;
  const game = findGame(gameSlug);
  if (!game) {
    return (
      <main className="container page-section">
        <h1 className="text-3xl font-black">Không tìm thấy game</h1>
      </main>
    );
  }

  const table = getBenchmarkTable(game.slug);
  const topRows = table
    .filter((row) => row.resolution === "1080p")
    .sort((a, b) => bestBenchmarkFps(b) - bestBenchmarkFps(a))
    .slice(0, 6);
  const compatibleDevices = getCompatibleDevices(game.slug).slice(0, 6);
  const gallery = buildGallery(game.slug, game.coverImage, game.steamId);
  const avgFps = topRows.length ? Math.round(topRows.reduce((sum, row) => sum + bestBenchmarkFps(row), 0) / topRows.length) : 0;

  return (
    <main>
      <section className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 opacity-36">
          {game.coverImage ? <Image src={game.coverImage} alt="" fill priority sizes="100vw" className="object-cover" /> : null}
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,.98),rgba(15,23,42,.86),rgba(15,23,42,.40))]" />
        <div className="container relative grid gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:py-12">
          <div>
            <Breadcrumb items={[{ href: "/", label: "Trang chủ" }, { href: "/chon-game", label: "Game" }, { href: "#", label: game.name }]} />
            <h1 className="mt-6 max-w-4xl text-4xl font-black lg:text-5xl">{game.name}</h1>
            <p className="mt-4 max-w-2xl text-slate-200">
              {game.genres.slice(0, 3).join(", ")} · {formatGamePrice(game.price, game.isFree)} · {game.sizeGb}GB
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {game.genres.slice(0, 5).map((genre) => (
                <span key={genre} className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold backdrop-blur">
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link className="btn bg-teal-400 text-slate-950 hover:bg-teal-300" href={`/tra-cuu?gpu=${gpus[0]?.slug ?? ""}&ram=16&res=1080p`}>
                Kiểm tra máy của bạn
              </Link>
              {game.officialUrl ? (
                <a className="btn-secondary border-white/30 bg-white/10 text-white hover:bg-white hover:text-slate-950" href={game.officialUrl} target="_blank" rel="nofollow noreferrer">
                  Trang chính thức
                </a>
              ) : null}
            </div>
          </div>
          <aside className="surface border-white/15 bg-white/10 p-4 backdrop-blur">
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-slate-800">
              {game.coverImage ? <Image src={game.coverImage} alt={"Ảnh bìa " + game.name} fill sizes="380px" className="object-cover" /> : null}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <HeroStat label="FPS nổi bật" value={avgFps ? `${avgFps}` : "Đang cập nhật"} />
              <HeroStat label="GPU đã có" value={table.length.toLocaleString("vi-VN")} />
              <HeroStat label="RAM đề xuất" value={`${game.recSpecs.ramGb}GB`} />
              <HeroStat label="Dung lượng" value={`${game.sizeGb}GB`} />
            </div>
          </aside>
        </div>
      </section>

      <div className="container page-section">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
          <main>
            <section>
              <h2 className="text-2xl font-black">Ảnh game</h2>
              <div className="mt-4 grid gap-3 md:grid-cols-3">
                {gallery.map((image, index) => (
                  <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-slate-100 dark:bg-gray-800" key={image + index}>
                    <Image src={image} alt={`${game.name} ảnh ${index + 1}`} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" unoptimized={image.startsWith("http")} />
                  </div>
                ))}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-black">Cấu hình yêu cầu</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SpecCard title="Tối thiểu" specs={game.minSpecs} />
                <SpecCard title="Đề xuất" specs={game.recSpecs} />
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-black">FPS theo GPU</h2>
              <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {topRows.map((row) => {
                  const gpu = gpus.find((item) => item.slug === row.gpuSlug);
                  const fps = bestBenchmarkFps(row);
                  return (
                    <article className="card p-4" key={`${row.gpuSlug}-${row.resolution}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <Link href={`/game/${game.slug}/${row.gpuSlug}`} className="font-black hover:text-teal-700 dark:hover:text-teal-300">
                            {gpu?.name ?? row.gpuSlug}
                          </Link>
                          <p className="mt-1 text-sm text-slate-500">
                            {row.resolution} · {row.recommendedSetting}
                          </p>
                        </div>
                        <CompatibilityBadge status={row.status} />
                      </div>
                      <p className="mt-4 text-3xl font-black">{fps} FPS</p>
                      <div className="mt-3">
                        <FpsBar fps={fps} />
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>

            <section className="mt-10">
              <h2 className="text-2xl font-black">Bảng FPS</h2>
              <div className="mt-4">
                <BenchmarkTable rows={table.slice(0, 100).map(toBenchmarkTableRow)} />
              </div>
            </section>
          </main>

          <aside className="grid gap-4 content-start">
            <section className="surface p-4">
              <h2 className="text-xl font-black">Tóm tắt</h2>
              <dl className="mt-4 grid gap-3 text-sm">
                <Info label="CPU tối thiểu" value={game.minSpecs.cpuName} />
                <Info label="GPU tối thiểu" value={game.minSpecs.gpuName} />
                <Info label="CPU đề xuất" value={game.recSpecs.cpuName} />
                <Info label="GPU đề xuất" value={game.recSpecs.gpuName} />
              </dl>
            </section>
            <section className="surface p-4">
              <h2 className="text-xl font-black">Video benchmark</h2>
              <div className="mt-3 grid gap-2">
                {table.slice(0, 6).map((row) => {
                  const gpu = gpus.find((item) => item.slug === row.gpuSlug);
                  const videoUrl = getBenchmarkVideoUrl(row);
                  const href = videoUrl ?? buildVideoSearchUrl({ gameName: game.name, gpuName: gpu?.name ?? row.gpuSlug });
                  return (
                    <a className="rounded-md border border-slate-200 px-3 py-2 text-sm font-bold hover:border-teal-300 dark:border-gray-700" key={row.gpuSlug + row.resolution} href={href} target="_blank" rel="nofollow noreferrer">
                      {gpu?.name ?? row.gpuSlug}
                    </a>
                  );
                })}
              </div>
            </section>
          </aside>
        </div>

        {compatibleDevices.length ? (
          <section className="mt-10">
            <h2 className="text-2xl font-black">Laptop/PC phù hợp</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {compatibleDevices.map((device) => (
                <DeviceCard key={device.slug} device={device} />
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}

function buildGallery(gameSlug: string, coverImage: string | null, steamId: string | null) {
  const images = new Set<string>();
  if (coverImage) images.add(coverImage);
  for (const image of gameImages[gameSlug] ?? []) images.add(image);
  if (steamId) {
    images.add(`https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/capsule_616x353.jpg`);
    images.add(`https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`);
  }
  return Array.from(images).slice(0, 6);
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md bg-white/10 p-3 text-white">
      <p className="text-xs text-slate-300">{label}</p>
      <p className="mt-1 font-black">{value}</p>
    </div>
  );
}

function SpecCard({ title, specs }: { title: string; specs: { cpuName: string; gpuName: string; ramGb: number; storageGb: number } }) {
  return (
    <article className="surface p-4">
      <h3 className="text-lg font-black">{title}</h3>
      <dl className="mt-4 grid gap-3 text-sm">
        <Info label="CPU" value={specs.cpuName} />
        <Info label="GPU" value={specs.gpuName} />
        <Info label="RAM" value={`${specs.ramGb}GB`} />
        <Info label="Ổ cứng" value={`${specs.storageGb}GB`} />
      </dl>
    </article>
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
