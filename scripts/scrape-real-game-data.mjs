import fs from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();
const GAMES_FILE = path.join(ROOT, "data", "games.json");
const SOURCES_FILE = path.join(ROOT, "data", "game-sources.json");
const STEAM_SEARCH_URL = "https://store.steampowered.com/api/storesearch/";
const STEAM_DETAILS_URL = "https://store.steampowered.com/api/appdetails";

const steamIdOverrides = {
  "counter-strike-2": "730",
  "dota-2": "570",
  "apex-legends": "1172470",
  "pubg-battlegrounds": "578080",
  "grand-theft-auto-v": "271590",
  "red-dead-redemption-2": "1174180",
  "cyberpunk-2077": "1091500",
  "elden-ring": "1245620",
  "the-witcher-3": "292030",
  "hogwarts-legacy": "990080",
  "palworld": "1623730",
  "helldivers-2": "553850",
  "baldur-s-gate-3": "1086940",
  "alan-wake-2": null,
  "assassin-s-creed-valhalla": "2208920",
  "assassin-s-creed-odyssey": "812140",
  "far-cry-6": "2369390",
  "far-cry-5": "552520",
  "forza-horizon-5": "1551360",
  "diablo-iv": "2344520",
  "diablo-iii": null,
  "overwatch-2": "2357570",
  "world-of-tanks": "1407200",
  "war-thunder": "236390",
  "warframe": "230410",
  "lost-ark": "1599340",
  "path-of-exile": "238960",
  "black-desert-online": "582660",
  "team-fortress-2": "440",
  "left-4-dead-2": "550",
  "euro-truck-simulator-2": "227300",
  "ea-sports-fc-24": "2195250",
  "stardew-valley": "413150",
  "terraria": "105600",
  "hollow-knight": "367520",
  "celeste": "504230",
  "hades": "1145360",
  "cuphead": "268910",
  "ori-and-the-will-of-the-wisps": "1057090",
  "cities-skylines": "255710",
  "rocket-league": "252950",
  "mortal-kombat-11": "976310",
  "resident-evil-4-remake": "2050650",
  "phasmophobia": "739630",
  "raft": "648800",
  "ark-survival-evolved": "346110",
  "don-t-starve-together": "322330",
  "civilization-vi": "289070",
  "monster-hunter-rise": "1446780",
  "watch-dogs-2": "447040",
  "control": "870780",
  "metro-exodus": "412020",
  "dying-light-2": "534380",
  "hitman-3": "1659040",
  "tomb-raider": "203160",
  "minecraft": null,
  "valorant": null,
  "fortnite": null,
  "roblox": null,
  "lien-minh-huyen-thoai": null,
  "fifa-online-4": null,
  "dot-kich": null,
  "audition": null,
  "genshin-impact": null,
};

const officialUrlOverrides = {
  "valorant": "https://playvalorant.com/vi-vn/",
  "genshin-impact": "https://genshin.hoyoverse.com/",
  "lien-minh-huyen-thoai": "https://www.leagueoflegends.com/vi-vn/",
  "fortnite": "https://www.fortnite.com/?lang=en-US&language=vietnamese",
  "minecraft": "https://www.minecraft.net/",
  "roblox": "https://www.roblox.com/",
  "fifa-online-4": "https://fo4.garena.vn/",
  "dot-kich": "https://cf.goplay.vn/",
  "audition": "https://au.vtcgame.vn/",
  "alan-wake-2": "https://www.alanwake.com/",
  "diablo-iii": "https://diablo3.blizzard.com/",
};

