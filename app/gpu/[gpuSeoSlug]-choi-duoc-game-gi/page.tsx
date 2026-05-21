import GpuPage from "@/app/gpu/[gpuSlug]/page";
import { gpus } from "@/lib/data";

export const dynamic = "force-dynamic";
export async function generateMetadata({ params }: { params: Promise<{ gpuSeoSlug: string }> }) {
  const { gpuSeoSlug } = await params;
  const gpu = gpus.find((item) => item.slug === gpuSeoSlug);
  return {
    title: gpu ? `${gpu.name} chơi được game gì? Top game chạy tốt 2026` : "GPU chơi được game gì?",
    description: gpu ? `Danh sách game chơi được trên ${gpu.name}, FPS ước tính, setting đề xuất và gợi ý nâng cấp.` : "Tra cứu GPU chơi được game gì theo dữ liệu cấu hình phổ biến tại Việt Nam.",
  };
}
export default async function GpuSeoPage({ params }: { params: Promise<{ gpuSeoSlug: string }> }) {
  const { gpuSeoSlug } = await params;
  return <GpuPage params={Promise.resolve({ gpuSlug: gpuSeoSlug })} />;
}
