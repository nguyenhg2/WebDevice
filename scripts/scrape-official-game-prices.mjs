import fs from "node:fs/promises";
import path from "node:path";

const root = process.cwd();
const gamesPath = path.join(root, "data", "games.json");
const steamDetailsUrl = "https://store.steampowered.com/api/appdetails";
const sleepMs = Number.parseInt(process.env.OFFICIAL_METADATA_DELAY_MS || "800", 10);

const manualOfficialMetadata = {
  valorant: {
    price: 0,
    isFree: true,
    genres: ["Bắn súng", "Chiến thuật", "FPS"],
    officialUrl: "https://playvalorant.com/vi-vn/",
  },
  fortnite: {
    price: 0,
    isFree: true,
    genres: ["Battle Royale", "Bắn súng", "Sinh tồn"],
    officialUrl: "https://www.fortnite.com/",
  },
  "alan-wake-2": {
    price: null,
    isFree: false,
    genres: ["Kinh dị sinh tồn", "Hành động", "Phiêu lưu"],
    officialUrl: "https://www.alanwake.com/",
  },
  "rocket-league": {
    price: 0,
    isFree: true,
    genres: ["Đua xe", "Thể thao", "Hành động"],
    officialUrl: "https://www.rocketleague.com/play/",
  },
  "path-of-exile": {
    price: 0,
    isFree: true,
    genres: ["Hành động", "Nhập vai"],
    officialUrl: "https://www.pathofexile.com/",
  },
  "path-of-exile-2": {
    price: null,
    isFree: false,
    genres: ["Hành động", "Nhập vai"],
    officialUrl: "https://pathofexile2.com/",
  },
  "delta-force": {
    price: 0,
    isFree: true,
    genres: ["Bắn súng", "Hành động", "Chiến thuật"],
    officialUrl: "https://www.playdeltaforce.com/",
  },
  "aion-2": {
    price: 0,
    isFree: true,
    genres: ["MMO", "Nhập vai", "Phiêu lưu"],
    officialUrl: "https://aion2.plaync.com/",
  },
  "arena-breakout-infinite": {
    price: 0,
    isFree: true,
    genres: ["Bắn súng", "Chiến thuật", "Sinh tồn"],
    officialUrl: "https://store.steampowered.com/app/2073620/Arena_Breakout_Infinite/",
  },
  "marvels-spider-man-2": {
    price: null,
    isFree: false,
    genres: ["Hành động", "Phiêu lưu"],
    officialUrl: "https://store.steampowered.com/app/2651280/Marvels_SpiderMan_2/",
  },
  "ghost-of-tsushima-director-s-cut": {
    price: null,
    isFree: false,
    genres: ["Hành động", "Phiêu lưu"],
    officialUrl: "https://store.steampowered.com/app/2215430/Ghost_of_Tsushima_DIRECTORS_CUT/",
  },
  "death-stranding-2-on-the-beach": {
    price: null,
    isFree: false,
    genres: ["Hành động", "Phiêu lưu"],
    officialUrl: "https://store.steampowered.com/app/3280350/DEATH_STRANDING_2_ON_THE_BEACH/",
  },
  "lego-horizon-adventures": {
    price: null,
    isFree: false,
    genres: ["Hành động", "Phiêu lưu"],
    officialUrl: "https://store.steampowered.com/app/2428810/LEGO_Horizon_Adventures/",
  },
  "silent-hill-2": {
    price: null,
    isFree: false,
    genres: ["Kinh dị sinh tồn", "Hành động", "Phiêu lưu"],
    officialUrl: "https://store.steampowered.com/app/2124490/SILENT_HILL_2/",
  },
  "helldivers-2": {
    price: null,
    isFree: false,
    genres: ["Bắn súng", "Hành động"],
    officialUrl: "https://store.steampowered.com/app/553850/HELLDIVERS_2/",
  },
};

const genreMap = new Map([
  ["Action", "Hành động"],
  ["Hành động", "Hành động"],
  ["Hanh dong", "Hành động"],
  ["Adventure", "Phiêu lưu"],
  ["Phiêu lưu", "Phiêu lưu"],
  ["Phieu luu", "Phiêu lưu"],
  ["Casual", "Giải trí"],
  ["Đơn giản", "Giải trí"],
  ["Giai tri", "Giải trí"],
  ["Indie", "Indie"],
  ["Độc lập", "Indie"],
  ["Doc lap", "Indie"],
  ["Racing", "Đua xe"],
  ["Đua tốc độ", "Đua xe"],
  ["Dua xe", "Đua xe"],
  ["RPG", "Nhập vai"],
  ["Nhập vai (RPG)", "Nhập vai"],
  ["Nhap vai", "Nhập vai"],
  ["Simulation", "Mô phỏng"],
  ["Mô phỏng", "Mô phỏng"],
  ["Mo phong", "Mô phỏng"],
  ["Sports", "Thể thao"],
  ["Thể thao", "Thể thao"],
  ["The thao", "Thể thao"],
  ["Strategy", "Chiến thuật"],
  ["Chiến thuật", "Chiến thuật"],
  ["Chien thuat", "Chiến thuật"],
  ["Massively Multiplayer", "MMO"],
  ["Nhiều người chơi", "MMO"],
  ["Nhieu nguoi choi", "MMO"],
]);

const nonGenreLabels = new Set(["Free To Play", "Chơi miễn phí", "Mien phi", "Early Access", "Truy cập sớm"]);

