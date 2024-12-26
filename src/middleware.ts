import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;

  // Public paths that don't require authentication
  const isPublicPath = request.nextUrl.pathname.startsWith("/auth/");

  if (!isAuthenticated && !isPublicPath) {
    return NextResponse.redirect(new URL("/auth/signin", request.url));
  }

  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If authenticated and trying to access home page, check if user has tracked URLs
  if (isAuthenticated && request.nextUrl.pathname === "/") {
    try {
      const response = await fetch(`${request.nextUrl.origin}/api/tracked-urls`, {
        headers: {
          Cookie: request.headers.get("cookie") || "",
        },
      });

      const trackedUrls = await response.json();

      if (!Array.isArray(trackedUrls) || trackedUrls.length === 0) {
        return NextResponse.redirect(new URL("/track/new", request.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    } catch (error) {
      console.error("Middleware error:", error);
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}; 