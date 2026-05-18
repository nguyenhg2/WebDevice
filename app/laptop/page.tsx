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
export default function LaptopList(){ return <section className="container py-8"><h1 className="text-3xl font-black">Laptop gaming và PC theo tầm giá</h1><div className="mt-4 flex flex-wrap gap-2">{Object.entries(priceRangeLabel).map(([k,v])=><a className="rounded-md border px-3 py-2" key={k} href={"/laptop?priceRange="+k}>{v}</a>)}</div><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{devices.map(d=><DeviceCard key={d.slug} device={d}/>)}</div></section> }
