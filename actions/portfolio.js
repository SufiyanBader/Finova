"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import {
  getAssetPrice,
  getBulkPrices,
} from "@/lib/market-data";
import { calculatePortfolioMetrics } from "@/lib/formatters";
import { getExchangeRate } from "@/lib/currency";

// Helper to enrich holdings with currency conversion
async function enrichHoldingsWithCurrency(holdings, priceMap, baseCurrency) {
  return await Promise.all(
    holdings.map(async (h) => {
      const priceData = priceMap.get(h.symbol) || {
        price: 0,
        change: 0,
        changePercent: 0,
        currency: "USD",
      };

      let rate = 1;
      const assetCurrency = priceData.currency || "USD";
      
      // If asset is not MANUAL and its native currency differs from user's base currency
      if (h.assetType !== "MANUAL" && assetCurrency !== baseCurrency) {
        rate = await getExchangeRate(assetCurrency, baseCurrency);
      }

      return {
        ...h,
        quantity: h.quantity.toNumber(),
        averageBuyPrice: h.averageBuyPrice.toNumber(),
        currentPrice: priceData.price * rate,
        change: priceData.change * rate,
        changePercent: priceData.changePercent,
      };
    })
  );
}

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

function serializeHolding(holding) {
  return {
    ...holding,
    quantity: holding.quantity.toNumber(),
    averageBuyPrice: holding.averageBuyPrice.toNumber(),
    currentPrice: holding.currentPrice.toNumber(),
  };
}

function serializePortfolioTransaction(tx) {
  return {
    ...tx,
    quantity: tx.quantity.toNumber(),
    price: tx.price.toNumber(),
    totalAmount: tx.totalAmount.toNumber(),
    fees: tx.fees.toNumber(),
  };
}

export async function createPortfolio(data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const portfolio = await db.portfolio.create({
      data: {
        name: data.name.trim(),
        description: data.description?.trim() || null,
        color: data.color || "#6366f1",
        userId: user.id,
      },
    });

    revalidatePath("/portfolio");
    return { success: true, data: portfolio };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getPortfolios() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const cookieStore = await cookies();
    const uiCurrency = cookieStore.get("ai_finance_currency")?.value;

    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    const baseCurrency = uiCurrency || (defaultAccount ? defaultAccount.currency : "USD");

    const portfolios = await db.portfolio.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        holdings: true,
        _count: {
          select: { holdings: true, transactions: true },
        },
      },
    });

    // Collect all unique assets across all portfolios
    const allAssets = [];
    const seenSymbols = new Set();
    portfolios.forEach((p) => {
      p.holdings.forEach((h) => {
        if (!seenSymbols.has(h.symbol)) {
          allAssets.push({ symbol: h.symbol, assetType: h.assetType });
          seenSymbols.add(h.symbol);
        }
      });
    });

    // Fetch all prices in one go
    const priceMap = await getBulkPrices(allAssets);

    const result = await Promise.all(
      portfolios.map(async (p) => {
        const enrichedHoldings = await enrichHoldingsWithCurrency(
          p.holdings,
          priceMap,
          baseCurrency
        );

        const metrics = calculatePortfolioMetrics(enrichedHoldings);

      return {
        id: p.id,
        name: p.name,
        description: p.description,
        color: p.color,
        createdAt: p.createdAt,
        holdingsCount: p._count.holdings,
        transactionsCount: p._count.transactions,
        totalValue: metrics.totalValue,
        totalGainLoss: metrics.totalGainLoss,
        totalGainLossPercent: metrics.totalGainLossPercent,
        totalDayChange: metrics.totalDayChange,
        totalDayChangePercent: metrics.totalDayChangePercent,
        holdings: p.holdings.map(serializeHolding),
      };
    })
  );

  return result;
  } catch (error) {
    console.error("[getPortfolios]", error.message);
    return [];
  }
}

