import { getTrips } from "@/actions/trips";
import CreateTripDialog from "./_components/create-trip-dialog";
import TripCard from "./_components/trip-card";
import { Plane } from "lucide-react";

export const metadata = {
  title: "Trips | AI Finance",
  description: "Track your travel expenses in multiple currencies",
};

export default async function TripsPage() {
  const trips = await getTrips();

  const activeTrips = trips.filter((t) => !t.isCompleted);
  const completedTrips = trips.filter((t) => t.isCompleted);

  return (
    <div className="space-y-8 px-5">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="gradient-title text-5xl font-bold">Trip Expenses</h1>
          <p className="text-muted-foreground mt-1">
            Track your travel expenses in any currency
          </p>
        </div>
        <CreateTripDialog />
      </div>

      {/* Empty State */}
      {trips.length === 0 && (
        <div className="text-center py-20">
          <div className="bg-emerald-50 dark:bg-emerald-950/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
            <Plane className="h-10 w-10 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">No trips yet</h2>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Create your first trip to start tracking expenses in multiple
            currencies
          </p>
          <CreateTripDialog />
        </div>
      )}

      {/* Active Trips */}
      {activeTrips.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4">Active Trips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Trips */}
      {completedTrips.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold mb-4 text-muted-foreground">
            Completed Trips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-75">
            {completedTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
