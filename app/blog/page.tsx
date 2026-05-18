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
export default function Blog(){ return <section className="container py-8"><h1 className="text-3xl font-black">Blog cấu hình game</h1><div className="mt-5 grid gap-4 md:grid-cols-3">{blogPosts.map(p=><article className="card p-4" key={p.slug}><a className="font-bold" href={"/blog/"+p.slug}>{p.title}</a><p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{p.excerpt}</p></article>)}</div></section> }
