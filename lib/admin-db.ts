import { Client, type Client as PgClient } from "pg";

export type AdminCollection = "game" | "gpu" | "cpu" | "device" | "benchmark" | "blogPost";

const idFromSlug = (prefix: string, slug: string) => `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_")}`.slice(0, 120);
const connectionErrorCodes = new Set(["ENOTFOUND", "EAI_AGAIN", "ETIMEDOUT", "ECONNREFUSED", "EACCES", "ENETUNREACH"]);

async function withClient<T>(fn: (client: PgClient) => Promise<T>) {
  const connectionString = databaseUrl();
  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 8000,
  });

  try {
    await client.connect();
  } catch (error) {
    throw adminDbError(error);
  }

  try {
    return await fn(client);
  } catch (error) {
    throw adminDbError(error);
  } finally {
    await client.end();
  }
}

function databaseUrl() {
  const value = process.env.ADMIN_DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || process.env.DATABASE_URL;
  if (!value) throw new Error("Chưa cấu hình DATABASE_URL hoặc ADMIN_DATABASE_URL.");
  return value;
}

function adminDbError(error: unknown) {
  if (isConnectionError(error)) {
    return new Error("Không kết nối được Supabase/Postgres. Hãy kiểm tra DATABASE_URL hoặc dùng Supabase pooler IPv4 trong ADMIN_DATABASE_URL.");
  }
  return error instanceof Error ? error : new Error(String(error));
}

function isConnectionError(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String((error as { code?: unknown }).code) : "";
  const message = error instanceof Error ? error.message : String(error);
  return connectionErrorCodes.has(code) || /getaddrinfo|ENOTFOUND|EAI_AGAIN|timeout|network|tenant\/user|Tenant or user/i.test(message);
}

async function upsertGame(client: PgClient, game: any) {
  await client.query(
    `INSERT INTO "Game" ("id","name","slug","steamId","genres","sizeGb","price","isFree","description","coverImage","officialUrl","minSpecs","recSpecs","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,NOW())
     ON CONFLICT ("slug") DO UPDATE SET
     "name"=EXCLUDED."name","steamId"=EXCLUDED."steamId","genres"=EXCLUDED."genres","sizeGb"=EXCLUDED."sizeGb","price"=EXCLUDED."price",
     "isFree"=EXCLUDED."isFree","description"=EXCLUDED."description","coverImage"=EXCLUDED."coverImage","officialUrl"=EXCLUDED."officialUrl",
     "minSpecs"=EXCLUDED."minSpecs","recSpecs"=EXCLUDED."recSpecs","updatedAt"=NOW()`,
    [idFromSlug("game", game.slug), game.name, game.slug, game.steamId ?? null, game.genres ?? [], game.sizeGb ?? 0, game.price ?? null, Boolean(game.isFree), game.description ?? "", game.coverImage ?? null, game.officialUrl ?? null, JSON.stringify(game.minSpecs ?? {}), JSON.stringify(game.recSpecs ?? {})],
  );
}

async function upsertGpu(client: PgClient, gpu: any) {
  await client.query(
    `INSERT INTO "Gpu" ("id","name","slug","brand","benchmarkScore","category","tdp","vram","priceRangeVnd","isLaptop","commonInVietnam")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
     ON CONFLICT ("slug") DO UPDATE SET
     "name"=EXCLUDED."name","brand"=EXCLUDED."brand","benchmarkScore"=EXCLUDED."benchmarkScore","category"=EXCLUDED."category",
     "tdp"=EXCLUDED."tdp","vram"=EXCLUDED."vram","priceRangeVnd"=EXCLUDED."priceRangeVnd","isLaptop"=EXCLUDED."isLaptop","commonInVietnam"=EXCLUDED."commonInVietnam"`,
    [idFromSlug("gpu", gpu.slug), gpu.name, gpu.slug, gpu.brand, gpu.benchmarkScore ?? 0, gpu.category, gpu.tdp ?? null, gpu.vram ?? null, gpu.priceRangeVnd ?? "", Boolean(gpu.isLaptop), Boolean(gpu.commonInVietnam)],
  );
}

