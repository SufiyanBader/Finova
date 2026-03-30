import { Suspense } from "react";

export default function DashboardLayout({ children }) {
  return (
    <div>
      <h1 className="text-5xl font-bold tracking-tight mb-5 gradient-title">
        Dashboard
      </h1>
      <Suspense
        fallback={
          <div className="space-y-4">
            <div className="h-2 w-full bg-indigo-100 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        }
      >
        {children}
      </Suspense>
    </div>
  );
}

