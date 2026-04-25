"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
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
import { accountSchema } from "@/lib/schema";
import { createAccount } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { CURRENCIES, DEFAULT_CURRENCY } from "@/lib/currencies";
import { useCurrency } from "./currency-provider";

export default function CreateAccountDrawer({ children }) {
  const [open, setOpen] = useState(false);

  const { currencyCode } = useCurrency();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: "",
      type: "SAVINGS",
      balance: "",
      currency: currencyCode || DEFAULT_CURRENCY,
      isDefault: false,
    },
  });

  const {
    loading: isLoading,
    fn: createAccountFn,
    data: newAccount,
    error,
  } = useFetch(createAccount);

  const onSubmit = (data) => {
    createAccountFn(data);
  };

  useEffect(() => {
    if (newAccount?.success && !isLoading) {
      toast.success("Account created successfully");
      reset();
      setOpen(false);
    }
  }, [newAccount, isLoading, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to create account");
    }
  }, [error]);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>{children}</DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Create New Account</DrawerTitle>
        </DrawerHeader>

        <div className="px-4 pb-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Account Name */}
            <div className="space-y-1">
              <Label htmlFor="name">Account Name</Label>
              <Input
                id="name"
                placeholder="e.g., Main Checking"
                {...register("name")}
              />
              {errors.name && (
                <p className="text-sm text-destructive">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Account Type */}
            <div className="space-y-1">
              <Label htmlFor="type">Account Type</Label>
              <Select
                defaultValue={watch("type")}
                onValueChange={(v) => setValue("type", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CURRENT">Current</SelectItem>
                  <SelectItem value="SAVINGS">Savings</SelectItem>
                </SelectContent>
              </Select>
              {errors.type && (
                <p className="text-sm text-destructive">
                  {errors.type.message}
                </p>
              )}
            </div>

            {/* Initial Balance */}
            <div className="space-y-1">
              <Label htmlFor="balance">Initial Balance</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register("balance")}
              />
              {errors.balance && (
                <p className="text-sm text-destructive">
                  {errors.balance.message}
                </p>
              )}
            </div>

            {/* Account Currency */}
            <div className="space-y-1">
              <Label htmlFor="currency">Account Currency</Label>
              <Select
                defaultValue={watch("currency")}
                onValueChange={(v) => setValue("currency", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((currency) => (
                    <SelectItem key={currency.code} value={currency.code}>
                      {currency.name} ({currency.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.currency && (
                <p className="text-sm text-destructive">
                  {errors.currency.message}
                </p>
              )}
            </div>

            {/* Default Account Switch */}
            <div className="flex justify-between items-center rounded-lg border p-3">
              <div>
                <Label htmlFor="isDefault" className="font-medium">
                  Set as Default
                </Label>
                <p className="text-sm text-muted-foreground">
                  This account will be selected by default for transactions
                </p>
              </div>
              <Switch
                id="isDefault"
                checked={watch("isDefault")}
                onCheckedChange={(v) => setValue("isDefault", v)}
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-4 pt-4">
              <DrawerClose asChild>
                <Button type="button" variant="outline" className="flex-1">
                  Cancel
                </Button>
              </DrawerClose>
              <Button type="submit" className="flex-1" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin mr-2 h-4 w-4" />
                    Creating...
                  </>
                ) : (
                  "Create Account"
                )}
              </Button>
            </div>
          </form>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
