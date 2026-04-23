import { format } from "date-fns";
import Papa from "papaparse";

export function exportTransactionsToCSV(transactions, filename) {
  const headers = [
    "Date", "Description", "Category",
    "Type", "Amount", "Account", "Recurring"
  ];
  
  const rows = transactions.map(t => [
    format(new Date(t.date), "yyyy-MM-dd"),
    t.description || "",
    t.category,
    t.type,
    t.amount.toFixed(2),
    t.accountId,
    t.isRecurring ? "Yes" : "No"
  ]);
  
  const csvContent = [headers, ...rows]
    .map(row => row.map(cell =>
      `"${String(cell).replace(/"/g, '""')}"`
    ).join(","))
    .join("\n");
  
  const blob = new Blob([csvContent],
    { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename || "transactions.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function parseCSVToTransactions(csvText) {
  const result = Papa.parse(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: h => h.trim().toLowerCase()
  });
  
  return result.data.map(row => ({
    date: new Date(row.date),
    description: row.description || "",
    category: row.category?.toLowerCase() || "other-expense",
    type: row.type?.toUpperCase() === "INCOME"
      ? "INCOME" : "EXPENSE",
    amount: parseFloat(row.amount) || 0,
    isRecurring: row.recurring?.toLowerCase() === "yes"
  })).filter(t => t.amount > 0);
}
