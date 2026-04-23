"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import {
  ArrowLeft,
  MapPin,
  Calendar,
  CheckCircle2,
  Trash2,
  Flag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { deleteTrip, completeTrip } from "@/actions/trips";
import useFetch from "@/hooks/use-fetch";
import { formatCurrency } from "@/lib/currency";

export default function TripHeader({ trip }) {
  const router = useRouter();

  const {
    loading: deleteLoading,
    fn: deleteFn,
    data: deleteResult,
  } = useFetch(deleteTrip);

  const {
    loading: completeLoading,
    fn: completeFn,
    data: completeResult,
  } = useFetch(completeTrip);

  const handleDelete = () => {
    if (
      window.confirm(
        "Delete this trip and all its expenses? This cannot be undone."
      )
    ) {
      deleteFn(trip.id);
    }
  };

  const handleComplete = () => {
    if (window.confirm("Mark this trip as completed?")) {
      completeFn(trip.id);
    }
  };

  useEffect(() => {
    if (deleteResult?.success) {
      toast.success("Trip deleted");
      router.push("/trips");
    }
  }, [deleteResult, router]);

  useEffect(() => {
    if (completeResult?.success) {
      toast.success("Trip marked as completed");
      router.refresh();
    }
  }, [completeResult, router]);

  return (
    <div>
      {/* Back button */}
      <div className="flex items-center gap-3 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push("/trips")}
          className="gap-1"
        >
          <ArrowLeft className="h-4 w-4" />
          All Trips
        </Button>
      </div>

      {/* Title row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          {/* Color stripe */}
          <div
            className="w-4 h-16 rounded-full flex-shrink-0"
            style={{ backgroundColor: trip.coverColor }}
          />

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-4xl font-bold gradient-title">{trip.name}</h1>
              {trip.isCompleted && (
                <Badge className="bg-green-100 text-green-700 dark:bg-green-950/40">
                  <CheckCircle2 className="h-3 w-3 mr-1" />
                  Completed
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-2 text-muted-foreground text-sm flex-wrap">
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {trip.destination}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(trip.startDate), "MMM d, yyyy")}
                {trip.endDate &&
                  ` - ${format(new Date(trip.endDate), "MMM d, yyyy")}`}
              </div>
              <Badge variant="outline">Base: {trip.baseCurrency}</Badge>

              {trip.budget !== null && trip.budget > 0 && (
                <span className="font-medium">
                  Budget: {formatCurrency(trip.budget, trip.baseCurrency)}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2 flex-shrink-0">
          {!trip.isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleComplete}
              disabled={completeLoading}
              className="gap-1"
            >
              <Flag className="h-4 w-4" />
              Complete Trip
            </Button>
          )}

          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleteLoading}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
