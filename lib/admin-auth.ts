import crypto from "node:crypto";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "fpsviet_admin";

const encoder = new TextEncoder();

function adminEmail() {
  return process.env.ADMIN_EMAIL || "admin@fpsviet.com";
}

function adminPassword() {
  return process.env.ADMIN_PASSWORD || "admin123";
}

function sessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || process.env.NEXTAUTH_SECRET || "change-this-admin-session-secret";
}

function safeEqual(a: string, b: string) {
  const left = encoder.encode(a);
  const right = encoder.encode(b);
  if (left.byteLength !== right.byteLength) return false;
  return crypto.timingSafeEqual(left, right);
}

function sign(payload: string) {
  return crypto.createHmac("sha256", sessionSecret()).update(payload).digest("base64url");
}

export function validateAdminLogin(email: string, password: string) {
  return safeEqual(email, adminEmail()) && safeEqual(password, adminPassword());
}

export function createAdminToken(email = adminEmail()) {
  const expiresAt = Date.now() + 1000 * 60 * 60 * 12;
  const payload = Buffer.from(JSON.stringify({ email, expiresAt })).toString("base64url");
  return `${payload}.${sign(payload)}`;
}

export function verifyAdminToken(token?: string | null) {
  if (!token) return null;
  const [payload, signature] = token.split(".");
  if (!payload || !signature || !safeEqual(sign(payload), signature)) return null;

  try {
    const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as { email: string; expiresAt: number };
    if (!session.email || Date.now() > session.expiresAt) return null;
    return session;
  } catch {
    return null;
  }
}

export function getAdminFromRequest(req: NextRequest) {
  return verifyAdminToken(req.cookies.get(ADMIN_COOKIE)?.value);
}
