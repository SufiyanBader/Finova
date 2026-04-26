import { db } from "@/lib/prisma";

const PRICE_CACHE_MINUTES = 15;
const CACHE_DURATION_MS = PRICE_CACHE_MINUTES * 60 * 1000;

import { POPULAR_CRYPTO } from "./constants";

// Map crypto symbol to CoinGecko ID
const CRYPTO_COINGECKO_MAP = POPULAR_CRYPTO.reduce((acc, c) => {
  acc[c.symbol] = c.coingeckoId;
  return acc;
}, {});

/**
 * Check if cached price is still valid
 */
function isCacheValid(fetchedAt) {
  return Date.now() - new Date(fetchedAt).getTime() < CACHE_DURATION_MS;
}

/**
 * Get cached price from database
 */
async function getCachedPrice(symbol, assetType) {
  try {
    const cached = await db.assetPrice.findUnique({
      where: {
        symbol_assetType: { symbol, assetType },
      },
    });
    if (cached && isCacheValid(cached.fetchedAt)) {
      return {
        price: cached.price.toNumber(),
        change: cached.change.toNumber(),
        changePercent: cached.changePercent.toNumber(),
        fromCache: true,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Save price to database cache
 */
async function saveToCache(symbol, assetType, price, change, changePercent) {
  try {
    await db.assetPrice.upsert({
      where: {
        symbol_assetType: { symbol, assetType },
      },
      update: {
        price,
        change,
        changePercent,
        fetchedAt: new Date(),
      },
      create: {
        symbol,
        assetType,
        price,
        change,
        changePercent,
      },
    });
  } catch (error) {
    console.error("Failed to save price cache:", error.message);
  }
}

/**
 * Convert a symbol to Twelve Data's required format.
 *
 * Yahoo Finance uses  TATASTEEL.NS  /  TATASTEEL.BO
 * Twelve Data uses    TATASTEEL:NSE /  TATASTEEL:BSE
 */
function toTwelveDataSymbol(symbol) {
  if (symbol.endsWith(".NS")) return symbol.replace(/\.NS$/i, ":NSE");
  if (symbol.endsWith(".BO")) return symbol.replace(/\.BO$/i, ":BSE");
  return symbol;
}

/**
 * Fetch stock price from Twelve Data.
 * Handles NSE/BSE symbols by converting .NS/.BO suffix to :NSE/:BSE notation.
 * Returns null on failure.
 */
async function fetchStockPrice(symbol) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    console.warn("TWELVE_DATA_API_KEY not set");
    return null;
  }

  const tdSymbol = toTwelveDataSymbol(symbol);

  try {
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${encodeURIComponent(tdSymbol)}&apikey=${apiKey}`,
      { next: { revalidate: 900 } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === "error" || !data.close) {
      console.warn(`[fetchStockPrice] No data for ${tdSymbol}:`, data.message || "unknown");
      return null;
    }

    const price = parseFloat(data.close);
    const change = parseFloat(data.change || 0);
    const changePercent = parseFloat(data.percent_change || 0);

    return { price, change, changePercent };
  } catch (error) {
    console.error(`Stock price fetch failed for ${tdSymbol}:`, error.message);
    return null;
  }
}

/**
 * Fetch crypto price from CoinGecko
 * No API key required
 * Returns null on failure
 */
async function fetchCryptoPrice(symbol) {
  const coingeckoId = CRYPTO_COINGECKO_MAP[symbol.toUpperCase()];

  if (!coingeckoId) {
    console.warn(`No CoinGecko ID for ${symbol}`);
    return null;
  }

  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${coingeckoId}&vs_currencies=usd&include_24hr_change=true`,
      { next: { revalidate: 900 } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (!data[coingeckoId]) return null;

    const price = data[coingeckoId].usd;
    const changePercent = data[coingeckoId].usd_24h_change || 0;
    const change = (price * changePercent) / 100;

    return { price, change, changePercent };
  } catch (error) {
    console.error(`Crypto price fetch failed for ${symbol}:`, error.message);
    return null;
  }
}

/**
 * Get price for any asset with caching
 * Returns { price, change, changePercent, fromCache }
 */
export async function getAssetPrice(symbol, assetType) {
  // Check cache first
  const cached = await getCachedPrice(symbol, assetType);
  if (cached) return cached;

  // Fetch fresh price based on asset type
  let priceData = null;

  if (assetType === "CRYPTO") {
    priceData = await fetchCryptoPrice(symbol);
  } else if (assetType === "STOCK" || assetType === "ETF") {
    priceData = await fetchStockPrice(symbol);
  } else if (assetType === "MUTUAL_FUND") {
    priceData = await fetchStockPrice(symbol);
  }

  if (priceData) {
    await saveToCache(
      symbol,
      assetType,
      priceData.price,
      priceData.change,
      priceData.changePercent
    );
    return { ...priceData, fromCache: false };
  }

  // Return stale cache if API failed
  const staleCached = await db.assetPrice.findUnique({
    where: { symbol_assetType: { symbol, assetType } },
  });

  if (staleCached) {
    return {
      price: staleCached.price.toNumber(),
      change: staleCached.change.toNumber(),
      changePercent: staleCached.changePercent.toNumber(),
      fromCache: true,
      stale: true,
    };
  }

  return { price: 0, change: 0, changePercent: 0, fromCache: false };
}

/**
 * Get prices for multiple assets at once
 * Returns Map of symbol -> price data
 */
export async function getBulkPrices(assets) {
  const priceMap = new Map();

  await Promise.allSettled(
    assets.map(async ({ symbol, assetType }) => {
      const priceData = await getAssetPrice(symbol, assetType);
      priceMap.set(symbol, priceData);
    })
  );

  return priceMap;
}

/**
 * Search all NSE/BSE listed stocks via Twelve Data's symbol_search API.
 * Covers every SEBI-listed equity — no hardcoded list needed.
 *
 * @param {string} query  Partial symbol or company name
 * @returns {Promise<Array<{symbol, name, exchange, sector, assetType}>>}
 */
export async function searchIndianStocks(query) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey || !query || query.length < 1) return [];

  try {
    const url = `https://api.twelvedata.com/symbol_search?symbol=${encodeURIComponent(query)}&outputsize=20&apikey=${apiKey}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const data = await res.json();
    if (!data.data || !Array.isArray(data.data)) return [];

    // Filter to NSE and BSE only; deduplicate by base symbol (prefer NSE over BSE)
    const seen = new Set();
    const results = [];

    // First pass — NSE (higher priority)
    for (const item of data.data) {
      if (item.exchange !== "NSE") continue;
      const base = item.symbol.replace(/\.NS$/i, "");
      if (!seen.has(base)) {
        seen.add(base);
        results.push({
          symbol: item.symbol.includes(".") ? item.symbol : `${item.symbol}.NS`,
          name: item.instrument_name || item.symbol,
          exchange: "NSE",
          sector: item.sector || null,
          assetType: "STOCK",
        });
      }
    }

    // Second pass — BSE (fallback when not already found on NSE)
    for (const item of data.data) {
      if (item.exchange !== "BSE") continue;
      const base = item.symbol.replace(/\.BO$/i, "");
      if (!seen.has(base)) {
        seen.add(base);
        results.push({
          symbol: item.symbol.includes(".") ? item.symbol : `${item.symbol}.BO`,
          name: item.instrument_name || item.symbol,
          exchange: "BSE",
          sector: item.sector || null,
          assetType: "STOCK",
        });
      }
    }

    return results.slice(0, 15);
  } catch (err) {
    console.error("[searchIndianStocks] error:", err.message);
    return [];
  }
}
