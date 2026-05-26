ALTER TABLE "GameGpuBenchmark" ADD COLUMN IF NOT EXISTS "setting" TEXT;
ALTER TABLE "GameGpuBenchmark" ADD COLUMN IF NOT EXISTS "avgFps" INTEGER;
ALTER TABLE "GameGpuBenchmark" ADD COLUMN IF NOT EXISTS "onePercentLow" INTEGER;
ALTER TABLE "GameGpuBenchmark" ADD COLUMN IF NOT EXISTS "confidence" TEXT NOT NULL DEFAULT 'measured';
ALTER TABLE "GameGpuBenchmark" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX IF NOT EXISTS "GameGpuBenchmark_source_idx" ON "GameGpuBenchmark"("source");
CREATE INDEX IF NOT EXISTS "GameGpuBenchmark_confidence_idx" ON "GameGpuBenchmark"("confidence");
