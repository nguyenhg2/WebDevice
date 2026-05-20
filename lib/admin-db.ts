import { Client, type Client as PgClient } from "pg";

export type AdminCollection = "game" | "gpu" | "cpu" | "device" | "benchmark" | "blogPost";

const idFromSlug = (prefix: string, slug: string) => `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_")}`.slice(0, 120);

async function withClient<T>(fn: (client: PgClient) => Promise<T>) {
  if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL chưa được cấu hình.");
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    return await fn(client);
  } finally {
    await client.end();
  }
}

async function upsertGame(client: PgClient, game: any) {
  await client.query(
    `INSERT INTO "Game" ("id","name","slug","steamId","genres","sizeGb","price","isFree","description","coverImage","officialUrl","minSpecs","recSpecs","updatedAt")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,NOW())
     ON CONFLICT ("slug") DO UPDATE SET
     "name"=EXCLUDED."name","steamId"=EXCLUDED."steamId","genres"=EXCLUDED."genres","sizeGb"=EXCLUDED."sizeGb","price"=EXCLUDED."price",
     "isFree"=EXCLUDED."isFree","description"=EXCLUDED."description","coverImage"=EXCLUDED."coverImage","officialUrl"=EXCLUDED."officialUrl",
     "minSpecs"=EXCLUDED."minSpecs","recSpecs"=EXCLUDED."recSpecs","updatedAt"=NOW()`,
    [idFromSlug("game", game.slug), game.name, game.slug, game.steamId ?? null, game.genres ?? [], game.sizeGb ?? 0, game.price ?? 0, Boolean(game.isFree), game.description ?? "", game.coverImage ?? null, game.officialUrl ?? null, JSON.stringify(game.minSpecs ?? {}), JSON.stringify(game.recSpecs ?? {})],
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
    `INSERT INTO "GameGpuBenchmark" ("id","gameId","gpuId","resolution","fpsLow","fpsMedium","fpsHigh","fpsUltra","recommendedSetting","status","videoTestUrl","source")
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
     ON CONFLICT ("gameId","gpuId","resolution") DO UPDATE SET
     "fpsLow"=EXCLUDED."fpsLow","fpsMedium"=EXCLUDED."fpsMedium","fpsHigh"=EXCLUDED."fpsHigh","fpsUltra"=EXCLUDED."fpsUltra",
     "recommendedSetting"=EXCLUDED."recommendedSetting","status"=EXCLUDED."status","videoTestUrl"=EXCLUDED."videoTestUrl","source"=EXCLUDED."source"`,
    [idFromSlug("bench", `${benchmark.gameSlug}_${benchmark.gpuSlug}_${benchmark.resolution}`), idFromSlug("game", benchmark.gameSlug), idFromSlug("gpu", benchmark.gpuSlug), benchmark.resolution, benchmark.fpsLow ?? 0, benchmark.fpsMedium ?? 0, benchmark.fpsHigh ?? 0, benchmark.fpsUltra ?? 0, benchmark.recommendedSetting ?? "Low", benchmark.status ?? "playable", benchmark.videoTestUrl ?? null, benchmark.source ?? "Admin"],
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
