import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { notFound } from "next/navigation";
import { getPortfolioById } from "@/actions/portfolio";

import PortfolioHeader from "./_components/portfolio-header";
import PortfolioStats from "./_components/portfolio-stats";
import HoldingsList from "./_components/holdings-list";
import PortfolioCharts from "./_components/portfolio-charts";
import AddHoldingSheet from "./_components/add-holding-sheet";
import TransactionHistory from "./_components/transaction-history";

export default async function PortfolioDetailPage({ params }) {
  const { id } = await params;
  const portfolio = await getPortfolioById(id);

  if (!portfolio) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <PortfolioHeader portfolio={portfolio} />
      <PortfolioStats metrics={portfolio.metrics} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#2563eb" />}>
          <PortfolioCharts
            holdings={portfolio.holdings}
            allocationByType={portfolio.allocationByType}
            sectorAllocation={portfolio.sectorAllocation}
            history={portfolio.history}
          />
        </Suspense>

        <Suspense fallback={<BarLoader className="mt-4" width={"100%"} color="#2563eb" />}>
          <HoldingsList holdings={portfolio.holdings} portfolioId={portfolio.id} />
        </Suspense>
      </div>

      {portfolio.transactions.length > 0 && (
        <TransactionHistory transactions={portfolio.transactions} />
      )}

      <AddHoldingSheet portfolioId={portfolio.id} />
    </div>
  );
}
