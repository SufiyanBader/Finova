"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/market-data";

const ASSET_TYPE_COLORS = {
  STOCK: "#3b82f6",
  CRYPTO: "#f97316",
  ETF: "#22c55e",
  MUTUAL_FUND: "#8b5cf6",
  MANUAL: "#94a3b8",
};

const CHART_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#eab308",
];

export default function PortfolioCharts({
  holdings,
  allocationByType,
  sectorAllocation,
  history,
}) {
  const allocationPieData = Object.entries(allocationByType)
    .filter(([_, value]) => value > 0)
    .map(([type, value]) => ({
      name: type.charAt(0) + type.slice(1).toLowerCase(),
      value: parseFloat(value.toFixed(2)),
      color: ASSET_TYPE_COLORS[type] || "#94a3b8",
    }));

  const holdingsPieData = holdings
    .sort((a, b) => b.currentValue - a.currentValue)
    .slice(0, 8)
    .map((h) => ({
      name: h.symbol,
      value: parseFloat(h.currentValue.toFixed(2)),
    }));

  return (
    <div className="space-y-6">
      {history && history.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Performance History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(str) => {
                      const date = new Date(str);
                      return date.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      });
                    }}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value) => formatPrice(value)}
                    labelFormatter={(label) => {
                      const date = new Date(label);
                      return date.toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      });
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="value"
                    stroke="#2563eb"
                    fillOpacity={1}
                    fill="url(#colorValue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Asset Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[260px]">
            {allocationPieData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={allocationPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {allocationPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-muted-foreground">
                No data available
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {holdingsPieData.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Holdings Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={holdingsPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={50}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {holdingsPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => formatPrice(value)} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {holdings.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {[...holdings]
                .sort((a, b) => b.gainLossPercent - a.gainLossPercent)
                .slice(0, 5)
                .map((h) => (
                  <div key={h.id} className="flex justify-between items-center py-2 border-b last:border-0">
                    <div>
                      <p className="font-bold">{h.symbol}</p>
                      <p className="text-sm text-muted-foreground truncate w-32 md:w-auto">{h.name}</p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-medium ${
                          h.gainLoss >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {h.gainLoss >= 0 ? "+" : ""}
                        {formatPrice(h.gainLoss)}
                      </p>
                      <p
                        className={`text-xs ${
                          h.gainLossPercent >= 0 ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {h.gainLossPercent >= 0 ? "+" : ""}
                        {h.gainLossPercent.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
