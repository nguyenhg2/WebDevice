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
export function generateStaticParams(){return ["4","8","16","32"].map(ramSize=>({ramSize}))} export default async function RamPage({params}:{params:Promise<{ramSize:string}>}){ const {ramSize}=await params; const ram=Number(ramSize.replace("gb","")); const rows=games.map(game=>({game,...classifyGame(8000,12000,ram,"1080p",game.minSpecs,game.recSpecs)})); return <section className="container py-8"><h1 className="text-3xl font-black">{ram}GB RAM chơi được game gì?</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.filter(r=>r.status!=="not_recommended").slice(0,30).map(r=><GameCard key={r.game.slug} game={r.game} status={r.status} fps={r.estimatedFps} setting={r.recommendedSetting}/>)}</div><div className="mt-6"><UpgradeAdviceCard advice={"Nâng RAM lên mức cao hơn để giảm giật khung hình trong game thế giới mở."}/></div></section> }
