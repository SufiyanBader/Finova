"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { goalSchema } from "@/lib/schema";
import { createGoal } from "@/actions/goals";
import useFetch from "@/hooks/use-fetch";

export default function CreateGoalDialog({ accounts }) {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      name: "",
      targetAmount: "",
      savedAmount: "",
      deadline: "",
      accountId: "",
    },
  });

  const {
    loading: isLoading,
    fn: createGoalFn,
    data: newGoal,
    error,
  } = useFetch(createGoal);

  const onSubmit = async (data) => {
    await createGoalFn(data);
  };

  useEffect(() => {
    if (newGoal?.success && !isLoading) {
      toast.success("Goal created successfully");
      reset();
      setOpen(false);
    }
  }, [newGoal, isLoading, reset]);

  useEffect(() => {
    if (error) {
      toast.error(error.message);
    }
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          New Goal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Financial Goal</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Goal Name</Label>
            <Input id="name" placeholder="e.g., Vacation Fund" {...register("name")} />
            {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="targetAmount">Target Amount ($)</Label>
            <Input
              id="targetAmount"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("targetAmount")}
            />
            {errors.targetAmount && <p className="text-sm text-destructive">{errors.targetAmount.message}</p>}
          </div>

          <div className="space-y-1">
            <Label htmlFor="deadline">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              min={new Date().toISOString().split("T")[0]}
              {...register("deadline")}
            />
          </div>

          <div className="space-y-1">
            <Label>Link to Account (Optional)</Label>
            <Select onValueChange={(v) => setValue("accountId", v)}>
              <SelectTrigger>
                <SelectValue placeholder="No account linked" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unlinked">No account linked</SelectItem>
                {accounts.map((acc) => (
                  <SelectItem key={acc.id} value={acc.id}>
                    {acc.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground mt-1">If linked, we can optionally track balances relative to this account.</p>
          </div>

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin h-4 w-4 mr-2" />
                  Creating...
                </>
              ) : (
                "Create Goal"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
