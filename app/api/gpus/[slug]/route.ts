import { classifyGame } from "@/lib/compatibility-engine";
import { enforceRateLimit, fail, ok } from "@/lib/api";
import { findGpu, games } from "@/lib/data";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const limited = await enforceRateLimit(req, "gpu-detail");
  if (limited) return limited;

  const { slug } = await params;
  const gpu = findGpu(slug);
  if (!gpu) return fail("Không tìm thấy GPU", 404);

  return ok({
    gpu,
    games: games.map((game) => ({
      game,
      ...classifyGame(gpu.benchmarkScore, 15000, 8, "1080p", game.minSpecs, game.recSpecs),
    })),
  });
}
