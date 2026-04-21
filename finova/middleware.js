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

const suspiciousPatterns = [
  "wp-admin", "wp-login", ".php",
  "xmlrpc", "eval(", "base64_decode",
  "../", "etc/passwd", "cmd=", "exec(",
];

export default clerkMiddleware(async (auth, request) => {
  const url = request.url.toLowerCase();
  
  if (suspiciousPatterns.some(pattern => url.includes(pattern))) {
    return new Response("Forbidden", { status: 403 });
  }

  if (isProtectedRoute(request)) {
    await auth.protect();
  }
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
