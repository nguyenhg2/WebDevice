import GameCard from "@/components/GameCard";
import { games } from "@/lib/data";

export default function PickGame() {
  return <section className="container py-8"><h1 className="text-3xl font-black">Chọn game để xem cấu hình đề xuất</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{games.map((game) => <GameCard key={game.slug} game={game} />)}</div></section>;
}
