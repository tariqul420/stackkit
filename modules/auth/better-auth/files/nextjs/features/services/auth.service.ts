"use server";

import {
  ILoginResponse,
  OAuthLoginPayload,
  OAuthPayloadResponse,
  SocialProvider,
} from "@/features/auth/types/auth.type";
import { api } from "@/lib/axios/http";
import { envVars } from "@/lib/env";
import { setTokenInCookies } from "@/lib/utils/token";
import { cookies } from "next/headers";

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  try {
    const res = await api.post<ILoginResponse>("/v1/auth/login", payload);
    return res.data;
  } catch (err: unknown) {
    const e = err as Record<string, unknown> | undefined;
    const resp =
      e && typeof e === "object" && "response" in e
        ? (e["response"] as Record<string, unknown> | undefined)
        : undefined;
    const data =
      resp && typeof resp === "object" && "data" in resp
        ? (resp["data"] as Record<string, unknown> | undefined)
        : undefined;
    const message =
      data && typeof data === "object" && "message" in data
        ? String(data["message"])
        : err instanceof Error
          ? err.message
          : "Request failed";
    const ex = new Error(message) as Error & {
      response?: { data?: Record<string, unknown> };
    };
    ex.response = { data };
    throw ex;
  }
}

export async function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/v1/auth/register", payload);
  return res.data;
}

export async function forgetPasswordRequest(payload: { email: string }) {
  const res = await api.post("/v1/auth/forget-password", payload);
  return res.data;
}

export async function resetPasswordRequest(payload: {
  email: string;
  otp: string;
  newPassword: string;
}) {
  const res = await api.post("/v1/auth/reset-password", payload);
  return res.data;
}

export async function verifyEmailRequest(payload: {
  email: string;
  otp: string;
}) {
  const res = await api.post("/v1/auth/verify-email", payload);
  return res.data;
}

export async function resendOTPRequest(payload: { email: string }) {
  const res = await api.post("/v1/auth/resend-otp", payload);
  return res.data;
}

export async function logoutRequest() {
  const res = await api.post("/v1/auth/logout", {});
  return res.data;
}

export async function getMeRequest() {
  const res = await api.get("/v1/auth/me");
  return res.data;
}

export const socialLoginPayload = async (provider: SocialProvider) => {
  const response = (await api.get(`/v1/auth/login/${provider}`, {
    params: {
      redirect: "/dashboard",
      json: "true",
    },
  })) as { data: OAuthPayloadResponse };

  return response.data.data;
};

export const socialLogin = async (payload: OAuthLoginPayload) => {
  const response = (await api.post(payload.signInEndpoint, {
    provider: payload.provider,
    callbackURL: payload.callbackURL,
  })) as { data: { url?: string } };

  return response.data.url;
};

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
