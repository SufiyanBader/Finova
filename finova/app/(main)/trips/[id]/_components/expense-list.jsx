"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { Trash2, Search } from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { deleteTripExpense } from "@/actions/trips";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency, getCurrencySymbol } from "@/lib/currency";

export default function ExpenseList({ expenses, tripId: _tripId, baseCurrency }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [sortBy, setSortBy] = useState("date-desc");

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
  } = useFetch(deleteTripExpense);

  const handleDelete = (expenseId) => {
    if (window.confirm("Delete this expense?")) {
      deleteFn(expenseId);
    }
  };

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Expense deleted");
    }
  }, [deleteResult]);

  const handleCategoryChange = (val) => {
    setCategoryFilter(val === "__all__" ? "" : val);
  };

  const uniqueCategories = [...new Set(expenses.map((e) => e.category))];

  const filteredExpenses = expenses
    .filter((e) => {
      const matchSearch =
        !searchTerm ||
        e.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategory = !categoryFilter || e.category === categoryFilter;
      return matchSearch && matchCategory;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "amount-desc":
          return b.convertedAmount - a.convertedAmount;
        case "amount-asc":
          return a.convertedAmount - b.convertedAmount;
        default:
          return 0;
      }
    });


  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold">
            Expenses ({expenses.length})
          </CardTitle>
        </div>

        {/* Filter Controls */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <div className="relative flex-1 min-w-32">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search expenses..."
              value={searchTerm}
              className="pl-8 h-9"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <Select
            value={categoryFilter === "" ? "__all__" : categoryFilter}
            onValueChange={handleCategoryChange}
          >
            <SelectTrigger className="w-32 h-9">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__all__">All</SelectItem>
              {uniqueCategories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c.charAt(0).toUpperCase() + c.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-36 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date-desc">Newest First</SelectItem>
              <SelectItem value="date-asc">Oldest First</SelectItem>
              <SelectItem value="amount-desc">Highest Amount</SelectItem>
              <SelectItem value="amount-asc">Lowest Amount</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No expenses found
          </div>
        ) : (
          <div className="space-y-2">
            {filteredExpenses.map((expense) => (
              <div
                key={expense.id}
                className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors gap-3"
              >
                {/* Left: info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-sm truncate">
                      {expense.description}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs flex-shrink-0 capitalize"
                    >
                      {expense.category}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{format(new Date(expense.date), "MMM d")}</span>
                    {expense.currency !== baseCurrency && (
                      <span className="text-emerald-600">
                        {getCurrencySymbol(expense.currency)}
                        {expense.amount.toFixed(2)} {expense.currency}
                      </span>
                    )}
                    {expense.notes && (
                      <span className="truncate max-w-24">{expense.notes}</span>
                    )}
                  </div>
                </div>

                {/* Right: amount + delete */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {formatCurrency(expense.convertedAmount, baseCurrency)}
                    </p>
                    {expense.currency !== baseCurrency && (
                      <p className="text-xs text-muted-foreground">
                        Rate: {expense.exchangeRate.toFixed(4)}
                      </p>
                    )}
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(expense.id)}
                    disabled={deleteLoading}
                    aria-label="Delete expense"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
