"use client";

import { useCurrency } from "@/components/currency-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Compact currency selector that lives in the header.
 * Shows symbol + code in the trigger, full name + symbol in the dropdown.
 */
export default function CurrencySelector() {
  const { currencyCode, setCurrencyCode, currencies } = useCurrency();

  return (
    <Select value={currencyCode} onValueChange={setCurrencyCode}>
      <SelectTrigger
        id="currency-selector"
        className="h-9 w-[90px] text-sm border-none bg-transparent shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-accent rounded-md transition-colors"
        aria-label="Select currency"
      >
        <SelectValue>
          {/* Show symbol + code compactly */}
          {currencies.find((c) => c.code === currencyCode)?.symbol ?? "$"}{" "}
          <span className="text-xs text-muted-foreground">{currencyCode}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72 overflow-y-auto">
        {currencies.map((currency) => (
          <SelectItem key={currency.code} value={currency.code}>
            <div className="flex items-center gap-2">
              <span className="w-7 text-center font-semibold text-sm">
                {currency.symbol}
              </span>
              <div className="flex flex-col leading-none">
                <span className="text-sm font-medium">{currency.code}</span>
                <span className="text-xs text-muted-foreground">{currency.name}</span>
              </div>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
