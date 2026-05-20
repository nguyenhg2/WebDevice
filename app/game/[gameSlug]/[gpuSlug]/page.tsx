import GameCard from "@/components/GameCard";
import BenchmarkTable from "@/components/BenchmarkTable";
import { benchmarks, findGame, findGpu, games, gpus } from "@/lib/data";
import { classifyGame } from "@/lib/compatibility-engine";

export const revalidate = 86400;
export function generateStaticParams() { return games.flatMap((game) => gpus.map((gpu) => ({ gameSlug: game.slug, gpuSlug: gpu.slug }))); }
export default async function GameGpu({ params }: { params: Promise<{ gameSlug: string; gpuSlug: string }> }) {
  const { gameSlug, gpuSlug } = await params;
  const game = findGame(gameSlug);
  const gpu = findGpu(gpuSlug);
  if (!game || !gpu) return <section className="container py-8"><h1>Không tìm thấy dữ liệu</h1></section>;
  const result = classifyGame(gpu.benchmarkScore, 15000, 8, "1080p", game.minSpecs, game.recSpecs);
  return <section className="container py-8"><h1 className="text-3xl font-black">{game.name} trên {gpu.name}: FPS và thiết lập đề xuất</h1><div className="mt-5"><GameCard game={game} status={result.status} fps={result.estimatedFps} setting={result.recommendedSetting} /></div><h2 className="mt-8 text-2xl font-black">Bảng đo FPS</h2><BenchmarkTable rows={benchmarks.filter((row) => row.gameSlug === game.slug && row.gpuSlug === gpu.slug)} highlightGpu={gpu.slug} /></section>;
}
