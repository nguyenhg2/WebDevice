import Image from "next/image";
import Link from "next/link";
import CompatibilityBadge from "@/components/CompatibilityBadge";
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
    <article className="card group overflow-hidden">
      <Link href={"/game/" + game.slug} className="block">
        <div className="relative aspect-[16/9] bg-slate-100 dark:bg-gray-800">
          <Image
            src={game.coverImage ?? "/images/placeholder.svg"}
            alt={"Ảnh bìa " + game.name}
            fill
            sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
            className="object-cover transition duration-300 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-slate-950/70 to-transparent" />
          <span className="absolute bottom-2 left-3 rounded-md bg-white/92 px-2 py-1 text-xs font-black text-slate-950 backdrop-blur dark:bg-gray-950/86 dark:text-white">
            {formatGamePrice(game.price, game.isFree)}
          </span>
        </div>
      </Link>

      <div className="p-4">
        <Link href={"/game/" + game.slug} className="line-clamp-2 text-base font-black hover:text-teal-700 dark:hover:text-teal-300">
          {game.name}
        </Link>
        <p className="mt-2 line-clamp-1 text-sm text-slate-600 dark:text-gray-300">{game.genres.slice(0, 2).join(", ")}</p>

        {status && fps ? (
          <div className="mt-4 grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-800/70">
            <div className="flex items-center justify-between gap-3">
              <CompatibilityBadge status={status} />
              <span className="text-right text-lg font-black tabular-nums">{fps} FPS</span>
            </div>
            <FpsBar fps={fps} />
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400">{setting ? `Gợi ý: ${setting}` : "FPS 1080p tham khảo"}</p>
          </div>
        ) : null}
      </div>
    </article>
  );
}
