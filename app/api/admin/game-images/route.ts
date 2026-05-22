import fs from "node:fs/promises";
import path from "node:path";
import { NextRequest, NextResponse } from "next/server";
import {
  buildGameImageItem,
  getGameImageIssues,
  includesGameImageSearch,
  isAllowedImageUrl,
  normalizeImageUrls,
  type GameImages,
  type GameImageSources,
} from "@/lib/game-images";
import { getAdminFromRequest } from "@/lib/admin-auth";
import type { Game } from "@/types";

export const runtime = "nodejs";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const imagesPath = path.join(root, "data", "game-images.json");
const sourcesPath = path.join(root, "data", "game-image-sources.json");

function jsonError(message: string, status = 400) {
  return NextResponse.json({ success: false, error: message }, { status });
}

async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath: string, value: unknown) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

function cleanOptional(value: unknown) {
  const output = cleanText(value);
  return output ? output : null;
}

async function loadData() {
  const games = await readJson<Game[]>(gamesPath, []);
  const images = await readJson<GameImages>(imagesPath, {});
  const sources = await readJson<GameImageSources>(sourcesPath, {});
  return { games, images, sources };
}

function writeFailure(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/EROFS|read-only|permission|EACCES|EPERM/i.test(message)) {
    return "Không ghi được file data trên môi trường hiện tại. Hãy chạy admin ở local, lưu thay đổi, commit/deploy lại để production nhận ảnh mới.";
  }
  return message;
}

export async function GET(req: NextRequest) {
  if (!getAdminFromRequest(req)) return jsonError("Chưa đăng nhập quản trị.", 401);

  try {
    const url = new URL(req.url);
    const search = cleanText(url.searchParams.get("search"));
    const issuesOnly = url.searchParams.get("issuesOnly") === "1";
    const limit = Math.min(200, Math.max(1, Number(url.searchParams.get("limit") || 80)));
    const { games, images, sources } = await loadData();
    let items = games.map((game) => buildGameImageItem(game, images, sources));

    if (search) items = items.filter((item) => includesGameImageSearch(item, search));
    if (issuesOnly) items = items.filter((item) => item.issues.length > 0);

    const issueCount = games.reduce((count, game) => count + (getGameImageIssues(game, images[game.slug] ?? []).length ? 1 : 0), 0);
    return NextResponse.json({
      success: true,
      items: items.slice(0, limit),
      total: games.length,
      issueCount,
      source: "data-files",
      canWriteFiles: process.env.VERCEL !== "1",
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error), 500);
  }
}

export async function POST(req: NextRequest) {
  if (!getAdminFromRequest(req)) return jsonError("Chưa đăng nhập quản trị.", 401);

  try {
    const body = await req.json();
    const slug = cleanText(body.slug);
    if (!slug) throw new Error("Thiếu slug game cần cập nhật.");

    const { games, images, sources } = await loadData();
    const game = games.find((item) => item.slug === slug);
    if (!game) throw new Error(`Không tìm thấy game "${slug}".`);

    const coverImage = cleanOptional(body.coverImage);
    const officialUrl = cleanOptional(body.officialUrl);
    if (coverImage && !isAllowedImageUrl(coverImage)) throw new Error("Ảnh bìa phải là URL http/https hoặc đường dẫn /images/.");

    const gallery = normalizeImageUrls(body.gallery);
    const nextGallery = normalizeImageUrls([coverImage, ...gallery].filter(Boolean));
    const manualSourceUrl = cleanText(body.sourceUrl) || officialUrl || game.officialUrl || "admin-manual";
    const previousSources = new Map((sources[slug] ?? []).map((item) => [item.url, item]));

    game.coverImage = coverImage;
    game.officialUrl = officialUrl;
    images[slug] = nextGallery;
    sources[slug] = nextGallery.map((url) => {
      const previous = previousSources.get(url);
      return {
        url,
        source: previous?.source || "manual-admin",
        sourceUrl: previous?.sourceUrl || manualSourceUrl,
      };
    });

    try {
      await writeJson(gamesPath, games);
      await writeJson(imagesPath, images);
      await writeJson(sourcesPath, sources);
    } catch (error) {
      return jsonError(writeFailure(error), 500);
    }

    return NextResponse.json({
      success: true,
      item: buildGameImageItem(game, images, sources),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : String(error));
  }
}