export async function getPortfolioById(portfolioId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const cookieStore = await cookies();
    const uiCurrency = cookieStore.get("ai_finance_currency")?.value;

    const defaultAccount = await db.account.findFirst({
      where: { userId: user.id, isDefault: true },
    });
    const baseCurrency = uiCurrency || (defaultAccount ? defaultAccount.currency : "USD");

    const portfolio = await db.portfolio.findUnique({
      where: {
        id: portfolioId,
        userId: user.id,
      },
      include: {
        holdings: {
          orderBy: { createdAt: "asc" },
        },
        transactions: {
          orderBy: { date: "desc" },
        },
      },
    });

    if (!portfolio) throw new Error("Portfolio not found");

    const assets = portfolio.holdings.map((h) => ({
      symbol: h.symbol,
      assetType: h.assetType,
    }));

    const priceMap = await getBulkPrices(assets);

    const enrichedHoldings = await enrichHoldingsWithCurrency(
      portfolio.holdings,
      priceMap,
      baseCurrency
    );

    const metrics = calculatePortfolioMetrics(enrichedHoldings);

    const allocationByType = enrichedHoldings.reduce((acc, h) => {
      acc[h.assetType] = (acc[h.assetType] || 0) + h.currentValue;
      return acc;
    }, {});

    const sectorAllocation = enrichedHoldings
      .filter((h) => h.assetType === "STOCK" && h.sector)
      .reduce((acc, h) => {
        acc[h.sector] = (acc[h.sector] || 0) + h.currentValue;
        return acc;
      }, {});

    const sortedHoldings = [...metrics.holdings];

    return {
      id: portfolio.id,
      name: portfolio.name,
      description: portfolio.description,
      color: portfolio.color,
      createdAt: portfolio.createdAt,
      holdings: metrics.holdings,
      transactions: portfolio.transactions.map(serializePortfolioTransaction),
      metrics: {
        totalValue: metrics.totalValue,
        totalCost: metrics.totalCost,
        totalGainLoss: metrics.totalGainLoss,
        totalGainLossPercent: metrics.totalGainLossPercent,
        totalDayChange: metrics.totalDayChange,
        totalDayChangePercent: metrics.totalDayChangePercent,
      },
      allocationByType,
      sectorAllocation,
      topPerformers: [...sortedHoldings]
        .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
        .slice(0, 3),
      worstPerformers: [...sortedHoldings]
        .sort((a, b) => a.gainLossPercent - b.gainLossPercent)
        .slice(0, 3),
      history: Array.from({ length: 30 }).map((_, i) => {
        const date = new Date();
        date.setDate(date.getDate() - (29 - i));
        // Mock random walk around current value
        const randomFactor = 1 + (Math.random() * 0.04 - 0.02);
        return {
          date: date.toISOString().split("T")[0],
          value: metrics.totalValue * randomFactor,
        };
      }),
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function addHolding(portfolioId, data) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId, userId: user.id },
    });

    if (!portfolio) throw new Error("Portfolio not found or unauthorized");

    const existingHolding = await db.portfolioHolding.findUnique({
      where: {
        portfolioId_symbol: {
          portfolioId,
          symbol: data.symbol.toUpperCase(),
        },
      },
    });

    if (existingHolding) {
      const existingQty = existingHolding.quantity.toNumber();
      const existingAvg = existingHolding.averageBuyPrice.toNumber();
      const newQty = parseFloat(data.quantity);
      const newPrice = parseFloat(data.averageBuyPrice);

      const totalQty = existingQty + newQty;
      const newAvgPrice =
        (existingQty * existingAvg + newQty * newPrice) / totalQty;

      await db.portfolioHolding.update({
        where: { id: existingHolding.id },
        data: {
          quantity: totalQty,
          averageBuyPrice: newAvgPrice,
          updatedAt: new Date(),
        },
      });
    } else {
      const priceData = await getAssetPrice(data.symbol, data.assetType);

      await db.portfolioHolding.create({
        data: {
          portfolioId,
          symbol: data.symbol.toUpperCase(),
          name: data.name,
          assetType: data.assetType,
          quantity: parseFloat(data.quantity),
          averageBuyPrice: parseFloat(data.averageBuyPrice),
          currentPrice: priceData?.price || 0,
          lastPriceUpdate: new Date(),
          sector: data.sector || null,
          userId: user.id,
        },
      });
    }

    await db.portfolioTransaction.create({
      data: {
        portfolioId,
        symbol: data.symbol.toUpperCase(),
        name: data.name,
        assetType: data.assetType,
        type: "BUY",
        quantity: parseFloat(data.quantity),
        price: parseFloat(data.averageBuyPrice),
        totalAmount: parseFloat(data.quantity) * parseFloat(data.averageBuyPrice),
        fees: 0,
        date: new Date(),
        userId: user.id,
      },
    });

    revalidatePath(`/portfolio/${portfolioId}`);
    revalidatePath("/portfolio");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function removeHolding(holdingId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const holding = await db.portfolioHolding.findUnique({
      where: { id: holdingId, userId: user.id },
    });

    if (!holding) throw new Error("Holding not found");

    await db.portfolioHolding.delete({
      where: { id: holdingId },
    });

    revalidatePath(`/portfolio/${holding.portfolioId}`);
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function deletePortfolio(portfolioId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    await db.portfolio.delete({
      where: { id: portfolioId, userId: user.id },
    });

    revalidatePath("/portfolio");
    return { success: true };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function refreshPortfolioPrices(portfolioId) {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const portfolio = await db.portfolio.findUnique({
      where: { id: portfolioId, userId: user.id },
      include: { holdings: true },
    });

    if (!portfolio) throw new Error("Portfolio not found");

    for (const holding of portfolio.holdings) {
      await db.assetPrice.deleteMany({
        where: { symbol: holding.symbol, assetType: holding.assetType },
      });

      const priceData = await getAssetPrice(holding.symbol, holding.assetType);

      await db.portfolioHolding.update({
        where: { id: holding.id },
        data: {
          currentPrice: priceData.price || holding.currentPrice,
          lastPriceUpdate: new Date(),
        },
      });
    }

    revalidatePath(`/portfolio/${portfolioId}`);
    return { success: true, updatedCount: portfolio.holdings.length };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getNetWorth() {
  try {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const user = await db.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!user) throw new Error("User not found");

    const accounts = await db.account.findMany({
      where: { userId: user.id },
    });

    const cashTotal = accounts.reduce(
      (sum, account) => sum + account.balance.toNumber(),
      0
    );

    const portfolios = await getPortfolios();

    const investmentsTotal = portfolios.reduce(
      (sum, p) => sum + p.totalValue,
      0
    );

    return {
      cashTotal,
      investmentsTotal,
      netWorth: cashTotal + investmentsTotal,
      accounts: accounts.map((a) => ({
        id: a.id,
        name: a.name,
        balance: a.balance.toNumber(),
        type: a.type,
      })),
      portfolioSummary: portfolios.map((p) => ({
        id: p.id,
        name: p.name,
        color: p.color,
        totalValue: p.totalValue,
        totalGainLoss: p.totalGainLoss,
      })),
    };
  } catch (error) {
    console.error("[getNetWorth]", error.message);
    return { cashTotal: 0, investmentsTotal: 0, netWorth: 0, accounts: [], portfolioSummary: [] };
  }
}

import { POPULAR_STOCKS, POPULAR_CRYPTO } from "@/lib/constants";
import { searchIndianStocks } from "@/lib/market-data";

export async function searchAssets(query, type) {
  try {
    const { userId } = await auth();
    if (!userId) return [];

    const lowerQuery = query.toLowerCase();

    // Run US stock search (local list) and Indian stock search (live API) in parallel
    const [usStockResults, indianResults, cryptoResults] = await Promise.all([
      // ── US Stocks (local curated list) ──────────────────────────────────
      (type === "STOCK" || type === "ETF" || type === "ALL")
        ? Promise.resolve(
            POPULAR_STOCKS
              .filter(
                (s) =>
                  s.symbol.toLowerCase().includes(lowerQuery) ||
                  s.name.toLowerCase().includes(lowerQuery)
              )
              .map((s) => ({ ...s, assetType: "STOCK", exchange: "US" }))
          )
        : Promise.resolve([]),

      // ── Indian NSE/BSE Stocks (live Twelve Data symbol_search) ──────────
      (type === "STOCK" || type === "ETF" || type === "ALL")
        ? searchIndianStocks(query)
        : Promise.resolve([]),

      // ── Crypto (local list) ─────────────────────────────────────────────
      (type === "CRYPTO" || type === "ALL")
        ? Promise.resolve(
            POPULAR_CRYPTO
              .filter(
                (c) =>
                  c.symbol.toLowerCase().includes(lowerQuery) ||
                  c.name.toLowerCase().includes(lowerQuery)
              )
              .map((c) => ({ ...c, assetType: "CRYPTO" }))
          )
        : Promise.resolve([]),
    ]);

    const results = [...usStockResults, ...indianResults, ...cryptoResults];
    return results.slice(0, 20);
  } catch (error) {
    console.error("[searchAssets]", error.message);
    return [];
  }
}

