import Image from "next/image";
import Link from "next/link";
import DeviceCard from "@/components/DeviceCard";
import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import FpsBar from "@/components/FpsBar";
import { findGame, games, gpus } from "@/lib/data";
import { getBenchmarkTable, getCompatibleDevices } from "@/lib/reverse-lookup";
import { formatVnd } from "@/lib/utils";

export const revalidate = 86400;

export function generateStaticParams() {
  return games.map((game) => ({ gameSlug: game.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;
  const game = findGame(gameSlug);
  return {
    title: game ? `${game.name} - Cấu hình, FPS benchmark, thiết bị đề xuất` : "Không tìm thấy game",
    description: game ? game.description : "Game không tồn tại",
    openGraph: game ? { images: game.coverImage ? [game.coverImage] : [] } : undefined,
  };
}

export default async function GameDetail({ params }: { params: Promise<{ gameSlug: string }> }) {
  const { gameSlug } = await params;
  const game = findGame(gameSlug);
  if (!game) return <section className="container py-8"><h1>Không tìm thấy game</h1></section>;

  const table = getBenchmarkTable(game.slug);
  const topRows = table
    .filter((row) => row.resolution === "1080p")
    .slice(-6)
    .reverse();
  const compatibleDevices = getCompatibleDevices(game.slug).slice(0, 6);
  const gallery = buildGallery(game.coverImage, game.steamId);
  const avgFps = topRows.length ? Math.round(topRows.reduce((sum, row) => sum + row.fpsHigh, 0) / topRows.length) : 0;

  return <section><div className="relative overflow-hidden bg-slate-950 text-white"><div className="absolute inset-0 opacity-35">{game.coverImage ? <Image src={game.coverImage} alt={"Ảnh nền " + game.name} fill priority sizes="100vw" className="object-cover" /> : null}</div><div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-slate-950/20" /><div className="container relative grid gap-8 py-8 lg:grid-cols-[1fr_380px] lg:py-12"><div><Breadcrumb items={[{ href: "/", label: "Trang chủ" }, { href: "/chon-game", label: "Chọn game" }, { href: "#", label: game.name }]} /><h1 className="mt-6 max-w-4xl text-4xl font-black lg:text-5xl">{game.name}</h1><p className="mt-4 max-w-3xl text-base text-slate-200">{game.description}</p><div className="mt-6 flex flex-wrap gap-2">{game.genres.slice(0, 6).map((genre) => <span key={genre} className="rounded-full bg-white/10 px-3 py-1 text-sm font-bold backdrop-blur">{genre}</span>)}</div><div className="mt-6 flex flex-wrap gap-3"><Link className="btn bg-white text-blue-700" href={`/tra-cuu?gpu=${gpus[0]?.slug ?? ""}&ram=8&res=1080p`}>Kiểm tra máy của bạn</Link>{game.officialUrl ? <a className="rounded-md border border-white/40 px-4 py-2 font-bold hover:bg-white/10" href={game.officialUrl} target="_blank" rel="nofollow">Trang chính thức</a> : null}</div></div><aside className="rounded-lg border border-white/15 bg-white/10 p-4 backdrop-blur"><div className="relative aspect-[16/9] overflow-hidden rounded-md bg-slate-800">{game.coverImage ? <Image src={game.coverImage} alt={"Ảnh bìa " + game.name} fill sizes="380px" className="object-cover" /> : null}</div><div className="mt-4 grid grid-cols-2 gap-3 text-sm"><Stat label="Giá" value={game.isFree ? "Miễn phí" : formatVnd(game.price)} /><Stat label="Dung lượng" value={`${game.sizeGb}GB`} /><Stat label="RAM tối thiểu" value={`${game.minSpecs.ramGb}GB`} /><Stat label="FPS 1080p nổi bật" value={avgFps ? `${avgFps} FPS` : "Đang cập nhật"} /></div></aside></div></div><div className="container py-8"><div className="grid gap-6 lg:grid-cols-[1fr_320px]"><main><section><h2 className="text-2xl font-black">Ảnh game</h2><div className="mt-4 grid gap-3 md:grid-cols-3">{gallery.map((image, index) => <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-slate-100 dark:bg-gray-800" key={image + index}><Image src={image} alt={`${game.name} screenshot ${index + 1}`} fill sizes="(min-width:1024px) 30vw, 100vw" className="object-cover" /></div>)}</div></section><section className="mt-8"><h2 className="text-2xl font-black">Cấu hình yêu cầu</h2><div className="mt-4 grid gap-4 md:grid-cols-2"><SpecCard title="Tối thiểu" specs={game.minSpecs} /><SpecCard title="Đề xuất" specs={game.recSpecs} /></div></section><section className="mt-8"><h2 className="text-2xl font-black">FPS benchmark nổi bật</h2><div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{topRows.map((row) => { const gpu = gpus.find((item) => item.slug === row.gpuSlug); return <article className="card p-4" key={`${row.gpuSlug}-${row.resolution}`}><div className="flex items-start justify-between gap-3"><div><Link href={`/game/${game.slug}/${row.gpuSlug}`} className="font-bold hover:text-blue-600">{gpu?.name ?? row.gpuSlug}</Link><p className="mt-1 text-sm text-slate-500">{row.resolution} · {row.recommendedSetting}</p></div><CompatibilityBadge status={row.status} /></div><p className="mt-4 text-3xl font-black">{row.fpsHigh} FPS</p><div className="mt-3"><FpsBar fps={row.fpsHigh} /></div></article>; })}</div></section><section className="mt-8"><h2 className="text-2xl font-black">Bảng benchmark FPS</h2><div className="mt-4"><BenchmarkTable rows={table.slice(0, 80)} /></div></section></main><aside className="space-y-6"><div className="card p-4"><h2 className="text-xl font-black">Tóm tắt nhanh</h2><dl className="mt-4 grid gap-3 text-sm"><Info label="CPU tối thiểu" value={game.minSpecs.cpuName} /><Info label="GPU tối thiểu" value={game.minSpecs.gpuName} /><Info label="CPU đề xuất" value={game.recSpecs.cpuName} /><Info label="GPU đề xuất" value={game.recSpecs.gpuName} /><Info label="Nguồn" value={game.steamId ? "Steam Store API" : "Website chính thức/curated"} /></dl></div><div className="card p-4"><h2 className="text-xl font-black">Video test hiệu năng</h2><div className="mt-3 grid gap-2">{table.filter((row) => row.videoTestUrl).slice(0, 6).map((row) => <a className="rounded-md border px-3 py-2 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-gray-800" key={row.gpuSlug + row.resolution} href={row.videoTestUrl ?? "#"} target="_blank" rel="nofollow">Test {row.gpuSlug} {row.resolution}</a>)}</div></div></aside></div><section className="mt-8"><h2 className="text-2xl font-black">Thiết bị đề xuất theo tầm giá</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{compatibleDevices.map((device) => <DeviceCard key={device.slug} device={device} />)}</div></section></div></section>;
}

function buildGallery(coverImage: string | null, steamId: string | null) {
  const images = new Set<string>();
  if (coverImage) images.add(coverImage);
  if (steamId) {
    images.add(`https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/capsule_616x353.jpg`);
    images.add(`https://cdn.akamai.steamstatic.com/steam/apps/${steamId}/library_600x900.jpg`);
  }
  return Array.from(images).slice(0, 3);
}

function Stat({ label, value }: { label: string; value: string }) {
  return <div className="rounded-md bg-white/10 p-3"><p className="text-xs text-slate-300">{label}</p><p className="mt-1 font-black">{value}</p></div>;
}

function SpecCard({ title, specs }: { title: string; specs: { cpuName: string; gpuName: string; cpuBenchmark: number; gpuBenchmark: number; ramGb: number; storageGb: number } }) {
  return <article className="card p-4"><h3 className="text-lg font-black">{title}</h3><dl className="mt-4 grid gap-3 text-sm"><Info label="CPU" value={specs.cpuName} /><Info label="GPU" value={specs.gpuName} /><Info label="RAM" value={`${specs.ramGb}GB`} /><Info label="Ổ cứng" value={`${specs.storageGb}GB`} /><Info label="Điểm CPU" value={String(specs.cpuBenchmark)} /><Info label="Điểm GPU" value={String(specs.gpuBenchmark)} /></dl></article>;
}

function Info({ label, value }: { label: string; value: string }) {
  return <div><dt className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</dt><dd className="mt-1 font-semibold">{value}</dd></div>;
}
