import { createElement } from "react";
import { generateResilientContent, SUPPORTED_MODELS } from "@/lib/gemini";
import { inngest } from "./client";
import { db } from "@/lib/prisma";
import { sendEmail } from "@/actions/send-email";
// EmailTemplate is authored by Person A – adjust this import if the path differs
import EmailTemplate from "@/emails/template";

// ---------------------------------------------------------------------------
// Shared Helpers
// ---------------------------------------------------------------------------

/**
 * Returns true if the two dates fall in different calendar months.
 *
 * @param {Date} lastAlertDate
 * @param {Date} currentDate
 * @returns {boolean}
 */
function isNewMonth(lastAlertDate, currentDate) {
  return (
    lastAlertDate.getMonth() !== currentDate.getMonth() ||
    lastAlertDate.getFullYear() !== currentDate.getFullYear()
  );
}

/**
 * Calculates the next due date for a recurring transaction.
 *
 * @param {Date|string} startDate
 * @param {"DAILY"|"WEEKLY"|"MONTHLY"|"YEARLY"} interval
 * @returns {Date}
 */
function calculateNextRecurringDate(startDate, interval) {
  const date = new Date(startDate);

  switch (interval) {
    case "DAILY":
      date.setDate(date.getDate() + 1);
      break;
    case "WEEKLY":
      date.setDate(date.getDate() + 7);
      break;
    case "MONTHLY":
      date.setMonth(date.getMonth() + 1);
      break;
    case "YEARLY":
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      throw new Error(`Unknown recurring interval: ${interval}`);
  }

  return date;
}

/**
 * Determines whether a recurring transaction is due for processing today.
 *
 * @param {{ lastProcessed: Date|null, nextRecurringDate: Date|null }} transaction
 * @returns {boolean}
 */
function isTransactionDue(transaction) {
  if (!transaction.lastProcessed) return true;
  const today = new Date();
  const dueDate = new Date(transaction.nextRecurringDate);
  return dueDate <= today;
}

/**
 * Aggregates income, expenses and category breakdown for a given user / month.
 *
 * @param {string} userId
 * @param {Date} month - Any date within the target month.
 * @returns {Promise<{
 *   totalIncome: number,
 *   totalExpenses: number,
 *   byCategory: Record<string, number>,
 *   transactionCount: number
 * }>}
 */
async function getMonthlyStats(userId, month) {
  const startDate = new Date(month.getFullYear(), month.getMonth(), 1);
  const endDate = new Date(month.getFullYear(), month.getMonth() + 1, 1);

  const transactions = await db.transaction.findMany({
    where: { userId, date: { gte: startDate, lt: endDate } },
  });

  return transactions.reduce(
    (stats, t) => {
      const amount = t.amount.toNumber();

      if (t.type === "INCOME") {
        stats.totalIncome += amount;
      } else {
        stats.totalExpenses += amount;
        stats.byCategory[t.category] =
          (stats.byCategory[t.category] ?? 0) + amount;
      }

      return stats;
    },
    {
      totalIncome: 0,
      totalExpenses: 0,
      byCategory: {},
      transactionCount: transactions.length,
    }
  );
}

/**
 * Calls Gemini to produce 3 concise, actionable financial insights.
 * Falls back to generic advice on failure.
 *
 * @param {object} stats - Output of {@link getMonthlyStats}.
 * @param {string} month - Human-readable month label, e.g. "March 2025".
 * @returns {Promise<string[]>}
 */
async function generateFinancialInsights(stats, month) {
  const prompt = `
Analyze this financial data and provide 3 concise, actionable insights.
Focus on spending patterns and practical advice.
Keep it friendly and conversational.

Financial Data for ${month}:
- Total Income: $${stats.totalIncome || 0}
- Total Expenses: $${stats.totalExpenses || 0}
- Net: $${(stats.totalIncome || 0) - (stats.totalExpenses || 0)}
- Expense Categories: ${JSON.stringify(stats.byCategory || {})}

Respond ONLY with a JSON array of 3 strings. No markdown, no explanation.
Example: ["insight 1","insight 2","insight 3"]
`.trim();

  try {
    const text = await generateResilientContent(
      SUPPORTED_MODELS.FLASH,
      prompt
    );
    // Strip markdown fences Gemini sometimes adds around JSON
    const cleaned = text
      .replace(/^```(?:json)?\s*/i, "")
      .replace(/```\s*$/i, "")
      .trim();
    const parsed = JSON.parse(cleaned);
    if (!Array.isArray(parsed)) throw new Error("Response is not an array");
    return parsed;
  } catch (error) {
    console.error("[generateFinancialInsights] Fallback:", error.message);
    return [
      "Track your largest expense category to find saving opportunities.",
      "Consider setting up a monthly budget to stay on track.",
      "Review your recurring subscriptions regularly for unused services.",
    ];
  }
}

// ---------------------------------------------------------------------------
// Inngest Functions
// ---------------------------------------------------------------------------

/**
 * CRON – runs every 6 hours.
 * Sends a budget-alert email when a user has consumed ≥80 % of their
 * monthly budget. Only one alert is sent per calendar month.
 */
