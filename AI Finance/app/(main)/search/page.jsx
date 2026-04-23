export const dynamic = "force-dynamic";

import { getDashboardData, getUserAccounts } from "@/actions/dashboard";
import AdvancedSearchPanel from "./_components/advanced-search-panel";

export default async function SearchPage() {
  const transactions = await getDashboardData();
  const accounts = await getUserAccounts();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl md:text-5xl gradient-title">Search Transactions</h1>
      <AdvancedSearchPanel transactions={transactions || []} accounts={accounts || []} />
    </div>
  );
}
