"use client";

import { IUserResponse } from "@/features/auth/types/auth.type";
import { useQuery } from "@tanstack/react-query";
import { getMeRequest } from "../services/auth.api";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
};

export const useMeQuery = () => {
  return useQuery<IUserResponse>({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: getMeRequest,
    retry: false,
  });
};