export const checkBudgetAlert = inngest.createFunction(
  { id: "check-budget-alerts", name: "Check Budget Alerts", triggers: [{ cron: "0 */6 * * *" }] },
  async ({ step }) => {
    const budgets = await step.run("fetch-budgets", async () => {
      return await db.budget.findMany({
        include: {
          user: {
            include: {
              accounts: { where: { isDefault: true } },
            },
          },
        },
      });
    });

    for (const budget of budgets) {
      // We still need an account name for the email; use default if present
      const defaultAccount = budget.user.accounts[0];

      await step.run(`check-budget-${budget.id}`, async () => {
        const now = new Date();
        const startDate = new Date(now.getFullYear(), now.getMonth(), 1);

        // Count expenses across ALL user accounts, not just the default
        const expenses = await db.transaction.aggregate({
          where: {
            userId: budget.userId,
            type: "EXPENSE",
            date: { gte: startDate },
          },
          _sum: { amount: true },
        });

        const totalExpenses = expenses._sum.amount?.toNumber() ?? 0;
        const budgetAmount = budget.amount.toNumber();
        // Guard against division by zero when budget is set to 0
        const percentUsed = budgetAmount > 0
          ? (totalExpenses / budgetAmount) * 100
          : 0;

        const shouldAlert =
          percentUsed >= 80 &&
          (!budget.lastAlertSent ||
            isNewMonth(new Date(budget.lastAlertSent), now));

        if (shouldAlert) {
          await sendEmail({
            to: budget.user.email,
            subject: `Budget Alert: ${percentUsed.toFixed(1)}% used`,
            react: createElement(EmailTemplate, {
              userName: budget.user.name,
              type: "budget-alert",
              data: {
                percentUsed,
                budgetAmount,
                totalExpenses,
                // Use default account name if available; otherwise generic label
                accountName: defaultAccount?.name ?? "All Accounts",
              },
            }),
          });

          await db.budget.update({
            where: { id: budget.id },
            data: { lastAlertSent: now },
          });
        }
      });
    }
  }
);

/**
 * CRON – runs daily at midnight.
 * Finds all recurring transactions that are due and fires an
 * individual processing event for each one.
 */
export const triggerRecurringTransactions = inngest.createFunction(
  {
    id: "trigger-recurring-transactions",
    name: "Trigger Recurring Transactions",
    triggers: [{ cron: "0 0 * * *" }],
  },
  async ({ step }) => {
    const recurringTransactions = await step.run(
      "fetch-recurring-transactions",
      async () => {
        return await db.transaction.findMany({
          where: {
            isRecurring: true,
            status: "COMPLETED",
            OR: [
              { lastProcessed: null },
              { nextRecurringDate: { lte: new Date() } },
            ],
          },
        });
      }
    );

    if (recurringTransactions.length > 0) {
      const events = recurringTransactions.map((transaction) => ({
        name: "transaction.recurring.process",
        data: {
          transactionId: transaction.id,
          userId: transaction.userId,
        },
      }));
      await inngest.send(events);
    }

    return { triggered: recurringTransactions.length };
  }
);

/**
 * EVENT – triggered by `transaction.recurring.process`.
 * Throttled to 10 events per minute per user to avoid thundering-herd issues.
 * Creates a new transaction entry and updates the account balance atomically.
 */
export const processRecurringTransaction = inngest.createFunction(
  {
    id: "process-recurring-transaction",
    name: "Process Recurring Transaction",
    throttle: {
      limit: 10,
      period: "1m",
      key: "event.data.userId",
    },
    triggers: [{ event: "transaction.recurring.process" }],
  },
  async ({ event, step }) => {
    if (!event.data?.transactionId || !event.data?.userId) {
      throw new Error("Invalid event data: transactionId and userId are required");
    }

    await step.run("process-transaction", async () => {
      const transaction = await db.transaction.findUnique({
        where: {
          id: event.data.transactionId,
          userId: event.data.userId,
        },
        include: { account: true },
      });

      if (!transaction || !isTransactionDue(transaction)) return;

      const balanceChange =
        transaction.type === "EXPENSE"
          ? -transaction.amount.toNumber()
          : transaction.amount.toNumber();

      const nextDate = calculateNextRecurringDate(
        new Date(transaction.nextRecurringDate),
        transaction.recurringInterval
      );

      await db.$transaction(async (tx) => {
        // Create the new occurrence
        await tx.transaction.create({
          data: {
            type: transaction.type,
            amount: transaction.amount,
            description: transaction.description,
            date: new Date(),
            category: transaction.category,
            userId: transaction.userId,
            accountId: transaction.accountId,
            isRecurring: true,
            recurringInterval: transaction.recurringInterval,
            nextRecurringDate: nextDate,
            status: "COMPLETED",
          },
        });

        // Adjust account balance
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } },
        });

        // Stamp the source template with last-processed metadata
        await tx.transaction.update({
          where: { id: transaction.id },
          data: {
            lastProcessed: new Date(),
            nextRecurringDate: nextDate,
          },
        });
      });
    });
  }
);

/**
 * CRON – runs on the 1st of every month at midnight.
 * Generates a personalised financial report for every user and emails it.
 */
export const generateMonthlyReports = inngest.createFunction(
  { id: "generate-monthly-reports", name: "Generate Monthly Reports", triggers: [{ cron: "0 0 1 * *" }] },
  async ({ step }) => {
    const users = await step.run("fetch-users", async () => {
      // Only select the fields we actually need — avoid fetching account data
      return await db.user.findMany({
        select: { id: true, email: true, name: true },
      });
    });

    for (const user of users) {
      await step.run(`generate-report-${user.id}`, async () => {
        const now = new Date();
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

        const stats = await getMonthlyStats(user.id, lastMonth);

        const monthName = lastMonth.toLocaleString("default", {
          month: "long",
          year: "numeric",
        });

        const insights = await generateFinancialInsights(stats, monthName);

        await sendEmail({
          to: user.email,
          subject: `Your Monthly Financial Report - ${monthName}`,
          react: createElement(EmailTemplate, {
            userName: user.name,
            type: "monthly-report",
            data: { month: monthName, stats, insights },
          }),
        });
      });
    }

    return { processed: users.length };
  }
);
