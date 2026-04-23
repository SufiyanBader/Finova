"use client";

import Link from "next/link";
import { TrendingUp, TrendingDown, Briefcase } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice, formatPercent, getChangeColor } from "@/lib/market-data";

export default function PortfolioCard({ portfolio }) {
  const isPositive = portfolio.totalGainLoss >= 0;

  return (
    <Link href={`/portfolio/${portfolio.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border shadow-md">
        <div
          className="h-1.5 w-full"
          style={{ backgroundColor: portfolio.color }}
        />
        <CardContent className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div
                className="rounded-lg p-2"
                style={{ backgroundColor: portfolio.color + "20" }}
              >
                <Briefcase
                  className="h-5 w-5"
                  style={{ color: portfolio.color }}
                />
              </div>
              <div>
                <h3 className="font-semibold text-base leading-tight">
                  {portfolio.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {portfolio.holdingsCount} holdings
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-xs">
              {portfolio.holdingsCount} assets
            </Badge>
          </div>

          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Portfolio Value
            </p>
            <p className="text-2xl font-bold">
              {formatPrice(portfolio.totalValue)}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total Return</p>
              <div
                className={`flex items-center gap-1 font-semibold ${getChangeColor(
                  portfolio.totalGainLoss
                )}`}
              >
                {isPositive ? (
                  <TrendingUp className="h-4 w-4" />
                ) : (
                  <TrendingDown className="h-4 w-4" />
                )}
                <span>{formatPrice(Math.abs(portfolio.totalGainLoss))}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Return %</p>
              <p
                className={`font-bold ${getChangeColor(
                  portfolio.totalGainLossPercent
                )}`}
              >
                {formatPercent(portfolio.totalGainLossPercent)}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Today</span>
              <span className={getChangeColor(portfolio.totalDayChange)}>
                {formatPercent(portfolio.totalDayChangePercent)} (
                {formatPrice(Math.abs(portfolio.totalDayChange))})
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
