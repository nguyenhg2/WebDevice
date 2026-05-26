import GpuPage from "@/app/gpu/[gpuSlug]/page";
import { gpus } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ gpuSeoSlug: string }> }) {
  const { gpuSeoSlug } = await params;
  const gpu = gpus.find((item) => item.slug === gpuSeoSlug);
  return {
    title: gpu ? `${gpu.name} chơi được game gì?` : "GPU chơi được game gì?",
    description: gpu ? `Danh sách game chơi được trên ${gpu.name}, FPS tham khảo và setting đề xuất.` : "Tra cứu GPU chơi được game gì.",
  };
}

export default async function GpuSeoPage({ params }: { params: Promise<{ gpuSeoSlug: string }> }) {
  const { gpuSeoSlug } = await params;
  return <GpuPage params={Promise.resolve({ gpuSlug: gpuSeoSlug })} />;
}
