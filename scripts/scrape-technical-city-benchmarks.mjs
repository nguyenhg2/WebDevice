import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const gamesPath = path.join(ROOT, "data", "games.json");
const gpusPath = path.join(ROOT, "data", "gpus.json");
const benchmarksPath = path.join(ROOT, "data", "benchmarks.json");
const debugDir = path.join(ROOT, "data", ".technical-city-debug");

const settings = ["Low", "Medium", "High", "Ultra", "Epic"];
const settingAlias = { Low: "Low", Medium: "Medium", High: "High", Ultra: "Ultra", Epic: "Ultra" };
const resolutionMap = new Map([
  ["Full HD", "1080p"],
  ["1440p", "1440p"],
  ["4K", "4k"],
]);

const manualGameAliases = new Map([
  ["Counter-Strike 2", "counter-strike-2"],
  ["Counter Strike 2", "counter-strike-2"],
  ["Counter-Strike: Global Offensive", "counter-strike-2"],
  ["Cyberpunk 2077", "cyberpunk-2077"],
  ["Dota 2", "dota-2"],
  ["DOTA 2", "dota-2"],
  ["EA Sports FC 24", "ea-sports-fc-24"],
  ["Elden Ring", "elden-ring"],
  ["Far Cry 5", "far-cry-5"],
  ["Far Cry 6", "far-cry-6"],
  ["Fortnite", "fortnite"],
  ["Forza Horizon 5", "forza-horizon-5"],
  ["GTA 5", "grand-theft-auto-v"],
  ["GTA V", "grand-theft-auto-v"],
  ["Grand Theft Auto V", "grand-theft-auto-v"],
  ["Metro Exodus", "metro-exodus"],
  ["Playerunknown's Battlegrounds", "pubg-battlegrounds"],
  ["PLAYERUNKNOWN'S BATTLEGROUNDS", "pubg-battlegrounds"],
  ["PUBG", "pubg-battlegrounds"],
  ["PUBG: BATTLEGROUNDS", "pubg-battlegrounds"],
  ["Red Dead Redemption 2", "red-dead-redemption-2"],
  ["Resident Evil 4 Remake", "resident-evil-4-remake"],
  ["Shadow of the Tomb Raider", "shadow-of-the-tomb-raider"],
  ["The Witcher 3", "the-witcher-3"],
  ["The Witcher 3: Wild Hunt", "the-witcher-3"],
  ["Valorant", "valorant"],
]);

const gpuSlugOverrides = new Map([
  ["intel-hd-4000", "HD-Graphics-4000"],
  ["intel-uhd-620", "UHD-Graphics-620"],
  ["intel-iris-xe-graphics", "Iris-Xe-Graphics-G7-96EU"],
  ["amd-radeon-vega-8", "Radeon-RX-Vega-8"],
  ["nvidia-gt-730", "GeForce-GT-730"],
  ["nvidia-gtx-750-ti", "GeForce-GTX-750-Ti"],
  ["nvidia-gtx-950", "GeForce-GTX-950"],
  ["nvidia-gtx-1050", "GeForce-GTX-1050"],
  ["nvidia-gtx-1050-ti", "GeForce-GTX-1050-Ti"],
  ["nvidia-gtx-1060-3gb", "GeForce-GTX-1060-3-GB"],
  ["nvidia-gtx-1060-6gb", "GeForce-GTX-1060-6-GB"],
  ["nvidia-gtx-1650", "GeForce-GTX-1650"],
  ["nvidia-gtx-1650-laptop", "GeForce-GTX-1650-Mobile"],
  ["nvidia-gtx-1660-super", "GeForce-GTX-1660-Super"],
  ["nvidia-gtx-1660-ti", "GeForce-GTX-1660-Ti"],
  ["nvidia-rtx-2050-laptop", "GeForce-RTX-2050-Mobile"],
  ["nvidia-rtx-3050-laptop", "GeForce-RTX-3050-Mobile"],
  ["nvidia-rtx-3050", "GeForce-RTX-3050"],
  ["nvidia-rtx-3060-laptop", "GeForce-RTX-3060-Laptop-GPU"],
  ["nvidia-rtx-3060", "GeForce-RTX-3060"],
  ["nvidia-rtx-4060-laptop", "GeForce-RTX-4060-Laptop-GPU"],
  ["nvidia-rtx-4060", "GeForce-RTX-4060"],
  ["nvidia-rtx-3070", "GeForce-RTX-3070"],
  ["nvidia-rtx-4070", "GeForce-RTX-4070"],
  ["nvidia-rtx-4080", "GeForce-RTX-4080"],
  ["amd-radeon-rx-550", "Radeon-RX-550"],
  ["amd-radeon-rx-560", "Radeon-RX-560"],
  ["amd-radeon-rx-570", "Radeon-RX-570"],
  ["amd-radeon-rx-580", "Radeon-RX-580"],
  ["amd-radeon-rx-5500-xt", "Radeon-RX-5500-XT"],
  ["amd-radeon-rx-5600-xt", "Radeon-RX-5600-XT"],
  ["amd-radeon-rx-6600", "Radeon-RX-6600"],
  ["amd-radeon-rx-6650-xt", "Radeon-RX-6650-XT"],
  ["amd-radeon-rx-6700-xt", "Radeon-RX-6700-XT"],
  ["amd-radeon-rx-7600", "Radeon-RX-7600"],
]);

