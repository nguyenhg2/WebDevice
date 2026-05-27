import { ExternalLink, HardDrive, MemoryStick } from "lucide-react";
import FastImage from "@/components/FastImage";
import { getLaptopAffiliateLinks } from "@/lib/affiliate";
import { formatVnd } from "@/lib/utils";
import type { Device } from "@/types";
import type { ReactNode } from "react";

export default function DeviceCard({ device }: { device: Device }) {
  const links = getLaptopAffiliateLinks(device.name);

  return (
    <article className="card group h-full overflow-hidden">
      <div className="image-frame relative aspect-[16/9] overflow-hidden">
        <FastImage
          src={device.imageUrl}
          alt={"Ảnh " + device.name}
          fill
          sizes="(min-width:1024px) 380px, (min-width:640px) 45vw, 92vw"
          quality={66}
          className="object-cover transition duration-300 group-hover:scale-[1.025]"
        />
        <span className="absolute left-3 top-3 rounded-md bg-white/94 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-sm backdrop-blur dark:bg-gray-950/88 dark:text-white">
          {device.brand}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 font-black leading-snug">{device.name}</h3>
        <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500 dark:text-gray-400">{device.gpu}</p>
        <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
          <Spec icon={<MemoryStick aria-hidden size={15} />} value={`${device.ramGb}GB RAM`} />
          <Spec icon={<HardDrive aria-hidden size={15} />} value={`${device.storageGb}GB ${device.storageType}`} />
        </div>
        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4 dark:border-gray-800">
          <p className="font-black text-teal-700 dark:text-teal-300">{formatVnd(device.priceVnd)}</p>
          <a className="btn min-h-10 px-3 py-2 text-sm" href={links.shopee} target="_blank" rel="nofollow sponsored noreferrer">
            Xem giá
            <ExternalLink aria-hidden size={15} strokeWidth={2.5} />
          </a>
        </div>
      </div>
    </article>
  );
}

function Spec({ icon, value }: { icon: ReactNode; value: string }) {
  return (
    <div className="metric flex items-center gap-2 p-2.5 font-bold">
      <span className="text-slate-500 dark:text-gray-400">{icon}</span>
      <span className="min-w-0 truncate">{value}</span>
    </div>
  );
}
