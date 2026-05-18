import { enforceRateLimit, fail, ok } from "@/lib/api";
import { findGame } from "@/lib/data";
import { getRecommendedConfigs } from "@/lib/reverse-lookup";

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const limited = await enforceRateLimit(req, "game-recommend");
  if (limited) return limited;

  const { slug } = await params;
  if (!findGame(slug)) return fail("Không tìm thấy game", 404);
  return ok(getRecommendedConfigs(slug));
}
