// Popular US stocks for search suggestions
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

/**
 * Indian NSE-listed stocks.
 * Symbols use the ".NS" suffix required by Twelve Data API for NSE equities.
 */
export const POPULAR_INDIAN_STOCKS = [
  // Large-cap Financials
  { symbol: "HDFCBANK.NS",  name: "HDFC Bank Ltd.",           sector: "Financial" },
  { symbol: "ICICIBANK.NS", name: "ICICI Bank Ltd.",          sector: "Financial" },
  { symbol: "SBIN.NS",      name: "State Bank of India",      sector: "Financial" },
  { symbol: "KOTAKBANK.NS", name: "Kotak Mahindra Bank",      sector: "Financial" },
  { symbol: "AXISBANK.NS",  name: "Axis Bank Ltd.",           sector: "Financial" },
  // Technology
  { symbol: "TCS.NS",       name: "Tata Consultancy Services",sector: "Technology" },
  { symbol: "INFY.NS",      name: "Infosys Ltd.",             sector: "Technology" },
  { symbol: "WIPRO.NS",     name: "Wipro Ltd.",               sector: "Technology" },
  { symbol: "HCLTECH.NS",   name: "HCL Technologies",         sector: "Technology" },
  { symbol: "TECHM.NS",     name: "Tech Mahindra Ltd.",       sector: "Technology" },
  // Energy & Conglomerates
  { symbol: "RELIANCE.NS",  name: "Reliance Industries",      sector: "Energy" },
  { symbol: "ONGC.NS",      name: "Oil & Natural Gas Corp.",  sector: "Energy" },
  { symbol: "NTPC.NS",      name: "NTPC Ltd.",                sector: "Utilities" },
  { symbol: "POWERGRID.NS", name: "Power Grid Corporation",   sector: "Utilities" },
  // FMCG / Consumer
  { symbol: "HINDUNILVR.NS",name: "Hindustan Unilever",       sector: "Consumer Defensive" },
  { symbol: "ITC.NS",       name: "ITC Ltd.",                 sector: "Consumer Defensive" },
  { symbol: "NESTLEIND.NS", name: "Nestle India Ltd.",        sector: "Consumer Defensive" },
  // Automobiles
  { symbol: "TATAMOTORS.NS",name: "Tata Motors Ltd.",         sector: "Consumer Cyclical" },
  { symbol: "MARUTI.NS",    name: "Maruti Suzuki India",      sector: "Consumer Cyclical" },
  { symbol: "BAJAJ-AUTO.NS",name: "Bajaj Auto Ltd.",          sector: "Consumer Cyclical" },
  // Pharma
  { symbol: "SUNPHARMA.NS", name: "Sun Pharmaceutical",       sector: "Healthcare" },
  { symbol: "DRREDDY.NS",   name: "Dr. Reddy's Laboratories", sector: "Healthcare" },
  { symbol: "CIPLA.NS",     name: "Cipla Ltd.",               sector: "Healthcare" },
  // Metals & Mining
  { symbol: "TATASTEEL.NS", name: "Tata Steel Ltd.",          sector: "Materials" },
  { symbol: "JSWSTEEL.NS",  name: "JSW Steel Ltd.",           sector: "Materials" },
  // Infrastructure / Others
  { symbol: "LT.NS",        name: "Larsen & Toubro Ltd.",     sector: "Industrial" },
  { symbol: "ADANIPORTS.NS",name: "Adani Ports & SEZ",        sector: "Industrial" },
  { symbol: "ULTRACEMCO.NS",name: "UltraTech Cement",         sector: "Materials" },
  { symbol: "BAJFINANCE.NS",name: "Bajaj Finance Ltd.",       sector: "Financial" },
  { symbol: "ASIANPAINT.NS",name: "Asian Paints Ltd.",        sector: "Materials" },
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
