// Clerk and basic Next.js utilities
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

// Dynamic imports at the top are better for middleware performance
// (though Arcjet specifically recommends dynamic import if the key might be missing)

/** Routes that require an authenticated Clerk session. */
const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/account(.*)",
  "/transaction(.*)",
]);

/**
 * Clerk middleware – redirects unauthenticated users away from protected routes.
 */
const clerkHandler = clerkMiddleware(async (auth, req) => {
  const { userId } = await auth();

  if (!userId && isProtectedRoute(req)) {
    const { redirectToSignIn } = await auth();
    return redirectToSignIn();
  }

  return NextResponse.next();
});

/**
 * Main Middleware Handler
 * Composes Arcjet protection with Clerk authentication.
 */
export default async function middleware(req, evt) {
  // If ARCJET_KEY is missing, bypass Arcjet and use Clerk only
  if (!process.env.ARCJET_KEY) {
    return clerkHandler(req, evt);
  }

  try {
    // Importing Arcjet dynamically but once per request is standard,
    // however, we ensure it fails fast if the key is invalid.
    const { default: arcjet, shield, detectBot, createMiddleware } =
      await import("@arcjet/next");

    const aj = arcjet({
      key: process.env.ARCJET_KEY,
      rules: [
        shield({ mode: "LIVE" }),
        detectBot({
          mode: "LIVE",
          allow: [
            "CATEGORY:SEARCH_ENGINE",
            "CATEGORY:PREVIEW",
            "CATEGORY:MONITOR",
            "GO_HTTP",
          ],
        }),
      ],
    });

    const composed = createMiddleware(aj, clerkHandler);
    return composed(req, evt);
  } catch (error) {
    console.error("[middleware] Arcjet error, falling back to Clerk:", error.message);
    return clerkHandler(req, evt);
  }
}

export const config = {
  matcher: [
    // Skip Next.js internals and static assets
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};
