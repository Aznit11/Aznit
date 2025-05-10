import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Create base response to add headers
  let response = NextResponse.next();

  // Add security headers
  const securityHeaders = {
    'X-XSS-Protection': '1; mode=block',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'X-Frame-Options': 'DENY',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.paypal.com https://*.paypalobjects.com https://www.google.com https://www.gstatic.com; style-src 'self' 'unsafe-inline' https://*.paypalobjects.com; img-src 'self' data: https: blob:; font-src 'self' data: https://*.paypalobjects.com; connect-src 'self' https://*.paypal.com https://api.paypal.com; frame-src 'self' https://*.paypal.com https://www.google.com;"
  };

  // Apply security headers to all responses
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  // Debug route should always be accessible
  if (request.nextUrl.pathname.startsWith("/debug")) {
    return response;
  }

  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET || "fallbacksecretkeyfortesting1234567890",
  });

  console.log("Middleware token:", token);

  const isAuthRoute = request.nextUrl.pathname.startsWith("/login") || 
                      request.nextUrl.pathname.startsWith("/register");

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // For protected routes
  const isProtectedRoute = request.nextUrl.pathname.startsWith("/account") || 
                          request.nextUrl.pathname.startsWith("/checkout") ||
                          request.nextUrl.pathname.startsWith("/admin");
  
  // If accessing a protected route without being authenticated
  if (isProtectedRoute && !token) {
    console.log("Redirecting unauthenticated user from protected route");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // For admin routes
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");
  
  // If accessing admin route without admin privileges
  if (isAdminRoute && token?.role !== "ADMIN") {
    console.log("User role:", token?.role);
    console.log("Redirecting non-admin user from admin route");
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}; 