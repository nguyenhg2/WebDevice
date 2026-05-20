import { NextRequest, NextResponse } from "next/server";
import { getAdminFromRequest } from "@/lib/admin-auth";
import { deleteAdminItem, listAdminItems, type AdminCollection } from "@/lib/admin-db";

const collections = new Set(["game", "gpu", "cpu", "device", "benchmark", "blogPost"]);

function parseCollection(value: string | null) {
  if (!value || !collections.has(value)) throw new Error("Module dữ liệu không hợp lệ.");
  return value as AdminCollection;
}

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  try {
    const url = new URL(req.url);
    const collection = parseCollection(url.searchParams.get("collection"));
    const search = url.searchParams.get("search") ?? "";
    const limit = Number(url.searchParams.get("limit") || 50);
    const items = await listAdminItems(collection, search, limit);
    return NextResponse.json({ success: true, items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!getAdminFromRequest(req)) {
    return NextResponse.json({ success: false, error: "Chưa đăng nhập quản trị." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const collection = parseCollection(String(body.collection || ""));
    const key = String(body.key || "");
    if (!key) throw new Error("Thiếu khóa bản ghi cần xóa.");
    const count = await deleteAdminItem(collection, key);
    return NextResponse.json({ success: true, count });
  } catch (error) {
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : String(error) }, { status: 400 });
  }
}
