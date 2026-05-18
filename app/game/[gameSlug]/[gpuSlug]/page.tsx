import GameCard from "@/components/GameCard";
import GpuCard from "@/components/GpuCard";
import DeviceCard from "@/components/DeviceCard";
import BenchmarkTable from "@/components/BenchmarkTable";
import Breadcrumb from "@/components/Breadcrumb";
import UpgradeAdviceCard from "@/components/UpgradeAdviceCard";
import { games,gpus,cpus,devices,blogPosts,findGame,findGpu,findDevice,findPost,benchmarks } from "@/lib/data";
import { classifyGame } from "@/lib/compatibility-engine";
import { getBenchmarkTable, getCompatibleDevices, getRecommendedConfigs } from "@/lib/reverse-lookup";
import { formatVnd, priceRangeLabel } from "@/lib/utils";
export const revalidate=86400; export function generateStaticParams(){return games.flatMap(game=>gpus.map(gpu=>({gameSlug:game.slug,gpuSlug:gpu.slug})))} export default async function GameGpu({params}:{params:Promise<{gameSlug:string;gpuSlug:string}>}){ const {gameSlug,gpuSlug}=await params; const game=findGame(gameSlug); const gpu=findGpu(gpuSlug); if(!game||!gpu) return <section className="container py-8"><h1>Không tìm thấy dữ liệu</h1></section>; const r=classifyGame(gpu.benchmarkScore,15000,8,"1080p",game.minSpecs,game.recSpecs); return <section className="container py-8"><h1 className="text-3xl font-black">{game.name} trên {gpu.name}: FPS và setting đề xuất</h1><div className="mt-5"><GameCard game={game} status={r.status} fps={r.estimatedFps} setting={r.recommendedSetting}/></div><h2 className="mt-8 text-2xl font-black">Bảng benchmark</h2><BenchmarkTable rows={benchmarks.filter(b=>b.gameSlug===game.slug&&b.gpuSlug===gpu.slug)} highlightGpu={gpu.slug}/></section> }
