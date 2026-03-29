"use server";

import { envVars } from "@/lib/env";
import { setTokenInCookies } from "@/lib/utils/token";
import { cookies } from "next/headers";

export async function getNewTokensWithRefreshToken(
  refreshToken: string,
): Promise<boolean> {
  try {
    const res = await fetch(`${envVars.API_URL}/auth/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: `refreshToken=${refreshToken}`,
      },
    });

    if (!res.ok) {
      return false;
    }

    const { data } = await res.json();

    const { accessToken, refreshToken: newRefreshToken, token } = data;

    if (accessToken) {
      await setTokenInCookies("accessToken", accessToken);
    }

    if (newRefreshToken) {
      await setTokenInCookies("refreshToken", newRefreshToken);
    }

    if (token) {
      await setTokenInCookies("better-auth.session_token", token, 24 * 60 * 60); // 1 day in seconds
    }

    return true;
  } catch (error) {
    console.error("Error refreshing token:", error);
    return false;
  }
}

export async function setTokens(tokens: {
  accessToken?: string;
  refreshToken?: string;
  token?: string;
}) {
  if (!tokens) return false;

  if (tokens.accessToken) {
    await setTokenInCookies("accessToken", tokens.accessToken);
  }

  if (tokens.refreshToken) {
    await setTokenInCookies("refreshToken", tokens.refreshToken);
  }

  if (tokens.token) {
    await setTokenInCookies(
      "better-auth.session_token",
      tokens.token,
      24 * 60 * 60,
    );
  }

  return true;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res = await fetch(`${envVars.API_URL}/v1/auth/me`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Cookie: `accessToken=${accessToken}; better-auth.session_token=${sessionToken}`,
      },
    });

    if (!res.ok) {
      console.error("Failed to fetch user info:", res.status, res.statusText);
      return null;
    }

    const { data } = await res.json();

    return data;
  } catch (error) {
    console.error("Error fetching user info:", error);
    return null;
  }
}
