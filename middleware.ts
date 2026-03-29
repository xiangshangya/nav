import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  
  const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth")
  const isRegisterApiRoute = nextUrl.pathname === "/api/register"
  const isPublicRoute = ["/login", "/register"].includes(nextUrl.pathname)

  // 1. Allow API Auth routes and Register API route
  if (isApiAuthRoute || isRegisterApiRoute) {
    return NextResponse.next()
  }

  // 2. Public Routes: if logged in, redirect to home; else proceed
  if (isPublicRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl))
    }
    return NextResponse.next()
  }

  // 3. Protected Routes
  if (!isLoggedIn) {
    // For API requests, return 401 instead of redirecting
    if (nextUrl.pathname.startsWith("/api")) {
      return new NextResponse("Unauthorized", { status: 401 })
    }
    // For page requests, redirect to login
    return NextResponse.redirect(new URL("/login", nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - xiangshang.png (your custom icon)
     * - all other common static file extensions (png, jpg, jpeg, gif, svg)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|ico)$|xiangshang.png).*)",
  ],
}
