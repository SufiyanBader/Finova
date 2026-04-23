import { db } from "@/lib/prisma";
import { subDays } from "date-fns";

// ---------------------------------------------------------------------------
// ⚠️  DEVELOPMENT ONLY – Replace these IDs before running the seed
// ---------------------------------------------------------------------------
const ACCOUNT_ID = "REPLACE_WITH_YOUR_ACCOUNT_ID";
const USER_ID = "REPLACE_WITH_YOUR_USER_ID";
// ---------------------------------------------------------------------------

/** Expense categories with realistic amount ranges (USD). */
const CATEGORIES = {
  income: [
    { name: "Salary", min: 3000, max: 7000 },
    { name: "Freelance", min: 500, max: 3000 },
    { name: "Investments", min: 100, max: 2000 },
    { name: "Business", min: 800, max: 5000 },
    { name: "Rental", min: 600, max: 2500 },
  ],
  expense: [
    { name: "Housing", min: 500, max: 2500 },
    { name: "Transportation", min: 50, max: 400 },
    { name: "Groceries", min: 30, max: 300 },
    { name: "Utilities", min: 50, max: 250 },
    { name: "Entertainment", min: 20, max: 200 },
    { name: "Food", min: 10, max: 100 },
    { name: "Shopping", min: 20, max: 500 },
    { name: "Healthcare", min: 30, max: 300 },
    { name: "Education", min: 50, max: 500 },
    { name: "Travel", min: 100, max: 1500 },
    { name: "Insurance", min: 50, max: 400 },
    { name: "Gifts", min: 20, max: 250 },
    { name: "Bills", min: 30, max: 200 },
  ],
};

/**
 * Returns a random float between min and max (2 decimal places).
 *
 * @param {number} min
 * @param {number} max
 * @returns {number}
 */
function generateAmount(min, max) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(2));
}

/**
 * Picks a random category object from the correct type bucket.
 *
 * @param {"INCOME"|"EXPENSE"} type
 * @returns {{ name: string, min: number, max: number }}
 */
function generateCategory(type) {
  const bucket =
    type === "INCOME" ? CATEGORIES.income : CATEGORIES.expense;
  return bucket[Math.floor(Math.random() * bucket.length)];
}

/**
 * Returns a Date that is `daysAgo` days before today.
 *
 * @param {number} daysAgo
 * @returns {Date}
 */
function generateDate(daysAgo) {
  return subDays(new Date(), daysAgo);
}

/**
 * Deletes existing transactions for the configured account,
 * inserts 90 realistic transactions spread over 90 days,
 * and recalculates the account balance.
 *
 * @returns {Promise<{ created: number, balance: string }>}
 */
async function seedTransactions() {
  // Remove stale data first
  await db.transaction.deleteMany({ where: { accountId: ACCOUNT_ID } });

  const transactions = [];
  let balanceDelta = 0;

  for (let i = 0; i < 90; i++) {
    const date = generateDate(i);
    const isIncome = Math.random() < 0.3; // 30 % income, 70 % expense
    const type = isIncome ? "INCOME" : "EXPENSE";
    const category = generateCategory(type);
    const amount = generateAmount(category.min, category.max);

    balanceDelta += type === "INCOME" ? amount : -amount;

    transactions.push({
      type,
      amount,
      description: category.name,
      date,
      // Normalise category to snake_case for DB storage
      category: category.name.toLowerCase().replace(/ /g, "_"),
      userId: USER_ID,
      accountId: ACCOUNT_ID,
      status: "COMPLETED",
      isRecurring: false,
    });
  }

  await db.transaction.createMany({ data: transactions });

  // Reflect net balance change
  await db.account.update({
    where: { id: ACCOUNT_ID },
    data: { balance: { increment: balanceDelta } },
  });

  return {
    created: transactions.length,
    balance: balanceDelta.toFixed(2),
  };
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * GET /api/seed
 *
 * Seeds the database with 90 days of sample transactions.
 * Remove or gate this route before deploying to production.
 */
export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return Response.json(
      { error: "Seed route is disabled in production" },
      { status: 403 }
    );
  }

  try {
    const result = await seedTransactions();
    return Response.json({
      success: true,
      message: `Seeded ${result.created} transactions successfully`,
      balanceDelta: result.balance,
    });
  } catch (error) {
    console.error("[seed] Error seeding transactions:", error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
