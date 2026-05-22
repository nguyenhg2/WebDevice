import { NextResponse } from "next/server";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

export function ok<T>(data: T, pagination?: unknown) {
  return NextResponse.json(
    { success: true, data, pagination },
    { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } },
  );
}

export function fail(message: string, status = 400) {
  return NextResponse.json({ success: false, data: null, error: message }, { status });
}

export function paginate<T>(items: T[], page: number, limit: number) {
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const total = items.length;
  const start = (safePage - 1) * safeLimit;

  return {
    data: items.slice(start, start + safeLimit),
    pagination: { page: safePage, limit: safeLimit, total, totalPages: Math.max(1, Math.ceil(total / safeLimit)) },
  };
}

export async function enforceRateLimit(req: Request, scope: string) {
  const allowed = await rateLimit(`${scope}:${getClientKey(req)}`);
  return allowed ? null : fail("Bạn thao tác quá nhanh, vui lòng thử lại sau.", 429);
}
