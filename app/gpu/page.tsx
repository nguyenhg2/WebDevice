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
export default function GpuList(){ return <section className="container py-8"><h1 className="text-3xl font-black">Danh sách GPU phổ biến</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gpus.map(g=><GpuCard key={g.slug} gpu={g} count={games.length}/>)}</div></section> }
