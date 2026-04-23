import { Inngest } from "inngest";

/**
 * Shared Inngest client for Finova.
 * Uses exponential back-off with a max of 2 retry attempts.
 */
export const inngest = new Inngest({
  id: "finova",
  name: "Finova",
  retryFunction: async (attempt) => ({
    delay: Math.pow(2, attempt) * 1000,
    maxAttempts: 2,
  }),
});
