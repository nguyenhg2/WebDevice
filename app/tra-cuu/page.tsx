import GameCard from "@/components/GameCard";
import UpgradeAdviceCard from "@/components/UpgradeAdviceCard";
import { classifyGame } from "@/lib/compatibility-engine";
import { cpus, games, gpus } from "@/lib/data";

export default function LookupPage({ searchParams }: { searchParams: Promise<{ gpu?: string; cpu?: string; ram?: string; res?: string }> }) {
  return <LookupContent searchParams={searchParams} />;
}

async function LookupContent({ searchParams }: { searchParams: Promise<{ gpu?: string; cpu?: string; ram?: string; res?: string }> }) {
  const params = await searchParams;
  const gpu = gpus.find((item) => item.slug === params.gpu) ?? gpus[0];
  const cpu = cpus.find((item) => item.slug === params.cpu) ?? cpus[0];
  const ram = Number(params.ram ?? 8);
  const res = (params.res ?? "1080p") as "720p" | "1080p" | "1440p" | "4k";
  const rows = games.map((game) => ({ game, ...classifyGame(gpu.benchmarkScore, cpu.benchmarkScore, ram, res, game.minSpecs, game.recSpecs) }));

  return <section className="container py-8"><h1 className="text-3xl font-black">Tra cứu cấu hình chơi game</h1><form className="card mt-5 grid gap-3 p-4 md:grid-cols-5"><select name="gpu" className="input" defaultValue={gpu.slug}>{gpus.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select name="cpu" className="input" defaultValue={cpu.slug}>{cpus.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select><select name="ram" className="input" defaultValue={ram}><option value="4">4GB</option><option value="8">8GB</option><option value="16">16GB</option><option value="32">32GB</option></select><select name="res" className="input" defaultValue={res}><option value="720p">720p</option><option value="1080p">1080p</option><option value="1440p">1440p</option><option value="4k">4K</option></select><button className="btn">Kiểm tra cấu hình</button></form>{(["smooth", "playable", "not_recommended"] as const).map((status) => <div key={status}><h2 className="mt-8 text-2xl font-black">{status === "smooth" ? "Chơi mượt" : status === "playable" ? "Chơi được" : "Không khuyến nghị"} ({rows.filter((row) => row.status === status).length} game)</h2><div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rows.filter((row) => row.status === status).slice(0, 9).map((row) => <GameCard key={row.game.slug} game={row.game} status={row.status} fps={row.estimatedFps} setting={row.recommendedSetting} />)}</div></div>)}<div className="mt-8 grid gap-4 md:grid-cols-3">{rows[0].upgradeAdvice.map((advice) => <UpgradeAdviceCard key={advice} advice={advice} />)}</div></section>;
}
