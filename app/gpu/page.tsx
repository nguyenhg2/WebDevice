import GpuCard from "@/components/GpuCard";
import { games, gpus } from "@/lib/data";

export default function GpuList() {
  return <section className="container py-8"><h1 className="text-3xl font-black">Danh sách GPU phổ biến</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{gpus.map((gpu) => <GpuCard key={gpu.slug} gpu={gpu} count={games.length} />)}</div></section>;
}
