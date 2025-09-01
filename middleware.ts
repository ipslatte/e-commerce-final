import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get the token from the session cookie
  const token = request.cookies.get("next-auth.session-token")?.value || 
                request.cookies.get("__Secure-next-auth.session-token")?.value;

  // If no token, redirect to login for protected routes
  if (!token) {
    if (pathname.startsWith("/dashboard") || 
        pathname.startsWith("/profile") || 
        pathname.startsWith("/orders") || 
        pathname.startsWith("/wishlist")) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // For now, allow all requests (we'll implement role-based logic later)
  // You can add role checking here once you have the user data available
  return NextResponse.next();
}

// Protect these paths with authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/orders/:path*",
    "/wishlist/:path*",
  ],
};
