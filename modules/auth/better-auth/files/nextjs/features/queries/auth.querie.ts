"use client";

import {
  getMeRequest,
  logoutRequest,
} from "@/features/auth/services/auth.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_QUERY_KEYS.logout,
    mutationFn: logoutRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    },
    onError: () => {
      toast.error("Failed to log out. Please try again.");
    },
  });
};
