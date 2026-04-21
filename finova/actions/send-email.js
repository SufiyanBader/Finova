"use server";

import { Resend } from "resend";

import { auth } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Sends a transactional email via Resend.
 *
 * @param {{
 *   to: string | string[],
 *   subject: string,
 *   react: React.ReactElement
 * }} options
 * @returns {Promise<{ success: boolean, data?: object, error?: string }>}
 */
export async function sendEmail({ to, subject, react }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      throw new Error("Unauthorized");
    }

    const data = await resend.emails.send({
      from: "AI Finance <onboarding@resend.dev>",
      to,
      subject,
      react,
    });

    return { success: true, data };
  } catch (error) {
    console.error("[sendEmail] Failed to send email:", error);
    return { success: false, error: error.message };
  }
}
