"use client";

import Link from "next/link";
import { format } from "date-fns";
import {
  MapPin,
  Calendar,
  Wallet,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { formatCurrency } from "@/lib/currency";

export default function TripCard({ trip }) {
  const budgetPercent = trip.budget
    ? Math.min((trip.totalSpent / trip.budget) * 100, 100)
    : null;

  const budgetColor =
    budgetPercent >= 90
      ? "text-red-600"
      : budgetPercent >= 75
      ? "text-yellow-600"
      : "text-green-600";

  const progressColor =
    budgetPercent >= 90
      ? "[&>div]:bg-red-500"
      : budgetPercent >= 75
      ? "[&>div]:bg-yellow-500"
      : "[&>div]:bg-green-500";

  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden border-0 shadow-md">
        {/* Color accent bar */}
        <div className="h-2 w-full" style={{ backgroundColor: trip.coverColor }} />

        <CardContent className="p-5">
          {/* Header */}
          <div className="flex justify-between items-start mb-4">
            <div>
              <h3 className="font-semibold text-lg leading-tight">{trip.name}</h3>
              <div className="flex items-center gap-1 text-muted-foreground text-sm mt-1">
                <MapPin className="h-3 w-3" />
                <span>{trip.destination}</span>
              </div>
            </div>

            {trip.isCompleted ? (
              <Badge className="bg-green-100 text-green-700 border-0 dark:bg-green-950/40">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge className="bg-emerald-100 text-emerald-700 border-0 dark:bg-emerald-950/40">
                Active
              </Badge>
            )}
          </div>

          {/* Stats */}
          <div className="space-y-3">
            {/* Dates + base currency */}
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1 text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>{format(new Date(trip.startDate), "MMM d, yyyy")}</span>
                {trip.endDate && (
                  <>
                    <span> - </span>
                    <span>{format(new Date(trip.endDate), "MMM d, yyyy")}</span>
                  </>
                )}
              </div>
              <Badge variant="outline" className="text-xs">
                {trip.baseCurrency}
              </Badge>
            </div>

            {/* Total spent */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-lg p-2">
                  <Wallet className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Total Spent</p>
                  <p className="font-bold text-sm">
                    {formatCurrency(trip.totalSpent, trip.baseCurrency)}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">
                  {trip.expenseCount} expense{trip.expenseCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>

            {/* Budget progress */}
            {trip.budget !== null && trip.budget > 0 && (
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Budget</span>
                  <span className={budgetColor}>
                    {formatCurrency(trip.budget, trip.baseCurrency)}
                  </span>
                </div>
                <Progress
                  value={budgetPercent}
                  className={progressColor}
                />
                <p className="text-xs text-right text-muted-foreground">
                  {budgetPercent.toFixed(1)}% used
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
