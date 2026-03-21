"use client";

import { getMeRequest } from "@/features/auth/services/auth.service";
import { useQuery } from "@tanstack/react-query";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
  logout: ["auth", "logout"] as const,
};

export const useMeQuery = () => {
  return useQuery({
    queryKey: AUTH_QUERY_KEYS.me,
    queryFn: getMeRequest,
    retry: false,
  });
};
