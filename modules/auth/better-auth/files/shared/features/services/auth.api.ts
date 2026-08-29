{{#if framework == "nextjs"}}
"use server";
{{/if}}
import type { IUserResponse } from "../types/auth.type";
import { api } from "@/lib/ofetch/http";

export async function updateProfile(payload: {
  name: string;
  image?: string;
}) {
  const res = await api.patch("/v1/auth/profile", payload);
  return res.data;
}

export async function getMeRequest(): Promise<IUserResponse> {
  const res = await api.get<IUserResponse>("/v1/auth/me");
  return res.data;
}
