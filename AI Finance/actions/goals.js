"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { sanitizeString } from "@/lib/sanitize";

function serializeDecimal(obj) {
  const serialized = { ...obj };
  if (obj.balance !== undefined && obj.balance !== null) {
    serialized.balance = obj.balance.toNumber ? obj.balance.toNumber() : obj.balance;
  }
  if (obj.amount !== undefined && obj.amount !== null) {
    serialized.amount = obj.amount.toNumber ? obj.amount.toNumber() : obj.amount;
  }
  if (obj.targetAmount !== undefined && obj.targetAmount !== null) {
    serialized.targetAmount = obj.targetAmount.toNumber ? obj.targetAmount.toNumber() : obj.targetAmount;
  }
  if (obj.savedAmount !== undefined && obj.savedAmount !== null) {
    serialized.savedAmount = obj.savedAmount.toNumber ? obj.savedAmount.toNumber() : obj.savedAmount;
  }
  return serialized;
}

export async function createGoal(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goal = await db.goal.create({
      data: {
        name: sanitizeString(data.name),
        targetAmount: parseFloat(data.targetAmount),
        savedAmount: 0,
        deadline: data.deadline ? new Date(data.deadline) : null,
        userId: user.id,
        accountId: data.accountId || null,
      },
    });

    revalidatePath("/goals");
    return { success: true, data: serializeDecimal(goal) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getGoals() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goals = await db.goal.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { account: true },
    });

    return goals.map((g) => ({
      ...serializeDecimal(g),
      targetAmount: g.targetAmount.toNumber(),
      savedAmount: g.savedAmount.toNumber(),
    }));
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateGoalProgress(goalId, amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id },
    });
    if (!goal) throw new Error("Goal not found");

    const newSavedAmount = goal.savedAmount.toNumber() + parseFloat(amount);
    const isCompleted = newSavedAmount >= goal.targetAmount.toNumber();

    const updated = await db.$transaction(async (tx) => {
      const updatedGoal = await tx.goal.update({
        where: { id: goalId },
        data: {
          savedAmount: newSavedAmount,
          isCompleted,
        },
      });

      // Debit the linked account balance if one is set
      if (goal.accountId) {
        await tx.account.update({
          where: { id: goal.accountId, userId: user.id },
          data: { balance: { decrement: parseFloat(amount) } },
        });
      }

      return updatedGoal;
    });

    revalidatePath("/goals");
    return { success: true, data: serializeDecimal(updated) };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteGoal(goalId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    await db.goal.deleteMany({
      where: { id: goalId, userId: user.id },
    });

    revalidatePath("/goals");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function updateGoal(goalId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const goal = await db.goal.findFirst({
      where: { id: goalId, userId: user.id }
    });
    if (!goal) throw new Error("Goal not found");

    const updated = await db.goal.update({
      where: { id: goalId },
      data: {
        name: sanitizeString(data.name),
        targetAmount: parseFloat(data.targetAmount),
        deadline: data.deadline ? new Date(data.deadline) : null,
      },
    });

    revalidatePath("/goals");
    return { success: true, data: serializeDecimal(updated) };
  } catch (error) {
    throw new Error(error.message);
  }
}
