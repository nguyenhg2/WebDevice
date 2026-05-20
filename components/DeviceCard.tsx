import Image from "next/image";
import type { Device } from "@/types";
import { getLaptopAffiliateLinks } from "@/lib/affiliate";
import { formatVnd } from "@/lib/utils";

export default function DeviceCard({ device }: { device: Device }) {
  const links = getLaptopAffiliateLinks(device.name);
  return <article className="card p-4"><div className="relative aspect-[16/9] overflow-hidden rounded bg-slate-100 dark:bg-gray-800"><Image src={device.imageUrl ?? "/images/placeholder.svg"} alt={"Ảnh " + device.name} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover" /></div><h3 className="mt-3 font-bold">{device.name}</h3><p className="mt-1 text-sm text-slate-600 dark:text-gray-300">{device.cpu} · {device.gpu} · {device.ramGb}GB RAM</p><p className="mt-2 font-black text-blue-700 dark:text-blue-400">{formatVnd(device.priceVnd)}</p><a className="btn mt-3 w-full" href={links.shopee} target="_blank" rel="nofollow sponsored">Mua trên Shopee</a><p className="mt-2 text-xs text-slate-500">* Link affiliate - bạn không tốn thêm chi phí</p></article>;
}
