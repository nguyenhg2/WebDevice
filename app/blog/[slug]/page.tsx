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
export function generateStaticParams(){return blogPosts.map(post=>({slug:post.slug}))} export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params; const post=findPost(slug); return {title:post?.metaTitle,description:post?.metaDescription};} export default async function Post({params}:{params:Promise<{slug:string}>}){ const {slug}=await params; const post=findPost(slug); if(!post) return <section className="container py-8"><h1>Không tìm thấy bài viết</h1></section>; return <section className="container grid gap-8 py-8 lg:grid-cols-[1fr_300px]"><article><h1 className="text-3xl font-black">{post.title}</h1><div className="prose mt-5 dark:prose-invert" dangerouslySetInnerHTML={{__html:post.content}} /></article><aside className="card p-4"><h2 className="font-bold">Bài viết liên quan</h2>{blogPosts.slice(0,6).map(p=><a className="mt-3 block text-sm" key={p.slug} href={"/blog/"+p.slug}>{p.title}</a>)}<a className="btn mt-4" href="/tra-cuu">Tra cứu nhanh</a></aside><script type="application/ld+json" dangerouslySetInnerHTML={{__html:JSON.stringify({"@context":"https://schema.org","@type":"Article",headline:post.title,datePublished:post.publishedAt})}} /></section> }
