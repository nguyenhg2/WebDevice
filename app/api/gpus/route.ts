import { z } from "zod";
import { enforceRateLimit, fail, ok, paginate } from "@/lib/api";
import { gpus } from "@/lib/data";
import { includesText } from "@/lib/utils";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "gpus");
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const query = z
      .object({
        search: z.string().optional(),
        brand: z.string().optional(),
        category: z.string().optional(),
        priceRange: z.string().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(24),
      })
      .parse(Object.fromEntries(url.searchParams));

    const items = gpus.filter(
      (gpu) =>
        (!query.search || includesText(gpu.name, query.search)) &&
        (!query.brand || gpu.brand === query.brand) &&
        (!query.category || gpu.category === query.category) &&
        (!query.priceRange || gpu.priceRangeVnd === query.priceRange),
    );
    const page = paginate(items, query.page, query.limit);
    return ok(page.data, page.pagination);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Lỗi tải GPU");
  }
}
