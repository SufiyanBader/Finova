"use client";

import { useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { toast } from "sonner";
import { CalendarIcon, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { transactionSchema } from "@/lib/schema";
import { createTransaction, updateTransaction } from "@/actions/transaction";
import useFetch from "@/hooks/use-fetch";
import ReceiptScanner from "./receipt-scanner";
import CreateAccountDrawer from "@/components/create-account-drawer";
import { useCurrency } from "@/components/currency-provider";

export default function AddTransactionForm({
  accounts,
  categories,
  editMode = false,
  initialData = null,
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const { formatCurrency } = useCurrency();

  const {
    loading: transactionLoading,
    fn: transactionFn,
    data: transactionResult,
  } = useFetch(createTransaction);

  const {
    loading: updateLoading,
    fn: updateFn,
    data: updateResult,
  } = useFetch(updateTransaction);

  const {
    register,
    setValue,
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues:
      editMode && initialData
        ? {
            type: initialData.type,
            amount: initialData.amount.toString(),
            description: initialData.description,
            accountId: initialData.accountId,
            category: initialData.category,
            date: new Date(initialData.date),
            isRecurring: initialData.isRecurring,
            recurringInterval:
              initialData.recurringInterval || undefined,
          }
        : {
            type: "EXPENSE",
            amount: "",
            description: "",
            accountId: accounts.find((a) => a.isDefault)?.id,
            date: new Date(),
            isRecurring: false,
          },
  });

  const type = useWatch({ control, name: "type" }) || "";
  const isRecurring = useWatch({ control, name: "isRecurring" });
  const date = useWatch({ control, name: "date" });
  const accountId = useWatch({ control, name: "accountId" }) || "";
  const category = useWatch({ control, name: "category" }) || "";
  const recurringInterval = useWatch({ control, name: "recurringInterval" }) || "";

  const filteredCategories = categories.filter((c) => c.type === type);

  const handleScanComplete = useCallback((scannedData) => {
    if (scannedData.amount) {
      setValue("amount", scannedData.amount.toString());
    }
    if (scannedData.date) {
      setValue("date", new Date(scannedData.date));
    }
    if (scannedData.description) {
      setValue("description", scannedData.description);
    }
    if (scannedData.category) {
      setValue("category", scannedData.category);
    }
  }, [setValue]);

  const onSubmit = async (data) => {
    const formData = { ...data, amount: parseFloat(data.amount) };
    if (editMode) {
      await updateFn(editId, formData);
    } else {
      await transactionFn(formData);
    }
  };

  useEffect(() => {
    if (transactionResult?.success && !transactionLoading) {
      toast.success("Transaction created successfully");
      reset();
      router.refresh(); // bust the Next.js client router cache
      router.push(`/account/${transactionResult.data.accountId}`);
    }
  }, [transactionResult, transactionLoading, reset, router]);

  useEffect(() => {
    if (updateResult?.success && !updateLoading) {
      toast.success("Transaction updated successfully");
      router.refresh(); // bust the Next.js client router cache
      router.push(`/account/${updateResult.data.accountId}`);
    }
  }, [updateResult, updateLoading, router]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {!editMode && <ReceiptScanner onScanComplete={handleScanComplete} />}

      {/* Type */}
      <div className="space-y-1">
        <Label htmlFor="type">Type</Label>
        <Select
          value={type}
          onValueChange={(v) => setValue("type", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INCOME">Income</SelectItem>
            <SelectItem value="EXPENSE">Expense</SelectItem>
          </SelectContent>
        </Select>
        {errors.type && (
          <p className="text-sm text-destructive">{errors.type.message}</p>
        )}
      </div>

      {/* Amount and Account */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-1">
          <Label htmlFor="amount">Amount</Label>
          <Input
            id="amount"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register("amount")}
          />
          {errors.amount && (
            <p className="text-sm text-destructive">{errors.amount.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="accountId">Account</Label>
          <div className="flex gap-2">
            <Select
              value={accountId}
              onValueChange={(v) => setValue("accountId", v)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select account" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name} ({formatCurrency(parseFloat(account.balance))})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <CreateAccountDrawer>
              <Button type="button" variant="outline" size="icon">
                +
              </Button>
            </CreateAccountDrawer>
          </div>
          {errors.accountId && (
            <p className="text-sm text-destructive">
              {errors.accountId.message}
            </p>
          )}
        </div>
      </div>

      {/* Category */}
      <div className="space-y-1">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setValue("category", v)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select category" />
          </SelectTrigger>
          <SelectContent>
            {filteredCategories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.category && (
          <p className="text-sm text-destructive">{errors.category.message}</p>
        )}
      </div>

      {/* Date */}
      <div className="space-y-1">
        <Label>Date</Label>
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-full justify-start text-left font-normal"
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>Pick a date</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(d) => setValue("date", d)}
              disabled={(d) =>
                d > new Date() || d < new Date("1900-01-01")
              }
              initialFocus
            />
          </PopoverContent>
        </Popover>
        {errors.date && (
          <p className="text-sm text-destructive">{errors.date.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label htmlFor="description">Description</Label>
        <Input
          id="description"
          placeholder="Enter description (optional)"
          {...register("description")}
        />
        {errors.description && (
          <p className="text-sm text-destructive">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* Recurring */}
      <div className="flex justify-between items-center rounded-lg border p-3">
        <div>
          <Label htmlFor="isRecurring" className="font-medium">
            Recurring Transaction
          </Label>
          <p className="text-sm text-muted-foreground">
            Set up a recurring schedule for this transaction
          </p>
        </div>
        <Switch
          id="isRecurring"
          checked={isRecurring}
          onCheckedChange={(v) => setValue("isRecurring", v)}
        />
      </div>

      {/* Recurring Interval */}
      {isRecurring && (
        <div className="space-y-1">
          <Label>Recurring Interval</Label>
          <Select
            value={recurringInterval}
            onValueChange={(v) => setValue("recurringInterval", v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interval" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          {errors.recurringInterval && (
            <p className="text-sm text-destructive">
              {errors.recurringInterval.message}
            </p>
          )}
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-4 pt-4">
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={() => router.back()}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1"
          disabled={transactionLoading || updateLoading}
        >
          {transactionLoading || updateLoading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              {editMode ? "Updating..." : "Creating..."}
            </>
          ) : editMode ? (
            "Update Transaction"
          ) : (
            "Create Transaction"
          )}
        </Button>
      </div>
    </form>
  );
}
