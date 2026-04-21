import { Inngest } from "inngest";

/**
 * Shared Inngest client for AI Finance.
 * Uses exponential back-off with a max of 2 retry attempts.
 */
export const inngest = new Inngest({
  id: "ai-finance",
  name: "AI Finance",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
