import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const REQUEST_TIMEOUT_MS = 15000;
const DEFAULT_DELAY_MS = Number.parseInt(process.env.FPS_SOURCE_DELAY_MS || "650", 10);
const MAX_GAMES = Number.parseInt(process.env.FPS_SOURCE_MAX_GAMES || "80", 10);
const USER_AGENT = process.env.FPS_SOURCE_USER_AGENT || "Maynaychoiduoc.vn public data importer; contact local project admin";

const gamesPath = path.join(ROOT, "data", "games.json");
const gpusPath = path.join(ROOT, "data", "gpus.json");
const samplesPath = path.join(ROOT, "data", "external-fps-samples.json");
const statusPath = path.join(ROOT, "data", "data-source-status.json");
const summaryPath = path.join(ROOT, "data", "external-fps-import-summary.json");

const sourceDefinitions = [
  {
    key: "pcgamebenchmark",
    name: "PCGameBenchmark",
    url: "https://www.pcgamebenchmark.com/fps-calculator",
    robotsUrl: "https://www.pcgamebenchmark.com/robots.txt",
  },
  {
    key: "howmanyfps",
    name: "HowManyFPS",
    url: "https://howmanyfps.com/benchmarks",
    robotsUrl: "https://howmanyfps.com/robots.txt",
    sitemapUrl: "https://cdn.howmanyfps.com/sitemap.xml",
  },
  {
    key: "pc-builds",
    name: "PC-Builds",
    url: "https://pc-builds.com/fps-calculator/",
    robotsUrl: "https://pc-builds.com/robots.txt",
  },
  {
    key: "userbenchmark",
    name: "UserBenchmark",
    url: "https://www.userbenchmark.com",
    robotsUrl: "https://www.userbenchmark.com/robots.txt",
  },
];

const gameQueryAliases = new Map([
  ["dot-kich", ["CrossFire"]],
  ["grand-theft-auto-v", ["GTA 5", "Grand Theft Auto V"]],
  ["lien-minh-huyen-thoai", ["League of Legends"]],
  ["minecraft", ["Minecraft"]],
  ["pubg-battlegrounds", ["PUBG Battlegrounds", "PlayerUnknown's Battlegrounds"]],
  ["roblox", ["Roblox"]],
  ["the-witcher-3", ["The Witcher 3"]],
]);

const gameNameAliases = new Map([
  ["gta 5", "grand-theft-auto-v"],
  ["grand theft auto v", "grand-theft-auto-v"],
  ["league of legends", "lien-minh-huyen-thoai"],
  ["playerunknowns battlegrounds", "pubg-battlegrounds"],
  ["pubg battlegrounds", "pubg-battlegrounds"],
  ["the witcher 3 wild hunt", "the-witcher-3"],
]);

async function main() {
  const games = await readJson(gamesPath, []);
  const gpus = await readJson(gpusPath, []);
  const existingSamples = await readJson(samplesPath, []);

  const statuses = [];
  const pcgbResult = await importPcGameBenchmark(games, gpus);
  statuses.push(pcgbResult.status);

  statuses.push(await inspectHowManyFps());
  statuses.push(await inspectPcBuilds());
  statuses.push(await inspectUserBenchmark());

  const merged = mergeSamples(existingSamples, pcgbResult.samples);
  await writeJson(samplesPath, merged);
  await writeJson(statusPath, statuses);
  await writeJson(summaryPath, {
    updatedAt: new Date().toISOString(),
    totalSamples: merged.length,
    addedSamples: merged.length - existingSamples.length,
    sourceStatuses: statuses.map((item) => ({ key: item.key, status: item.status, recordsImported: item.recordsImported, recordsDiscovered: item.recordsDiscovered ?? 0 })),
  });

  console.log(`External FPS import complete. Total samples: ${merged.length}. Added: ${merged.length - existingSamples.length}.`);
  for (const status of statuses) {
    console.log(`${status.name}: ${status.status}, imported=${status.recordsImported}, discovered=${status.recordsDiscovered ?? 0}`);
  }
}

