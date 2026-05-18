import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import pg from "pg";

const root = process.cwd();
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("DATABASE_URL chưa được cấu hình.");
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
        game.price,
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
      `INSERT INTO "Device" ("id","name","slug","type","brand","cpu","gpu","ramGb","storageGb","storageType","screenSize","screenResolution","priceVnd","priceRange","shopeeUrl","tikiUrl","phơngvuUrl","gearvnUrl","imageUrl")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19)
       ON CONFLICT ("slug") DO UPDATE SET
       "name"=EXCLUDED."name","type"=EXCLUDED."type","brand"=EXCLUDED."brand","cpu"=EXCLUDED."cpu","gpu"=EXCLUDED."gpu",
       "ramGb"=EXCLUDED."ramGb","storageGb"=EXCLUDED."storageGb","storageType"=EXCLUDED."storageType","screenSize"=EXCLUDED."screenSize",
       "screenResolution"=EXCLUDED."screenResolution","priceVnd"=EXCLUDED."priceVnd","priceRange"=EXCLUDED."priceRange",
       "shopeeUrl"=EXCLUDED."shopeeUrl","tikiUrl"=EXCLUDED."tikiUrl","phơngvuUrl"=EXCLUDED."phơngvuUrl","gearvnUrl"=EXCLUDED."gearvnUrl","imageUrl"=EXCLUDED."imageUrl"`,
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
        device.phơngvuUrl,
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
  for (const benchmark of benchmarks) {
    await client.query(
      `INSERT INTO "GameGpuBenchmark" ("id","gameId","gpuId","resolution","fpsLow","fpsMedium","fpsHigh","fpsUltra","recommendedSetting","status","videoTestUrl","source")
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)
       ON CONFLICT ("gameId","gpuId","resolution") DO UPDATE SET
       "fpsLow"=EXCLUDED."fpsLow","fpsMedium"=EXCLUDED."fpsMedium","fpsHigh"=EXCLUDED."fpsHigh","fpsUltra"=EXCLUDED."fpsUltra",
       "recommendedSetting"=EXCLUDED."recommendedSetting","status"=EXCLUDED."status","videoTestUrl"=EXCLUDED."videoTestUrl","source"=EXCLUDED."source"`,
      [
        idFromSlug("bench", `${benchmark.gameSlug}_${benchmark.gpuSlug}_${benchmark.resolution}`),
        idFromSlug("game", benchmark.gameSlug),
        idFromSlug("gpu", benchmark.gpuSlug),
        benchmark.resolution,
        benchmark.fpsLow,
        benchmark.fpsMedium,
        benchmark.fpsHigh,
        benchmark.fpsUltra,
        benchmark.recommendedSetting,
        benchmark.status,
        benchmark.videoTestUrl,
        benchmark.source,
      ],
    );
  }
}

await client.connect();
try {
  const migrationSql = fs.readFileSync(path.join(root, "prisma/migrations/0001_init/migration.sql"), "utf8");
  await runStatements(migrationSql);
  await seedGames();
  await seedGpus();
  await seedCpus();
  await seedDevices();
  await seedBlogPosts();
  await seedBenchmarks();
  console.log("Supabase migration và seed hoàn tất.");
} finally {
  await client.end();
}
