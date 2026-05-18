import { z } from "zod";
import { enforceRateLimit, fail, ok, paginate } from "@/lib/api";
import { devices } from "@/lib/data";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "devices");
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const query = z
      .object({
        priceRange: z.string().optional(),
        type: z.string().optional(),
        brand: z.string().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(24),
      })
      .parse(Object.fromEntries(url.searchParams));

    const items = devices.filter(
      (device) =>
        (!query.priceRange || device.priceRange === query.priceRange) &&
        (!query.type || device.type === query.type) &&
        (!query.brand || device.brand === query.brand),
    );
    const page = paginate(items, query.page, query.limit);
    return ok(page.data, page.pagination);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Lỗi tải thiết bị");
  }
}
