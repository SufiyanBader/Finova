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
import { Textarea } from "@/components/ui/textarea";

import { portfolioSchema } from "@/lib/portfolio-schema";
import { createPortfolio } from "@/actions/portfolio";
import useFetch from "@/hooks/use-fetch";
import { cn } from "@/lib/utils";

const PORTFOLIO_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
  "#3b82f6",
  "#10b981",
  "#f59e0b",
];

export default function CreatePortfolioDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(portfolioSchema),
    defaultValues: {
      name: "",
      description: "",
      color: "#6366f1",
    },
  });

  const {
    data: newPortfolio,
    loading: isLoading,
    error,
    fn: createFn,
  } = useFetch(createPortfolio);

  const selectedColor = watch("color");

  const onSubmit = (data) => {
    createFn(data);
  };

  useEffect(() => {
    if (newPortfolio && !isLoading) {
      toast.success("Portfolio created");
      reset();
      setOpen(false);
    }
  }, [newPortfolio, isLoading, reset]);

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
          New Portfolio
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Portfolio</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Portfolio Name</Label>
            <Input
              id="name"
              placeholder="e.g., Growth Portfolio"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-sm text-red-500">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Optional description..."
              rows={2}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-sm text-red-500">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Portfolio Color</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {PORTFOLIO_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("color", color)}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 transition-all hover:scale-110",
                    selectedColor === color
                      ? "border-gray-800 scale-110 shadow-md"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            {errors.color && (
              <p className="text-sm text-red-500">{errors.color.message}</p>
            )}
          </div>

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Portfolio"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
