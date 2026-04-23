import { Briefcase } from "lucide-react";
import { getPortfolios, getNetWorth } from "@/actions/portfolio";
import CreatePortfolioDialog from "./_components/create-portfolio-dialog";
import PortfolioCard from "./_components/portfolio-card";
import NetWorthBanner from "./_components/net-worth-banner";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const [portfolios, netWorth] = await Promise.all([
    getPortfolios(),
    getNetWorth(),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="gradient-title text-5xl font-bold">Portfolio</h1>
          <p className="text-muted-foreground mt-1">
            Track your investments and net worth
          </p>
        </div>
        <CreatePortfolioDialog />
      </div>

      <NetWorthBanner data={netWorth} />

      {portfolios.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed rounded-xl">
          <div className="bg-blue-50 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-10 w-10 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No portfolios yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first portfolio to start tracking your investments and
            monitoring performance
          </p>
          <CreatePortfolioDialog />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portfolios.map((p) => (
            <PortfolioCard key={p.id} portfolio={p} />
          ))}
        </div>
      )}
    </div>
  );
}
