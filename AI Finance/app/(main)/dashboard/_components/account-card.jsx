"use client";

import { useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { updateDefaultAccount } from "@/actions/dashboard";
import useFetch from "@/hooks/use-fetch";
import { useCurrency } from "@/components/currency-provider";

export default function AccountCard({ account }) {
  const { name, type, balance, id, isDefault } = account;
  const { formatCurrency } = useCurrency();

  const {
    loading: updateDefaultLoading,
    fn: updateDefaultFn,
    data: updatedAccount,
    error,
  } = useFetch(updateDefaultAccount);

  useEffect(() => {
    if (updatedAccount?.success) {
      toast.success("Default account updated successfully");
    }
  }, [updatedAccount]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || "Failed to update default account");
    }
  }, [error]);

  const handleDefaultChange = (event) => {
    event.preventDefault();
    if (isDefault) {
      toast.warning("At least one default account is required");
      return;
    }
    updateDefaultFn(id);
  };

  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer relative">
      <Link href={`/account/${id}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium capitalize">{name}</CardTitle>
          <Switch
            checked={isDefault}
            onCheckedChange={handleDefaultChange}
            disabled={updateDefaultLoading}
            onClick={(e) => e.preventDefault()}
          />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(parseFloat(balance))}
          </div>
          <p className="text-xs text-muted-foreground capitalize">
            {type.charAt(0) + type.slice(1).toLowerCase()} Account
          </p>
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <ArrowUpRight className="h-4 w-4 text-green-500" />
            <span>Income</span>
          </div>
          <div className="flex items-center gap-1">
            <ArrowDownRight className="h-4 w-4 text-red-500" />
            <span>Expense</span>
          </div>
        </CardFooter>
      </Link>
    </Card>
  );
}
