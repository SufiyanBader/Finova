import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Guard against missing env vars at module load time (build, cold start, fresh clone).
// Mirrors the same pattern used in middleware.js.
const redis =
  process.env.UPSTASH_REDIS_REST_URL &&
  process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null;

// 10 transactions per hour per user. null when Redis is unavailable.
export const transactionRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.tokenBucket(10, "1 h", 10),
      analytics: true,
      prefix: "finova:transaction",
    })
  : null;

// 5 requests per minute — auth endpoints
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, "1 m"),
      analytics: true,
      prefix: "finova:auth",
    })
  : null;

// 30 requests per minute — general API
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(30, "1 m"),
      analytics: true,
      prefix: "finova:api",
    })
  : null;

// 3 scans per minute — AI receipt scanning
export const aiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.fixedWindow(3, "1 m"),
      analytics: true,
      prefix: "finova:ai",
    })
  : null;
