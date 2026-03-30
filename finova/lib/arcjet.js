import arcjet, { tokenBucket } from "@arcjet/next";

/**
 * Arcjet client configured with a token-bucket rate limiter.
 * Used inside Server Actions to protect expensive endpoints.
 *
 * When ARCJET_KEY is not set (e.g. local dev), exports a no-op stub
 * so the app runs without rate limiting rather than crashing.
 *
 * Allows 10 requests per user per hour in production.
 */

let aj;

if (process.env.ARCJET_KEY) {
  aj = arcjet({
    key: process.env.ARCJET_KEY,
    characteristics: ["userId"],
    rules: [
      tokenBucket({
        mode: "LIVE",
        refillRate: 10,
        interval: 3600, // seconds – 1 hour
        capacity: 10,
      }),
    ],
  });
} else {
  // Dev/test stub – passes every request
  aj = {
    protect: async () => ({
      isDenied: () => false,
      reason: {},
    }),
  };
}

export default aj;
