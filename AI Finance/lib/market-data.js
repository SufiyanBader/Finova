import { db } from "@/lib/prisma";

const PRICE_CACHE_MINUTES = 15;
const CACHE_DURATION_MS = PRICE_CACHE_MINUTES * 60 * 1000;

// Popular stocks for search suggestions
export const POPULAR_STOCKS = [
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology" },
  { symbol: "AMZN", name: "Amazon.com Inc.", sector: "Consumer Cyclical" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology" },
  { symbol: "META", name: "Meta Platforms Inc.", sector: "Technology" },
  { symbol: "TSLA", name: "Tesla Inc.", sector: "Consumer Cyclical" },
  { symbol: "BRK.B", name: "Berkshire Hathaway", sector: "Financial" },
  { symbol: "JPM", name: "JPMorgan Chase", sector: "Financial" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial" },
  { symbol: "PG", name: "Procter & Gamble", sector: "Consumer Defensive" },
  { symbol: "UNH", name: "UnitedHealth Group", sector: "Healthcare" },
  { symbol: "HD", name: "Home Depot", sector: "Consumer Cyclical" },
  { symbol: "MA", name: "Mastercard Inc.", sector: "Financial" },
];

// Popular crypto for search suggestions
export const POPULAR_CRYPTO = [
  { symbol: "BTC", name: "Bitcoin", coingeckoId: "bitcoin" },
  { symbol: "ETH", name: "Ethereum", coingeckoId: "ethereum" },
  { symbol: "BNB", name: "Binance Coin", coingeckoId: "binancecoin" },
  { symbol: "SOL", name: "Solana", coingeckoId: "solana" },
  { symbol: "XRP", name: "XRP", coingeckoId: "ripple" },
  { symbol: "ADA", name: "Cardano", coingeckoId: "cardano" },
  { symbol: "AVAX", name: "Avalanche", coingeckoId: "avalanche-2" },
  { symbol: "DOT", name: "Polkadot", coingeckoId: "polkadot" },
  { symbol: "MATIC", name: "Polygon", coingeckoId: "matic-network" },
  { symbol: "LINK", name: "Chainlink", coingeckoId: "chainlink" },
];

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

/**
 * Calculate portfolio metrics from holdings and prices
 */
export function calculatePortfolioMetrics(holdings) {
  let totalValue = 0;
  let totalCost = 0;
  let totalDayChange = 0;

  const enrichedHoldings = holdings.map((holding) => {
    const quantity = holding.quantity;
    const currentPrice = holding.currentPrice;
    const avgBuyPrice = holding.averageBuyPrice;

    const currentValue = quantity * currentPrice;
    const costBasis = quantity * avgBuyPrice;
    const gainLoss = currentValue - costBasis;
    const gainLossPercent = costBasis > 0
      ? (gainLoss / costBasis) * 100
      : 0;
    const dayChange = holding.change
      ? quantity * holding.change
      : 0;

    totalValue += currentValue;
    totalCost += costBasis;
    totalDayChange += dayChange;

    return {
      ...holding,
      currentValue,
      costBasis,
      gainLoss,
      gainLossPercent,
      dayChange,
      allocation: 0,
    };
  });

  const totalGainLoss = totalValue - totalCost;
  const totalGainLossPercent = totalCost > 0
    ? (totalGainLoss / totalCost) * 100
    : 0;
  const totalDayChangePercent = totalValue > 0
    ? (totalDayChange / totalValue) * 100
    : 0;

  // Calculate allocation percentages
  enrichedHoldings.forEach((h) => {
    h.allocation = totalValue > 0
      ? (h.currentValue / totalValue) * 100
      : 0;
  });

  return {
    holdings: enrichedHoldings,
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    totalDayChange,
    totalDayChangePercent,
  };
}

/**
 * Format price with appropriate decimal places
 */
export function formatPrice(price, symbol) {
  if (price === null || price === undefined) return "$0.00";

  // Crypto under $1 shows 6 decimal places
  if (price < 0.01) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 6,
      maximumFractionDigits: 6,
    }).format(price);
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

/**
 * Format percentage with sign
 */
export function formatPercent(value) {
  if (value === null || value === undefined || isNaN(value)) return "0.00%";
  const sign = value >= 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}

/**
 * Get color class based on positive/negative value
 */
export function getChangeColor(value) {
  if (value > 0) return "text-green-600";
  if (value < 0) return "text-red-600";
  return "text-muted-foreground";
}
