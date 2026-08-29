import { getSession } from "@/features/auth/services/auth.service";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  type UserRole,
} from "@/lib/utils/auth";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get("better-auth.session_token")?.value;

    const isAuth = isAuthRoute(pathname);

    if (isAuth && sessionToken) {
      return NextResponse.redirect(new URL(getDefaultDashboardRoute("USER"), request.url));
    }

    if (isAuth) {
      return NextResponse.next();
    }

    const routerOwner = getRouteOwner(pathname);

    if (routerOwner === null || routerOwner === "COMMON") {
      return NextResponse.next();
    }

    if (!sessionToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    const userInfo = await getSession();
    if (userInfo) {
      const userRole: UserRole = userInfo.role === "ADMIN" ? "ADMIN" : "USER";

      if (userInfo.emailVerified === false && pathname !== "/verify-email") {
        const verifyEmailUrl = new URL("/verify-email", request.url);
        verifyEmailUrl.searchParams.set("email", userInfo.email);
        return NextResponse.redirect(verifyEmailUrl);
      }

      if (userInfo.needPasswordChange && pathname !== "/reset-password") {
        const resetPasswordUrl = new URL("/reset-password", request.url);
        resetPasswordUrl.searchParams.set("email", userInfo.email);
        return NextResponse.redirect(resetPasswordUrl);
      }

      if (routerOwner === "ADMIN" && userRole !== "ADMIN") {
        return NextResponse.redirect(new URL(getDefaultDashboardRoute(userRole), request.url));
      }

      return NextResponse.next();
    }

    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  } catch (error) {
    console.error("Error in proxy middleware:", error);
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)"],
};
