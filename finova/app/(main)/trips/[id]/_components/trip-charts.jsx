"use client";

import { format } from "date-fns";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatCurrency } from "@/lib/currency";

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
  "#84cc16",
];

export default function TripCharts({
  byCategory,
  byCurrency,
  byDay,
  baseCurrency,
}) {
  // Category pie data
  const categoryChartData = Object.entries(byCategory)
    .map(([cat, data]) => ({
      name: cat.charAt(0).toUpperCase() + cat.slice(1),
      value: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // Currency bar data
  const currencyChartData = Object.entries(byCurrency)
    .map(([currency, data]) => ({
      name: currency,
      value: data.convertedTotal,
      original: data.total,
      count: data.count,
    }))
    .sort((a, b) => b.value - a.value);

  // Daily spending bar data
  const dailyChartData = Object.entries(byDay)
    .map(([date, data]) => ({
      date: format(new Date(date + "T00:00:00"), "MMM d"),
      amount: data.total,
    }));

  const hasNoExpenses = categoryChartData.length === 0;

  if (hasNoExpenses) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-48 text-muted-foreground">
          No expenses to chart yet
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Breakdown — Donut chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base font-semibold">By Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="value"
                  label={({ name, percent }) =>
                    `${name} ${(percent * 100).toFixed(0)}%`
                  }
                  labelLine={false}
                >
                  {categoryChartData.map((_, i) => (
                    <Cell
                      key={`cell-${i}`}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value) => formatCurrency(value, baseCurrency)}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Daily Spending — Bar chart */}
      {dailyChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Daily Spending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyChartData}
                  margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
                >
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => "$" + v}
                  />
                  <Tooltip
                    formatter={(v) => [
                      formatCurrency(v, baseCurrency),
                      "Spent",
                    ]}
                  />
                  <Bar dataKey="amount" fill="#6366f1" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Currency Breakdown — horizontal bar-like list */}
      {currencyChartData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Currency Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(() => {
                const maxValue = currencyChartData[0]?.value ?? 1;
                return currencyChartData.map((item) => (
                  <div key={item.name}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium">{item.name}</span>
                      <div className="text-right">
                        <span className="font-bold">
                          {formatCurrency(item.value, baseCurrency)}
                        </span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {item.count} transaction
                          {item.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                    <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all"
                        style={{
                          width: `${(item.value / maxValue) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ));
              })()}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
