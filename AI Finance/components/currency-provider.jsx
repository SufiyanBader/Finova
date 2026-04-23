"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { createFormatter, DEFAULT_CURRENCY, CURRENCIES } from "@/lib/currencies";

const STORAGE_KEY = "ai_finance_currency";

const CurrencyContext = createContext(null);

/**
 * Provides currency state + formatting to the entire app.
 * Persists selection in localStorage so it survives refreshes.
 */
export function CurrencyProvider({ children }) {
  const [currencyCode, setCurrencyCodeState] = useState(DEFAULT_CURRENCY);

  // Restore from localStorage after hydration
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && CURRENCIES.some((c) => c.code === saved)) {
        setCurrencyCodeState(saved);
      }
    } catch {
      // localStorage unavailable (e.g. SSR) — use default
    }
  }, []);

  const setCurrencyCode = useCallback((code) => {
    setCurrencyCodeState(code);
    try {
      localStorage.setItem(STORAGE_KEY, code);
    } catch {
      // ignore
    }
  }, []);

  const formatCurrency = useCallback(
    createFormatter(currencyCode),
    [currencyCode]
  );

  const currentCurrency = CURRENCIES.find((c) => c.code === currencyCode) ?? CURRENCIES[0];

  return (
    <CurrencyContext.Provider
      value={{ currencyCode, setCurrencyCode, formatCurrency, currentCurrency, currencies: CURRENCIES }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

/**
 * Hook to consume currency context.
 * Returns { currencyCode, setCurrencyCode, formatCurrency, currentCurrency, currencies }
 */
export function useCurrency() {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used inside <CurrencyProvider>");
  return ctx;
}
