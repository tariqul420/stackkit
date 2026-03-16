import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  let isAuthenticated = false;
  let isAdmin = false;

  // Mock user data for demonstration purposes replace this with actual authentication session logic
  const data = {
    name: "John Doe",
    email: "john.doe@example.com",
    role: "ADMIN",
  };

  if (data) {
    isAuthenticated = true;
    const role = data?.role;
    isAdmin = role === "ADMIN";
  }

  if (
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/signup"
  ) {
    if (isAuthenticated) {
      if (isAdmin) {
        return NextResponse.redirect(new URL("/dashboard/admin", request.url));
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    const next = encodeURIComponent(pathname + (search || ""));
    const res = NextResponse.redirect(
      new URL(`/login?next=${next}`, request.url),
    );
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/login",
    "/register",
    "/signup",
    "/dashboard/:path*",
  ],
};