import Link from "next/link";
import type { Gpu } from "@/types";
export default function GpuCard({gpu,count}:{gpu:Gpu;count?:number}){ return <article className="card p-4"><Link href={"/gpu/"+gpu.slug} className="font-bold hover:text-blue-600">{gpu.name}</Link><p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{gpu.brand} · {gpu.vram ?? 0}GB VRAM · {gpu.category}</p><p className="mt-3 text-sm font-semibold">{count ?? 0} game chơi được</p></article> }