async function upsertCpu(client: PgClient, cpu: any) {
  await client.query(
    `INSERT INTO "Cpu" ("id","name","slug","brand","benchmarkScore","cores","threads","generation","socket","integratedGpu","priceRangeVnd","commonInVietnam")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT ("slug") DO UPDATE SET
     "name"=EXCLUDED."name","brand"=EXCLUDED."brand","benchmarkScore"=EXCLUDED."benchmarkScore","cores"=EXCLUDED."cores",
     "threads"=EXCLUDED."threads","generation"=EXCLUDED."generation","socket"=EXCLUDED."socket","integratedGpu"=EXCLUDED."integratedGpu",
     "priceRangeVnd"=EXCLUDED."priceRangeVnd","commonInVietnam"=EXCLUDED."commonInVietnam"`,
    [idFromSlug("cpu", cpu.slug), cpu.name, cpu.slug, cpu.brand, cpu.benchmarkScore ?? 0, cpu.cores ?? 0, cpu.threads ?? 0, cpu.generation ?? "", cpu.socket ?? null, cpu.integratedGpu ?? null, cpu.priceRangeVnd ?? "", Boolean(cpu.commonInVietnam)],
  );
}

async function upsertDevice(client: PgClient, device: any) {
  await client.query(
    `INSERT INTO "Device" ("id","name","slug","type","brand","cpu","gpu","ramGb","storageGb","storageType","screenSize","screenResolution","priceVnd","priceRange","shopeeUrl","tikiUrl","phongvuUrl","gearvnUrl","imageUrl")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
     ON CONFLICT ("slug") DO UPDATE SET
     "name"=EXCLUDED."name","type"=EXCLUDED."type","brand"=EXCLUDED."brand","cpu"=EXCLUDED."cpu","gpu"=EXCLUDED."gpu",
     "ramGb"=EXCLUDED."ramGb","storageGb"=EXCLUDED."storageGb","storageType"=EXCLUDED."storageType","screenSize"=EXCLUDED."screenSize",
     "screenResolution"=EXCLUDED."screenResolution","priceVnd"=EXCLUDED."priceVnd","priceRange"=EXCLUDED."priceRange",
     "shopeeUrl"=EXCLUDED."shopeeUrl","tikiUrl"=EXCLUDED."tikiUrl","phongvuUrl"=EXCLUDED."phongvuUrl","gearvnUrl"=EXCLUDED."gearvnUrl","imageUrl"=EXCLUDED."imageUrl"`,
    [idFromSlug("device", device.slug), device.name, device.slug, device.type, device.brand, device.cpu, device.gpu, device.ramGb ?? 0, device.storageGb ?? 0, device.storageType ?? "SSD", device.screenSize ?? null, device.screenResolution ?? null, device.priceVnd ?? 0, device.priceRange, device.shopeeUrl ?? null, device.tikiUrl ?? null, device.phongvuUrl ?? null, device.gearvnUrl ?? null, device.imageUrl ?? null],
  );
}

async function upsertBenchmark(client: PgClient, benchmark: any) {
  await client.query(
    `INSERT INTO "GameGpuBenchmark" ("id","gameId","gpuId","resolution","fpsLow","fpsMedium","fpsHigh","fpsUltra","recommendedSetting","setting","avgFps","onePercentLow","status","videoTestUrl","source","confidence","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
     ON CONFLICT ("gameId","gpuId","resolution") DO UPDATE SET
     "fpsLow"=EXCLUDED."fpsLow","fpsMedium"=EXCLUDED."fpsMedium","fpsHigh"=EXCLUDED."fpsHigh","fpsUltra"=EXCLUDED."fpsUltra",
     "recommendedSetting"=EXCLUDED."recommendedSetting","setting"=EXCLUDED."setting","avgFps"=EXCLUDED."avgFps","onePercentLow"=EXCLUDED."onePercentLow",
     "status"=EXCLUDED."status","videoTestUrl"=EXCLUDED."videoTestUrl","source"=EXCLUDED."source",
     "confidence"=EXCLUDED."confidence","updatedAt"=EXCLUDED."updatedAt"`,
    [
      idFromSlug("bench", `${benchmark.gameSlug}_${benchmark.gpuSlug}_${benchmark.resolution}`),
      idFromSlug("game", benchmark.gameSlug),
      idFromSlug("gpu", benchmark.gpuSlug),
      benchmark.resolution,
      benchmark.fpsLow ?? 0,
      benchmark.fpsMedium ?? 0,
      benchmark.fpsHigh ?? 0,
      benchmark.fpsUltra ?? 0,
      benchmark.recommendedSetting ?? "Low",
      benchmark.setting ?? benchmark.recommendedSetting ?? "Low",
      benchmark.avgFps ?? (benchmark.fpsUltra || benchmark.fpsHigh || benchmark.fpsMedium || benchmark.fpsLow || 0),
      benchmark.onePercentLow ?? benchmark.fpsLow ?? 0,
      benchmark.status ?? "playable",
      benchmark.videoTestUrl ?? null,
      benchmark.source ?? "Quản trị",
      benchmark.confidence ?? "manual",
      benchmark.updatedAt ?? new Date().toISOString(),
    ],
  );
}

