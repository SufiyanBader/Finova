"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  TrendingUp,
  Wallet,
  Receipt,
  BarChart3,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency";

export default function TripStats({ stats, baseCurrency }) {
  const statCards = [
    {
      label: "Total Spent",
      value: formatCurrency(stats.totalSpent, baseCurrency),
      icon: Wallet,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-950/30",
    },
    {
      label: "Daily Average",
      value: formatCurrency(stats.dailyAverage, baseCurrency),
      icon: TrendingUp,
      color: "text-teal-600",
      bg: "bg-teal-50 dark:bg-teal-950/30",
    },
    {
      label: "Total Expenses",
      value: stats.expenseCount.toString(),
      icon: Receipt,
      color: "text-green-600",
      bg: "bg-green-50 dark:bg-green-950/30",
    },
    {
      label: "Top Category",
      value: stats.topCategory
        ? stats.topCategory.charAt(0).toUpperCase() +
          stats.topCategory.slice(1)
        : "None",
      icon: BarChart3,
      color: "text-orange-600",
      bg: "bg-orange-50 dark:bg-orange-950/30",
    },
  ];

  if (stats.budgetRemaining !== null) {
    const isOver = stats.budgetRemaining < 0;
    statCards.push({
      label: isOver ? "Over Budget" : "Budget Remaining",
      value: formatCurrency(Math.abs(stats.budgetRemaining), baseCurrency),
      icon: isOver ? AlertTriangle : TrendingDown,
      color: isOver ? "text-red-600" : "text-green-600",
      bg: isOver
        ? "bg-red-50 dark:bg-red-950/30"
        : "bg-green-50 dark:bg-green-950/30",
    });
  }

  return (
    <div className="col-span-1 md:col-span-3 grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className={`${stat.bg} rounded-lg p-2`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">
                    {stat.label}
                  </p>
                  <p className="font-bold text-sm">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
