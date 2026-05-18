import { enforceRateLimit, fail, ok } from "@/lib/api";
import { findGame } from "@/lib/data";
import { getBenchmarkTable, getBenchmarkVideos, getCompatibleDevices } from "@/lib/reverse-lookup";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const limited = await enforceRateLimit(req, "game-detail");
  if (limited) return limited;

  const { slug } = await params;
  const game = findGame(slug);
  if (!game) return fail("Không tìm thấy game", 404);

  return ok({
    game,
    benchmarks: getBenchmarkTable(slug),
    devices: getCompatibleDevices(slug).slice(0, 6),
    videos: getBenchmarkVideos(slug),
  });
}
