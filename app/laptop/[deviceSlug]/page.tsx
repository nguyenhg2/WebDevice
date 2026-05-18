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
export function generateStaticParams(){return devices.map(device=>({deviceSlug:device.slug}))} export default async function DeviceDetail({params}:{params:Promise<{deviceSlug:string}>}){ const {deviceSlug}=await params; const device=findDevice(deviceSlug); if(!device) return <section className="container py-8"><h1>Không tìm thấy thiết bị</h1></section>; const gpu=gpus.find(g=>g.name===device.gpu); const rows=games.map(game=>({game,...classifyGame(gpu?.benchmarkScore??1000,15000,device.ramGb,"1080p",game.minSpecs,game.recSpecs)})); return <section className="container py-8"><h1 className="text-3xl font-black">{device.name}</h1><p className="mt-3">{device.cpu} · {device.gpu} · {device.ramGb}GB RAM · {formatVnd(device.priceVnd)}</p><div className="mt-4"><DeviceCard device={device}/></div><h2 className="mt-8 text-2xl font-black">Game chơi được trên thiết bị này</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.filter(r=>r.status!=="not_recommended").slice(0,18).map(r=><GameCard key={r.game.slug} game={r.game} status={r.status} fps={r.estimatedFps} setting={r.recommendedSetting}/>)}</div></section> }
