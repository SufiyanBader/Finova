import { db } from "@/lib/prisma";

// Cache duration: 1 hour
const CACHE_DURATION_MS = 60 * 60 * 1000;

// ---------------------------------------------------------------------------
// Internal: fetch a live rate from the free exchangerate-api endpoint
// ---------------------------------------------------------------------------

async function fetchRateFromAPI(from, to) {
  try {
    const response = await fetch(
      `https://api.exchangerate-api.com/v4/latest/${from}`,
      { cache: "force-cache", next: { revalidate: 3600 } }
    );

    if (!response.ok) {
      throw new Error(`Exchange rate API responded with ${response.status}`);
    }

    const data = await response.json();

    if (!data.rates || data.rates[to] === undefined) {
      throw new Error(`Rate not available for ${to}`);
    }

    return data.rates[to];
  } catch (error) {
    console.error("[fetchRateFromAPI]", error.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// Public: get exchange rate with 1-hour DB caching
// ---------------------------------------------------------------------------

export async function getExchangeRate(from, to) {
  if (from === to) return 1;

  try {
    const cached = await db.currencyRate.findUnique({
      where: {
        baseCurrency_targetCurrency: {
          baseCurrency: from,
          targetCurrency: to,
        },
      },
    });

    const now = new Date();
    const isCacheValid =
      cached &&
      now.getTime() - cached.fetchedAt.getTime() < CACHE_DURATION_MS;

    if (isCacheValid) {
      return cached.rate.toNumber();
    }

    const freshRate = await fetchRateFromAPI(from, to);

    if (!freshRate) {
      // Return stale cache rather than failing completely
      if (cached) return cached.rate.toNumber();
      return 1;
    }

    await db.currencyRate.upsert({
      where: {
        baseCurrency_targetCurrency: {
          baseCurrency: from,
          targetCurrency: to,
        },
      },
      update: { rate: freshRate, fetchedAt: now },
      create: { baseCurrency: from, targetCurrency: to, rate: freshRate },
    });

    return freshRate;
  } catch (error) {
    console.error("[getExchangeRate]", error.message);
    return 1;
  }
}

// ---------------------------------------------------------------------------
// Public: convert an amount between two currencies
// ---------------------------------------------------------------------------

export async function convertAmount(amount, from, to) {
  const rate = await getExchangeRate(from, to);
  return {
    convertedAmount: amount * rate,
    exchangeRate: rate,
  };
}

// ---------------------------------------------------------------------------
// Public: format a number as a locale-aware currency string
// ---------------------------------------------------------------------------

