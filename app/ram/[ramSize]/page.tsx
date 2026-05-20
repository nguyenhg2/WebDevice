import GameCard from "@/components/GameCard";
import UpgradeAdviceCard from "@/components/UpgradeAdviceCard";
import { games } from "@/lib/data";
import { classifyGame } from "@/lib/compatibility-engine";

export function generateStaticParams() { return ["4", "8", "16", "32"].map((ramSize) => ({ ramSize })); }
export default async function RamPage({ params }: { params: Promise<{ ramSize: string }> }) {
  const { ramSize } = await params;
  const ram = Number(ramSize.replace("gb", ""));
  const rows = games.map((game) => ({ game, ...classifyGame(8000, 12000, ram, "1080p", game.minSpecs, game.recSpecs) }));
  return <section className="container py-8"><h1 className="text-3xl font-black">{ram}GB RAM chơi được game gì?</h1><div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.filter((row) => row.status !== "not_recommended").slice(0, 30).map((row) => <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />)}</div><div className="mt-6"><UpgradeAdviceCard advice="Nâng RAM lên mức cao hơn để giảm giật khung hình trong game thế giới mở." /></div></section>;
}