const freeGameOverrides = new Set([
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

const curatedSpecOverrides = {
  "valorant": {
    minSpecs: { cpuName: "Intel Core 2 Duo E8400 hoặc AMD Athlon 200GE", gpuName: "Intel HD 4000 hoặc AMD Radeon R5 200", ramGb: 4, storageGb: 30 },
    recSpecs: { cpuName: "Intel Core i3-4150 hoặc AMD Ryzen 3 1200 trở lên", gpuName: "NVIDIA GeForce GT 730 hoặc AMD Radeon R7 240 trở lên", ramGb: 4, storageGb: 30 },
  },
  "genshin-impact": {
    minSpecs: { cpuName: "Intel Core i5 thế hệ 4 hoặc tương đương", gpuName: "NVIDIA GeForce GT 1030 hoặc tương đương", ramGb: 8, storageGb: 100 },
    recSpecs: { cpuName: "Intel Core i7 thế hệ 7 hoặc tương đương trở lên", gpuName: "NVIDIA GeForce GTX 1060 6GB trở lên", ramGb: 16, storageGb: 100 },
  },
  "lien-minh-huyen-thoai": {
    minSpecs: { cpuName: "Intel Core i3-530 hoặc AMD A6-3650", gpuName: "NVIDIA GeForce 9600GT hoặc AMD HD 6570", ramGb: 2, storageGb: 16 },
    recSpecs: { cpuName: "Intel Core i5-3300 hoặc AMD Ryzen 3 1200 trở lên", gpuName: "NVIDIA GeForce GTX 560 hoặc AMD Radeon HD 6950 trở lên", ramGb: 4, storageGb: 16 },
  },
  "fortnite": {
    minSpecs: { cpuName: "Intel Core i3-3225 3.3GHz", gpuName: "Intel HD 4000 hoặc AMD Radeon Vega 8", ramGb: 8, storageGb: 50 },
    recSpecs: { cpuName: "Intel Core i5-7300U 3.5GHz hoặc AMD Ryzen 3 3300U trở lên", gpuName: "NVIDIA GTX 960, AMD R9 280 hoặc DX11 GPU tương đương", ramGb: 16, storageGb: 50 },
  },
  "minecraft": {
    minSpecs: { cpuName: "Intel Core i3-3210 hoặc AMD A8-7600", gpuName: "Intel HD 4000 hoặc AMD Radeon R5", ramGb: 4, storageGb: 4 },
    recSpecs: { cpuName: "Intel Core i5-4690 hoặc AMD A10-7800 trở lên", gpuName: "NVIDIA GeForce 700 Series hoặc AMD Radeon Rx 200 Series trở lên", ramGb: 8, storageGb: 4 },
  },
  "roblox": {
    minSpecs: { cpuName: "CPU 1.6GHz sản xuất từ năm 2005 trở lên", gpuName: "GPU hỗ trợ DirectX 10 trở lên", ramGb: 1, storageGb: 2 },
    recSpecs: { cpuName: "Intel Core i3 hoặc AMD Ryzen 3 trở lên", gpuName: "Intel UHD 620 hoặc GPU rời phổ thông trở lên", ramGb: 4, storageGb: 2 },
  },
  "fifa-online-4": {
    minSpecs: { cpuName: "Intel Core i3-2100 3.1GHz", gpuName: "NVIDIA GeForce GT 730 hoặc AMD Radeon HD 7570", ramGb: 4, storageGb: 20 },
    recSpecs: { cpuName: "Intel Core i5-2550 3.4GHz trở lên", gpuName: "NVIDIA GeForce GTX 460 hoặc AMD Radeon HD 6870 trở lên", ramGb: 8, storageGb: 20 },
  },
  "dot-kich": {
    minSpecs: { cpuName: "Intel Pentium 4 2.0GHz", gpuName: "NVIDIA GeForce 6600 hoặc ATI Radeon X1600", ramGb: 2, storageGb: 15 },
    recSpecs: { cpuName: "Intel Core 2 Duo E6600 trở lên", gpuName: "NVIDIA GeForce 8600GT hoặc AMD Radeon HD 2600 trở lên", ramGb: 4, storageGb: 15 },
  },
  "audition": {
    minSpecs: { cpuName: "Intel Pentium 4 2.4GHz", gpuName: "GPU hỗ trợ DirectX 9.0c", ramGb: 2, storageGb: 10 },
    recSpecs: { cpuName: "Intel Core i3 hoặc AMD tương đương trở lên", gpuName: "NVIDIA GeForce GT 730 hoặc Intel UHD 620 trở lên", ramGb: 4, storageGb: 10 },
  },
  "diablo-iii": {
    minSpecs: { cpuName: "Intel Core 2 Duo hoặc AMD Athlon 64 X2", gpuName: "NVIDIA GeForce 8800GT hoặc ATI Radeon HD 2900 XT", ramGb: 4, storageGb: 25 },
    recSpecs: { cpuName: "Intel Core i5 hoặc AMD FX trở lên", gpuName: "NVIDIA GeForce GTX 260 hoặc ATI Radeon HD 4870 trở lên", ramGb: 8, storageGb: 25 },
  },
  "alan-wake-2": {
    minSpecs: { cpuName: "Intel Core i5-7600K hoặc AMD Ryzen 5 1600", gpuName: "NVIDIA RTX 2060 hoặc AMD Radeon RX 6600", ramGb: 16, storageGb: 90 },
    recSpecs: { cpuName: "AMD Ryzen 7 3700X hoặc Intel Core i7-10700K trở lên", gpuName: "NVIDIA RTX 3070 hoặc AMD Radeon RX 6700 XT trở lên", ramGb: 16, storageGb: 90 },
  },
  "starcraft-ii": {
    minSpecs: { cpuName: "Intel Core 2 Duo hoặc AMD Athlon 64 X2 5600+", gpuName: "NVIDIA GeForce 7600 GT hoặc ATI Radeon HD 2600 XT", ramGb: 2, storageGb: 30 },
    recSpecs: { cpuName: "Intel Core i5 hoặc AMD FX Series trở lên", gpuName: "NVIDIA GeForce GTX 650 hoặc AMD Radeon HD 7790 trở lên", ramGb: 4, storageGb: 30 },
  },
};

const genreTranslations = {
  Action: "Hành động",
  Adventure: "Phiêu lưu",
  Casual: "Giải trí nhẹ",
  "Free To Play": "Miễn phí",
  Indie: "Độc lập",
  "Massively Multiplayer": "Nhiều người chơi",
  Racing: "Đua xe",
  RPG: "Nhập vai",
  Simulation: "Mô phỏng",
  Sports: "Thể thao",
  Strategy: "Chiến thuật",
  "Early Access": "Truy cập sớm",
  "Violent": "Hành động bạo lực",
  Gore: "Kinh dị",
  "ua xe": "Đua xe",
  "Đua xe": "Đua xe",
  "Chin thut": "Chiến thuật",
  "Chiến thuật": "Chiến thuật",
  "Sinh tn": "Sinh tồn",
  "Sinh tồn": "Sinh tồn",
  "Th thao": "Thể thao",
  "Thể thao": "Thể thao",
  "M phng": "Mô phỏng",
  "Mô phỏng": "Mô phỏng",
  Offline: "Chơi offline",
  "Co-op": "Phối hợp",
};

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function resolveUrl(baseUrl, value) {
  if (!value) return null;
  try {
    return new URL(value, baseUrl).toString();
  } catch {
    return null;
  }
}

function normalize(value) {
  return String(value)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function stripHtml(value) {
  return String(value || "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|li|ul|ol|div)>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function translateGenre(genre) {
  return genreTranslations[genre] || genre;
}

function buildVietnameseDescription(game, genres) {
  const genreText = genres.length ? genres.slice(0, 3).join(", ").toLowerCase().replace(/\bmoba\b/g, "MOBA").replace(/\bfps\b/g, "FPS") : "giải trí";
  const priceText = game.isFree ? "miễn phí" : "trả phí";
  return `${game.name} là trò chơi ${genreText}, thuộc nhóm ${priceText}. Trang này tổng hợp ảnh chính thức, dung lượng, cấu hình tối thiểu, cấu hình đề xuất và dữ liệu FPS tham khảo để bạn kiểm tra máy trước khi tải hoặc mua trò chơi.`;
}

function hasLikelyEnglishText(value) {
  return /\b(the|and|with|players|gameplay|features|experience|world|battle|official|download|discover|support)\b/i.test(String(value || ""));
}

function localizeGame(game) {
  const genres = (game.genres || []).map(translateGenre);
  const curated = curatedSpecOverrides[game.slug];
  const localized = {
    ...game,
    genres,
    description: buildVietnameseDescription({ ...game, genres }, genres),
    minSpecs: localizeSpecBlock(game.minSpecs),
    recSpecs: localizeSpecBlock(game.recSpecs),
  };
  if (!curated) return localized;
  return {
    ...localized,
    minSpecs: { ...localized.minSpecs, ...curated.minSpecs },
    recSpecs: { ...localized.recSpecs, ...curated.recSpecs },
  };
}

function localizeSpecBlock(specs) {
  return {
    ...specs,
    cpuName: localizeSpecName(specs?.cpuName, "cpu"),
    gpuName: localizeSpecName(specs?.gpuName, "gpu"),
  };
}

function localizeSpecName(value, type) {
  const text = String(value || "").trim();
  const replacements = new Map([
    ["CPU pho thong 4 luong", "CPU phổ thông 4 luồng"],
    ["GPU pho thong", "GPU phổ thông"],
    ["CPU 6 nhan hoac tot hon", "CPU 6 nhân hoặc tốt hơn"],
    ["GPU gaming tam trung", "GPU gaming tầm trung"],
    ["CPU phổ thông 4 luồng", "CPU phổ thông 4 luồng"],
    ["GPU phổ thông", "GPU phổ thông"],
    ["CPU 6 nhân hoặc tốt hơn", "CPU 6 nhân hoặc tốt hơn"],
    ["GPU gaming tầm trung", "GPU gaming tầm trung"],
  ]);
  if (replacements.has(text)) return replacements.get(text);
  if (/\bor higher\b/i.test(text)) return text.replace(/\bor higher\b/gi, "trở lên");

  if (/video card must be/i.test(text)) return "Card đồ họa hỗ trợ DirectX 11, VRAM 1GB trở lên";
  if (/^and operating system$/i.test(text)) return type === "cpu" ? "CPU 64-bit tương thích Windows" : "GPU hỗ trợ DirectX";
  if (/and operating system|processor:/i.test(text)) {
    const processor = text.match(/processor:\s*([^;]+)/i)?.[1]?.trim();
    if (processor) return processor;
  }
  if (/graphics:/i.test(text)) {
    const graphics = text.match(/graphics:\s*([^;]+)/i)?.[1]?.trim();
    if (graphics) return graphics;
  }

  if (!text) return type === "cpu" ? "CPU phổ thông" : "GPU phổ thông";
  return text;
}

function decodeHtmlAttribute(value) {
  return String(value || "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function pickNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Number(match[1]);
  }
  return null;
}

function extractSpecNames(text) {
  const compact = text.replace(/\s+/g, " ");
  const cpu =
    compact.match(/(?:processor|cpu):?\s*([^.;\n]+?)(?:memory|graphics|video|gpu|directx|storage|$)/i)?.[1]?.trim() ||
    null;
  const gpu =
    compact.match(/(?:graphics|video card|gpu):?\s*([^.;\n]+?)(?:directx|network|storage|sound|additional|$)/i)?.[1]?.trim() ||
    null;
  return {
    cpuName: cpu ? cpu.slice(0, 120) : null,
    gpuName: gpu ? gpu.slice(0, 120) : null,
  };
}

function mergeSpec(existing, html) {
  const text = stripHtml(html);
  const ramGb = pickNumber(text, [
    /(\d+(?:\.\d+)?)\s*gb\s*(?:ram|memory)/i,
    /memory:?\s*(\d+(?:\.\d+)?)\s*gb/i,
  ]);
  const storageGb = pickNumber(text, [
    /(\d+(?:\.\d+)?)\s*gb\s*(?:available space|storage|hard drive|hdd|ssd)/i,
    /storage:?\s*(\d+(?:\.\d+)?)\s*gb/i,
  ]);
  const names = extractSpecNames(text);

  return {
    ...existing,
    cpuName: names.cpuName || existing.cpuName,
    gpuName: names.gpuName || existing.gpuName,
    ramGb: ramGb || existing.ramGb,
    storageGb: storageGb || existing.storageGb,
  };
}

async function fetchJson(url, params) {
  const endpoint = new URL(url);
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) endpoint.searchParams.set(key, value);
  }
  const response = await fetch(endpoint, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn data updater (contact: local project)",
      Accept: "application/json",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.json();
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "Maynaychoiduoc.vn data updater (contact: local project)",
      Accept: "text/html",
    },
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  return response.text();
}

function extractOgImage(baseUrl, html) {
  const patterns = [
    /<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["'][^>]*>/i,
    /<meta[^>]+name=["']twitter:image["'][^>]+content=["']([^"']+)["'][^>]*>/i,
    /<meta[^>]+content=["']([^"']+)["'][^>]+name=["']twitter:image["'][^>]*>/i,
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    const image = resolveUrl(baseUrl, decodeHtmlAttribute(match?.[1]));
    if (image) return image;
  }
  return null;
}

async function getOfficialImage(url) {
  const html = await fetchHtml(url);
  return extractOgImage(url, html);
}

async function findSteamAppId(game) {
  if (Object.prototype.hasOwnProperty.call(steamIdOverrides, game.slug)) {
    return steamIdOverrides[game.slug];
  }
  if (game.steamId) return game.steamId;

  const data = await fetchJson(STEAM_SEARCH_URL, {
    term: game.name,
    cc: "vn",
    l: "vietnamese",
  });
  const target = normalize(game.name);
  const match = (data.items || []).find((item) => normalize(item.name) === target) || (data.items || [])[0];
  if (!match) return null;
  return String(match.id);
}

async function getSteamDetails(appid) {
  for (const cc of ["vn", "us", undefined]) {
    const data = await fetchJson(STEAM_DETAILS_URL, {
      appids: appid,
      cc,
      l: "vietnamese",
    });
    const entry = data[String(appid)];
    if (entry?.success && entry.data && entry.data.type === "game") return entry.data;
    await sleep(150);
  }
  return null;
}

function mergeSteamGame(game, appid, details) {
  const minHtml = details.pc_requirements?.minimum || "";
  const recHtml = details.pc_requirements?.recommended || "";
  const finalPrice = normalizeSteamPrice(details.price_overview);
  const isFree = freeGameOverrides.has(game.slug) || Boolean(details.is_free);
  const localizedDescription = stripHtml(details.short_description);
  const genres = Array.isArray(details.genres) && details.genres.length > 0
    ? details.genres.map((genre) => translateGenre(genre.description)).filter(Boolean)
    : game.genres;
  const nextGame = {
    ...game,
    name: details.name || game.name,
    steamId: String(appid),
    genres,
    price: isFree ? 0 : Number.isFinite(finalPrice) ? finalPrice : null,
    isFree,
    coverImage: details.header_image || game.coverImage,
    officialUrl: `https://store.steampowered.com/app/${appid}/`,
    minSpecs: mergeSpec(game.minSpecs, minHtml),
    recSpecs: mergeSpec(game.recSpecs, recHtml || minHtml),
  };

  return {
    ...nextGame,
    description: localizedDescription && !hasLikelyEnglishText(localizedDescription)
      ? localizedDescription
      : buildVietnameseDescription(nextGame, genres),
  };
}

function normalizeSteamPrice(priceOverview) {
  if (!priceOverview) return null;
  const formatted = String(priceOverview.final_formatted || priceOverview.initial_formatted || "");
  const formattedNumber = parseLocalizedPrice(formatted);
  if (Number.isFinite(formattedNumber)) return formattedNumber;

  const raw = Number(priceOverview.final ?? priceOverview.initial);
  if (!Number.isFinite(raw)) return null;

  // Steam stores prices in the smallest unit. For VND this still comes back
  // multiplied by 100, e.g. 99000000 means 990.000₫.
  return Math.round(raw / 100);
}

function parseLocalizedPrice(value) {
  const text = String(value || "").trim();
  if (!text || /free|miễn phí/i.test(text)) return 0;
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return null;
  return Number(digits);
}

async function main() {
  const games = JSON.parse(await fs.readFile(GAMES_FILE, "utf8"));
  const updated = [];
  const sources = [];

  for (const game of games) {
    let nextGame = { ...game };
    let source = {
      slug: game.slug,
      name: game.name,
      source: "manual-seed",
      url: game.officialUrl,
      updatedAt: new Date().toISOString(),
      note: "",
    };

    try {
      const appid = await findSteamAppId(game);
      await sleep(250);

      if (appid) {
        const details = await getSteamDetails(appid);
        await sleep(250);

        if (details) {
          nextGame = mergeSteamGame(game, appid, details);
          source = {
            ...source,
            name: nextGame.name,
            source: "steam-store-api",
            url: nextGame.officialUrl,
            note: "Fetched from Steam Store appdetails with cc=vn and l=english.",
          };
        } else {
          source.note = `Steam app ${appid} was not a valid game response.`;
        }
      } else if (officialUrlOverrides[game.slug]) {
        nextGame.officialUrl = officialUrlOverrides[game.slug];
        const image = await getOfficialImage(nextGame.officialUrl).catch(() => null);
        if (image) nextGame.coverImage = image;
        nextGame.genres = (nextGame.genres || []).map(translateGenre);
        nextGame.description = buildVietnameseDescription(nextGame, nextGame.genres);
        source = {
          ...source,
          source: "official-site",
          url: nextGame.officialUrl,
          note: image
            ? "No Steam app used; official publisher/game site and social preview image recorded."
            : "No Steam app used; official publisher/game site recorded.",
        };
      } else {
        source.note = "No trusted automated source matched; kept existing curated values.";
      }
    } catch (error) {
      source.note = `Fetch failed: ${error instanceof Error ? error.message : String(error)}`;
    }

    nextGame = localizeGame(nextGame);
    updated.push(nextGame);
    sources.push(source);
    console.log(`${nextGame.slug}: ${source.source} ${source.url || ""}`);
  }

  await fs.writeFile(GAMES_FILE, `${JSON.stringify(updated, null, 2)}\n`);
  await fs.writeFile(SOURCES_FILE, `${JSON.stringify(sources, null, 2)}\n`);
  console.log(`Updated ${GAMES_FILE}`);
  console.log(`Wrote ${SOURCES_FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
