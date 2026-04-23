import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BarLoader } from "react-spinners";
import { getAccountWithTransactions } from "@/actions/accounts";
import AccountChart from "./_components/account-chart";
import TransactionTable from "./_components/transaction-table";

export const dynamic = "force-dynamic";

export default async function AccountPage({ params }) {
  const { id } = await params;
  const accountData = await getAccountWithTransactions(id);

  if (!accountData) {
    notFound();
  }

  const { transactions, ...account } = accountData;

  return (
    <div className="space-y-8 px-5">
      <div className="flex justify-between items-end gap-4">
        <div>
          <h1 className="text-5xl sm:text-6xl font-bold capitalize gradient-title">
            {account.name}
          </h1>
          <p className="text-muted-foreground">
            {account.type.charAt(0) +
              account.type.slice(1).toLowerCase()}{" "}
            Account
          </p>
        </div>
        <div className="text-right">
          <p className="text-xl sm:text-2xl font-bold">
            {Number(account.balance).toLocaleString(undefined, {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            {account._count.transactions} Transactions
          </p>
        </div>
      </div>

      <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
        <AccountChart transactions={transactions} />
      </Suspense>

      <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
        <TransactionTable transactions={transactions} accountId={id} />
      </Suspense>
    </div>
  );
}
