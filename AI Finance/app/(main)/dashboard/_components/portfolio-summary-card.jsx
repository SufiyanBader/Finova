"use client";

import Link from "next/link";
import { TrendingUp, Briefcase, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice, getChangeColor } from "@/lib/market-data";

export default function PortfolioSummaryCard({ data }) {
  if (!data) return null;

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border shadow-md bg-white dark:bg-gray-900">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Investments</CardTitle>
        <div className="rounded-full bg-blue-100 p-2">
          <Briefcase className="h-4 w-4 text-blue-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatPrice(data.investmentsTotal)}</div>
        <p className="text-xs text-muted-foreground mt-1">
          {data.portfolioSummary.length} active portfolios
        </p>
        <div className="flex items-center justify-between mt-4">
          <Link 
            href="/portfolio" 
            className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-medium"
          >
            Manage Portfolio <ArrowUpRight className="h-3 w-3" />
          </Link>
          {data.investmentsTotal > 0 && (
            <div className="text-xs font-semibold px-2 py-1 rounded bg-muted">
              {((data.investmentsTotal / (data.netWorth || 1)) * 100).toFixed(1)}% of total
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
