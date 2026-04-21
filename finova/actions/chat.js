"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { sendResilientChat, SUPPORTED_MODELS } from "@/lib/gemini";

export async function sendChatMessage(message, conversationHistory) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 90);

    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: "desc" },
      take: 100,
    });

    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const totalExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    const byCategory = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((acc, t) => {
        acc[t.category] = (acc[t.category] || 0) + t.amount.toNumber();
        return acc;
      }, {});

    const topCategories = Object.entries(byCategory)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([cat, amt]) => `${cat}: $${amt.toFixed(2)}`)
      .join(", ");

    const systemPrompt = `
      You are AI Finance assistant, a helpful personal finance assistant.
      You have access to the user's financial data for the last 90 days.
      
      User: ${user.name || "User"}
      
      Financial Summary (Last 90 Days):
      - Total Income: $${totalIncome.toFixed(2)}
      - Total Expenses: $${totalExpenses.toFixed(2)}
      - Net Savings: $${(totalIncome - totalExpenses).toFixed(2)}
      - Top Expense Categories: ${topCategories}
      - Total Transactions: ${transactions.length}
      
      Recent Transactions (last 10):
      ${transactions
        .slice(0, 10)
        .map(
          (t) =>
            `${t.date.toISOString().split("T")[0]} | ${t.type} | $${t.amount.toNumber().toFixed(2)} | ${t.category} | ${t.description || "No description"}`
        )
        .join("\n")}
      
      Guidelines:
      - Answer questions about the user's finances using the data above
      - Give specific numbers when available
      - Be concise, friendly, and actionable
      - If asked something outside your data, say so honestly
      - Format currency as USD with 2 decimal places
      - Keep responses under 150 words unless detail is needed
    `.trim();

    const history = [
      { role: "user", parts: [{ text: systemPrompt }] },
      {
        role: "model",
        parts: [
          {
            text: "I have received your financial data and guidelines. I am ready to assist you as AI Finance assistant. How can I help you today?",
          },
        ],
      },
      ...conversationHistory.map((msg) => ({
        role: msg.role === "user" ? "user" : "model",
        parts: [{ text: msg.content }],
      })),
    ];

    const text = await sendResilientChat(
      SUPPORTED_MODELS.FLASH,
      history,
      message
    );

    return { success: true, message: text };
  } catch (error) {
    console.error("[sendChatMessage] Error:", error.message);
    throw new Error("I'm experiencing high demand right now. Please try again in a moment.");
  }
}
