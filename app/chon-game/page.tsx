import Link from "next/link";
import GameCard from "@/components/GameCard";
import { benchmarks, games } from "@/lib/data";
import { includesText } from "@/lib/utils";

type PickGameParams = {
  search?: string;
};

export default async function PickGame({ searchParams }: { searchParams: Promise<PickGameParams> }) {
  const params = await searchParams;
  const search = (params.search ?? "").trim();
  const filteredGames = search ? games.filter((game) => includesText(game.name, search) || game.genres.some((genre) => includesText(genre, search))) : games;
  const fpsCounts = new Map<string, number>();
  for (const row of benchmarks) fpsCounts.set(row.gameSlug, (fpsCounts.get(row.gameSlug) ?? 0) + 1);
  const listedGames = filteredGames.sort((a, b) => (fpsCounts.get(b.slug) ?? 0) - (fpsCounts.get(a.slug) ?? 0) || a.name.localeCompare(b.name, "vi"));

  return (
    <main className="container page-section">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div>
          <p className="eyebrow">Game catalog</p>
          <h1 className="mt-2 text-4xl font-black">Chọn game bạn muốn chơi</h1>
          <p className="mt-3 max-w-2xl text-slate-600 dark:text-gray-300">Mở trang game để xem cấu hình yêu cầu, FPS theo GPU và laptop/PC phù hợp.</p>
          <form className="mt-5 max-w-xl">
            <input name="search" className="input" defaultValue={search} placeholder="Tìm game theo tên hoặc thể loại..." />
          </form>
        </div>
        <aside className="surface p-4">
          <h2 className="text-xl font-black">Tổng quan</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label={search ? "Kết quả" : "Game"} value={filteredGames.length.toLocaleString("vi-VN")} />
            <Metric label="Có FPS" value={listedGames.filter((game) => fpsCounts.has(game.slug)).length.toLocaleString("vi-VN")} />
          </dl>
          <Link href="/tra-cuu" className="btn mt-4 w-full">
            Kiểm tra máy
          </Link>
        </aside>
      </header>

      {search && filteredGames.length === 0 ? (
        <div className="surface mt-8 p-6 text-center">
          <h2 className="text-xl font-black">Không tìm thấy game phù hợp</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">Thử tên ngắn hơn hoặc tìm theo thể loại.</p>
          <Link href="/chon-game" className="btn mt-4">
            Xem tất cả game
          </Link>
        </div>
      ) : (
        <>
          <h2 className="mt-10 text-2xl font-black">{search ? "Kết quả tìm kiếm" : "Tất cả game"}</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {listedGames.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </>
      )}
    </main>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <dt className="text-xs text-slate-500 dark:text-gray-400">{label}</dt>
      <dd className="mt-1 font-black">{value}</dd>
    </div>
  );
}
