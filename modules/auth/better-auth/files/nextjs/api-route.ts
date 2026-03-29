import { NextRequest, NextResponse } from "next/server";

const SUPPORTED_PROVIDERS = [
  "google",
  "github",
  "facebook",
  "twitter",
  "discord",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;

  if (!SUPPORTED_PROVIDERS.includes(provider)) {
    return NextResponse.redirect(
      new URL("/login?error=unsupported_provider", request.url),
    );
  }

  const { searchParams } = request.nextUrl;

  const accessToken = searchParams.get("accessToken");
  const refreshToken = searchParams.get("refreshToken");
  const sessionToken = searchParams.get("token");
  const redirectPath = searchParams.get("redirect") || "/dashboard";

  // Prevent open-redirect attacks
  const isValidRedirectPath =
    redirectPath.startsWith("/") && !redirectPath.startsWith("//");
  const finalRedirect = isValidRedirectPath ? redirectPath : "/dashboard";

  if (!accessToken || !refreshToken) {
    return NextResponse.redirect(
      new URL("/login?error=oauth_failed", request.url),
    );
  }

  const isProduction = process.env.NODE_ENV === "production";
  const ONE_DAY_SECONDS = 60 * 60 * 24;
  const SEVEN_DAYS_SECONDS = ONE_DAY_SECONDS * 7;

  const response = NextResponse.redirect(new URL(finalRedirect, request.url));

  response.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: ONE_DAY_SECONDS,
  });

  response.cookies.set("refreshToken", refreshToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: "lax",
    path: "/",
    maxAge: SEVEN_DAYS_SECONDS,
  });

  if (sessionToken) {
    response.cookies.set("better-auth.session_token", sessionToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "lax",
      path: "/",
      maxAge: ONE_DAY_SECONDS,
    });
  }

  return response;
}
