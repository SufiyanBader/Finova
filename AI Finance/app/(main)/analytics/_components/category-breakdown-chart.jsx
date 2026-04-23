"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCurrency } from "@/components/currency-provider";

export default function CategoryBreakdownChart({ data }) {
  const { formatCurrency, currentCurrency } = useCurrency();
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Expense Categories</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const chartData = data.map(([category, amount]) => ({
    category,
    amount,
  }));

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-2 border rounded shadow">
          <p className="font-semibold">{payload[0].payload.category}</p>
          <p className="text-emerald-600">{formatCurrency(payload[0].value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Expense Categories</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis type="number" tickFormatter={(value) => currentCurrency.symbol + value} />
              <YAxis
                dataKey="category"
                type="category"
                tick={{ fill: "currentColor", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="amount" fill="#2563eb" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
