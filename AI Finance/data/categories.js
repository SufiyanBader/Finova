export const defaultCategories = [
  // Income categories
  {
    id: "salary",
    name: "Salary",
    type: "INCOME",
    color: "#22c55e",
  },
  {
    id: "freelance",
    name: "Freelance",
    type: "INCOME",
    color: "#06b6d4",
  },
  {
    id: "investments",
    name: "Investments",
    type: "INCOME",
    color: "#6366f1",
  },
  {
    id: "business",
    name: "Business",
    type: "INCOME",
    color: "#8b5cf6",
  },
  {
    id: "rental",
    name: "Rental Income",
    type: "INCOME",
    color: "#f97316",
  },
  {
    id: "other-income",
    name: "Other Income",
    type: "INCOME",
    color: "#84cc16",
  },

  // Expense categories
  {
    id: "housing",
    name: "Housing",
    type: "EXPENSE",
    color: "#ef4444",
  },
  {
    id: "transportation",
    name: "Transportation",
    type: "EXPENSE",
    color: "#f97316",
  },
  {
    id: "groceries",
    name: "Groceries",
    type: "EXPENSE",
    color: "#eab308",
  },
  {
    id: "utilities",
    name: "Utilities",
    type: "EXPENSE",
    color: "#06b6d4",
  },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "EXPENSE",
    color: "#8b5cf6",
  },
  {
    id: "food",
    name: "Food and Dining",
    type: "EXPENSE",
    color: "#f43f5e",
  },
  {
    id: "shopping",
    name: "Shopping",
    type: "EXPENSE",
    color: "#ec4899",
  },
  {
    id: "healthcare",
    name: "Healthcare",
    type: "EXPENSE",
    color: "#22c55e",
  },
  {
    id: "education",
    name: "Education",
    type: "EXPENSE",
    color: "#6366f1",
  },
  {
    id: "travel",
    name: "Travel",
    type: "EXPENSE",
    color: "#0ea5e9",
  },
  {
    id: "insurance",
    name: "Insurance",
    type: "EXPENSE",
    color: "#14b8a6",
  },
  {
    id: "gifts",
    name: "Gifts and Donations",
    type: "EXPENSE",
    color: "#f97316",
  },
  {
    id: "bills",
    name: "Bills",
    type: "EXPENSE",
    color: "#ef4444",
  },
  {
    id: "other-expense",
    name: "Other Expense",
    type: "EXPENSE",
    color: "#94a3b8",
  },
];

export const categoryColors = defaultCategories.reduce((acc, category) => {
  acc[category.id] = category.color;
  return acc;
}, {});
