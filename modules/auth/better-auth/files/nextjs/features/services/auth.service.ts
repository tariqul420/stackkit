"use server";

import { ILoginResponse } from "@/features/auth/types/auth.type";
import { api } from "@/lib/axios/http";
import { envVars } from "@/lib/env";
import { setTokenInCookies } from "@/lib/utils/token";
import { cookies } from "next/headers";

// Client-side HTTP helpers (used by React Query hooks)
export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const res = await api.post<ILoginResponse>("/v1/auth/login", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/v1/auth/register", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function forgetPasswordRequest(payload: { email: string }) {
  const res = await api.post("/v1/auth/forget-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function resetPasswordRequest(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const res = await api.post("/v1/auth/reset-password", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function verifyEmailRequest(payload: {
  email: string;
  otp: string;
}) {
  const res = await api.post("/v1/auth/verify-email", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post(
    "/v1/auth/logout",
    {},
    { headers: { "Content-Type": "application/json" } },
  );
  return res.data;
}

export async function getMeRequest() {
  const res = await api.get("/v1/auth/me");
  return res.data;
}

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

export async function getUserInfo() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("accessToken")?.value;
    const sessionToken = cookieStore.get("better-auth.session_token")?.value;

    if (!accessToken) {
      return null;
    }

    const res = await fetch(`${envVars.API_URL}/auth/me`, {
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
