import {
  getNewTokensWithRefreshToken,
  getUserInfo,
} from "@/features/auth/services/auth.service";
import { envVars } from "@/lib/env";
import {
  getDefaultDashboardRoute,
  getRouteOwner,
  isAuthRoute,
  UserRole,
} from "@/lib/utils/auth";
import { jwtUtils } from "@/lib/utils/jwt";
import { isTokenExpiringSoon } from "@/lib/utils/token";
import { NextRequest, NextResponse } from "next/server";

async function refreshTokenMiddleware(refreshToken: string): Promise<boolean> {
  try {
    const refresh = await getNewTokensWithRefreshToken(refreshToken);
    if (!refresh) {
      return false;
    }
    return true;
  } catch (error) {
    console.error("Error refreshing token in middleware:", error);
    return false;
  }
}

export async function proxy(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl;
    const accessToken = request.cookies.get("accessToken")?.value;
    const refreshToken = request.cookies.get("refreshToken")?.value;

    const decodedAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string)
        .data;

    const isValidAccessToken =
      accessToken &&
      jwtUtils.verifyToken(accessToken, envVars.JWT_ACCESS_SECRET as string)
        .success;

    let userRole: UserRole | null = null;

    if (decodedAccessToken) {
      userRole = (decodedAccessToken.role as UserRole) || null;
    }

    // Normalize roles to only ADMIN or USER for frontend routing
    const normalizedUserRole = userRole === "ADMIN" ? "ADMIN" : "USER";

    const routerOwner = getRouteOwner(pathname);

    const isAuth = isAuthRoute(pathname);

    //proactively refresh token if refresh token exists and access token is expired or about to expire
    if (
      isValidAccessToken &&
      refreshToken &&
      (await isTokenExpiringSoon(accessToken))
    ) {
      const requestHeaders = new Headers(request.headers);

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      try {
        const refreshed = await refreshTokenMiddleware(refreshToken);

        if (refreshed) {
          requestHeaders.set("x-token-refreshed", "1");
        }

        return NextResponse.next({
          request: {
            headers: requestHeaders,
          },
          headers: response.headers,
        });
      } catch (error) {
        console.error("Error refreshing token:", error);
      }

      return response;
    }

    // Rule - 1 : User is logged in (has access token) and trying to access auth route -> allow
    if (isAuth && isValidAccessToken) {
      return NextResponse.redirect(
        new URL(getDefaultDashboardRoute(userRole as UserRole), request.url),
      );
    }

    // Rule - 2 : User is trying to access reset password page
    if (pathname === "/reset-password") {
      const email = request.nextUrl.searchParams.get("email");

      // case - 1 user has needPasswordChange true
      //no need for case 1 if need password change is handled from change-password page
      if (accessToken && email) {
        const userInfo = await getUserInfo();

        if (userInfo.needPasswordChange) {
          return NextResponse.next();
        } else {
          return NextResponse.redirect(
            new URL(
              getDefaultDashboardRoute(userRole as UserRole),
              request.url,
            ),
          );
        }
      }

      // Case-2 user coming from forgot password

      if (email) {
        return NextResponse.next();
      }

      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rule - 3 Public route -> allow
    if (routerOwner === null || routerOwner === "COMMON") {
      return NextResponse.next();
    }

    // Rule - 4 User is Not logged in but trying to access protected route -> redirect to login
    if (!accessToken || !isValidAccessToken) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Rule - 5 enforce email verification / password change flows
    if (accessToken) {
      const userInfo = await getUserInfo();
      if (userInfo) {
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
      }
    }

    // Rule - 6 enforce role-based routes (only ADMIN vs USER)
    const routeOwnerNormalized = routerOwner === "ADMIN" ? "ADMIN" : "USER";

    if (routeOwnerNormalized === "ADMIN" && normalizedUserRole !== "ADMIN") {
      return NextResponse.redirect(
        new URL(
          getDefaultDashboardRoute(normalizedUserRole as UserRole),
          request.url,
        ),
      );
    }

    return NextResponse.next();
  } catch (error) {
    console.error("Error in proxy middleware:", error);
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.well-known).*)",
  ],
};
