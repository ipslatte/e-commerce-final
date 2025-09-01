import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAdmin = token?.role === "admin";
    const path = req.nextUrl.pathname;

    // Redirect admin trying to access user dashboard
    if (isAdmin && path === "/dashboard") {
      return NextResponse.redirect(new URL("/dashboard/admin", req.url));
    }

    // Redirect user trying to access admin dashboard
    if (!isAdmin && path.startsWith("/dashboard/admin")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token, // Return true if the user is authenticated
    },
  }
);

// Protect these paths with authentication
export const config = {
  matcher: [
    "/dashboard",
    "/dashboard/:path*",
    "/profile",
    "/orders",
    "/wishlist",
  ],
};