async function fetchSteamDetails(appid) {
  const url = new URL(steamDetailsUrl);
  url.searchParams.set("appids", appid);
  url.searchParams.set("cc", "vn");
  url.searchParams.set("l", "vietnamese");

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Fpsviet.com official metadata updater (Steam API; local project)",
        Accept: "application/json",
      },
    });

    if (response.status === 429 || response.status >= 500) {
      await sleep(4000 * attempt);
      continue;
    }

    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const payload = await response.json();
    const entry = payload?.[String(appid)];
    if (!entry?.success || entry.data?.type !== "game") return null;
    return entry.data;
  }

  throw new Error("Steam rate limit after retries");
}

function parseFormattedVnd(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/free|miễn phí/i.test(text)) return 0;
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function normalizeSteamPrice(details) {
  if (details.is_free) return 0;
  const priceOverview = details.price_overview;
  if (!priceOverview) return null;

  const formatted = parseFormattedVnd(priceOverview.final_formatted || priceOverview.initial_formatted);
  if (Number.isFinite(formatted)) return formatted;

  const raw = Number(priceOverview.final ?? priceOverview.initial);
  if (!Number.isFinite(raw)) return null;
  if (priceOverview.currency === "VND") return Math.round(raw / 100);
  return null;
}

function normalizeSteamPackagePrice(details) {
  const packagePrices = [];

  for (const group of details.package_groups || []) {
    for (const sub of group.subs || []) {
      if (sub.is_free_license || sub.can_get_free_license === "1") {
        packagePrices.push(0);
        continue;
      }

      const raw = Number(sub.price_in_cents_with_discount);
      if (Number.isFinite(raw) && raw > 0) {
        packagePrices.push(Math.round(raw / 100));
        continue;
      }

      const formatted = parseFormattedVnd(sub.option_text);
      if (Number.isFinite(formatted) && formatted > 0) packagePrices.push(formatted);
    }
  }

  if (!packagePrices.length) return null;
  if (packagePrices.includes(0)) return 0;
  return Math.min(...packagePrices);
}

function normalizeSteamFinalPrice(details) {
  const overviewPrice = normalizeSteamPrice(details);
  if (overviewPrice !== null) return overviewPrice;
  return normalizeSteamPackagePrice(details);
}

function normalizeGenres(genres) {
  const output = [];
  for (const genre of genres || []) {
    const raw = String(genre?.description || genre || "").trim();
    if (!raw || nonGenreLabels.has(raw)) continue;
    const label = genreMap.get(raw) || raw;
    if (!output.includes(label)) output.push(label);
  }
  return output.slice(0, 5);
}

function buildDescription(game) {
  const genreText = game.genres.slice(0, 3).join(", ").toLowerCase() || "game PC";
  const priceText = game.isFree ? "miễn phí" : game.price ? `có giá khoảng ${formatVnd(game.price)}` : "cần xem giá trên trang chính thức";
  return `${game.name} là game ${genreText}, ${priceText}. Trang này giúp bạn xem cấu hình yêu cầu, FPS tham khảo và gợi ý máy phù hợp trước khi tải hoặc mua game.`;
}

function formatVnd(value) {
  return `${new Intl.NumberFormat("vi-VN").format(value)}đ`;
}

function applyManualMetadata(game, metadata) {
  game.price = metadata.price;
  game.isFree = metadata.isFree;
  game.genres = metadata.genres;
  if (metadata.officialUrl) game.officialUrl = metadata.officialUrl;
  game.description = buildDescription(game);
}

async function main() {
  const games = JSON.parse(await fs.readFile(gamesPath, "utf8"));
  const updated = [];
  const unresolvedPrices = [];
  const unresolvedGenres = [];

  for (const game of games) {
    const manual = manualOfficialMetadata[game.slug];
    if (manual) {
      applyManualMetadata(game, manual);
      updated.push(`${game.slug}: manual official metadata`);
      continue;
    }

    if (!game.steamId) {
      game.price = null;
      game.isFree = false;
      game.genres = normalizeGenres(game.genres);
      game.description = buildDescription(game);
      unresolvedPrices.push(`${game.slug}: no Steam ID`);
      if (!game.genres.length) unresolvedGenres.push(`${game.slug}: no official genre endpoint`);
      continue;
    }

    try {
      const details = await fetchSteamDetails(game.steamId);
      if (!details) {
        game.price = null;
        game.isFree = false;
        game.genres = normalizeGenres(game.genres);
        game.description = buildDescription(game);
        unresolvedPrices.push(`${game.slug}: Steam returned no game details`);
        if (!game.genres.length) unresolvedGenres.push(`${game.slug}: Steam returned no genres`);
        continue;
      }

      const price = normalizeSteamFinalPrice(details);
      const genres = normalizeGenres(details.genres);
      game.price = price;
      game.isFree = price === 0 || Boolean(details.is_free);
      if (genres.length) game.genres = genres;
      else {
        game.genres = normalizeGenres(game.genres);
        unresolvedGenres.push(`${game.slug}: Steam returned no usable genres`);
      }
      game.description = buildDescription(game);
      updated.push(`${game.slug}: Steam metadata`);
      if (price === null) unresolvedPrices.push(`${game.slug}: Steam has no VN price package`);
    } catch (error) {
      unresolvedPrices.push(`${game.slug}: ${error instanceof Error ? error.message : String(error)}; kept existing metadata`);
    }

    await sleep(sleepMs);
  }

  await fs.writeFile(gamesPath, `${JSON.stringify(games, null, 2)}\n`, "utf8");
  console.log(`Updated metadata for ${updated.length} games.`);
  console.log(`Unresolved prices: ${unresolvedPrices.length}`);
  if (unresolvedPrices.length) console.log(unresolvedPrices.slice(0, 80).join("\n"));
  console.log(`Unresolved genres: ${unresolvedGenres.length}`);
  if (unresolvedGenres.length) console.log(unresolvedGenres.slice(0, 80).join("\n"));
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
