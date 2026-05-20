import GameCard from "@/components/GameCard";
import DeviceCard from "@/components/DeviceCard";
import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import { benchmarks, devices, findGpu, games, gpus } from "@/lib/data";
import { classifyGame } from "@/lib/compatibility-engine";

export const revalidate = 86400;
export function generateStaticParams() { return gpus.map((gpu) => ({ gpuSlug: gpu.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ gpuSlug: string }> }) {
  const { gpuSlug } = await params;
  const gpu = findGpu(gpuSlug);
  return { title: gpu ? `${gpu.name} chơi được game gì? Danh sách game và FPS ước tính` : "Không tìm thấy GPU" };
}
export default async function GpuDetail({ params }: { params: Promise<{ gpuSlug: string }> }) {
  const { gpuSlug } = await params;
  const gpu = findGpu(gpuSlug);
  if (!gpu) return <section className="container py-8"><h1>Không tìm thấy GPU</h1></section>;
  const rows = games.map((game) => ({ game, ...classifyGame(gpu.benchmarkScore, 15000, 8, "1080p", game.minSpecs, game.recSpecs) }));
  return <section className="container py-8"><Breadcrumb items={[{ href: "/", label: "Trang chủ" }, { href: "/gpu", label: "GPU" }, { href: "#", label: gpu.name }]} /><h1 className="text-3xl font-black">{gpu.name} chơi được game gì?</h1><p className="mt-3">Benchmark: {gpu.benchmarkScore} · VRAM: {gpu.vram ?? 0}GB · TDP: {gpu.tdp ?? 0}W · Nhóm {gpu.category}</p><div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.slice(0, 18).map((row) => <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />)}</div><h2 className="mt-8 text-2xl font-black">Bảng benchmark FPS</h2><BenchmarkTable rows={benchmarks.filter((row) => row.gpuSlug === gpu.slug).slice(0, 80)} highlightGpu={gpu.slug} /><h2 className="mt-8 text-2xl font-black">Laptop/PC có GPU này</h2><div className="mt-4 grid gap-4 md:grid-cols-3">{devices.filter((device) => device.gpu === gpu.name).slice(0, 6).map((device) => <DeviceCard key={device.slug} device={device} />)}</div></section>;
}
