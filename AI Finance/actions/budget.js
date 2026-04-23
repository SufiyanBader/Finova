"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Resolves the authenticated Clerk user to a database User record.
 *
 * @returns {Promise<{ userId: string, user: import("@prisma/client").User }>}
 */
async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return { userId, user };
}

// ---------------------------------------------------------------------------
// Server Actions
// ---------------------------------------------------------------------------

/**
 * Returns the user's current monthly budget together with total expenses
 * incurred so far this calendar month for the given account.
 *
 * @param {string} accountId - The account to aggregate expenses against.
 * @returns {Promise<{
 *   budget: { id: string, amount: number, lastAlertSent: Date|null, userId: string } | null,
 *   currentExpenses: number
 * }>}
 */
export async function getCurrentBudget(accountId) {
  try {
    const { user } = await getAuthenticatedUser();

    const budget = await db.budget.findFirst({
      where: { userId: user.id },
    });

    // Determine the first and last moments of the current calendar month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    const expenses = await db.transaction.aggregate({
      where: {
        userId: user.id,
        accountId,
        type: "EXPENSE",
        date: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
    });

    return {
      budget: budget
        ? { ...budget, amount: budget.amount.toNumber() }
        : null,
      currentExpenses: expenses._sum.amount
        ? expenses._sum.amount.toNumber()
        : 0,
    };
  } catch (error) {
    const msg = error.message || "";
    if (
      msg.includes("connect") ||
      msg.includes("ECONNREFUSED") ||
      msg.includes("ENOTFOUND") ||
      msg.includes("Unauthorized") ||
      msg.includes("User not found")
    ) {
      return { budget: null, currentExpenses: 0 };
    }
    console.error("[getCurrentBudget] Error fetching budget:", error);
    return { budget: null, currentExpenses: 0 };
  }
}

/**
 * Creates or updates the monthly budget for the authenticated user.
 *
 * @param {number} amount - The new budget ceiling in the user's currency.
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function updateBudget(amount) {
  try {
    const { user } = await getAuthenticatedUser();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      return { success: false, error: "Invalid budget amount" };
    }

    const budget = await db.budget.upsert({
      where: { userId: user.id },
      update: { amount: parsedAmount },
      create: { userId: user.id, amount: parsedAmount },
    });

    revalidatePath("/dashboard");

    return {
      success: true,
      data: { ...budget, amount: budget.amount.toNumber() },
    };
  } catch (error) {
    console.error("[updateBudget] Error updating budget:", error);
    return { success: false, error: error.message };
  }
}
