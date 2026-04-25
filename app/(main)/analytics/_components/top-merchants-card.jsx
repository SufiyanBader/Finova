"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createFormatter } from "@/lib/currencies";

export default function TopMerchantsCard({ data, currency }) {
  const formatCurrency = createFormatter(currency);
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Merchants</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No data available for the selected period.</p>
        </CardContent>
      </Card>
    );
  }

  const maxTotal = Math.max(...data.map((m) => m.total));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Merchants</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] overflow-y-auto space-y-4 pr-2">
          {data.map((merchant, index) => {
            const widthPct = ((merchant.total / maxTotal) * 100).toFixed(1);
            return (
              <div key={index} className="flex flex-col space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-4 text-right">
                      {index + 1}.
                    </span>
                    <span className="font-medium truncate max-w-[150px] sm:max-w-[200px]">
                      {merchant.name}
                    </span>
                    <Badge variant="outline" className="text-[10px] h-5 px-1 py-0">
                      {merchant.count}x
                    </Badge>
                  </div>
                  <span className="font-semibold text-red-600">
                    {formatCurrency(merchant.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-red-400 h-2 rounded-full"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
