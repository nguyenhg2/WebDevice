import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const outputPath = path.join(root, "data", "game-expansion-candidates.json");
const gamesPath = path.join(root, "data", "games.json");
const requestHeaders = { "User-Agent": "Fpsviet.com game discovery (sitemap-only; no FPS import)" };

const sources = [
  {
    key: "pc-builds",
    label: "PC-Builds FPS calculator",
    url: "https://pc-builds.com/fps-calculator/",
    pattern: null,
  },
  {
    key: "howmanyfps",
    label: "HowManyFPS sitemap",
    url: "https://cdn.howmanyfps.com/sitemap.xml",
    pattern: /^https:\/\/howmanyfps\.com\/games\/([^/?#]+)$/i,
  },
  {
    key: "dropreference",
    label: "DropReference sitemap",
    url: "https://dropreference.com/sitemaps/sitemap-games.xml",
    pattern: /^https:\/\/dropreference\.com\/en\/benchmarks\/([^/?#]+)$/i,
  },
];

const existingGames = JSON.parse(fs.readFileSync(gamesPath, "utf8"));
const existingSlugs = new Set(existingGames.map((game) => game.slug));
const existingNames = new Map(existingGames.map((game) => [normalize(game.name), game.slug]));
const candidates = new Map();
const audit = [];

for (const source of sources) {
  try {
    const xml = await fetchText(source.url);
    if (!source.pattern) {
      audit.push({ source: source.key, label: source.label, status: "skipped", reason: "No public sitemap/game index was available for safe discovery." });
      continue;
    }
    const urls = locsFromSitemap(xml);
    let matched = 0;

    for (const url of urls) {
      const match = url.match(source.pattern);
      if (!match) continue;
      matched += 1;
      const slug = cleanSlug(match[1]);
      if (!slug) continue;
      const name = titleFromSlug(slug);
      const key = existingSlugs.has(slug) ? slug : slug;
      const row = candidates.get(key) ?? {
        slug,
        name,
        inCatalog: existingSlugs.has(slug) || existingNames.has(normalize(name)),
        existingGameSlug: existingSlugs.has(slug) ? slug : existingNames.get(normalize(name)) ?? null,
        referenceSites: [],
        status: "needs-official-data-and-video-review",
      };
      if (!row.referenceSites.includes(source.key)) row.referenceSites.push(source.key);
      candidates.set(key, row);
    }

    audit.push({ source: source.key, label: source.label, status: "ok", urls: urls.length, matched });
  } catch (error) {
    audit.push({ source: source.key, label: source.label, status: "error", message: error instanceof Error ? error.message : String(error) });
  }
}

const rows = [...candidates.values()]
  .sort((a, b) => Number(a.inCatalog) - Number(b.inCatalog) || b.referenceSites.length - a.referenceSites.length || a.name.localeCompare(b.name, "en"))
  .map((row) => ({
    ...row,
    note: row.inCatalog
      ? "Already represented in the production catalog."
      : "Candidate only. Do not add FPS until verified by video/manual test or a licensed data source.",
  }));

fs.writeFileSync(outputPath, `${JSON.stringify(rows, null, 2)}\n`, "utf8");

console.log(`Wrote ${rows.length} game expansion candidates to ${path.relative(root, outputPath)}`);
for (const item of audit) {
  console.log(`${item.source}: ${item.status}${item.matched !== undefined ? `, matched ${item.matched}/${item.urls}` : item.message ? `, ${item.message}` : item.reason ? `, ${item.reason}` : ""}`);
}
console.log(`New candidates: ${rows.filter((row) => !row.inCatalog).length}`);
console.log(`Already in catalog: ${rows.filter((row) => row.inCatalog).length}`);

async function fetchText(url) {
  const response = await fetch(url, { headers: requestHeaders });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function locsFromSitemap(xml) {
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1].trim());
}

function cleanSlug(value) {
  return decodeURIComponent(String(value || ""))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function titleFromSlug(slug) {
  const special = new Map([
    ["gta-v", "GTA V"],
    ["grand-theft-auto-v", "Grand Theft Auto V"],
    ["cs2", "Counter-Strike 2"],
    ["pubg-battlegrounds", "PUBG: BATTLEGROUNDS"],
  ]);
  if (special.has(slug)) return special.get(slug);
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => (/^(ii|iii|iv|vi|vii|viii|ix|x|vr)$/i.test(part) ? part.toUpperCase() : part[0].toUpperCase() + part.slice(1)))
    .join(" ");
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
