import GameCard from "@/components/GameCard";
import { games } from "@/lib/data";

export default function Onboard() {
  const integratedGpuGames = games.filter((game) => game.minSpecs.gpuBenchmark < 3000);

  return (
    <section className="container py-8">
      <h1 className="text-3xl font-black">Laptop không card rời chơi game gì?</h1>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {integratedGpuGames.map((game) => (
          <GameCard key={game.slug} game={game} />
        ))}
      </div>
    </section>
  );
}
