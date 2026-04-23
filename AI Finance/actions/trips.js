"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/prisma";
import { getExchangeRate, convertAmount } from "@/lib/currency";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function serializeDecimal(obj) {
  const result = { ...obj };
  Object.keys(result).forEach((key) => {
    if (
      result[key] !== null &&
      typeof result[key] === "object" &&
      typeof result[key].toNumber === "function"
    ) {
      result[key] = result[key].toNumber();
    }
  });
  return result;
}

async function getAuthenticatedUser() {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const user = await db.user.findUnique({ where: { clerkUserId: userId } });
  if (!user) throw new Error("User not found");

  return { userId, user };
}

function serializeExpense(e) {
  return {
    ...serializeDecimal(e),
    amount: e.amount.toNumber(),
    convertedAmount: e.convertedAmount.toNumber(),
    exchangeRate: e.exchangeRate.toNumber(),
  };
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const TRIP_CATEGORIES = [
  "accommodation",
  "transport",
  "food",
  "activities",
  "shopping",
  "health",
  "communication",
  "visa",
  "insurance",
  "other",
];

// ---------------------------------------------------------------------------
// FUNCTION 1: createTrip
// ---------------------------------------------------------------------------

export async function createTrip(data) {
  try {
    const { user } = await getAuthenticatedUser();

    const startDate = new Date(data.startDate);
    if (isNaN(startDate.getTime())) {
      throw new Error("Invalid start date");
    }

    const endDate = data.endDate ? new Date(data.endDate) : null;
    if (endDate && isNaN(endDate.getTime())) {
      throw new Error("Invalid end date");
    }
    if (endDate && endDate < startDate) {
      throw new Error("End date must be on or after start date");
    }

    const budget =
      data.budget && data.budget !== ""
        ? parseFloat(data.budget)
        : null;

    const trip = await db.trip.create({
      data: {
        name: data.name.trim(),
        destination: data.destination.trim(),
        baseCurrency: data.baseCurrency || "USD",
        budget,
        startDate,
        endDate,
        coverColor: data.coverColor || "#6366f1",
        userId: user.id,
      },
    });

    revalidatePath("/trips");

    return {
      success: true,
      data: {
        ...serializeDecimal(trip),
        budget: trip.budget ? trip.budget.toNumber() : null,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 2: getTrips
// ---------------------------------------------------------------------------

export async function getTrips() {
  try {
    const { user } = await getAuthenticatedUser();

    const trips = await db.trip.findMany({
      where: { userId: user.id },
      include: {
        expenses: true,
        _count: { select: { expenses: true } },
      },
      orderBy: { startDate: "desc" },
    });

    return trips.map((trip) => {
      const totalSpent = trip.expenses.reduce(
        (sum, e) => sum + e.convertedAmount.toNumber(),
        0
      );

      // Most used currency among expenses
      const currencyCount = {};
      trip.expenses.forEach((e) => {
        currencyCount[e.currency] = (currencyCount[e.currency] || 0) + 1;
      });
      const topCurrency =
        Object.keys(currencyCount).sort(
          (a, b) => currencyCount[b] - currencyCount[a]
        )[0] || trip.baseCurrency;

      return {
        ...serializeDecimal(trip),
        budget: trip.budget ? trip.budget.toNumber() : null,
        totalSpent,
        expenseCount: trip._count.expenses,
        topCurrency,
        expenses: trip.expenses.map(serializeExpense),
      };
    });
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 3: getTripById
// ---------------------------------------------------------------------------

export async function getTripById(tripId) {
  try {
    const { user } = await getAuthenticatedUser();

    const trip = await db.trip.findUnique({
      where: { id: tripId, userId: user.id },
      include: {
        expenses: { orderBy: { date: "desc" } },
      },
    });

    if (!trip) throw new Error("Trip not found");

    const expenses = trip.expenses.map(serializeExpense);
    const totalSpent = expenses.reduce((s, e) => s + e.convertedAmount, 0);
    const budgetRemaining =
      trip.budget ? trip.budget.toNumber() - totalSpent : null;

    // Group by category
    const byCategory = {};
    expenses.forEach((e) => {
      if (!byCategory[e.category]) {
        byCategory[e.category] = { total: 0, count: 0, expenses: [] };
      }
      byCategory[e.category].total += e.convertedAmount;
      byCategory[e.category].count += 1;
      byCategory[e.category].expenses.push(e);
    });

    // Group by currency
    const byCurrency = {};
    expenses.forEach((e) => {
      if (!byCurrency[e.currency]) {
        byCurrency[e.currency] = { total: 0, convertedTotal: 0, count: 0 };
      }
      byCurrency[e.currency].total += e.amount;
      byCurrency[e.currency].convertedTotal += e.convertedAmount;
      byCurrency[e.currency].count += 1;
    });

    // Group by day (sorted ascending)
    const byDayUnsorted = {};
    expenses.forEach((e) => {
      const dateKey = new Date(e.date).toISOString().split("T")[0];
      if (!byDayUnsorted[dateKey]) {
        byDayUnsorted[dateKey] = { total: 0, expenses: [] };
      }
      byDayUnsorted[dateKey].total += e.convertedAmount;
      byDayUnsorted[dateKey].expenses.push(e);
    });
    const byDay = Object.fromEntries(
      Object.entries(byDayUnsorted).sort(([a], [b]) =>
        a.localeCompare(b)
      )
    );

    const uniqueDays = Object.keys(byDay).length;

    // Trip duration in calendar days
    const tripStart = new Date(trip.startDate);
    const tripEnd = trip.endDate ? new Date(trip.endDate) : new Date();
    const durationDays = Math.max(
      Math.ceil((tripEnd - tripStart) / (1000 * 60 * 60 * 24)) + 1,
      uniqueDays,
      1
    );

    const dailyAverage = totalSpent / durationDays;

    const mostExpensiveDay =
      uniqueDays > 0
        ? Object.entries(byDay).sort(([, a], [, b]) => b.total - a.total)[0][0]
        : null;

    const topCategory =
      Object.keys(byCategory).length > 0
        ? Object.entries(byCategory).sort(
            ([, a], [, b]) => b.total - a.total
          )[0][0]
        : null;

    return {
      ...serializeDecimal(trip),
      budget: trip.budget ? trip.budget.toNumber() : null,
      expenses,
      stats: {
        totalSpent,
        budgetRemaining,
        byCategory,
        byCurrency,
        byDay,
        dailyAverage,
        mostExpensiveDay,
        topCategory,
        expenseCount: expenses.length,
      },
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 4: addTripExpense
// ---------------------------------------------------------------------------

export async function addTripExpense(tripId, data) {
  try {
    const { user } = await getAuthenticatedUser();

    const trip = await db.trip.findUnique({
      where: { id: tripId, userId: user.id },
    });
    if (!trip) throw new Error("Trip not found");

    const amount = parseFloat(data.amount);
    if (isNaN(amount) || amount <= 0) {
      throw new Error("Invalid amount — must be a positive number");
    }

    const { convertedAmount, exchangeRate } = await convertAmount(
      amount,
      data.currency,
      trip.baseCurrency
    );

    const expense = await db.tripExpense.create({
      data: {
        description: data.description.trim(),
        amount,
        currency: data.currency,
        convertedAmount,
        exchangeRate,
        category: data.category,
        date: new Date(data.date),
        notes: data.notes?.trim() || null,
        tripId,
        userId: user.id,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/trips");

    return { success: true, data: serializeExpense(expense) };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 5: deleteTripExpense
// ---------------------------------------------------------------------------

export async function deleteTripExpense(expenseId) {
  try {
    const { user } = await getAuthenticatedUser();

    const expense = await db.tripExpense.findUnique({
      where: { id: expenseId, userId: user.id },
    });
    if (!expense) throw new Error("Expense not found");

    await db.tripExpense.delete({ where: { id: expenseId } });

    revalidatePath(`/trips/${expense.tripId}`);
    revalidatePath("/trips");

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 6: deleteTrip
// ---------------------------------------------------------------------------

export async function deleteTrip(tripId) {
  try {
    const { user } = await getAuthenticatedUser();

    const trip = await db.trip.findUnique({
      where: { id: tripId, userId: user.id },
    });
    if (!trip) throw new Error("Trip not found");

    await db.trip.delete({ where: { id: tripId, userId: user.id } });

    revalidatePath("/trips");

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 7: completeTrip
// ---------------------------------------------------------------------------

export async function completeTrip(tripId) {
  try {
    const { user } = await getAuthenticatedUser();

    const trip = await db.trip.findUnique({
      where: { id: tripId, userId: user.id },
    });
    if (!trip) throw new Error("Trip not found");

    await db.trip.update({
      where: { id: tripId, userId: user.id },
      data: {
        isCompleted: true,
        endDate: trip.endDate ?? new Date(),
      },
    });

    revalidatePath("/trips");
    revalidatePath(`/trips/${tripId}`);

    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

// ---------------------------------------------------------------------------
// FUNCTION 8: getExchangeRatePreview
// ---------------------------------------------------------------------------

export async function getExchangeRatePreview(from, to, amount) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    if (from === to) {
      return { rate: 1, converted: parseFloat(amount), from, to };
    }

    const rate = await getExchangeRate(from, to);
    return {
      rate,
      converted: parseFloat(amount) * rate,
      from,
      to,
    };
  } catch (error) {
    return { rate: 1, converted: parseFloat(amount) || 0, error: true };
  }
}
