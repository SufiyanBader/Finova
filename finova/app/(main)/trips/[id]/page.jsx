import { notFound } from "next/navigation";
import { Suspense } from "react";
import { BarLoader } from "react-spinners";
import { getTripById } from "@/actions/trips";
import TripHeader from "./_components/trip-header";
import TripStats from "./_components/trip-stats";
import ExpenseList from "./_components/expense-list";
import TripCharts from "./_components/trip-charts";
import AddExpenseSheet from "./_components/add-expense-sheet";

export async function generateMetadata({ params }) {
  const { id } = await params;
  try {
    const trip = await getTripById(id);
    return { title: `${trip.name} | AI Finance Trips` };
  } catch {
    return { title: "Trip | AI Finance" };
  }
}

export default async function TripDetailPage({ params }) {
  const { id } = await params;
  const tripData = await getTripById(id).catch(() => null);

  if (!tripData) notFound();

  return (
    <div className="space-y-8 px-5 pb-24">
      {/* Header */}
      <TripHeader trip={tripData} />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <TripStats stats={tripData.stats} baseCurrency={tripData.baseCurrency} />
      </div>

      {/* Charts + Expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
          <TripCharts
            byCategory={tripData.stats.byCategory}
            byCurrency={tripData.stats.byCurrency}
            byDay={tripData.stats.byDay}
            baseCurrency={tripData.baseCurrency}
          />
        </Suspense>

        <Suspense fallback={<BarLoader width="100%" color="#6366f1" />}>
          <ExpenseList
            expenses={tripData.expenses}
            tripId={tripData.id}
            baseCurrency={tripData.baseCurrency}
          />
        </Suspense>
      </div>

      {/* Floating Add Expense Button */}
      <AddExpenseSheet
        tripId={tripData.id}
        baseCurrency={tripData.baseCurrency}
      />
    </div>
  );
}