async function importPcGameBenchmark(games, gpus) {
  const source = sourceDefinitions.find((item) => item.key === "pcgamebenchmark");
  const checkedAt = new Date().toISOString();
  const notes = [];
  const samples = [];

  try {
    const robots = await fetchText(source.robotsUrl);
    if (isDisallowAll(robots)) {
      return {
        samples,
        status: status(source, "disabled", checkedAt, 0, 0, ["robots.txt disallows all user agents."]),
      };
    }

    const candidates = buildPcGameBenchmarkQueries(games);
    const selectedCandidates = MAX_GAMES > 0 ? candidates.slice(0, MAX_GAMES) : candidates;
    const urls = ["https://www.pcgamebenchmark.com/fps-calculator"].concat(
      selectedCandidates.map((item) => `https://www.pcgamebenchmark.com/fps-calculator?game=${encodeURIComponent(item.query)}`),
    );

    let queried = 0;
    for (const url of urls) {
      try {
        const html = await fetchText(url);
        queried += 1;
        for (const row of parsePcGameBenchmarkRows(html, url, games, gpus)) samples.push(row);
        await sleep(DEFAULT_DELAY_MS);
      } catch (error) {
        notes.push(`Skipped ${url}: ${messageOf(error)}`);
      }
    }

    const uniqueSamples = uniqueBy(samples, (item) => item.id);
    notes.unshift(`Queried ${queried}/${urls.length} public FPS calculator pages.`);
    notes.unshift("Rows are stored as external samples for admin review; values are normalized by sorting min/avg/max columns.");
    return {
      samples: uniqueSamples,
      status: status(source, uniqueSamples.length ? "imported" : "partial", checkedAt, uniqueSamples.length, uniqueSamples.length, notes.slice(0, 8)),
    };
  } catch (error) {
    return {
      samples,
      status: status(source, "error", checkedAt, 0, 0, [messageOf(error)]),
    };
  }
}

async function inspectHowManyFps() {
  const source = sourceDefinitions.find((item) => item.key === "howmanyfps");
  const checkedAt = new Date().toISOString();
  const notes = [];
  let discovered = 0;

  try {
    const robots = await fetchText(source.robotsUrl);
    if (isDisallowAll(robots)) return status(source, "disabled", checkedAt, 0, 0, ["robots.txt disallows all user agents."]);

    try {
      const sitemap = await fetchText(source.sitemapUrl);
      discovered = [...sitemap.matchAll(/<loc>(https:\/\/howmanyfps\.com\/benchmarks\/[^<]+)<\/loc>/gi)].length;
      notes.push(`Public sitemap exposes ${discovered} benchmark URLs.`);
    } catch (error) {
      notes.push(`Could not read sitemap: ${messageOf(error)}`);
    }

    const probe = await fetchRaw(source.url);
    if (probe.status === 403 || /Just a moment|Enable JavaScript and cookies/i.test(probe.text)) {
      notes.push("Benchmark pages currently require browser verification, so importer did not bypass Cloudflare.");
      return status(source, "blocked", checkedAt, 0, discovered, notes);
    }

    notes.push("Public benchmark page is reachable, but a detailed parser is not enabled yet.");
    return status(source, "partial", checkedAt, 0, discovered, notes);
  } catch (error) {
    return status(source, "error", checkedAt, 0, discovered, [messageOf(error)]);
  }
}

async function inspectPcBuilds() {
  const source = sourceDefinitions.find((item) => item.key === "pc-builds");
  const checkedAt = new Date().toISOString();

  try {
    const robots = await fetchText(source.robotsUrl);
    if (isDisallowAll(robots)) return status(source, "disabled", checkedAt, 0, 0, ["robots.txt disallows all user agents."]);

    const probe = await fetchRaw(source.url);
    if (probe.status === 403 || /Just a moment|Enable JavaScript and cookies/i.test(probe.text)) {
      return status(source, "blocked", checkedAt, 0, 0, [
        "robots.txt allows public pages, but FPS calculator is behind browser verification.",
        "Importer did not attempt to bypass Cloudflare.",
      ]);
    }

    return status(source, "partial", checkedAt, 0, 0, ["Public calculator page is reachable, but a parser is not enabled yet."]);
  } catch (error) {
    return status(source, "error", checkedAt, 0, 0, [messageOf(error)]);
  }
}

