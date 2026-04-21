/**
 * Supported currencies for AI Finance.
 * Each entry maps to a valid BCP 47 locale + ISO 4217 currency code
 * so Intl.NumberFormat can do all the heavy lifting.
 */
export const CURRENCIES = [
  { code: "USD", name: "US Dollar",         symbol: "$",  locale: "en-US"  },
  { code: "EUR", name: "Euro",              symbol: "€",  locale: "de-DE"  },
  { code: "GBP", name: "British Pound",     symbol: "£",  locale: "en-GB"  },
  { code: "INR", name: "Indian Rupee",      symbol: "₹",  locale: "en-IN"  },
  { code: "JPY", name: "Japanese Yen",      symbol: "¥",  locale: "ja-JP"  },
  { code: "CAD", name: "Canadian Dollar",   symbol: "CA$",locale: "en-CA"  },
  { code: "AUD", name: "Australian Dollar", symbol: "A$", locale: "en-AU"  },
  { code: "CHF", name: "Swiss Franc",       symbol: "Fr", locale: "de-CH"  },
  { code: "CNY", name: "Chinese Yuan",      symbol: "¥",  locale: "zh-CN"  },
  { code: "BRL", name: "Brazilian Real",    symbol: "R$", locale: "pt-BR"  },
  { code: "MXN", name: "Mexican Peso",      symbol: "MX$",locale: "es-MX"  },
  { code: "KRW", name: "South Korean Won",  symbol: "₩",  locale: "ko-KR"  },
  { code: "SGD", name: "Singapore Dollar",  symbol: "S$", locale: "en-SG"  },
  { code: "AED", name: "UAE Dirham",        symbol: "د.إ",locale: "ar-AE"  },
  { code: "SAR", name: "Saudi Riyal",       symbol: "﷼",  locale: "ar-SA"  },
  { code: "TRY", name: "Turkish Lira",      symbol: "₺",  locale: "tr-TR"  },
  { code: "RUB", name: "Russian Ruble",     symbol: "₽",  locale: "ru-RU"  },
  { code: "ZAR", name: "South African Rand",symbol: "R",  locale: "en-ZA"  },
  { code: "PKR", name: "Pakistani Rupee",   symbol: "₨",  locale: "en-PK"  },
  { code: "BDT", name: "Bangladeshi Taka",  symbol: "৳",  locale: "bn-BD"  },
];

export const DEFAULT_CURRENCY = "USD";

/**
 * Returns a locale-aware currency formatter for the given currency code.
 *
 * @param {string} currencyCode  ISO 4217 code, e.g. "USD"
 * @returns {(amount: number) => string}
 */
export function createFormatter(currencyCode) {
  const currency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  const fmt = new Intl.NumberFormat(currency.locale, {
    style: "currency",
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (amount) => fmt.format(amount);
}
