import { z } from "zod";
import { classifyGame } from "@/lib/compatibility-engine";
import { enforceRateLimit, fail, ok, paginate } from "@/lib/api";
import { findCpu, findGpu, games } from "@/lib/data";
import type { Resolution } from "@/types";

export async function GET(req: Request) {
  const limited = await enforceRateLimit(req, "compatibility");
  if (limited) return limited;

  try {
    const url = new URL(req.url);
    const query = z
      .object({
        gpuSlug: z.string().optional(),
        cpuSlug: z.string(),
        ramGb: z.coerce.number(),
        resolution: z.enum(["720p", "1080p", "1440p", "4k"]).default("1080p"),
        genres: z.string().optional(),
        isFree: z.string().optional(),
        maxSizeGb: z.coerce.number().optional(),
        page: z.coerce.number().default(1),
        limit: z.coerce.number().default(24),
      })
      .parse(Object.fromEntries(url.searchParams));

    const cpu = findCpu(query.cpuSlug);
    const gpu = query.gpuSlug ? findGpu(query.gpuSlug) : undefined;
    if (!cpu) return fail("Không tìm thấy CPU", 404);

    const gpuScore = gpu?.benchmarkScore ?? (cpu.integratedGpu ? 1800 : 0);
    const rows = games
      .filter(
        (game) =>
          (!query.genres || game.genres.includes(query.genres)) &&
          (!query.isFree || String(game.isFree) === query.isFree) &&
          (!query.maxSizeGb || game.sizeGb <= query.maxSizeGb),
      )
      .map((game) => ({
        game,
        ...classifyGame(
          gpuScore,
          cpu.benchmarkScore,
          query.ramGb,
          query.resolution as Resolution,
          game.minSpecs,
          game.recSpecs,
        ),
      }))
      .sort(
        (a, b) =>
          ({ smooth: 0, playable: 1, not_recommended: 2 })[a.status] -
          ({ smooth: 0, playable: 1, not_recommended: 2 })[b.status],
      );

    const page = paginate(rows, query.page, query.limit);
    return ok(page.data, page.pagination);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Lỗi tra cứu");
  }
}
