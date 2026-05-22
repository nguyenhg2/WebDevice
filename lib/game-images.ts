import type { Game } from "@/types";

export type ImageSource = {
  url: string;
  source?: string;
  sourceUrl?: string;
};

export type GameImages = Record<string, string[]>;
export type GameImageSources = Record<string, ImageSource[]>;

export type GameImageItem = {
  name: string;
  slug: string;
  coverImage: string | null;
  officialUrl: string | null;
  gallery: string[];
  sources: ImageSource[];
  issues: string[];
};

const REMOTE_IMAGE_URL = /^https?:\/\//i;
const LOCAL_GAME_SVG = /^\/images\/games\/.+\.svg$/i;
const SUSPICIOUS_IMAGE =
  /(?:^|[\/_.-])(?:logo|log|icon|thumb|thum|favicon|sprite|avatar|badge|mark)(?:[\/_.-]|$)|header_menu|capsule_184|example\.com/i;

function cleanText(value: unknown) {
  return String(value ?? "").trim();
}

export function isRemoteImageUrl(url: string) {
  return REMOTE_IMAGE_URL.test(url);
}

export function isAllowedImageUrl(url: string) {
  return isRemoteImageUrl(url) || url.startsWith("/images/");
}

export function isSuspiciousGameImage(url: string) {
  return SUSPICIOUS_IMAGE.test(url);
}

export function isLocalGameSvg(url: string) {
  return LOCAL_GAME_SVG.test(url);
}

export function isPlaceholderGameImage(url: string) {
  return isLocalGameSvg(url) || isSuspiciousGameImage(url);
}

export function uniqueImageUrls(urls: string[]) {
  const seen = new Set<string>();
  const output: string[] = [];

  for (const url of urls) {
    const cleanUrl = url.trim();
    if (!cleanUrl || seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);
    output.push(cleanUrl);
  }

  return output;
}

export function splitImageUrls(value: unknown) {
  if (Array.isArray(value)) return uniqueImageUrls(value.map(cleanText));

  return uniqueImageUrls(
    cleanText(value)
      .split(/\r?\n|,/g)
      .map((item) => item.trim()),
  );
}

export function normalizeImageUrls(value: unknown) {
  return splitImageUrls(value).filter(isAllowedImageUrl);
}

export function getGameImageIssues(game: Pick<Game, "coverImage">, gallery: string[]) {
  const issues: string[] = [];
  const cover = game.coverImage ?? "";
  const remoteGalleryCount = gallery.filter((image) => isRemoteImageUrl(image) && !isSuspiciousGameImage(image)).length;

  if (!cover) issues.push("Thiếu ảnh bìa");
  if (cover && !isAllowedImageUrl(cover)) issues.push("Ảnh bìa không phải URL hợp lệ");
  if (cover && isLocalGameSvg(cover)) issues.push("Ảnh bìa đang là SVG placeholder");
  if (cover && isSuspiciousGameImage(cover)) issues.push("Ảnh bìa có vẻ là logo/thumbnail");
  if (gallery.length === 0) issues.push("Thiếu gallery");
  if (remoteGalleryCount === 0) issues.push("Gallery chưa có ảnh thật");
  if (gallery.some(isLocalGameSvg)) issues.push("Gallery còn SVG placeholder");

  return Array.from(new Set(issues));
}

export function buildGameImageItem(game: Game, images: GameImages, sources: GameImageSources): GameImageItem {
  const gallery = images[game.slug] ?? [];

  return {
    name: game.name,
    slug: game.slug,
    coverImage: game.coverImage,
    officialUrl: game.officialUrl,
    gallery,
    sources: sources[game.slug] ?? [],
    issues: getGameImageIssues(game, gallery),
  };
}

export function includesGameImageSearch(item: GameImageItem, search: string) {
  const query = search.toLowerCase();

  return [item.name, item.slug, item.coverImage, item.officialUrl, item.gallery.join(" ")]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(query));
}
