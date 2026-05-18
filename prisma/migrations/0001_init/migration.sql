CREATE TYPE "Brand" AS ENUM ('NVIDIA', 'AMD', 'Intel');
CREATE TYPE "GpuCategory" AS ENUM ('integrated', 'low', 'mid', 'high', 'ultra');
CREATE TYPE "Resolution" AS ENUM ('720p', '1080p', '1440p', '4k');
CREATE TYPE "BenchmarkStatus" AS ENUM ('smooth', 'playable', 'not_recommended');
CREATE TYPE "DeviceType" AS ENUM ('laptop', 'desktop_prebuilt', 'custom_build');
CREATE TYPE "StorageType" AS ENUM ('SSD', 'HDD', 'SSD+HDD');
CREATE TYPE "PriceRange" AS ENUM ('duoi-10-trieu', '10-15-trieu', '15-20-trieu', '20-30-trieu', 'tren-30-trieu');
CREATE TYPE "BlogCategory" AS ENUM ('so-sanh', 'huong-dan', 'top-game', 'nang-cap', 'tin-tuc');

CREATE TABLE "Game" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "steamId" TEXT,
  "genres" TEXT[] NOT NULL,
  "sizeGb" DOUBLE PRECISION NOT NULL,
  "price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "isFree" BOOLEAN NOT NULL,
  "description" TEXT NOT NULL,
  "coverImage" TEXT,
  "officialUrl" TEXT,
  "minSpecs" JSONB NOT NULL,
  "recSpecs" JSONB NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "Gpu" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "brand" "Brand" NOT NULL,
  "benchmarkScore" INTEGER NOT NULL,
  "category" "GpuCategory" NOT NULL,
  "tdp" INTEGER,
  "vram" INTEGER,
  "priceRangeVnd" TEXT NOT NULL,
  "isLaptop" BOOLEAN NOT NULL,
  "commonInVietnam" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Cpu" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "brand" "Brand" NOT NULL,
  "benchmarkScore" INTEGER NOT NULL,
  "cores" INTEGER NOT NULL,
  "threads" INTEGER NOT NULL,
  "generation" TEXT NOT NULL,
  "socket" TEXT,
  "integratedGpu" TEXT,
  "priceRangeVnd" TEXT NOT NULL,
  "commonInVietnam" BOOLEAN NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "Device" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE,
  "type" "DeviceType" NOT NULL,
  "brand" TEXT NOT NULL,
  "cpu" TEXT NOT NULL,
  "gpu" TEXT NOT NULL,
  "ramGb" INTEGER NOT NULL,
  "storageGb" INTEGER NOT NULL,
  "storageType" "StorageType" NOT NULL,
  "screenSize" DOUBLE PRECISION,
  "screenResolution" TEXT,
  "priceVnd" INTEGER NOT NULL,
  "priceRange" "PriceRange" NOT NULL,
  "shopeeUrl" TEXT,
  "tikiUrl" TEXT,
  "phơngvuUrl" TEXT,
  "gearvnUrl" TEXT,
  "imageUrl" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE "BlogPost" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL UNIQUE,
  "content" TEXT NOT NULL,
  "excerpt" TEXT NOT NULL,
  "category" "BlogCategory" NOT NULL,
  "tags" TEXT[] NOT NULL,
  "metaTitle" TEXT NOT NULL,
  "metaDescription" TEXT NOT NULL,
  "publishedAt" TIMESTAMP(3) NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL
);

CREATE TABLE "GameGpuBenchmark" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "gameId" TEXT NOT NULL REFERENCES "Game"("id") ON DELETE CASCADE,
  "gpuId" TEXT NOT NULL REFERENCES "Gpu"("id") ON DELETE CASCADE,
  "resolution" "Resolution" NOT NULL,
  "fpsLow" INTEGER NOT NULL,
  "fpsMedium" INTEGER NOT NULL,
  "fpsHigh" INTEGER NOT NULL,
  "fpsUltra" INTEGER NOT NULL,
  "recommendedSetting" TEXT NOT NULL,
  "status" "BenchmarkStatus" NOT NULL,
  "videoTestUrl" TEXT,
  "source" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE ("gameId", "gpuId", "resolution")
);

CREATE INDEX "Game_slug_idx" ON "Game"("slug");
CREATE INDEX "Gpu_slug_idx" ON "Gpu"("slug");
CREATE INDEX "Cpu_slug_idx" ON "Cpu"("slug");
CREATE INDEX "Device_slug_idx" ON "Device"("slug");
CREATE INDEX "Device_priceRange_idx" ON "Device"("priceRange");
CREATE INDEX "BlogPost_slug_idx" ON "BlogPost"("slug");
CREATE INDEX "BlogPost_category_idx" ON "BlogPost"("category");
