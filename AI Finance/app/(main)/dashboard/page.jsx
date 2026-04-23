import { Suspense } from "react";
import { getUserAccounts } from "@/actions/dashboard";
import { getDashboardData } from "@/actions/dashboard";
import { getCurrentBudget } from "@/actions/budget";
import AccountCard from "./_components/account-card";
import BudgetProgress from "./_components/budget-progress";
import DashboardOverview from "./_components/transaction-overview";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Skeleton shown while accounts load
function AccountsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
      {[1, 2].map((i) => (
        <div key={i} className="h-36 rounded-xl bg-muted/40" />
      ))}
    </div>
  );
}

import { getNetWorth } from "@/actions/portfolio";
import PortfolioSummaryCard from "./_components/portfolio-summary-card";

// Inner async component — loads accounts + budget in parallel where possible
async function DashboardContent() {
  const [accounts, transactions, netWorth] = await Promise.all([
    getUserAccounts(),
    getDashboardData(),
    getNetWorth(),
  ]);

  const defaultAccount = accounts?.find((account) => account.isDefault);

  let budgetData = null;
  if (defaultAccount) {
    try {
      budgetData = await getCurrentBudget(defaultAccount.id);
    } catch {
      budgetData = null;
    }
  }

  return (
    <>
      {defaultAccount && (
        <BudgetProgress
          initialBudget={budgetData?.budget}
          currentExpenses={budgetData?.currentExpenses ?? 0}
        />
      )}

      <DashboardOverview
        accounts={accounts}
        transactions={transactions || []}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <CreateAccountDrawer>
          <Card className="hover:shadow-md transition-shadow cursor-pointer border-dashed group">
            <CardContent className="flex flex-col items-center justify-center text-muted-foreground h-full pt-8 pb-8 gap-2">
              <div className="rounded-full bg-primary/10 p-3 group-hover:bg-primary/20 transition-colors">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Add New Account</p>
            </CardContent>
          </Card>
        </CreateAccountDrawer>

        <PortfolioSummaryCard data={netWorth} />

        {accounts?.length > 0 &&
          accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
      </div>

      {accounts?.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">No accounts yet. Create your first account to get started.</p>
        </div>
      )}
    </>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <Suspense fallback={<AccountsSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  );
}
