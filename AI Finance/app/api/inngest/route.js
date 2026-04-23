import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import {
  checkBudgetAlert,
  triggerRecurringTransactions,
  processRecurringTransaction,
  generateMonthlyReports,
} from "@/lib/inngest/functions";

/**
 * Inngest serve handler.
 * Registers all background functions and exposes GET / POST / PUT endpoints
 * that the Inngest platform uses to invoke and inspect functions.
 */
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    checkBudgetAlert,
    triggerRecurringTransactions,
    processRecurringTransaction,
    generateMonthlyReports,
  ],
});
