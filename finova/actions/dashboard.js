"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Converts Prisma Decimal fields to plain JS numbers so the data is
 * safe to pass across the server → client boundary.
 *
 * @param {object} obj - A Prisma model instance (Account or Transaction).
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
 * Throws with an appropriate message if auth or DB lookup fails.
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
 * Creates a new bank account for the authenticated user.
 * The first account created is always marked as the default.
 *
 * @param {{ name: string, type: string, balance: string|number, isDefault?: boolean }} data
 * @returns {Promise<{ success: true, data: object }>}
 */
export async function createAccount(data) {
  try {
    const { user } = await getAuthenticatedUser();

    const balanceFloat = parseFloat(data.balance);
    if (isNaN(balanceFloat)) throw new Error("Invalid balance amount");

    const existingAccounts = await db.account.findMany({
      where: { userId: user.id },
    });

    // First account is always the default regardless of the flag sent by client
    const shouldBeDefault =
      existingAccounts.length === 0 ? true : Boolean(data.isDefault);

    // Remove default flag from any existing account before setting a new one
    if (shouldBeDefault) {
      await db.account.updateMany({
        where: { userId: user.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const account = await db.account.create({
      data: {
        ...data,
        balance: balanceFloat,
        userId: user.id,
        isDefault: shouldBeDefault,
      },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns all accounts owned by the authenticated user,
 * ordered by creation date (newest first), including a
 * count of associated transactions.
 *
 * @returns {Promise<object[]>}
 */
export async function getUserAccounts() {
  try {
    const { user } = await getAuthenticatedUser();

    const accounts = await db.account.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { transactions: true } },
      },
    });

    return accounts.map(serializeTransaction);
  } catch (error) {
    const msg = error.message || "";
    // Gracefully handle DB unavailability (e.g. no connection in dev)
    if (msg.includes("connect") || msg.includes("ECONNREFUSED") || msg.includes("Unauthorized") || msg.includes("User not found")) {
      return [];
    }
    console.error("[getUserAccounts]", msg);
    throw new Error("Failed to load accounts. Please try again.");
  }
}

/**
 * Sets the specified account as the user's default,
 * clearing the flag from any previous default.
 *
 * @param {string} accountId
 * @returns {Promise<{ success: true, data: object }>}
 */
export async function updateDefaultAccount(accountId) {
  try {
    const { user } = await getAuthenticatedUser();

    // Clear existing default
    await db.account.updateMany({
      where: { userId: user.id, isDefault: true },
      data: { isDefault: false },
    });

    const account = await db.account.update({
      where: { id: accountId, userId: user.id },
      data: { isDefault: true },
    });

    revalidatePath("/dashboard");

    return { success: true, data: serializeTransaction(account) };
  } catch (error) {
    throw new Error(error.message);
  }
}

/**
 * Returns all transactions for the authenticated user,
 * ordered by date descending, for use on the dashboard.
 *
 * @returns {Promise<object[]>}
 */
export async function getDashboardData() {
  try {
    const { user } = await getAuthenticatedUser();

    const transactions = await db.transaction.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
    });

    return transactions.map(serializeTransaction);
  } catch (error) {
    const msg = error.message || "";
    if (msg.includes("connect") || msg.includes("ECONNREFUSED") || msg.includes("Unauthorized") || msg.includes("User not found")) {
      return [];
    }
    console.error("[getDashboardData]", msg);
    throw new Error("Failed to load transactions. Please try again.");
  }
}