async function upsertBlogPost(client: PgClient, post: any) {
  await client.query(
    `INSERT INTO "BlogPost" ("id","title","slug","content","excerpt","category","tags","metaTitle","metaDescription","publishedAt","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
     ON CONFLICT ("slug") DO UPDATE SET
     "title"=EXCLUDED."title","content"=EXCLUDED."content","excerpt"=EXCLUDED."excerpt","category"=EXCLUDED."category",
     "tags"=EXCLUDED."tags","metaTitle"=EXCLUDED."metaTitle","metaDescription"=EXCLUDED."metaDescription","publishedAt"=EXCLUDED."publishedAt","updatedAt"=NOW()`,
    [idFromSlug("post", post.slug), post.title, post.slug, post.content ?? "", post.excerpt ?? "", post.category, post.tags ?? [], post.metaTitle ?? post.title, post.metaDescription ?? post.excerpt ?? "", post.publishedAt ?? new Date().toISOString()],
  );
}

export async function upsertAdminItems(collection: AdminCollection, payload: unknown) {
  const rows = Array.isArray(payload) ? payload : [payload];
  await withClient(async (client) => {
    for (const row of rows) {
      if (collection === "game") await upsertGame(client, row);
      if (collection === "gpu") await upsertGpu(client, row);
      if (collection === "cpu") await upsertCpu(client, row);
      if (collection === "device") await upsertDevice(client, row);
      if (collection === "benchmark") await upsertBenchmark(client, row);
      if (collection === "blogPost") await upsertBlogPost(client, row);
    }
  });
  return rows.length;
}

const listConfig: Record<AdminCollection, { table: string; columns: string[]; search: string[]; order: string }> = {
  game: { table: "Game", columns: ["name", "slug", "steamId", "genres", "sizeGb", "price", "isFree", "description", "coverImage", "officialUrl", "minSpecs", "recSpecs"], search: ["name", "slug"], order: "name" },
  gpu: { table: "Gpu", columns: ["name", "slug", "brand", "benchmarkScore", "category", "tdp", "vram", "priceRangeVnd", "isLaptop", "commonInVietnam"], search: ["name", "slug", "brand"], order: "name" },
  cpu: { table: "Cpu", columns: ["name", "slug", "brand", "benchmarkScore", "cores", "threads", "generation", "socket", "integratedGpu", "priceRangeVnd", "commonInVietnam"], search: ["name", "slug", "brand"], order: "name" },
  device: { table: "Device", columns: ["name", "slug", "type", "brand", "cpu", "gpu", "ramGb", "storageGb", "storageType", "screenSize", "screenResolution", "priceVnd", "priceRange", "shopeeUrl", "tikiUrl", "phongvuUrl", "gearvnUrl", "imageUrl"], search: ["name", "slug", "brand", "cpu", "gpu"], order: "name" },
  benchmark: { table: "GameGpuBenchmark", columns: ["id", "gameId", "gpuId", "resolution", "fpsLow", "fpsMedium", "fpsHigh", "fpsUltra", "recommendedSetting", "setting", "avgFps", "onePercentLow", "status", "videoTestUrl", "source", "confidence", "updatedAt"], search: ["id", "gameId", "gpuId", "resolution", "source"], order: "updatedAt" },
  blogPost: { table: "BlogPost", columns: ["title", "slug", "content", "excerpt", "category", "tags", "metaTitle", "metaDescription", "publishedAt"], search: ["title", "slug", "excerpt"], order: "publishedAt" },
};

