"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus, ArrowRightLeft } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { tripExpenseSchema } from "@/lib/trip-schema";
import { addTripExpense, getExchangeRatePreview } from "@/actions/trips";
import useFetch from "@/hooks/use-fetch";
import { SUPPORTED_CURRENCIES, formatCurrency } from "@/lib/currency";

const TRIP_CATEGORIES = [
  { id: "accommodation", name: "Accommodation" },
  { id: "transport",     name: "Transport" },
  { id: "food",          name: "Food and Dining" },
  { id: "activities",   name: "Activities" },
  { id: "shopping",     name: "Shopping" },
  { id: "health",       name: "Health" },
  { id: "communication",name: "Communication" },
  { id: "visa",         name: "Visa and Entry" },
  { id: "insurance",    name: "Insurance" },
  { id: "other",        name: "Other" },
];

export default function AddExpenseSheet({ tripId, baseCurrency }) {
  const [open, setOpen] = useState(false);
  const [ratePreview, setRatePreview] = useState(null);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(tripExpenseSchema),
    defaultValues: {
      description: "",
      amount: "",
      currency: baseCurrency,
      category: "food",
      date: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  const watchedAmount = watch("amount");
  const watchedCurrency = watch("currency");

  const {
    loading: isLoading,
    fn: addExpenseFn,
    data: newExpense,
    error,
  } = useFetch(addTripExpense);

  const {
    loading: previewLoading,
    fn: previewFn,
    data: previewData,
  } = useFetch(getExchangeRatePreview);

  // Debounced rate preview fetch
  useEffect(() => {
    if (
      watchedCurrency !== baseCurrency &&
      watchedAmount &&
      parseFloat(watchedAmount) > 0
    ) {
      const timer = setTimeout(() => {
        previewFn(watchedCurrency, baseCurrency, watchedAmount);
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setRatePreview(null);
    }
  }, [watchedCurrency, watchedAmount, baseCurrency, previewFn]);

  useEffect(() => {
    if (previewData && !previewLoading) {
      setRatePreview(previewData);
    }
  }, [previewData, previewLoading]);

  const onSubmit = (data) => {
    addExpenseFn(tripId, data);
  };

  useEffect(() => {
    if (newExpense?.success && !isLoading) {
      toast.success("Expense added successfully");
      reset({
        description: "",
        amount: "",
        currency: baseCurrency,
        category: "food",
        date: new Date().toISOString().split("T")[0],
        notes: "",
      });
      setRatePreview(null);
      setOpen(false);
    }
  }, [newExpense, isLoading, reset, baseCurrency]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  return (
    <div className="fixed bottom-24 right-6 z-40">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            className="rounded-full h-12 px-5 shadow-lg gap-2 bg-indigo-600 hover:bg-indigo-700 text-white"
            aria-label="Add trip expense"
          >
            <Plus className="h-5 w-5" />
            <span className="font-medium">Add Expense</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-md overflow-y-auto"
        >
          <SheetHeader>
            <SheetTitle>Add Expense</SheetTitle>
          </SheetHeader>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-5 mt-6"
          >
            {/* Description */}
            <div className="space-y-1">
              <Label htmlFor="exp-description">Description</Label>
              <Input
                id="exp-description"
                placeholder="e.g., Lunch at ramen shop"
                {...register("description")}
              />
              {errors.description && (
                <p className="text-xs text-destructive">
                  {errors.description.message}
                </p>
              )}
            </div>

            {/* Amount + Currency */}
            <div className="space-y-1">
              <Label>Amount</Label>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    id="exp-amount"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    {...register("amount")}
                  />
                </div>
                <div className="w-28">
                  <Select
                    value={watchedCurrency}
                    onValueChange={(v) => setValue("currency", v)}
                  >
                    <SelectTrigger id="exp-currency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-h-60">
                      {Object.entries(SUPPORTED_CURRENCIES).map(
                        ([code]) => (
                          <SelectItem key={code} value={code}>
                            {code}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {errors.amount && (
                <p className="text-xs text-destructive">
                  {errors.amount.message}
                </p>
              )}

              {/* Live rate preview */}
              {ratePreview && watchedCurrency !== baseCurrency && (
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-3 flex items-center gap-2 text-sm">
                  <ArrowRightLeft className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-emerald-800 dark:text-emerald-300">
                      {formatCurrency(ratePreview.converted, baseCurrency)}
                    </p>
                    <p className="text-xs text-emerald-600 dark:text-emerald-400">
                      Rate: 1 {watchedCurrency} ={" "}
                      {ratePreview.rate.toFixed(4)} {baseCurrency}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1">
              <Label>Category</Label>
              <Select
                defaultValue={watch("category")}
                onValueChange={(v) => setValue("category", v)}
              >
                <SelectTrigger id="exp-category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TRIP_CATEGORIES.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date */}
            <div className="space-y-1">
              <Label htmlFor="exp-date">Date</Label>
              <Input id="exp-date" type="date" {...register("date")} />
              {errors.date && (
                <p className="text-xs text-destructive">
                  {errors.date.message}
                </p>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-1">
              <Label htmlFor="exp-notes">Notes (Optional)</Label>
              <Textarea
                id="exp-notes"
                placeholder="Any additional notes..."
                rows={2}
                {...register("notes")}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Adding...
                  </>
                ) : (
                  "Add Expense"
                )}
              </Button>
            </div>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}
