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
export default function Onboard(){ return <section className="container py-8"><h1 className="text-3xl font-black">Laptop không card rời chơi game gì?</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{games.filter(g=>g.minSpecs.gpuBenchmark<3000).map(g=><GameCard key={g.slug} game={g}/>)}</div></section> }