export async function listAdminItems(collection: AdminCollection, search = "", limit = 50) {
  const config = listConfig[collection];
  try {
    return withClient(async (client) => {
      const columns = config.columns.map((column) => `"${column}"`).join(",");
      const safeLimit = Math.min(100, Math.max(1, limit));
      const whereParts: string[] = [];
      const values: unknown[] = [];

      const terms = searchTerms(search);
      if (terms.length) {
        values.push(...terms.map((term) => `%${term}%`));
        const clauses = values.map((_, index) => {
          const param = `$${index + 1}`;
          return config.search.map((column) => `"${column}"::text ILIKE ${param}`).join(" OR ");
        });
        whereParts.push(`(${clauses.map((clause) => `(${clause})`).join(" OR ")})`);
      }

      const result = await client.query(
        `SELECT ${columns} FROM "${config.table}" ${whereParts.length ? `WHERE ${whereParts.join(" AND ")}` : ""} ORDER BY "${config.order}" ${config.order === "publishedAt" || config.order === "createdAt" ? "DESC" : "ASC"} LIMIT ${safeLimit}`,
        values,
      );
      return result.rows.map((row) => normalizeAdminRow(collection, row));
    });
  } catch (error) {
    throw adminDbError(error);
  }
}

export async function deleteAdminItem(collection: AdminCollection, key: string) {
  return withClient(async (client) => {
    if (collection === "benchmark") {
      const result = await client.query(`DELETE FROM "GameGpuBenchmark" WHERE "id"=$1 RETURNING "id"`, [key]);
      if (!result.rowCount) throw new Error("Không tìm thấy bản ghi cần xóa.");
      return result.rowCount;
    }
    const table = listConfig[collection].table;
    const result = await client.query(`DELETE FROM "${table}" WHERE "slug"=$1 RETURNING "slug"`, [key]);
    if (!result.rowCount) throw new Error("Không tìm thấy bản ghi cần xóa.");
    return result.rowCount;
  });
}

function searchTerms(search: string) {
  const input = search.trim();
  if (!input) return [];
  const noAccent = input.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const slug = noAccent.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const underscore = slug.replace(/-/g, "_");
  return Array.from(new Set([input, noAccent, slug, underscore].filter(Boolean)));
}

function normalizeAdminRow(collection: AdminCollection, row: Record<string, any>) {
  if (collection === "game") {
    return {
      ...row,
      minCpu: row.minSpecs?.cpuName ?? "",
      minGpu: row.minSpecs?.gpuName ?? "",
      minCpuBenchmark: row.minSpecs?.cpuBenchmark ?? 0,
      minGpuBenchmark: row.minSpecs?.gpuBenchmark ?? 0,
      minRamGb: row.minSpecs?.ramGb ?? 0,
      minStorageGb: row.minSpecs?.storageGb ?? 0,
      recCpu: row.recSpecs?.cpuName ?? "",
      recGpu: row.recSpecs?.gpuName ?? "",
      recCpuBenchmark: row.recSpecs?.cpuBenchmark ?? 0,
      recGpuBenchmark: row.recSpecs?.gpuBenchmark ?? 0,
      recRamGb: row.recSpecs?.ramGb ?? 0,
      recStorageGb: row.recSpecs?.storageGb ?? 0,
      genres: Array.isArray(row.genres) ? row.genres.join(", ") : row.genres,
    };
  }
  if (collection === "blogPost") {
    return {
      ...row,
      tags: Array.isArray(row.tags) ? row.tags.join(", ") : row.tags,
      publishedAt: row.publishedAt instanceof Date ? row.publishedAt.toISOString() : row.publishedAt,
    };
  }
  if (collection === "benchmark") return normalizeBenchmarkRow(row);
  return row;
}

function normalizeBenchmarkRow(row: Record<string, any>) {
  const gameSlug = String(row.gameId || "").replace(/^game_/, "").replace(/_/g, "-");
  const gpuSlug = String(row.gpuId || "").replace(/^gpu_/, "").replace(/_/g, "-");
  return { ...row, gameSlug, gpuSlug };
}
