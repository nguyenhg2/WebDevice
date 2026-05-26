import Image from "next/image";
import { getLaptopAffiliateLinks } from "@/lib/affiliate";
import { formatVnd } from "@/lib/utils";
import type { Device } from "@/types";

export default function DeviceCard({ device }: { device: Device }) {
  const links = getLaptopAffiliateLinks(device.name);

  return (
    <article className="card overflow-hidden">
      <div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-800">
        <Image
          src={device.imageUrl ?? "/images/placeholder.svg"}
          alt={"Ảnh " + device.name}
          fill
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-black">{device.name}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-slate-600 dark:text-gray-300">
          {device.gpu} · {device.ramGb}GB RAM · {device.storageGb}GB {device.storageType}
        </p>
        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="font-black text-teal-700 dark:text-teal-300">{formatVnd(device.priceVnd)}</p>
          <a className="btn min-h-9 px-3 py-2 text-sm" href={links.shopee} target="_blank" rel="nofollow sponsored noreferrer">
            Xem giá
          </a>
        </div>
      </div>
    </article>
  );
}
