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
  const benchmarked = filteredGames.filter((game) => fpsCounts.has(game.slug)).sort((a, b) => (fpsCounts.get(b.slug) ?? 0) - (fpsCounts.get(a.slug) ?? 0));
  const remaining = filteredGames.filter((game) => !fpsCounts.has(game.slug));

  return (
    <section className="container py-8">
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <header>
          <p className="text-sm font-bold uppercase text-blue-700 dark:text-blue-300">Game catalog</p>
          <h1 className="mt-2 text-3xl font-black">Chọn game để xem cấu hình, ảnh và FPS</h1>
          <p className="mt-3 max-w-3xl text-slate-600 dark:text-gray-300">
            Game có benchmark thực tế được ưu tiên lên đầu. Mỗi trang game có gallery, cấu hình tối thiểu/đề xuất, bảng FPS theo GPU và thiết bị phù hợp.
          </p>
          <form className="mt-5 max-w-xl">
            <input name="search" className="input" defaultValue={search} placeholder="Tìm game theo tên hoặc thể loại..." />
          </form>
        </header>
        <aside className="card p-4">
          <h2 className="text-xl font-black">Tổng quan</h2>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <Metric label={search ? "Kết quả" : "Game"} value={filteredGames.length.toLocaleString("vi-VN")} />
            <Metric label="Có FPS" value={benchmarked.length.toLocaleString("vi-VN")} />
          </dl>
          <Link href="/benchmark" className="btn mt-4 w-full">Mở bảng benchmark</Link>
        </aside>
      </div>

      <h2 className="mt-10 text-2xl font-black">Có benchmark FPS</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {benchmarked.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
      {search && filteredGames.length === 0 ? (
        <div className="card mt-6 p-6 text-center">
          <h2 className="text-xl font-black">Không tìm thấy game phù hợp</h2>
          <p className="mt-2 text-sm text-slate-600 dark:text-gray-300">Thử tên ngắn hơn hoặc tìm theo thể loại.</p>
          <Link href="/chon-game" className="btn mt-4">
            Xem tất cả game
          </Link>
        </div>
      ) : null}

      {remaining.length ? (
        <>
          <h2 className="mt-10 text-2xl font-black">Đang dùng ước tính cấu hình</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {remaining.map((game) => (
              <GameCard key={game.slug} game={game} />
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3 dark:border-gray-700">
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="mt-1 font-black">{value}</dd>
    </div>
  );
}
