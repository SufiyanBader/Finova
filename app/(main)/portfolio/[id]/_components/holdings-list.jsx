"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { removeHolding } from "@/actions/portfolio";
import useFetch from "@/hooks/use-fetch";
import { formatPrice, formatPercent, getChangeColor } from "@/lib/market-data";

export default function HoldingsList({ holdings }) {
  const {
    loading: removeLoading,
    fn: removeFn,
    data: removeResult,
  } = useFetch(removeHolding);

  const handleRemove = (holdingId, symbol) => {
    if (window.confirm(`Remove ${symbol} from portfolio?`)) {
      removeFn(holdingId);
    }
  };

  useEffect(() => {
    if (removeResult?.success) {
      toast.success("Holding removed");
    }
  }, [removeResult]);

  if (holdings.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          No holdings yet. Add an asset to get started.
        </CardContent>
      </Card>
    );
  }

  const ASSET_COLORS = {
    STOCK: "bg-blue-500",
    CRYPTO: "bg-orange-500",
    ETF: "bg-green-500",
    MUTUAL_FUND: "bg-purple-500",
    MANUAL: "bg-gray-500",
  };

  const sortedHoldings = [...holdings].sort(
    (a, b) => b.currentValue - a.currentValue
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Holdings ({holdings.length})</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedHoldings.map((holding) => (
            <div
              key={holding.id}
              className="flex items-center p-3 rounded-lg border hover:bg-muted/30 transition-colors gap-3"
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm text-white flex-shrink-0 ${
                  ASSET_COLORS[holding.assetType] || "bg-gray-500"
                }`}
              >
                {holding.symbol.substring(0, 2)}
              </div>
              
              <div className="flex-1">
                <p className="font-semibold">{holding.symbol}</p>
                <p className="text-xs text-muted-foreground truncate w-32 md:w-auto">
                  {holding.name}
                </p>
              </div>

              <div className="flex-1 text-sm text-muted-foreground hidden sm:block">
                <p>{holding.quantity.toFixed(4)} shares</p>
                <p>Avg: {formatPrice(holding.averageBuyPrice)}</p>
              </div>

              <div className="text-right">
                <p className="font-medium">{formatPrice(holding.currentPrice)}</p>
                <p className="text-xs">{formatPrice(holding.currentValue)}</p>
                <p
                  className={`text-xs font-semibold ${getChangeColor(
                    holding.gainLossPercent
                  )}`}
                >
                  {formatPercent(holding.gainLossPercent)}
                </p>
              </div>

              <div className="hidden md:block w-20">
                <div className="text-xs text-muted-foreground text-right mb-1">
                  {holding.allocation.toFixed(1)}%
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-1.5 rounded-full bg-blue-500"
                    style={{ width: `${holding.allocation}%` }}
                  />
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 ml-2 flex-shrink-0"
                onClick={() => handleRemove(holding.id, holding.symbol)}
                disabled={removeLoading}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
