import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { type AdminCollection, upsertAdminItems } from "@/lib/admin-db";

const collections = new Set(["game", "gpu", "cpu", "device", "benchmark", "blogPost"]);

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập admin." }, { status: 401 });
  }

  try {
    const form = await req.formData();
    const collection = String(form.get("collection") || "") as AdminCollection;
    const rawPayload = String(form.get("payload") || "");

    if (!collections.has(collection)) {
      return NextResponse.json({ success: false, error: "Module dữ liệu không hợp lệ." }, { status: 400 });
    }

    const payload = JSON.parse(rawPayload);
    const count = await upsertAdminItems(collection, payload);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
