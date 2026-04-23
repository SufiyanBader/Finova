import { db } from "@/lib/prisma";

// ---------------------------------------------------------------------------
// All supported currencies with display metadata
// ---------------------------------------------------------------------------

export const SUPPORTED_CURRENCIES = {
  USD: { name: "US Dollar",          symbol: "$",    flag: "US" },
  EUR: { name: "Euro",               symbol: "€",    flag: "EU" },
  GBP: { name: "British Pound",      symbol: "£",    flag: "GB" },
  JPY: { name: "Japanese Yen",       symbol: "¥",    flag: "JP" },
  AUD: { name: "Australian Dollar",  symbol: "A$",   flag: "AU" },
  CAD: { name: "Canadian Dollar",    symbol: "C$",   flag: "CA" },
  CHF: { name: "Swiss Franc",        symbol: "Fr",   flag: "CH" },
  CNY: { name: "Chinese Yuan",       symbol: "¥",    flag: "CN" },
  INR: { name: "Indian Rupee",       symbol: "₹",    flag: "IN" },
  MXN: { name: "Mexican Peso",       symbol: "$",    flag: "MX" },
  BRL: { name: "Brazilian Real",     symbol: "R$",   flag: "BR" },
  KRW: { name: "South Korean Won",   symbol: "₩",    flag: "KR" },
  SGD: { name: "Singapore Dollar",   symbol: "S$",   flag: "SG" },
  HKD: { name: "Hong Kong Dollar",   symbol: "HK$",  flag: "HK" },
  NOK: { name: "Norwegian Krone",    symbol: "kr",   flag: "NO" },
  SEK: { name: "Swedish Krona",      symbol: "kr",   flag: "SE" },
  DKK: { name: "Danish Krone",       symbol: "kr",   flag: "DK" },
  NZD: { name: "New Zealand Dollar", symbol: "NZ$",  flag: "NZ" },
  ZAR: { name: "South African Rand", symbol: "R",    flag: "ZA" },
  THB: { name: "Thai Baht",          symbol: "฿",    flag: "TH" },
  TRY: { name: "Turkish Lira",       symbol: "₺",    flag: "TR" },
  AED: { name: "UAE Dirham",         symbol: "د.إ",  flag: "AE" },
  SAR: { name: "Saudi Riyal",        symbol: "﷼",   flag: "SA" },
  IDR: { name: "Indonesian Rupiah",  symbol: "Rp",   flag: "ID" },
  MYR: { name: "Malaysian Ringgit",  symbol: "RM",   flag: "MY" },
  PHP: { name: "Philippine Peso",    symbol: "₱",    flag: "PH" },
  PLN: { name: "Polish Zloty",       symbol: "zł",   flag: "PL" },
  CZK: { name: "Czech Koruna",       symbol: "Kč",   flag: "CZ" },
  HUF: { name: "Hungarian Forint",   symbol: "Ft",   flag: "HU" },
  ILS: { name: "Israeli Shekel",     symbol: "₪",    flag: "IL" },
};

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

export function formatCurrency(amount, currencyCode) {
  const code = currencyCode && SUPPORTED_CURRENCIES[currencyCode]
    ? currencyCode
    : "USD";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

// ---------------------------------------------------------------------------
// Public: get just the symbol for a currency code
// ---------------------------------------------------------------------------

export function getCurrencySymbol(currencyCode) {
  return SUPPORTED_CURRENCIES[currencyCode]?.symbol ?? currencyCode;
}
