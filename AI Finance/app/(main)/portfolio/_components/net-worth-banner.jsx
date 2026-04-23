"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, Wallet } from "lucide-react";
import { formatPrice } from "@/lib/market-data";

export default function NetWorthBanner({ data }) {
  if (!data) return null;

  const cashPercent =
    data.netWorth > 0 ? (data.cashTotal / data.netWorth) * 100 : 0;
  const investPercent =
    data.netWorth > 0 ? (data.investmentsTotal / data.netWorth) * 100 : 0;

  return (
    <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-6">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">
              Total Net Worth
            </p>
            <p className="text-4xl md:text-5xl font-bold">
              {formatPrice(data.netWorth)}
            </p>
            <p className="text-blue-200 text-sm mt-2">
              Across {data.accounts.length} accounts and{" "}
              {data.portfolioSummary.length} portfolios
            </p>
          </div>

          <div className="flex gap-6">
            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Wallet className="h-4 w-4 text-blue-200" />
                <span className="text-blue-200 text-xs">Cash</span>
              </div>
              <p className="text-xl font-bold">{formatPrice(data.cashTotal)}</p>
              <p className="text-blue-200 text-xs mt-1">
                {cashPercent.toFixed(1)}% of net worth
              </p>
            </div>

            <div className="bg-white/10 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="h-4 w-4 text-blue-200" />
                <span className="text-blue-200 text-xs">Investments</span>
              </div>
              <p className="text-xl font-bold">
                {formatPrice(data.investmentsTotal)}
              </p>
              <p className="text-blue-200 text-xs mt-1">
                {investPercent.toFixed(1)}% of net worth
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