async function inspectUserBenchmark() {
  const source = sourceDefinitions.find((item) => item.key === "userbenchmark");
  const checkedAt = new Date().toISOString();

  try {
    const robots = await fetchText(source.robotsUrl);
    if (isDisallowAll(robots)) {
      return status(source, "disabled", checkedAt, 0, 0, [
        "robots.txt contains Disallow: / for User-agent: *.",
        "Direct scraping is disabled. Use an owned/exported CSV/JSON if you want to import this data.",
      ]);
    }

    return status(source, "partial", checkedAt, 0, 0, ["robots.txt does not disallow all, but no UserBenchmark parser is enabled."]);
  } catch (error) {
    return status(source, "error", checkedAt, 0, 0, [messageOf(error)]);
  }
}

function parsePcGameBenchmarkRows(html, sourceUrl, games, gpus) {
  const table = html.match(/<table[\s\S]*?<\/table>/i)?.[0];
  if (!table) return [];
  const rows = [...table.matchAll(/<tr[\s\S]*?<\/tr>/gi)].slice(1);
  const parsed = [];

  for (const rowMatch of rows) {
    const rowHtml = rowMatch[0];
    const cells = [...rowHtml.matchAll(/<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi)].map((match) => match[1]);
    if (cells.length < 7) continue;

    const gameName = stripHtml(cells[0]);
    const cpuName = stripHtml(cells[1]);
    const gpuName = stripHtml(cells[2]);
    const ramGb = numberFromText(stripHtml(cells[3]));
    const fpsValues = [numberFromText(stripHtml(cells[4])), numberFromText(stripHtml(cells[5])), numberFromText(stripHtml(cells[6]))]
      .filter((value) => Number.isFinite(value) && value > 0)
      .map((value) => Math.round(value));
    if (!gameName || !gpuName || fpsValues.length < 2) continue;

    const sortedFps = [...fpsValues].sort((a, b) => a - b);
    const fpsLow = sortedFps[0];
    const fpsAverage = sortedFps[Math.floor(sortedFps.length / 2)];
    const fpsHigh = sortedFps[sortedFps.length - 1];
    if (fpsAverage < 3 || fpsAverage > 360) continue;

    const gameSlug = findGameSlug(gameName, games);
    const gpuSlug = findGpuSlug(gpuName, rowHtml, gpus);
    const confidence = gameSlug && gpuSlug ? "matched" : gameSlug || gpuSlug ? "partial" : "raw";
    const id = stableId(["pcgamebenchmark", gameSlug ?? normalizeSlug(gameName), gpuSlug ?? normalizeSlug(gpuName), normalizeSlug(cpuName), ramGb ?? "", fpsLow, fpsAverage, fpsHigh]);

    parsed.push({
      id,
      source: "pcgamebenchmark",
      sourceName: "PCGameBenchmark",
      sourceUrl,
      gameName,
      gameSlug,
      cpuName,
      gpuName,
      gpuSlug,
      ramGb,
      fpsLow,
      fpsAverage,
      fpsHigh,
      normalizedFps: fpsAverage,
      confidence,
      importedAt: new Date().toISOString(),
    });
  }

  return parsed;
}

function buildPcGameBenchmarkQueries(games) {
  const priority = new Set([
    "counter-strike-2",
    "valorant",
    "minecraft",
    "roblox",
    "fortnite",
    "grand-theft-auto-v",
    "cyberpunk-2077",
    "red-dead-redemption-2",
    "elden-ring",
    "baldur-s-gate-3",
    "pubg-battlegrounds",
    "marvel-rivals",
    "apex-legends",
  ]);

  return games
    .flatMap((game) => {
      const queries = gameQueryAliases.get(game.slug) ?? [game.name];
      return queries.map((query) => ({ slug: game.slug, query, priority: priority.has(game.slug) ? 0 : 1 }));
    })
    .sort((a, b) => a.priority - b.priority || a.query.localeCompare(b.query, "en"));
}

function findGameSlug(gameName, games) {
  const key = normalizeKey(gameName);
  if (gameNameAliases.has(key)) return gameNameAliases.get(key);
  const match = games.find((game) => normalizeKey(game.name) === key || normalizeSlug(game.name) === normalizeSlug(gameName));
  return match?.slug ?? null;
}

