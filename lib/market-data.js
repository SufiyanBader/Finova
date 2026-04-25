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
 * Fetch stock price from Twelve Data
 * Returns null on failure
 */
async function fetchStockPrice(symbol) {
  const apiKey = process.env.TWELVE_DATA_API_KEY;
  if (!apiKey) {
    console.warn("TWELVE_DATA_API_KEY not set");
    return null;
  }

  try {
    const response = await fetch(
      `https://api.twelvedata.com/quote?symbol=${symbol}&apikey=${apiKey}`,
      { next: { revalidate: 900 } }
    );

    if (!response.ok) return null;

    const data = await response.json();

    if (data.status === "error" || !data.close) return null;

    const price = parseFloat(data.close);
    const change = parseFloat(data.change || 0);
    const changePercent = parseFloat(data.percent_change || 0);

    return { price, change, changePercent };
  } catch (error) {
    console.error(`Stock price fetch failed for ${symbol}:`, error.message);
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

