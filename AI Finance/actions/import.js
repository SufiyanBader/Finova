"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function importTransactions(transactions, accountId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const account = await db.account.findFirst({
      where: { id: accountId, userId: user.id },
    });
    if (!account) throw new Error("Account not found");

    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to import");
    }

    const created = await db.transaction.createMany({
      data: transactions.map((t) => ({
        type: t.type,
        amount: t.amount,
        description: t.description,
        date: new Date(t.date),
        category: t.category,
        accountId,
        userId: user.id,
        isRecurring: t.isRecurring || false,
        status: "COMPLETED",
      })),
    });

    const balanceChange = transactions.reduce((sum, t) => {
      return sum + (t.type === "INCOME" ? t.amount : -t.amount);
    }, 0);

    await db.account.update({
      where: { id: accountId },
      data: { balance: { increment: balanceChange } },
    });

    revalidatePath("/dashboard");
    revalidatePath(`/account/${accountId}`);
    
    return { success: true, count: created.count };
  } catch (error) {
    throw new Error(error.message);
  }
}
