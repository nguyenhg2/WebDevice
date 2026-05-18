import { enforceRateLimit, fail, ok } from "@/lib/api";
import { blogPosts, cpus, devices, games, gpus } from "@/lib/data";
import { includesText } from "@/lib/utils";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "search");
  if (limited) return limited;

  try {
    const query = new URL(req.url).searchParams.get("q") ?? "";
    return ok({
      games: games.filter((item) => includesText(item.name, query)).slice(0, 8),
      gpus: gpus.filter((item) => includesText(item.name, query)).slice(0, 8),
      cpus: cpus.filter((item) => includesText(item.name, query)).slice(0, 8),
      devices: devices.filter((item) => includesText(item.name, query)).slice(0, 8),
      posts: blogPosts.filter((item) => includesText(item.title, query)).slice(0, 8),
    });
  } catch {
    return fail("Lỗi tìm kiếm");
  }
}
