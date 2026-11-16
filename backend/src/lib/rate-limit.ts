import type { FastifyReply, FastifyRequest } from "fastify";

interface Bucket {
  count: number;
  resetAt: number;
}

export function createRateLimiter(limitPerMinute: number) {
  const buckets = new Map<string, Bucket>();
  const sweeper = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, 60_000);
  sweeper.unref();

  return async function rateLimit(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (limitPerMinute <= 0) return;

    const now = Date.now();
    const key = request.ip;
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + 60_000 });
      return;
    }

    bucket.count += 1;
    if (bucket.count > limitPerMinute) {
      const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
      await reply
        .header("Retry-After", String(retryAfter))
        .status(429)
        .send({
          error: {
            code: "rate_limited",
            message: "Too many AI requests. Please try again shortly.",
          },
        });
    }
  };
}
