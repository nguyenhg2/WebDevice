import { PrismaClient } from "@prisma/client";
import benchmarks from "../data/benchmarks.json";
import blogPosts from "../data/blog-posts.json";
import cpus from "../data/cpus.json";
import devices from "../data/devices.json";
import games from "../data/games.json";
import gpus from "../data/gpus.json";

const prisma = new PrismaClient();

const enumPrice = (value: string) =>
  value === "duoi-10-trieu" ? "duoi_10_trieu" : value === "tren-30-trieu" ? "tren_30_trieu" : "range_" + value.replace(/-/g, "_");
const enumCategory = (value: string) => value.replace(/-/g, "_");
const enumResolution = (value: string) => ("r" + value) as never;
const enumStorage = (value: string) => (value === "SSD+HDD" ? "SSD_HDD" : value);

async function main() {
  await prisma.gameGpuBenchmark.deleteMany({});

  for (const game of games) {
    const data = { ...game, price: game.price ?? null };
    await prisma.game.upsert({ where: { slug: game.slug }, update: data, create: data });
  }
  for (const gpu of gpus) await prisma.gpu.upsert({ where: { slug: gpu.slug }, update: gpu as never, create: gpu as never });
  for (const cpu of cpus) await prisma.cpu.upsert({ where: { slug: cpu.slug }, update: cpu as never, create: cpu as never });

  for (const device of devices) {
    const data = { ...device, priceRange: enumPrice(device.priceRange), storageType: enumStorage(device.storageType) };
    await prisma.device.upsert({ where: { slug: device.slug }, update: data as never, create: data as never });
  }

  for (const post of blogPosts) {
    const data = { ...post, category: enumCategory(post.category), publishedAt: new Date(post.publishedAt) };
    await prisma.blogPost.upsert({ where: { slug: post.slug }, update: data as never, create: data as never });
  }

  for (const benchmark of benchmarks) {
    const game = await prisma.game.findUnique({ where: { slug: benchmark.gameSlug } });
    const gpu = await prisma.gpu.findUnique({ where: { slug: benchmark.gpuSlug } });
    if (!game || !gpu) continue;

    const data = {
      gameId: game.id,
      gpuId: gpu.id,
      resolution: enumResolution(benchmark.resolution),
      fpsLow: benchmark.fpsLow,
      fpsMedium: benchmark.fpsMedium,
      fpsHigh: benchmark.fpsHigh,
      fpsUltra: benchmark.fpsUltra,
      recommendedSetting: benchmark.recommendedSetting,
      setting: benchmark.setting ?? benchmark.recommendedSetting,
      avgFps: benchmark.avgFps ?? (benchmark.fpsUltra || benchmark.fpsHigh || benchmark.fpsMedium || benchmark.fpsLow),
      onePercentLow: benchmark.onePercentLow ?? benchmark.fpsLow,
      status: benchmark.status as never,
      videoTestUrl: benchmark.videoTestUrl,
      source: benchmark.source,
      confidence: benchmark.confidence ?? "measured",
      updatedAt: benchmark.updatedAt ? new Date(benchmark.updatedAt) : new Date(),
    };

    await prisma.gameGpuBenchmark.upsert({
      where: { gameId_gpuId_resolution: { gameId: game.id, gpuId: gpu.id, resolution: data.resolution } },
      update: data as never,
      create: data as never,
    });
  }

  await prisma.device.deleteMany({ where: { slug: { notIn: devices.map((device) => device.slug) } } });
  await prisma.blogPost.deleteMany({ where: { slug: { notIn: blogPosts.map((post) => post.slug) } } });
  await prisma.cpu.deleteMany({ where: { slug: { notIn: cpus.map((cpu) => cpu.slug) } } });
  await prisma.gpu.deleteMany({ where: { slug: { notIn: gpus.map((gpu) => gpu.slug) } } });
  await prisma.game.deleteMany({ where: { slug: { notIn: games.map((game) => game.slug) } } });
}

main().finally(async () => prisma.$disconnect());
