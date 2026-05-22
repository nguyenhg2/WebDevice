import DeviceCard from "@/components/DeviceCard";
import { devices } from "@/lib/data";
import { priceRangeLabel } from "@/lib/utils";

export default function LaptopList() {
  return (
    <section className="container py-8">
      <h1 className="text-3xl font-black">Laptop gaming và PC theo tầm giá</h1>
      <div className="mt-4 flex flex-wrap gap-2">
        {Object.entries(priceRangeLabel).map(([key, label]) => (
          <a className="rounded-md border px-3 py-2" key={key} href={"/laptop?priceRange=" + key}>
            {label}
          </a>
        ))}
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {devices.map((device) => (
          <DeviceCard key={device.slug} device={device} />
        ))}
      </div>
    </section>
  );
}
