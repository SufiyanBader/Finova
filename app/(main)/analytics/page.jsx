export const dynamic = "force-dynamic";

import { getAnalyticsData } from "@/actions/analytics";
import { getUserAccounts } from "@/actions/dashboard";
import MonthlyTrendsChart from "./_components/monthly-trends-chart";
import CategoryBreakdownChart from "./_components/category-breakdown-chart";
import WeekdayPatternChart from "./_components/weekday-pattern-chart";
import TopMerchantsCard from "./_components/top-merchants-card";
import AnalyticsStatCards from "./_components/analytics-stat-cards";

export default async function AnalyticsPage() {
  const accounts = await getUserAccounts();
  const defaultAccount = accounts.find((a) => a.isDefault);
  const data = await getAnalyticsData(defaultAccount?.id, 90);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl md:text-5xl gradient-title">Analytics</h1>
      </div>

      <AnalyticsStatCards data={data} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MonthlyTrendsChart data={data.monthlyTrends} />
        <CategoryBreakdownChart data={data.categoryBreakdown} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <WeekdayPatternChart data={data.weekdayPattern} currency={defaultAccount?.currency} />
        <TopMerchantsCard data={data.topMerchants} currency={defaultAccount?.currency} />
      </div>
    </div>
  );
}