function findGpuSlug(gpuName, rowHtml, gpus) {
  const hrefSlug = rowHtml.match(/href=["']\/gpu\/([^"']+)["']/i)?.[1];
  const candidates = unique([gpuName, hrefSlug, hrefSlug ? hrefSlug.replace(/-/g, " ") : ""]);
  for (const candidate of candidates) {
    const match = findGpuByName(candidate, gpus);
    if (match) return match.slug;
  }
  return null;
}

function findGpuByName(name, gpus) {
  const key = normalizeHardwareName(name);
  const exactMatches = gpus.filter((gpu) => normalizeHardwareName(gpu.name) === key);
  if (exactMatches.length) {
    const sourceLooksLaptop = /\blaptop\b/i.test(name);
    return exactMatches.find((gpu) => gpu.isLaptop === sourceLooksLaptop) ?? exactMatches.find((gpu) => !gpu.isLaptop) ?? exactMatches[0];
  }

  const keyTokens = new Set(key.split(" ").filter(Boolean));
  const tokenMatches = gpus
    .map((gpu) => ({ gpu, tokens: normalizeHardwareName(gpu.name).split(" ").filter(Boolean) }))
    .filter((item) => item.tokens.length && item.tokens.every((token) => keyTokens.has(token)));
  if (!tokenMatches.length) return undefined;
  tokenMatches.sort((a, b) => b.tokens.length - a.tokens.length || Number(a.gpu.isLaptop) - Number(b.gpu.isLaptop));
  return tokenMatches[0].gpu;
}

function mergeSamples(existingSamples, newSamples) {
  const map = new Map();
  for (const sample of existingSamples) map.set(sample.id, sample);
  for (const sample of newSamples) map.set(sample.id, sample);
  return [...map.values()].sort((a, b) => {
    const sourceDelta = a.source.localeCompare(b.source);
    if (sourceDelta) return sourceDelta;
    const gameDelta = String(a.gameSlug ?? a.gameName).localeCompare(String(b.gameSlug ?? b.gameName));
    if (gameDelta) return gameDelta;
    return b.normalizedFps - a.normalizedFps;
  });
}

async function fetchRaw(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": USER_AGENT,
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });
    const text = await response.text();
    return { status: response.status, ok: response.ok, text };
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchText(url) {
  const response = await fetchRaw(url);
  if (!response.ok) throw new Error(`${response.status} for ${url}`);
  return response.text;
}

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch (error) {
    if (error?.code === "ENOENT") return fallback;
    throw error;
  }
}

async function writeJson(filePath, value) {
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

function status(source, statusValue, checkedAt, recordsImported, recordsDiscovered, notes) {
  return {
    key: source.key,
    name: source.name,
    url: source.url,
    robotsUrl: source.robotsUrl,
    status: statusValue,
    checkedAt,
    recordsImported,
    recordsDiscovered,
    notes,
  };
}

function isDisallowAll(robotsText) {
  const starBlock = robotsText
    .split(/\n(?=User-agent:)/i)
    .find((block) => /User-agent:\s*\*/i.test(block));
  return Boolean(starBlock && /Disallow:\s*\/\s*(?:\r?\n|$)/i.test(starBlock));
}

function stripHtml(value) {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function decodeHtml(value) {
  return String(value || "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function numberFromText(value) {
  const match = String(value).replace(/,/g, "").match(/-?\d+(?:\.\d+)?/);
  return match ? Number(match[0]) : Number.NaN;
}

function normalizeKey(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeSlug(value) {
  return normalizeKey(value).replace(/\s+/g, "-");
}

function normalizeHardwareName(value) {
  return normalizeKey(value)
    .replace(/\b(nvidia|amd|radeon|geforce|intel|graphics|gpu|cpu|tm)\b/g, " ")
    .replace(/\b(laptop|desktop)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stableId(parts) {
  return parts.map((part) => normalizeSlug(String(part))).join(":").slice(0, 220);
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function uniqueBy(values, getKey) {
  const map = new Map();
  for (const value of values) map.set(getKey(value), value);
  return [...map.values()];
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function messageOf(error) {
  return error instanceof Error ? error.message : String(error);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
