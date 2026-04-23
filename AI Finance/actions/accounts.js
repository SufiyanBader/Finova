"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts Prisma Decimal fields to plain JS numbers.
 *
 * @param {object} obj
 * @returns {object}
 */
function serializeTransaction(obj) {
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber();
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber();
  }
  return serialized;
}

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
 * Fetches a single account with its full transaction history.
 * Returns null if the account does not exist or belongs to another user.
 *
 * @param {string} accountId
 * @returns {Promise<object | null>}
 */
export async function getAccountWithTransactions(accountId) {
  try {
    const { user } = await getAuthenticatedUser();

    const account = await db.account.findUnique({
      where: { id: accountId, userId: user.id },
      include: {
        transactions: { orderBy: { date: "desc" } },
        _count: { select: { transactions: true } },
      },
    });

    if (!account) return null;

    return {
      ...serializeTransaction(account),
      transactions: account.transactions.map(serializeTransaction),
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
      return null;
    }
    console.error("[getAccountWithTransactions]", msg);
    return null;
  }
}

/**
 * Deletes multiple transactions and adjusts account balances accordingly.
 * Runs inside a Prisma interactive transaction to guarantee atomicity.
 *
 * Expense deletions increase the balance; income deletions decrease it.
 *
 * @param {string[]} transactionIds
 * @returns {Promise<{ success: true }>}
 */
export async function bulkDeleteTransactions(transactionIds) {
  try {
    const { user } = await getAuthenticatedUser();

    // Fetch only the transactions that belong to the authenticated user
    const transactions = await db.transaction.findMany({
      where: { id: { in: transactionIds }, userId: user.id },
    });

    if (transactions.length === 0) {
      throw new Error("No matching transactions found");
    }

    /**
     * Calculate the net balance delta per account.
     * Deleting an EXPENSE gives money back (+), deleting INCOME takes it away (-).
     * @type {Record<string, number>}
     */
    const accountBalanceChanges = transactions.reduce((acc, transaction) => {
      const change =
        transaction.type === "EXPENSE"
          ? transaction.amount.toNumber()   // restore funds
          : -transaction.amount.toNumber(); // remove income

      acc[transaction.accountId] =
        (acc[transaction.accountId] ?? 0) + change;
      return acc;
    }, {});

    // Atomic delete + balance update
    await db.$transaction(async (tx) => {
      await tx.transaction.deleteMany({
        where: { id: { in: transactionIds }, userId: user.id },
      });

      for (const [accountId, balanceChange] of Object.entries(
        accountBalanceChanges
      )) {
        await tx.account.update({
          where: { id: accountId, userId: user.id },
          data: { balance: { increment: balanceChange } },
        });
      }
    });

    revalidatePath("/dashboard");
    revalidatePath("/account/[id]");

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}
