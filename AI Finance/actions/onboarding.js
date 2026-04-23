"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createAccount } from "@/actions/dashboard";
import { updateBudget } from "@/actions/budget";

export async function completeOnboarding(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    if (data.accountName && data.accountType && data.initialBalance !== undefined) {
      await createAccount({
        name: data.accountName,
        type: data.accountType,
        balance: data.initialBalance.toString(),
        isDefault: true,
      });
    }

    if (data.monthlyBudget && parseFloat(data.monthlyBudget) > 0) {
      await updateBudget(parseFloat(data.monthlyBudget));
    }

    await db.user.update({
      where: { clerkUserId: userId },
      data: { isOnboarded: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function checkOnboardingStatus() {
  try {
    const { userId } = await auth();
    if (!userId) return { isOnboarded: false };

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
      select: { isOnboarded: true },
    });

    return { isOnboarded: user?.isOnboarded ?? false };
  } catch (error) {
    return { isOnboarded: false };
  }
}