const nanoReviewGpuSlugOverrides = new Map([
  ["intel-hd-4000", "hd-graphics-4000"],
  ["intel-uhd-620", "uhd-graphics-620"],
  ["intel-iris-xe-graphics", "iris-xe-graphics-g7-96eu"],
  ["amd-radeon-vega-8", "radeon-rx-vega-8"],
  ["nvidia-gt-730", "geforce-gt-730"],
  ["nvidia-gtx-750-ti", "geforce-gtx-750-ti"],
  ["nvidia-gtx-950", "geforce-gtx-950"],
  ["nvidia-gtx-1050", "geforce-gtx-1050"],
  ["nvidia-gtx-1050-ti", "geforce-gtx-1050-ti"],
  ["nvidia-gtx-1060-3gb", "geforce-gtx-1060-3-gb"],
  ["nvidia-gtx-1060-6gb", "geforce-gtx-1060-6-gb"],
  ["nvidia-gtx-1650", "geforce-gtx-1650"],
  ["nvidia-gtx-1650-laptop", "geforce-gtx-1650-mobile"],
  ["nvidia-gtx-1660-super", "geforce-gtx-1660-super"],
  ["nvidia-gtx-1660-ti", "geforce-gtx-1660-ti"],
  ["nvidia-rtx-2050-laptop", "geforce-rtx-2050-mobile"],
  ["nvidia-rtx-3050-laptop", "geforce-rtx-3050-mobile"],
  ["nvidia-rtx-3050", "geforce-rtx-3050"],
  ["nvidia-rtx-3060-laptop", "geforce-rtx-3060-mobile"],
  ["nvidia-rtx-3060", "geforce-rtx-3060"],
  ["nvidia-rtx-4060-laptop", "geforce-rtx-4060-mobile"],
  ["nvidia-rtx-4060", "geforce-rtx-4060"],
  ["nvidia-rtx-3070", "geforce-rtx-3070"],
  ["nvidia-rtx-4070", "geforce-rtx-4070"],
  ["nvidia-rtx-4080", "geforce-rtx-4080"],
  ["amd-radeon-rx-550", "radeon-rx-550"],
  ["amd-radeon-rx-560", "radeon-rx-560"],
  ["amd-radeon-rx-570", "radeon-rx-570"],
  ["amd-radeon-rx-580", "radeon-rx-580"],
  ["amd-radeon-rx-5500-xt", "radeon-rx-5500-xt"],
  ["amd-radeon-rx-5600-xt", "radeon-rx-5600-xt"],
  ["amd-radeon-rx-6600", "radeon-rx-6600"],
  ["amd-radeon-rx-6650-xt", "radeon-rx-6650-xt"],
  ["amd-radeon-rx-6700-xt", "radeon-rx-6700-xt"],
  ["amd-radeon-rx-7600", "radeon-rx-7600"],
]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function decodeHtml(value) {
  return String(value)
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

function plainTextFromHtml(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pageToLines(html) {
  return decodeHtml(html)
    .replace(/<script[\s\S]*?<\/script>/gi, "\n")
    .replace(/<style[\s\S]*?<\/style>/gi, "\n")
    .replace(/<\/(h[1-6]|p|li|tr|td|th|div|section)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function parseFps(value) {
  const range = value.match(/^(\d+)\s*[\u2212-]\s*(\d+)$/);
  if (range) return Math.round((Number(range[1]) + Number(range[2])) / 2);
  const single = value.match(/^(\d+)$/);
  return single ? Number(single[1]) : null;
}

function cleanGameName(value) {
  return String(value)
    .replace(/[\u2122\u00ae]/g, "")
    .replace(/ Legacy|: Definitive Edition|: Anniversary Edition| - GOTY Edition|: Reloaded Edition| Ultimate Edition| Game of the Year| Definitive Edition/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

function buildGameAliases(games) {
  const aliases = [];
  const gameSlugSet = new Set(games.map((game) => game.slug));

  for (const game of games) {
    aliases.push([game.name, game.slug]);
    aliases.push([cleanGameName(game.name), game.slug]);
  }

  for (const alias of manualGameAliases) {
    if (gameSlugSet.has(alias[1])) aliases.push(alias);
  }

  return [...new Map(
    aliases
      .filter(([name, slug]) => name && name.length >= 3 && gameSlugSet.has(slug))
      .map(([name, slug]) => [name.toLowerCase(), [name, slug]]),
  ).values()].sort((a, b) => b[0].length - a[0].length);
}

function sectionBetween(text, startPattern, endPatterns) {
  const start = text.search(startPattern);
  if (start < 0) return "";
  const rest = text.slice(start);
  const endIndexes = endPatterns.map((pattern) => rest.search(pattern)).filter((index) => index > 0);
  const end = endIndexes.length ? Math.min(...endIndexes) : rest.length;
  return rest.slice(0, end);
}

function extractFpsForAliases(text, aliases) {
  const rows = [];
  for (const [title, gameSlug] of aliases) {
    const pattern = new RegExp(`(?:^|\\s)${escapeRegex(title)}\\s+(\\d+(?:\\s*[\\u2212-]\\s*\\d+)?)\\b`, "gi");
    for (const match of text.matchAll(pattern)) {
      const fps = parseFps(match[1].replace(/\s+/g, ""));
      if (fps) rows.push({ gameSlug, fps });
    }
  }
  return rows;
}

function parseBenchmarks(html, games) {
  const aliases = buildGameAliases(games);
  const rows = parseBenchmarksFromLines(html, aliases);
  if (rows.length) return rows;
  return parseBenchmarksFromPlainText(html, aliases);
}

function parseNanoReviewBenchmarks(html, games) {
  const gameSlugByTitle = new Map(buildGameAliases(games).map(([title, slug]) => [title.toLowerCase(), slug]));
  const rows = [];
  const jsonBlocks = [
    ...html.matchAll(/<script[^>]+id=["']__NEXT_DATA__["'][^>]*>([\s\S]*?)<\/script>/gi),
    ...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi),
    ...html.matchAll(/<script[^>]*>([\s\S]*?"fps"[\s\S]*?)<\/script>/gi),
  ].map((match) => decodeHtml(match[1]));

  for (const block of jsonBlocks) {
    try {
      collectNanoReviewRows(JSON.parse(block), rows, gameSlugByTitle);
    } catch {
      collectNanoReviewTextRows(block, rows, gameSlugByTitle);
    }
  }

  if (!rows.length) collectNanoReviewTextRows(plainTextFromHtml(html), rows, gameSlugByTitle);
  return rows;
}

function collectNanoReviewRows(value, rows, gameSlugByTitle) {
  if (!value || typeof value !== "object") return;
  if (Array.isArray(value)) {
    for (const item of value) collectNanoReviewRows(item, rows, gameSlugByTitle);
    return;
  }

  const title = value.game || value.gameName || value.title || value.name;
  const normalizedTitle = typeof title === "string" ? cleanGameName(title).toLowerCase() : "";
  const gameSlug = gameSlugByTitle.get(normalizedTitle);
  if (gameSlug) {
    addNanoReviewFps(rows, gameSlug, value);
  }

  for (const nested of Object.values(value)) collectNanoReviewRows(nested, rows, gameSlugByTitle);
}

function addNanoReviewFps(rows, gameSlug, value) {
  const candidates = [
    ["1080p", "High", value.fullHdHigh ?? value.fhdHigh ?? value.high1080p ?? value.avgFps1080pHigh],
    ["1080p", "Ultra", value.fullHdUltra ?? value.fhdUltra ?? value.ultra1080p ?? value.avgFps1080pUltra],
    ["1440p", "Ultra", value.qhdUltra ?? value.ultra1440p ?? value.avgFps1440pUltra],
    ["4k", "Ultra", value.uhdUltra ?? value.ultra4k ?? value.avgFps4kUltra],
  ];

  for (const [resolution, setting, rawFps] of candidates) {
    const fps = Number(rawFps);
    if (Number.isFinite(fps) && fps > 0) rows.push({ gameSlug, resolution, setting, fps: Math.round(fps) });
  }
}

function collectNanoReviewTextRows(text, rows, gameSlugByTitle) {
  for (const [title, gameSlug] of gameSlugByTitle) {
    const titlePattern = escapeRegex(title);
    const nearby = new RegExp(`${titlePattern}[\\s\\S]{0,900}`, "gi");
    for (const match of text.matchAll(nearby)) {
      const chunk = match[0];
      const candidates = [
        ["1080p", "High", /(?:fullHdHigh|fhdHigh|high1080p|1080p[^0-9]{0,80}High)["':\s]+(\d+)/i],
        ["1080p", "Ultra", /(?:fullHdUltra|fhdUltra|ultra1080p|1080p[^0-9]{0,80}Ultra)["':\s]+(\d+)/i],
        ["1440p", "Ultra", /(?:qhdUltra|ultra1440p|1440p[^0-9]{0,80}Ultra)["':\s]+(\d+)/i],
        ["4k", "Ultra", /(?:uhdUltra|ultra4k|4K[^0-9]{0,80}Ultra)["':\s]+(\d+)/i],
      ];
      for (const [resolution, setting, pattern] of candidates) {
        const fps = Number(chunk.match(pattern)?.[1]);
        if (Number.isFinite(fps) && fps > 0) rows.push({ gameSlug, resolution, setting, fps });
      }
    }
  }
}

function parseBenchmarksFromLines(html, aliases) {
  const lines = pageToLines(html);
  const rows = [];
  let inGaming = false;
  let resolution = "";
  let setting = "";

  for (const line of lines) {
    if (/fps performance in popular games/i.test(line)) {
      inGaming = true;
      continue;
    }
    if (!inGaming) continue;
    if (/^(Closest competitors|AMD equivalent|Similar GPUs|Mining hashrates|Other GPUs)$/i.test(line)) break;
    if (resolutionMap.has(line)) {
      resolution = resolutionMap.get(line);
      continue;
    }
    if (settings.includes(line)) {
      setting = settingAlias[line];
      continue;
    }
    if (!resolution || !setting) continue;

    for (const parsed of extractFpsForAliases(line, aliases)) {
      rows.push({ gameSlug: parsed.gameSlug, resolution, setting, fps: parsed.fps });
    }
  }

  return rows;
}

function parseBenchmarksFromPlainText(html, aliases) {
  const text = plainTextFromHtml(html);
  const gamingText = sectionBetween(
    text,
    /FPS performance in popular games/i,
    [/Closest competitors/i, /AMD equivalent/i, /Similar GPUs/i, /Mining hashrates/i, /Other GPUs/i],
  );
  const rows = [];
  if (!gamingText) return rows;

  for (const [resolutionLabel, mappedResolution] of resolutionMap) {
    const otherResolutionPatterns = [...resolutionMap.keys()]
      .filter((label) => label !== resolutionLabel)
      .map((label) => new RegExp(`\\b${escapeRegex(label)}\\b`, "i"));
    const resolutionText = sectionBetween(gamingText, new RegExp(`\\b${escapeRegex(resolutionLabel)}\\b`, "i"), otherResolutionPatterns);
    if (!resolutionText) continue;

    for (const rawSetting of settings) {
      const otherSettingPatterns = settings
        .filter((item) => item !== rawSetting)
        .map((item) => new RegExp(`\\b${escapeRegex(item)}\\b`, "i"));
      const settingText = sectionBetween(resolutionText, new RegExp(`\\b${escapeRegex(rawSetting)}\\b`, "i"), otherSettingPatterns);
      if (!settingText) continue;

      for (const parsed of extractFpsForAliases(settingText, aliases)) {
        rows.push({ gameSlug: parsed.gameSlug, resolution: mappedResolution, setting: settingAlias[rawSetting], fps: parsed.fps });
      }
    }
  }

  return rows;
}

function fpsForRecommendedSetting(row) {
  if (row.recommendedSetting === "Ultra") return row.fpsUltra;
  if (row.recommendedSetting === "High") return row.fpsHigh;
  if (row.recommendedSetting === "Medium") return row.fpsMedium;
  return row.fpsLow;
}

function recommendedSetting(row) {
  if (row.fpsUltra > 0) return "Ultra";
  if (row.fpsHigh > 0) return "High";
  if (row.fpsMedium > 0) return "Medium";
  if (row.fpsLow > 0) return "Low";
  return "Low";
}

function rowStatus(row) {
  const fps = fpsForRecommendedSetting(row);
  if (fps >= 55 && (row.recommendedSetting === "High" || row.recommendedSetting === "Ultra")) return "smooth";
  if (fps >= 30) return "playable";
  return "not_recommended";
}

async function fetchGpuPage(technicalSlug) {
  const url = `https://technical.city/en/video/${technicalSlug}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn benchmark importer (local project; source attribution retained)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return { url, html: await response.text() };
}

async function fetchNanoReviewGpuPage(nanoReviewSlug) {
  const url = `https://nanoreview.net/en/gpu/${nanoReviewSlug}`;
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn benchmark importer (local project; source attribution retained)",
      "Accept-Language": "en-US,en;q=0.9",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return { url, html: await response.text() };
}

function mergeBenchmarkRow(byKey, parsed, gpuSlug, url, source) {
  const key = `${parsed.gameSlug}|${gpuSlug}|${parsed.resolution}`;
  const row = byKey.get(key) ?? {
    gameSlug: parsed.gameSlug,
    gpuSlug,
    resolution: parsed.resolution,
    fpsLow: 0,
    fpsMedium: 0,
    fpsHigh: 0,
    fpsUltra: 0,
    recommendedSetting: "Low",
    status: "not_recommended",
    videoTestUrl: url,
    source,
  };
  row[`fps${parsed.setting}`] = parsed.fps;
  row.recommendedSetting = recommendedSetting(row);
  row.status = rowStatus(row);
  row.videoTestUrl = row.videoTestUrl ?? url;
  row.source = row.source === source || row.source.includes(source) ? row.source : `${row.source}; ${source}`;
  byKey.set(key, row);
}

async function main() {
  const [games, gpus] = await Promise.all([
    fs.readFile(gamesPath, "utf8").then(JSON.parse),
    fs.readFile(gpusPath, "utf8").then(JSON.parse),
  ]);
  const byKey = new Map();
  const failures = [];
  const emptyPages = [];

  for (const gpu of gpus) {
    const technicalSlug = gpuSlugOverrides.get(gpu.slug);
    if (technicalSlug) {
      try {
        const { url, html } = await fetchGpuPage(technicalSlug);
        const rows = parseBenchmarks(html, games);
        if (rows.length === 0) emptyPages.push({ slug: gpu.slug, html });
        for (const parsed of rows) {
          mergeBenchmarkRow(byKey, parsed, gpu.slug, url, "Technical.city, gaming benchmarks credited to Notebookcheck");
        }
        console.log(`${gpu.name} Technical.city: ${rows.length} FPS entries`);
      } catch (error) {
        failures.push(`${gpu.name} Technical.city: ${error instanceof Error ? error.message : String(error)}`);
        console.warn(`Failed ${gpu.name} Technical.city:`, error instanceof Error ? error.message : error);
      }
      await sleep(600);
    }

    const nanoReviewSlug = nanoReviewGpuSlugOverrides.get(gpu.slug);
    if (nanoReviewSlug) {
      try {
        const { url, html } = await fetchNanoReviewGpuPage(nanoReviewSlug);
        const rows = parseNanoReviewBenchmarks(html, games);
        for (const parsed of rows) {
          mergeBenchmarkRow(byKey, parsed, gpu.slug, url, "NanoReview game FPS database");
        }
        console.log(`${gpu.name} NanoReview: ${rows.length} FPS entries`);
      } catch (error) {
        failures.push(`${gpu.name} NanoReview: ${error instanceof Error ? error.message : String(error)}`);
        console.warn(`Failed ${gpu.name} NanoReview:`, error instanceof Error ? error.message : error);
      }
      await sleep(600);
    }
  }

  const benchmarks = [...byKey.values()].sort((a, b) =>
    a.gameSlug.localeCompare(b.gameSlug) ||
    a.gpuSlug.localeCompare(b.gpuSlug) ||
    a.resolution.localeCompare(b.resolution),
  );

  if (benchmarks.length === 0) {
    if (emptyPages.length) {
      await fs.mkdir(debugDir, { recursive: true });
      for (const page of emptyPages.slice(0, 3)) {
        const text = pageToLines(page.html).join("\n").slice(0, 40000);
        await fs.writeFile(path.join(debugDir, `${page.slug}.txt`), text, "utf8");
      }
      console.log(`Saved parser debug text to ${path.relative(ROOT, debugDir)}`);
    }
    throw new Error("No benchmark rows were scraped; keeping existing data untouched.");
  }

  await fs.writeFile(benchmarksPath, `${JSON.stringify(benchmarks, null, 2)}\n`, "utf8");
  console.log(`Wrote ${benchmarks.length} real benchmark rows.`);
  if (failures.length) console.log(`Failures:\n${failures.join("\n")}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
