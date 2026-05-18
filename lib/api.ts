import { NextResponse } from "next/server";
import { getClientKey, rateLimit } from "@/lib/rate-limit";

export function ok<T>(data: T, pagination?: unknown) { return NextResponse.json({ success: true, data, pagination }, { headers: { "Cache-Control": "s-maxage=3600, stale-while-revalidate=86400" } }); }
export function fail(message: string, status = 400) { return NextResponse.json({ success: false, data: null, error: message }, { status }); }
export function paginate<T>(items: T[], page: number, limit: number) { const total = items.length; const start = (page - 1) * limit; return { data: items.slice(start, start + limit), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }; }
export async function enforceRateLimit(req: Request, scope: string) { const allowed = await rateLimit(`${scope}:${getClientKey(req)}`); return allowed ? null : fail("B?n thao tác quá nhanh, vui lêng th? lài sau.", 429); }
