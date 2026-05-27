import { ArrowRight, Gauge } from "lucide-react";
import Link from "next/link";
import CompatibilityBadge from "@/components/CompatibilityBadge";
import FastImage from "@/components/FastImage";
import FpsBar from "@/components/FpsBar";
import { formatGamePrice } from "@/lib/utils";
import type { Game, Status } from "@/types";

export default function GameCard({
  game,
  status,
  fps,
  setting,
}: {
  game: Game;
  status?: Status;
  fps?: number;
  setting?: string;
  fpsSource?: string;
}) {
  return (
    <article className="card group grid h-full overflow-hidden">
      <Link href={"/game/" + game.slug} className="block">
        <div className="image-frame relative aspect-[16/9] overflow-hidden">
          <FastImage
            src={game.coverImage}
            alt={"Ảnh bìa " + game.name}
            fill
            sizes="(min-width:1280px) 280px, (min-width:1024px) 25vw, (min-width:640px) 45vw, 92vw"
            quality={64}
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/78 to-transparent" />
          <span className="absolute left-3 top-3 rounded-md bg-white/94 px-2.5 py-1 text-[11px] font-black text-slate-950 shadow-sm backdrop-blur dark:bg-gray-950/88 dark:text-white">
            {formatGamePrice(game.price, game.isFree)}
          </span>
          {status ? (
            <span className="absolute bottom-3 left-3">
              <CompatibilityBadge status={status} />
            </span>
          ) : null}
        </div>
      </Link>

      <div className="grid min-h-[148px] content-start p-4">
        <Link href={"/game/" + game.slug} className="line-clamp-2 text-base font-black leading-snug hover:text-teal-700 dark:hover:text-teal-300">
          {game.name}
        </Link>
        <p className="mt-2 line-clamp-1 text-sm font-semibold text-slate-500 dark:text-gray-400">{game.genres.slice(0, 2).join(", ")}</p>

        {status && fps ? (
          <div className="mt-4 grid gap-2 border-t border-slate-100 pt-3 dark:border-gray-800">
            <div className="flex items-center justify-between gap-3">
              <span className="inline-flex items-center gap-1.5 text-xs font-black uppercase text-slate-500 dark:text-gray-400">
                <Gauge aria-hidden size={14} />
                {setting ?? "1080p"}
              </span>
              <span className="text-xl font-black tabular-nums text-slate-950 dark:text-white">{fps} FPS</span>
            </div>
            <FpsBar fps={fps} />
          </div>
        ) : (
          <Link href={"/game/" + game.slug} className="mt-4 inline-flex w-fit items-center gap-1.5 text-sm font-black text-teal-700 hover:text-teal-600 dark:text-teal-300">
            Xem cấu hình
            <ArrowRight aria-hidden size={15} strokeWidth={2.5} />
          </Link>
        )}
      </div>
    </article>
  );
}
