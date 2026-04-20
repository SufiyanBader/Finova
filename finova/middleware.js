import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// Routes that require an authenticated Clerk session
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
  "/goals(.*)",
  "/analytics(.*)",
  "/search(.*)",
  "/onboarding(.*)",
  "/trips(.*)",
]);

// @clerk/nextjs v6 middleware — use auth.protect() (async) for route guarding.
// Rate-limiting lives in lib/rate-limit.js (Node.js runtime, per server action).
export default clerkMiddleware(async (auth, request) => {
  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
