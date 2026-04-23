import { cache } from "react";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";

/**
 * Retrieves the currently authenticated Clerk user and
 * ensures a matching record exists in the database.
 * Creates a new User record on first sign-in.
 *
 * Returns null gracefully if:
 * - No user is authenticated
 * - The database is unavailable (e.g. no connection in dev)
 *
 * @returns {Promise<import("@prisma/client").User | null>}
 */
export const checkUser = cache(async function checkUser() {
  try {
    const user = await currentUser();
    if (!user) return null;

    // Return existing user if already synced
    const loggedInUser = await db.user.findUnique({
      where: { clerkUserId: user.id },
    });

    if (loggedInUser) return loggedInUser;

    // First login – persist user to database
    const name = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ");

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      console.error("[checkUser] No email found for Clerk user:", user.id);
      return null;
    }

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name: name || null,
        imageUrl: user.imageUrl ?? null,
        email,
      },
    });

    return newUser;
  } catch (error) {
    const msg = error.message || "";
    // Avoid logging common connection errors to prevent the red overlay in dev mode
    if (
      !msg.includes("connect") &&
      !msg.includes("ECONNREFUSED") &&
      !msg.includes("ENOTFOUND")
    ) {
      console.error("[checkUser] Unexpected Error:", msg);
    }
    return null;
  }
});
