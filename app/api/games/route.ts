import { z } from "zod";
import { enforceRateLimit, fail, ok, paginate } from "@/lib/api";
import { games } from "@/lib/data";
import { includesText } from "@/lib/utils";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "games");
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const query = z
      .object({
        search: z.string().optional(),
        genres: z.string().optional(),
        isFree: z.string().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(24),
      })
      .parse(Object.fromEntries(url.searchParams));

    const items = games.filter(
      (game) =>
        (!query.search || includesText(game.name, query.search)) &&
        (!query.genres || game.genres.includes(query.genres)) &&
        (!query.isFree || String(game.isFree) === query.isFree),
    );
    const page = paginate(items, query.page, query.limit);
    return ok(page.data, page.pagination);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Lỗi tải game");
  }
}
