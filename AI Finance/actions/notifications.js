"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getNotifications() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const notifications = await db.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return notifications;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function markAsRead(notificationId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    await db.notification.updateMany({
      where: { id: notificationId, userId: user.id },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function markAllAsRead() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    await db.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function createNotification(userId, title, message, type) {
  try {
    const notification = await db.notification.create({
      data: {
        userId,
        title,
        message,
        type,
      },
    });
    return notification;
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deleteNotification(notificationId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    await db.notification.deleteMany({
      where: { id: notificationId, userId: user.id },
    });

    revalidatePath("/dashboard");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}
