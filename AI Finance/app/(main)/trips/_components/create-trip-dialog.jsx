"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Plane } from "lucide-react";
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
import { tripSchema } from "@/lib/trip-schema";
import { createTrip } from "@/actions/trips";
import useFetch from "@/hooks/use-fetch";
import { SUPPORTED_CURRENCIES } from "@/lib/currency";
import { cn } from "@/lib/utils";

const COVER_COLORS = [
  "#6366f1",
  "#8b5cf6",
  "#ec4899",
  "#f97316",
  "#22c55e",
  "#06b6d4",
  "#f43f5e",
  "#eab308",
  "#14b8a6",
];

export default function CreateTripDialog() {
  const [open, setOpen] = useState(false);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(tripSchema),
    defaultValues: {
      name: "",
      destination: "",
      baseCurrency: "USD",
      budget: "",
      startDate: "",
      endDate: "",
      coverColor: "#6366f1",
    },
  });

  const selectedColor = watch("coverColor");

  const {
    loading: isLoading,
    fn: createTripFn,
    data: newTrip,
    error,
  } = useFetch(createTrip);

  const onSubmit = (data) => {
    createTripFn(data);
  };

  useEffect(() => {
    if (newTrip?.success && !isLoading) {
      toast.success("Trip created successfully");
      reset();
      setOpen(false);
    }
  }, [newTrip, isLoading, reset]);

  useEffect(() => {
    if (error) toast.error(error.message);
  }, [error]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plane className="h-4 w-4" />
          New Trip
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New Trip</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 mt-4"
        >
          {/* Trip Name */}
          <div className="space-y-1">
            <Label htmlFor="trip-name">Trip Name</Label>
            <Input
              id="trip-name"
              placeholder="e.g., Tokyo Adventure 2024"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Destination */}
          <div className="space-y-1">
            <Label htmlFor="trip-destination">Destination</Label>
            <Input
              id="trip-destination"
              placeholder="e.g., Tokyo, Japan"
              {...register("destination")}
            />
            {errors.destination && (
              <p className="text-xs text-destructive">
                {errors.destination.message}
              </p>
            )}
          </div>

          {/* Base Currency */}
          <div className="space-y-1">
            <Label>Base Currency</Label>
            <p className="text-xs text-muted-foreground">
              All expenses will be converted to this currency
            </p>
            <Select
              defaultValue={watch("baseCurrency")}
              onValueChange={(v) => setValue("baseCurrency", v)}
            >
              <SelectTrigger id="trip-base-currency">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {Object.entries(SUPPORTED_CURRENCIES).map(([code, info]) => (
                  <SelectItem key={code} value={code}>
                    <div className="flex items-center justify-between w-full gap-3">
                      <span className="font-medium">{code}</span>
                      <span className="text-muted-foreground text-xs">
                        {info.name}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Budget */}
          <div className="space-y-1">
            <Label htmlFor="trip-budget">Budget (Optional)</Label>
            <Input
              id="trip-budget"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register("budget")}
            />
            <p className="text-xs text-muted-foreground">
              Leave empty for no budget limit
            </p>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label htmlFor="trip-start">Start Date</Label>
              <Input id="trip-start" type="date" {...register("startDate")} />
              {errors.startDate && (
                <p className="text-xs text-destructive">
                  {errors.startDate.message}
                </p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="trip-end">End Date (Optional)</Label>
              <Input id="trip-end" type="date" {...register("endDate")} />
            </div>
          </div>

          {/* Cover Color */}
          <div className="space-y-2">
            <Label>Cover Color</Label>
            <div className="flex gap-2 flex-wrap mt-1">
              {COVER_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setValue("coverColor", color)}
                  className={cn(
                    "w-8 h-8 rounded-full transition-all hover:scale-110 border-2",
                    selectedColor === color
                      ? "border-gray-900 dark:border-gray-100 scale-110"
                      : "border-transparent"
                  )}
                  style={{ backgroundColor: color }}
                  aria-label={`Select color ${color}`}
                />
              ))}
            </div>
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
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-4 w-4" />
                  Creating...
                </>
              ) : (
                "Create Trip"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
