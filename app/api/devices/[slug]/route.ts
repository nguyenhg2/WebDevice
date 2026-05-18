import { classifyGame } from "@/lib/compatibility-engine";
import { enforceRateLimit, fail, ok } from "@/lib/api";
import { findDevice, games, gpus } from "@/lib/data";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const limited = await enforceRateLimit(req, "device-detail");
  if (limited) return limited;

  const { slug } = await params;
  const device = findDevice(slug);
  if (!device) return fail("Không tìm thấy thiết bị", 404);

  const gpu = gpus.find((item) => item.name === device.gpu);
  return ok({
    device,
    games: games.map((game) => ({
      game,
      ...classifyGame(gpu?.benchmarkScore ?? 1000, 15000, device.ramGb, "1080p", game.minSpecs, game.recSpecs),
    })),
  });
}
