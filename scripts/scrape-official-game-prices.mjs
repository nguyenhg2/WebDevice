import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const gamesPath = path.join(ROOT, "data", "games.json");
const steamDetailsUrl = "https://store.steampowered.com/api/appdetails";

const officialFreeGames = new Set([
  "counter-strike-2",
  "valorant",
  "genshin-impact",
  "lien-minh-huyen-thoai",
  "dota-2",
  "pubg-battlegrounds",
  "apex-legends",
  "fortnite",
  "roblox",
  "warframe",
  "path-of-exile",
  "lost-ark",
  "world-of-tanks",
  "war-thunder",
  "the-sims-4",
  "team-fortress-2",
  "overwatch-2",
  "rocket-league",
  "fifa-online-4",
  "dot-kich",
  "audition",
  "blade-soul",
  "blade-soul-heroes",
  "starcraft-ii",
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function fetchSteamDetails(appid) {
  const url = new URL(steamDetailsUrl);
  url.searchParams.set("appids", appid);
  url.searchParams.set("cc", "vn");
  url.searchParams.set("l", "vietnamese");
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn official price updater (local project)",
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const payload = await response.json();
  return payload?.[String(appid)]?.data ?? null;
}

function parseFormattedVnd(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  if (/free|miễn phí/i.test(text)) return 0;
  const digits = text.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function normalizeSteamPrice(priceOverview) {
  if (!priceOverview) return null;
  const formatted = parseFormattedVnd(priceOverview.final_formatted || priceOverview.initial_formatted);
  if (Number.isFinite(formatted)) return formatted;

  const raw = Number(priceOverview.final ?? priceOverview.initial);
  if (!Number.isFinite(raw)) return null;
  return Math.round(raw / 100);
}

async function main() {
  const games = JSON.parse(await fs.readFile(gamesPath, "utf8"));
  const updated = [];
  const unresolved = [];

  for (const game of games) {
    if (officialFreeGames.has(game.slug)) {
      game.price = 0;
      game.isFree = true;
      updated.push(`${game.slug}: free official`);
      continue;
    }

    if (!game.steamId) {
      game.price = null;
      game.isFree = false;
      unresolved.push(`${game.slug}: no official price endpoint`);
      continue;
    }

    try {
      const details = await fetchSteamDetails(game.steamId);
      if (!details) {
        game.price = null;
        game.isFree = false;
        unresolved.push(`${game.slug}: Steam returned no details`);
        continue;
      }

      if (details.is_free) {
        game.price = 0;
        game.isFree = true;
        updated.push(`${game.slug}: Steam free`);
      } else {
        const price = normalizeSteamPrice(details.price_overview);
        game.price = Number.isFinite(price) ? price : null;
        game.isFree = false;
        updated.push(`${game.slug}: ${game.price ?? "no VN price"}`);
        if (game.price === null) unresolved.push(`${game.slug}: Steam has no VN price_overview`);
      }
    } catch (error) {
      game.price = null;
      game.isFree = false;
      unresolved.push(`${game.slug}: ${error instanceof Error ? error.message : String(error)}`);
    }

    await sleep(250);
  }

  await fs.writeFile(gamesPath, `${JSON.stringify(games, null, 2)}\n`, "utf8");
  console.log(`Updated official prices for ${updated.length} games.`);
  if (unresolved.length) console.log(`Unresolved official prices:\n${unresolved.join("\n")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
