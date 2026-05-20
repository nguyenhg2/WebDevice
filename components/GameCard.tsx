import Image from "next/image";
import Link from "next/link";
import type { Game, Status } from "@/types";
import { formatVnd } from "@/lib/utils";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import FpsBar from "@/components/FpsBar";

export default function GameCard({ game, status, fps, setting }: { game: Game; status?: Status; fps?: number; setting?: string }) {
  return <article className="card overflow-hidden"><div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-800"><Image src={game.coverImage ?? "/images/placeholder.svg"} alt={"Ảnh bìa " + game.name} fill sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw" className="object-cover" /></div><div className="p-4"><Link href={"/chon-game/" + game.slug} className="font-bold hover:text-blue-600">{game.name}</Link><p className="mt-2 text-sm text-slate-600 dark:text-gray-300">{game.genres.join(", ")} · {game.sizeGb}GB · {game.isFree ? "Miễn phí" : formatVnd(game.price)}</p>{status && <div className="mt-3 flex items-center justify-between gap-3"><CompatibilityBadge status={status} /><span className="text-sm font-bold">{fps} FPS · {setting ?? ""}</span></div>}{fps && <div className="mt-3"><FpsBar fps={fps} /></div>}</div></article>;
}
