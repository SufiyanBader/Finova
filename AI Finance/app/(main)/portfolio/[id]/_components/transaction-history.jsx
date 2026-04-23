"use client";

import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/lib/market-data";

export default function TransactionHistory({ transactions }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 max-h-80 overflow-y-auto pr-2">
          {transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between p-3 rounded-lg border text-sm hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Badge
                  variant="outline"
                  className={
                    tx.type === "BUY"
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {tx.type}
                </Badge>
                <div>
                  <p className="font-bold">{tx.symbol}</p>
                  <p className="text-xs text-muted-foreground truncate w-24 sm:w-auto">
                    {tx.name}
                  </p>
                </div>
              </div>

              <div className="text-center hidden sm:block">
                <p>
                  {tx.quantity} @ {formatPrice(tx.price)}
                </p>
                <p className="text-muted-foreground text-xs">
                  {format(new Date(tx.date), "MMM d, yyyy")}
                </p>
              </div>

              <div className="text-right">
                <p className="font-semibold">{formatPrice(tx.totalAmount)}</p>
                {tx.fees > 0 && (
                  <p className="text-xs text-muted-foreground">
                    Fee: {formatPrice(tx.fees)}
                  </p>
                )}
                <p className="text-muted-foreground text-xs sm:hidden">
                  {format(new Date(tx.date), "MMM d")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
