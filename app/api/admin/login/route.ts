import { NextResponse } from "next/server";
import { ADMIN_COOKIE, createAdminToken, validateAdminLogin } from "@/lib/admin-auth";

export async function POST(req: Request) {
  const form = await req.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");

  if (!validateAdminLogin(email, password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", req.url), 303);
  }

  const res = NextResponse.redirect(new URL("/admin", req.url), 303);
  res.cookies.set(ADMIN_COOKIE, createAdminToken(email), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 12,
    path: "/",
  });
  return res;
}
