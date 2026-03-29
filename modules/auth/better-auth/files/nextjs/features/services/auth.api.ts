"use server";

import { ILoginResponse, IUserResponse } from "@/features/auth/types/auth.type";
import { api } from "@/lib/axios/http";
import { deleteCookie } from "@/lib/utils/cookie";

export async function loginRequest(payload: {
  email: string;
  password: string;
}) {
  const res = await api.post<ILoginResponse>("/v1/auth/login", payload);
  return res.data;
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

  // remove local cookies used for auth
  await deleteCookie("accessToken");
  await deleteCookie("refreshToken");
  await deleteCookie("better-auth.session_token");

  return res.data;
}

export async function getMeRequest(): Promise<IUserResponse> {
  const res = await api.get<IUserResponse>("/v1/auth/me");
  return res.data;
}
