import GameCard from "@/components/GameCard";
import { games } from "@/lib/data";

export default function FreeLowEndGames() {
  return <section className="container py-8"><h1 className="text-3xl font-black">Game miễn phí cho máy yếu</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{games.filter((game) => game.isFree).slice(0, 32).map((game) => <GameCard key={game.slug} game={game} />)}</div></section>;
}
