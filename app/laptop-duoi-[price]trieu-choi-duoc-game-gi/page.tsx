import DeviceCard from "@/components/DeviceCard";
import { devices } from "@/lib/data";

export const dynamic = "force-dynamic";
export default async function LaptopBudget({ params }: { params: Promise<{ price: string }> }) {
  const { price } = await params;
  const max = Number(price) * 1000000;
  return <section className="container py-8"><h1 className="text-3xl font-black">Laptop dưới {price} triệu chơi được game gì?</h1><div className="mt-5 grid gap-4 md:grid-cols-3">{devices.filter((device) => device.priceVnd <= max).map((device) => <DeviceCard key={device.slug} device={device} />)}</div></section>;
}
