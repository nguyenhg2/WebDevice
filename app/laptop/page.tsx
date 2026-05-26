import DeviceCard from "@/components/DeviceCard";
import { devices } from "@/lib/data";
import { priceRangeLabel } from "@/lib/utils";

type LaptopParams = {
  priceRange?: string;
};

export default async function LaptopList({ searchParams }: { searchParams: Promise<LaptopParams> }) {
  const params = await searchParams;
  const priceRange = params.priceRange;
  const visibleDevices = priceRange ? devices.filter((device) => device.priceRange === priceRange) : devices;

  return (
    <main className="container page-section">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="eyebrow">Laptop gaming</p>
          <h1 className="mt-2 text-4xl font-black">Chọn máy theo ngân sách</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-gray-300">Danh sách thiết bị đang giữ trong catalog, ưu tiên mẫu có GPU khớp dữ liệu FPS.</p>
        </div>
        <div className="surface p-4">
          <p className="text-sm text-slate-500 dark:text-gray-400">Đang hiển thị</p>
          <p className="mt-1 text-3xl font-black">{visibleDevices.length}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-gray-300">thiết bị</p>
        </div>
      </header>

      <div className="mt-6 flex flex-wrap gap-2">
        <a className={"chip " + (!priceRange ? "border-teal-300 text-teal-700 dark:text-teal-300" : "")} href="/laptop">
          Tất cả
        </a>
        {Object.entries(priceRangeLabel).map(([key, label]) => (
          <a className={"chip " + (priceRange === key ? "border-teal-300 text-teal-700 dark:text-teal-300" : "")} key={key} href={"/laptop?priceRange=" + key}>
            {label}
          </a>
        ))}
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleDevices.map((device) => (
          <DeviceCard key={device.slug} device={device} />
        ))}
      </div>
    </main>
  );
}
