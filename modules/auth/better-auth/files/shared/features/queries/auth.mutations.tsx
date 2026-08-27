{{#if framework == "nextjs"}}
"use client";
{{/if}}
import { updateProfile } from "@/features/auth/services/auth.api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AUTH_QUERY_KEYS } from "../queries/auth.queries";

export const AUTH_MUTATION_KEYS = {
  updateProfile: ["auth", "update-profile"] as const,
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.updateProfile,
    mutationFn: updateProfile,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      toast.success("Profile updated successfully");
    },
    onError: (error) => {
      toast.error(
        error.message || "Failed to update profile. Please check your details and try again.",
      );
    },
  });
};
