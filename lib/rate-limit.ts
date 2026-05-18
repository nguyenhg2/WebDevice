import { createClient, type RedisClientType } from "redis";

const memoryHits = new Map<string, { count: number; reset: number }>();
let redisClient: RedisClientType | null = null;
let redisFailed = false;

function getRedisClient(): RedisClientType | null {
  const url = process.env.REDIS_URL;
  if (!url || redisFailed) return null;
  if (!redisClient) {
    redisClient = createClient({ url });
    redisClient.on("error", () => {
      redisFailed = true;
    });
  }
  return redisClient;
}

function memoryRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const hit = memoryHits.get(key);
  if (!hit || hit.reset < now) {
    memoryHits.set(key, { count: 1, reset: now + windowMs });
    return true;
  }
  if (hit.count >= limit) return false;
  hit.count += 1;
  return true;
}

export function getClientKey(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "local"
  );
}

export async function rateLimit(key: string, limit = 120, windowMs = 60000): Promise<boolean> {
  const client = getRedisClient();
  if (!client) return memoryRateLimit(key, limit, windowMs);

  try {
    if (!client.isOpen) await client.connect();
    const redisKey = `rate:${key}`;
    const count = await client.incr(redisKey);
    if (count === 1) await client.pExpire(redisKey, windowMs);
    return count <= limit;
  } catch {
    redisFailed = true;
    return memoryRateLimit(key, limit, windowMs);
  }
}
