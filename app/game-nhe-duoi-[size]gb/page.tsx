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
export const dynamic = "force-dynamic";
export default async function LightGames({params}:{params:Promise<{size:string}>}){ const {size: sizeParam}=await params; const size=Number(sizeParam); return <section className="container py-8"><h1 className="text-3xl font-black">Game nhẹ dưới {size}GB</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{games.filter(g=>g.sizeGb<=size).map(g=><GameCard key={g.slug} game={g}/>)}</div></section> }
