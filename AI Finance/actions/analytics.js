"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { subDays, startOfDay, format } from "date-fns";

export async function getAnalyticsData(accountId, days = 30) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });
    if (!user) throw new Error("User not found");

    const startDate = startOfDay(subDays(new Date(), days));

    const whereClause = {
      userId: user.id,
      date: { gte: startDate },
    };
    if (accountId) {
      whereClause.accountId = accountId;
    }

    const transactions = await db.transaction.findMany({
      where: whereClause,
      orderBy: { date: "asc" },
    });

    // 1. Monthly Trends
    const monthlyTrends = {};
    transactions.forEach((t) => {
      const monthYear = format(t.date, "MMM yyyy");
      if (!monthlyTrends[monthYear]) {
        monthlyTrends[monthYear] = { month: monthYear, income: 0, expense: 0 };
      }
      if (t.type === "INCOME") {
        monthlyTrends[monthYear].income += t.amount.toNumber();
      } else {
        monthlyTrends[monthYear].expense += t.amount.toNumber();
      }
    });

    // 2. Category Breakdown
    const categoryTotals = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        categoryTotals[t.category] =
          (categoryTotals[t.category] || 0) + t.amount.toNumber();
      });

    const categoryBreakdown = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8);

    // 3. Daily Spending
    const dailySpendingObject = {};
    const recentTransactions = transactions.filter(
      (t) => t.type === "EXPENSE" && t.date >= startOfDay(subDays(new Date(), 30))
    );
    recentTransactions.forEach((t) => {
      const day = format(t.date, "yyyy-MM-dd");
      dailySpendingObject[day] = (dailySpendingObject[day] || 0) + t.amount.toNumber();
    });
    const dailySpending = Object.entries(dailySpendingObject).map(([date, amount]) => ({
      date,
      amount,
    }));

    // 4. Weekday Pattern
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const weekdayTotals = {
      0: { day: "Sun", total: 0, count: 0 },
      1: { day: "Mon", total: 0, count: 0 },
      2: { day: "Tue", total: 0, count: 0 },
      3: { day: "Wed", total: 0, count: 0 },
      4: { day: "Thu", total: 0, count: 0 },
      5: { day: "Fri", total: 0, count: 0 },
      6: { day: "Sat", total: 0, count: 0 },
    };

    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const dayOfWeek = t.date.getDay();
        weekdayTotals[dayOfWeek].total += t.amount.toNumber();
        weekdayTotals[dayOfWeek].count += 1;
      });

    const weekdayPattern = Object.values(weekdayTotals).map((w) => ({
      day: w.day,
      average: w.count > 0 ? w.total / w.count : 0,
    }));

    // 5. Top Merchants
    const merchantTotals = {};
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const desc = t.description || "Unknown";
        if (!merchantTotals[desc]) {
          merchantTotals[desc] = { name: desc, total: 0, count: 0 };
        }
        merchantTotals[desc].total += t.amount.toNumber();
        merchantTotals[desc].count += 1;
      });

    const topMerchants = Object.values(merchantTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    // Totals & Savings Rate
    const totalIncome = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);
    const totalExpenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount.toNumber(), 0);

    let savingsRate = 0;
    if (totalIncome > 0 && totalIncome >= totalExpenses) {
      savingsRate = ((totalIncome - totalExpenses) / totalIncome) * 100;
    }

    return {
      monthlyTrends: Object.values(monthlyTrends),
      categoryBreakdown,
      dailySpending,
      weekdayPattern,
      topMerchants,
      savingsRate: parseFloat(savingsRate.toFixed(2)),
      totalIncome: parseFloat(totalIncome.toFixed(2)),
      totalExpenses: parseFloat(totalExpenses.toFixed(2)),
      transactionCount: transactions.length,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}
