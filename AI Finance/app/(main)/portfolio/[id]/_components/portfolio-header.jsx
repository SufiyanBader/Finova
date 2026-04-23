"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, RefreshCw, Trash2, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deletePortfolio, refreshPortfolioPrices } from "@/actions/portfolio";
import useFetch from "@/hooks/use-fetch";
import { formatPrice, formatPercent, getChangeColor } from "@/lib/market-data";

export default function PortfolioHeader({ portfolio }) {
  const router = useRouter();

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
  } = useFetch(deletePortfolio);

  const {
    loading: refreshLoading,
    fn: refreshFn,
    data: refreshResult,
  } = useFetch(refreshPortfolioPrices);

  const handleDelete = () => {
    if (window.confirm("Delete this portfolio and all holdings?")) {
      deleteFn(portfolio.id);
    }
  };

  const handleRefresh = () => {
    refreshFn(portfolio.id);
    toast.info("Refreshing prices...");
  };

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Portfolio deleted");
      router.push("/portfolio");
    }
  }, [deleteResult, router]);

  useEffect(() => {
    if (refreshResult?.success) {
      toast.success(
        `Prices updated for ${refreshResult.updatedCount} holdings`
      );
    }
  }, [refreshResult]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex items-center gap-2">
          <div
            className="rounded-lg p-2"
            style={{ backgroundColor: portfolio.color + "20" }}
          >
            <Briefcase className="h-5 w-5" style={{ color: portfolio.color }} />
          </div>
          <h1 className="text-2xl font-bold">{portfolio.name}</h1>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mt-2">
        <div>
          {portfolio.description && (
            <p className="text-muted-foreground mb-2">
              {portfolio.description}
            </p>
          )}
          <Badge variant="outline">{portfolio.holdings.length} assets</Badge>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshLoading}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${
                refreshLoading ? "animate-spin" : ""
              }`}
            />
            Refresh Prices
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteLoading}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="flex gap-6 mt-4 flex-wrap">
        <div>
          <p className="text-sm text-muted-foreground">Portfolio Value</p>
          <p className="font-semibold">
            {formatPrice(portfolio.metrics.totalValue)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Total Return</p>
          <p
            className={`font-semibold ${getChangeColor(
              portfolio.metrics.totalGainLoss
            )}`}
          >
            {portfolio.metrics.totalGainLoss >= 0 ? "+" : "-"}
            {formatPrice(Math.abs(portfolio.metrics.totalGainLoss))}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Return %</p>
          <p
            className={`font-semibold ${getChangeColor(
              portfolio.metrics.totalGainLossPercent
            )}`}
          >
            {formatPercent(portfolio.metrics.totalGainLossPercent)}
          </p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">Today</p>
          <p
            className={`font-semibold ${getChangeColor(
              portfolio.metrics.totalDayChange
            )}`}
          >
            {formatPercent(portfolio.metrics.totalDayChangePercent)} (
            {formatPrice(Math.abs(portfolio.metrics.totalDayChange))})
          </p>
        </div>
      </div>
    </div>
  );
}
