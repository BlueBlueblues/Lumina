import type { FastifyReply, FastifyRequest } from "fastify";

interface SlidingBucket {
  timestamps: number[];
}

export function createRateLimiter(limitPerMinute: number, dailyGlobalLimit = 0) {
  const buckets = new Map<string, SlidingBucket>();
  let currentDay = new Date().toISOString().slice(0, 10);
  let dailyCount = 0;

  const sweeper = setInterval(() => {
    const cutoff = Date.now() - 60_000;
    for (const [key, bucket] of buckets) {
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
      if (bucket.timestamps.length === 0) buckets.delete(key);
    }
  }, 60_000);
  sweeper.unref();

  return async function rateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const now = Date.now();
    if (dailyGlobalLimit > 0) {
      const today = new Date(now).toISOString().slice(0, 10);
      if (today !== currentDay) {
        currentDay = today;
        dailyCount = 0;
      }
      if (dailyCount >= dailyGlobalLimit) {
        await reply.status(503).send({
          error: {
            code: "ai_budget_exceeded",
            message: "今日 AI 服务调用已达配额上限，本地记录与检索仍可正常使用。",
          },
        });
        return;
      }
    }

    if (limitPerMinute <= 0) {
      if (dailyGlobalLimit > 0) dailyCount += 1;
      return;
    }

    const key = request.ip;
    const cutoff = now - 60_000;
    let bucket = buckets.get(key);
    if (!bucket) {
      bucket = { timestamps: [] };
      buckets.set(key, bucket);
    } else {
      bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);
    }

    if (bucket.timestamps.length >= limitPerMinute) {
      const oldest = bucket.timestamps[0] ?? now;
      const retryAfter = Math.max(1, Math.ceil((oldest + 60_000 - now) / 1000));
      await reply
        .header("Retry-After", String(retryAfter))
        .status(429)
        .send({
          error: {
            code: "rate_limited",
            message: "Too many AI requests. Please try again shortly.",
          },
        });
      return;
    }

    bucket.timestamps.push(now);
    if (dailyGlobalLimit > 0) dailyCount += 1;
  };
}

let sharedAiLimiter: ReturnType<typeof createRateLimiter> | null = null;
export function getSharedAiRateLimiter(limitPerMinute: number, dailyGlobalLimit: number) {
  if (!sharedAiLimiter) {
    sharedAiLimiter = createRateLimiter(limitPerMinute, dailyGlobalLimit);
  }
  return sharedAiLimiter;
}
