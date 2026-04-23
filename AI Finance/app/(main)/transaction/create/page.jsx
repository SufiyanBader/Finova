import { getUserAccounts } from "@/actions/dashboard";
import { getTransaction } from "@/actions/transaction";
import { defaultCategories } from "@/data/categories";
import AddTransactionForm from "./_components/transaction-form";

export default async function AddTransactionPage({ searchParams }) {
  const resolvedSearchParams = await searchParams;
  const editId = resolvedSearchParams?.edit;

  let initialData = null;
  if (editId) {
    const transaction = await getTransaction(editId);
    initialData = transaction;
  }

  const editMode = !!editId;
  const accounts = await getUserAccounts();

  return (
    <div className="max-w-3xl mx-auto px-5">
      <h1 className="text-5xl gradient-title mb-8">
        {editMode ? "Edit Transaction" : "Add Transaction"}
      </h1>
      <AddTransactionForm
        accounts={accounts}
        categories={defaultCategories}
        editMode={editMode}
        initialData={initialData}
      />
    </div>
  );
}
