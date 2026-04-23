"use client";

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, BarChart2 } from "lucide-react";
import { formatPrice, formatPercent, getChangeColor } from "@/lib/market-data";

export default function PortfolioStats({ metrics }) {
  const isPositive = metrics.totalGainLoss >= 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Value
              </p>
              <h3 className="text-2xl font-bold">
                {formatPrice(metrics.totalValue)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-full">
              <BarChart2 className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Invested
              </p>
              <h3 className="text-2xl font-bold">
                {formatPrice(metrics.totalCost)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                isPositive ? "bg-green-100" : "bg-red-100"
              }`}
            >
              {isPositive ? (
                <TrendingUp className="h-6 w-6 text-green-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-red-600" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Total Return
              </p>
              <h3
                className={`text-2xl font-bold ${getChangeColor(
                  metrics.totalGainLoss
                )}`}
              >
                {isPositive ? "+" : "-"}
                {formatPrice(Math.abs(metrics.totalGainLoss))}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div
              className={`p-3 rounded-full ${
                metrics.totalGainLossPercent >= 0
                  ? "bg-green-100"
                  : "bg-red-100"
              }`}
            >
              <BarChart2
                className={`h-6 w-6 ${
                  metrics.totalGainLossPercent >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                Return Percentage
              </p>
              <h3
                className={`text-2xl font-bold ${getChangeColor(
                  metrics.totalGainLossPercent
                )}`}
              >
                {formatPercent(metrics.totalGainLossPercent)}
              </h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
