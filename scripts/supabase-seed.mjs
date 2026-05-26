import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const root = process.cwd();
const databaseUrl = process.env.ADMIN_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("ADMIN_DATABASE_URL or DATABASE_URL is not configured.");
  process.exit(1);
}

const { Client } = pg;
const client = new Client({
  connectionString: databaseUrl,
  ssl: { rejectUnauthorized: false },
});

const readJson = (file) => JSON.parse(fs.readFileSync(path.join(root, file), "utf8"));
const idFromSlug = (prefix, slug) => `${prefix}_${slug.replace(/[^a-z0-9]+/g, "_")}`.slice(0, 120);
const enumPrice = (value) => value;
const enumStorage = (value) => value;

const games = readJson("data/games.json");
const gpus = readJson("data/gpus.json");
const cpus = readJson("data/cpus.json");
const devices = readJson("data/devices.json");
const benchmarks = readJson("data/benchmarks.json");
const blogPosts = readJson("data/blog-posts.json");
const BENCHMARK_CHUNK_SIZE = 250;

async function runStatements(sql) {
  const statements = sql
    .split(/;\s*\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean);

  for (const statement of statements) {
    try {
      await client.query(`${statement};`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (
        message.includes("already exists") ||
        message.includes("multiple primary keys") ||
        message.includes("does not exist")
      ) {
        continue;
      }
      throw error;
    }
  }
}

async function seedGames() {
  for (const game of games) {
    await client.query(
      `INSERT INTO "Game" ("id","name","slug","steamId","genres","sizeGb","price","isFree","description","coverImage","officialUrl","minSpecs","recSpecs","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12::jsonb,$13::jsonb,NOW())
       ON CONFLICT ("slug") DO UPDATE SET
       "name"=EXCLUDED."name","steamId"=EXCLUDED."steamId","genres"=EXCLUDED."genres","sizeGb"=EXCLUDED."sizeGb","price"=EXCLUDED."price",
       "isFree"=EXCLUDED."isFree","description"=EXCLUDED."description","coverImage"=EXCLUDED."coverImage","officialUrl"=EXCLUDED."officialUrl",
       "minSpecs"=EXCLUDED."minSpecs","recSpecs"=EXCLUDED."recSpecs","updatedAt"=NOW()`,
      [
        idFromSlug("game", game.slug),
        game.name,
        game.slug,
        game.steamId,
        game.genres,
        game.sizeGb,
        game.price ?? null,
        game.isFree,
        game.description,
        game.coverImage,
        game.officialUrl,
        JSON.stringify(game.minSpecs),
        JSON.stringify(game.recSpecs),
      ],
    );
  }
}

async function seedGpus() {
  for (const gpu of gpus) {
    await client.query(
      `INSERT INTO "Gpu" ("id","name","slug","brand","benchmarkScore","category","tdp","vram","priceRangeVnd","isLaptop","commonInVietnam")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
       ON CONFLICT ("slug") DO UPDATE SET
       "name"=EXCLUDED."name","brand"=EXCLUDED."brand","benchmarkScore"=EXCLUDED."benchmarkScore","category"=EXCLUDED."category",
       "tdp"=EXCLUDED."tdp","vram"=EXCLUDED."vram","priceRangeVnd"=EXCLUDED."priceRangeVnd","isLaptop"=EXCLUDED."isLaptop","commonInVietnam"=EXCLUDED."commonInVietnam"`,
      [
        idFromSlug("gpu", gpu.slug),
        gpu.name,
        gpu.slug,
        gpu.brand,
        gpu.benchmarkScore,
        gpu.category,
        gpu.tdp,
        gpu.vram,
        gpu.priceRangeVnd,
        gpu.isLaptop,
        gpu.commonInVietnam,
      ],
    );
  }
}

async function seedCpus() {
  for (const cpu of cpus) {
    await client.query(
      `INSERT INTO "Cpu" ("id","name","slug","brand","benchmarkScore","cores","threads","generation","socket","integratedGpu","priceRangeVnd","commonInVietnam")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT ("slug") DO UPDATE SET
       "name"=EXCLUDED."name","brand"=EXCLUDED."brand","benchmarkScore"=EXCLUDED."benchmarkScore","cores"=EXCLUDED."cores",
       "threads"=EXCLUDED."threads","generation"=EXCLUDED."generation","socket"=EXCLUDED."socket","integratedGpu"=EXCLUDED."integratedGpu",
       "priceRangeVnd"=EXCLUDED."priceRangeVnd","commonInVietnam"=EXCLUDED."commonInVietnam"`,
      [
        idFromSlug("cpu", cpu.slug),
        cpu.name,
        cpu.slug,
        cpu.brand,
        cpu.benchmarkScore,
        cpu.cores,
        cpu.threads,
        cpu.generation,
        cpu.socket,
        cpu.integratedGpu,
        cpu.priceRangeVnd,
        cpu.commonInVietnam,
      ],
    );
  }
}

async function seedDevices() {
  for (const device of devices) {
    await client.query(
      `INSERT INTO "Device" ("id","name","slug","type","brand","cpu","gpu","ramGb","storageGb","storageType","screenSize","screenResolution","priceVnd","priceRange","shopeeUrl","tikiUrl","phongvuUrl","gearvnUrl","imageUrl")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT ("slug") DO UPDATE SET
       "name"=EXCLUDED."name","type"=EXCLUDED."type","brand"=EXCLUDED."brand","cpu"=EXCLUDED."cpu","gpu"=EXCLUDED."gpu",
       "ramGb"=EXCLUDED."ramGb","storageGb"=EXCLUDED."storageGb","storageType"=EXCLUDED."storageType","screenSize"=EXCLUDED."screenSize",
       "screenResolution"=EXCLUDED."screenResolution","priceVnd"=EXCLUDED."priceVnd","priceRange"=EXCLUDED."priceRange",
       "shopeeUrl"=EXCLUDED."shopeeUrl","tikiUrl"=EXCLUDED."tikiUrl","phongvuUrl"=EXCLUDED."phongvuUrl","gearvnUrl"=EXCLUDED."gearvnUrl","imageUrl"=EXCLUDED."imageUrl"`,
      [
        idFromSlug("device", device.slug),
        device.name,
        device.slug,
        device.type,
        device.brand,
        device.cpu,
        device.gpu,
        device.ramGb,
        device.storageGb,
        enumStorage(device.storageType),
        device.screenSize,
        device.screenResolution,
        device.priceVnd,
        enumPrice(device.priceRange),
        device.shopeeUrl,
        device.tikiUrl,
        device.phongvuUrl,
        device.gearvnUrl,
        device.imageUrl,
      ],
    );
  }
}

async function seedBlogPosts() {
  for (const post of blogPosts) {
    await client.query(
      `INSERT INTO "BlogPost" ("id","title","slug","content","excerpt","category","tags","metaTitle","metaDescription","publishedAt","updatedAt")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
       ON CONFLICT ("slug") DO UPDATE SET
       "title"=EXCLUDED."title","content"=EXCLUDED."content","excerpt"=EXCLUDED."excerpt","category"=EXCLUDED."category",
       "tags"=EXCLUDED."tags","metaTitle"=EXCLUDED."metaTitle","metaDescription"=EXCLUDED."metaDescription","publishedAt"=EXCLUDED."publishedAt","updatedAt"=NOW()`,
      [
        idFromSlug("post", post.slug),
        post.title,
        post.slug,
        post.content,
        post.excerpt,
        post.category,
        post.tags,
        post.metaTitle,
        post.metaDescription,
        post.publishedAt,
      ],
    );
  }
}

async function seedBenchmarks() {
  for (let offset = 0; offset < benchmarks.length; offset += BENCHMARK_CHUNK_SIZE) {
    const batch = benchmarks.slice(offset, offset + BENCHMARK_CHUNK_SIZE);
    const values = [];
    const placeholders = [];

    for (const benchmark of batch) {
      const start = values.length + 1;
      placeholders.push(`($${start},$${start + 1},$${start + 2},$${start + 3},$${start + 4},$${start + 5},$${start + 6},$${start + 7},$${start + 8},$${start + 9},$${start + 10},$${start + 11},$${start + 12},$${start + 13},$${start + 14},$${start + 15},$${start + 16})`);
      values.push(
        idFromSlug("bench", `${benchmark.gameSlug}_${benchmark.gpuSlug}_${benchmark.resolution}`),
        idFromSlug("game", benchmark.gameSlug),
        idFromSlug("gpu", benchmark.gpuSlug),
        benchmark.resolution,
        benchmark.fpsLow,
        benchmark.fpsMedium,
        benchmark.fpsHigh,
        benchmark.fpsUltra,
        benchmark.recommendedSetting,
        benchmark.setting ?? benchmark.recommendedSetting,
        benchmark.avgFps ?? (benchmark.fpsUltra || benchmark.fpsHigh || benchmark.fpsMedium || benchmark.fpsLow),
        benchmark.onePercentLow ?? benchmark.fpsLow,
        benchmark.status,
        benchmark.videoTestUrl,
        benchmark.source,
        benchmark.confidence ?? "measured",
        benchmark.updatedAt ?? new Date().toISOString(),
      );
    }

    await client.query(
      `INSERT INTO "GameGpuBenchmark" ("id","gameId","gpuId","resolution","fpsLow","fpsMedium","fpsHigh","fpsUltra","recommendedSetting","setting","avgFps","onePercentLow","status","videoTestUrl","source","confidence","updatedAt")
       VALUES ${placeholders.join(",")}
       ON CONFLICT ("gameId","gpuId","resolution") DO UPDATE SET
       "fpsLow"=EXCLUDED."fpsLow","fpsMedium"=EXCLUDED."fpsMedium","fpsHigh"=EXCLUDED."fpsHigh","fpsUltra"=EXCLUDED."fpsUltra",
       "recommendedSetting"=EXCLUDED."recommendedSetting","setting"=EXCLUDED."setting","avgFps"=EXCLUDED."avgFps","onePercentLow"=EXCLUDED."onePercentLow",
       "status"=EXCLUDED."status","videoTestUrl"=EXCLUDED."videoTestUrl","source"=EXCLUDED."source",
       "confidence"=EXCLUDED."confidence","updatedAt"=EXCLUDED."updatedAt"`,
      values,
    );
  }
}

async function pruneSeededTables() {
  const benchmarkIds = benchmarks.map((benchmark) => idFromSlug("bench", `${benchmark.gameSlug}_${benchmark.gpuSlug}_${benchmark.resolution}`));
  const gameSlugs = games.map((game) => game.slug);
  const gpuSlugs = gpus.map((gpu) => gpu.slug);
  const cpuSlugs = cpus.map((cpu) => cpu.slug);
  const deviceSlugs = devices.map((device) => device.slug);
  const blogSlugs = blogPosts.map((post) => post.slug);

  await client.query(`DELETE FROM "GameGpuBenchmark" WHERE NOT ("id" = ANY($1::text[]))`, [benchmarkIds]);
  await client.query(`DELETE FROM "Device" WHERE NOT ("slug" = ANY($1::text[]))`, [deviceSlugs]);
  await client.query(`DELETE FROM "BlogPost" WHERE NOT ("slug" = ANY($1::text[]))`, [blogSlugs]);
  await client.query(`DELETE FROM "Cpu" WHERE NOT ("slug" = ANY($1::text[]))`, [cpuSlugs]);
  await client.query(`DELETE FROM "Gpu" WHERE NOT ("slug" = ANY($1::text[]))`, [gpuSlugs]);
  await client.query(`DELETE FROM "Game" WHERE NOT ("slug" = ANY($1::text[]))`, [gameSlugs]);
}

async function runMigrations() {
  const migrationsRoot = path.join(root, "prisma", "migrations");
  const migrationDirs = fs
    .readdirSync(migrationsRoot, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const dir of migrationDirs) {
    const migrationPath = path.join(migrationsRoot, dir, "migration.sql");
    if (!fs.existsSync(migrationPath)) continue;
    await runStatements(fs.readFileSync(migrationPath, "utf8"));
  }
}

await client.connect();
try {
  await runMigrations();
  await pruneSeededTables();
  await seedGames();
  await seedGpus();
  await seedCpus();
  await seedDevices();
  await seedBlogPosts();
  await seedBenchmarks();
  await pruneSeededTables();
  console.log("Supabase migration and seed completed.");
} finally {
  await client.end();
}
