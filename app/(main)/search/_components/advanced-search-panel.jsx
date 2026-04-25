"use client";

import { useState, useMemo } from "react";
import { format } from "date-fns";
import { Search, SlidersHorizontal, X, ArrowUpRight, ArrowDownRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { categoryColors } from "@/data/categories";
import ExportButton from "@/components/export-button";
import { createFormatter } from "@/lib/currencies";

export default function AdvancedSearchPanel({ transactions, accounts: _accounts }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  const allCategories = useMemo(() => {
    const cats = new Set(transactions.map((t) => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const filteredResults = useMemo(() => {
    return transactions.filter((t) => {
      const matchesSearch =
        searchQuery === "" ||
        t.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.category.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType =
        selectedTypes.length === 0 || selectedTypes.includes(t.type);

      const matchesCategory =
        selectedCategories.length === 0 || selectedCategories.includes(t.category);

      const amt = t.amount;
      const matchesMinAmount = minAmount === "" || amt >= parseFloat(minAmount);
      const matchesMaxAmount = maxAmount === "" || amt <= parseFloat(maxAmount);

      const tDate = new Date(t.date).getTime();
      const matchesDateFrom =
        dateFrom === "" || tDate >= new Date(dateFrom).getTime();
      const matchesDateTo =
        dateTo === "" || tDate <= new Date(dateTo).getTime();

      return (
        matchesSearch &&
        matchesType &&
        matchesCategory &&
        matchesMinAmount &&
        matchesMaxAmount &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [
    transactions,
    searchQuery,
    selectedTypes,
    selectedCategories,
    minAmount,
    maxAmount,
    dateFrom,
    dateTo,
  ]);

  const activeFilterCount =
    (selectedTypes.length > 0 ? 1 : 0) +
    (selectedCategories.length > 0 ? 1 : 0) +
    (minAmount !== "" ? 1 : 0) +
    (maxAmount !== "" ? 1 : 0) +
    (dateFrom !== "" ? 1 : 0) +
    (dateTo !== "" ? 1 : 0);

  const toggleType = (type) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const toggleCategory = (category) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedCategories([]);
    setMinAmount("");
    setMaxAmount("");
    setDateFrom("");
    setDateTo("");
  };

  return (
    <div className="space-y-4">
      <div className="relative flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
          <Input
            className="pl-10 h-12 text-lg"
            placeholder="Search by description, category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button
          size="lg"
          variant={showFilters ? "default" : "outline"}
          onClick={() => setShowFilters(!showFilters)}
          className="h-12 px-4 relative"
        >
          <SlidersHorizontal className="h-5 w-5 md:mr-2" />
          <span className="hidden md:inline">Filters</span>
          {activeFilterCount > 0 && (
            <Badge className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 bg-red-500">
              {activeFilterCount}
            </Badge>
          )}
        </Button>
      </div>

      {showFilters && (
        <Card className="p-4 shadow-sm animate-in slide-in-from-top-2">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Type</h3>
              <div className="flex gap-4">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.includes("INCOME")}
                    onCheckedChange={() => toggleType("INCOME")}
                  />
                  <span>Income</span>
                </label>
                <label className="flex items-center space-x-2 cursor-pointer">
                  <Checkbox
                    checked={selectedTypes.includes("EXPENSE")}
                    onCheckedChange={() => toggleType("EXPENSE")}
                  />
                  <span>Expense</span>
                </label>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Amount Range</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                />
                <span>-</span>
                <Input
                  type="number"
                  placeholder="Max"
                  value={maxAmount}
                  onChange={(e) => setMaxAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-medium text-sm text-muted-foreground">Date Range</h3>
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />
                <span>-</span>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3 lg:col-span-3">
              <h3 className="font-medium text-sm text-muted-foreground">Categories</h3>
              <div className="max-h-32 overflow-y-auto border rounded-md p-3 flex flex-wrap gap-x-4 gap-y-2 bg-gray-50 dark:bg-gray-900/50">
                {allCategories.length === 0 && (
                  <span className="text-muted-foreground text-sm">No categories found in data.</span>
                )}
                {allCategories.map((cat) => (
                  <label key={cat} className="flex items-center space-x-2 cursor-pointer">
                    <Checkbox
                      checked={selectedCategories.includes(cat)}
                      onCheckedChange={() => toggleCategory(cat)}
                    />
                    <span className="capitalize">{cat}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {activeFilterCount > 0 && (
            <div className="mt-4 flex justify-end border-t pt-4">
              <Button variant="ghost" onClick={clearFilters} className="text-muted-foreground">
                <X className="h-4 w-4 mr-2" />
                Clear all filters
              </Button>
            </div>
          )}
        </Card>
      )}

      <div className="flex justify-between items-center mt-6 border-b pb-2">
        <span className="text-sm font-medium text-muted-foreground">
          {filteredResults.length} results found
        </span>
        {filteredResults.length > 0 && (
          <ExportButton transactions={filteredResults} filename="search-results.csv" />
        )}
      </div>

      {filteredResults.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
            <Search className="h-10 w-10 mb-4 opacity-20" />
            <p className="text-lg font-medium">No transactions found</p>
            <p className="text-sm mt-1">Try adjusting your filters or search query.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredResults.map((t) => (
            <div
              key={t.id}
              className="border rounded-lg p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-card hover:shadow-sm transition-shadow"
            >
              <div>
                <p className="font-medium text-lg">{t.description || "Untitled"}</p>
                <div className="flex flex-wrap gap-2 items-center text-sm text-muted-foreground mt-1">
                  <span
                    className="text-white text-xs px-2 py-0.5 rounded capitalize"
                    style={{ backgroundColor: categoryColors[t.category] || "#94a3b8" }}
                  >
                    {t.category}
                  </span>
                  <span>•</span>
                  <span>{format(new Date(t.date), "PP")}</span>
                  {t.isRecurring && (
                    <>
                      <span>•</span>
                      <Badge variant="secondary" className="text-[10px] h-5 py-0">
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Recurring
                      </Badge>
                    </>
                  )}
                </div>
              </div>
              
              <div className="text-right whitespace-nowrap self-end sm:self-center">
                <p
                  className={`text-sm font-semibold flex items-center justify-end gap-1 ${
                    t.type === "INCOME" ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {t.type === "INCOME" ? (
                    <>
                      <ArrowUpRight className="h-3 w-3" /> Income
                    </>
                  ) : (
                    <>
                      <ArrowDownRight className="h-3 w-3" /> Expense
                    </>
                  )}
                </p>
                <p className="text-xl font-bold">
                  {createFormatter(_accounts?.find(a => a.id === t.accountId)?.currency || "USD")(t.amount)}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
