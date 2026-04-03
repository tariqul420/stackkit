{{#if framework == "nextjs"}}
"use client";

import { setTokens } from "@/features/auth/services/auth.service";
{{/if}}
import {
  forgetPasswordRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  resendOTPRequest,
  resetPasswordRequest,
  verifyEmailRequest,
} from "@/features/auth/services/auth.api";
import { envVars } from "@/lib/env";
import { useMutation, useQueryClient } from "@tanstack/react-query";
{{#if framework == "nextjs"}}
import { useRouter } from "next/navigation";
{{else}}
import { useNavigate } from "react-router";
{{/if}}
import { toast } from "sonner";
import type { ILoginResponse, SocialProvider } from "../types/auth.type";
import type { ILoginPayload } from "../validators/login.validator";
import { ChangePassword, updateProfile } from "../services/auth.api";

export const AUTH_QUERY_KEYS = {
  me: ["auth", "me"] as const,
};

export const AUTH_MUTATION_KEYS = {
  register: ["auth", "register"] as const,
  login: ["auth", "login"] as const,
  forgotPassword: ["auth", "forgot-password"] as const,
  resetPassword: ["auth", "reset-password"] as const,
  verifyEmail: ["auth", "verify-email"] as const,
  resendOTP: ["auth", "resend-otp"] as const,
  socialLogin: ["auth", "social-login"] as const,
  changePassword: ["auth", "change-password"] as const,
  updateProfile: ["auth", "update-profile"] as const,
  logout: ["auth", "logout"] as const,
};

export const useRegisterMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.register,
    mutationFn: registerRequest,
    onSuccess: (_data, variables) => {
      navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`);
      toast.success("Registration successful! Please verify your email.");
    },
    onError: (error: unknown) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Registration failed. Please check your details and try again.",
      );
    },
  });
};

export const useLoginMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}
  const queryClient = useQueryClient();

  return useMutation<ILoginResponse, unknown, ILoginPayload & { redirectPath?: string }>(
    {
      mutationKey: AUTH_MUTATION_KEYS.login,
      mutationFn: loginRequest,
      onSuccess: async (data, variables) => {
        toast.success("Login successful!");

        {{#if framework == "nextjs"}}
        try {
          await setTokens({
            accessToken: data?.accessToken,
            refreshToken: data?.refreshToken,
            token: data?.token,
          });
        } catch (err) {
          console.error("Failed to set tokens in cookies:", err);
        }
        {{/if}}

        await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
        await new Promise((resolve) => setTimeout(resolve, 100));

        const defaultRoute = data?.user?.role === "ADMIN" ? "/dashboard/admin" : "/dashboard";
        navigate(variables?.redirectPath || defaultRoute);
      },
      onError: (error: unknown, variables) => {
        if (error instanceof Error && error.message === "Email not verified") {
          navigate(`/verify-email?email=${encodeURIComponent(variables.email)}`);
          return;
        }
        toast.error(
          error instanceof Error
            ? error.message
            : "Login failed. Please check your credentials and try again.",
        );
      },
    },
  );
};

export const useForgotPasswordMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.forgotPassword,
    mutationFn: forgetPasswordRequest,
    onSuccess: async () => {
      toast.success("Password reset OTP sent to your email!");
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      navigate("/reset-password");
    },
    onError: (error: Error) => {
      toast.error(
        error.message ||
          "Failed to send password reset email. Please check the email and try again.",
      );
    },
  });
};

export const useResetPasswordMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.resetPassword,
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      toast.success("Password reset successful! Please log in with your new password.");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Failed to reset password. Please check your details and try again.",
      );
    },
  });
};

export const useVerifyEmailMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.verifyEmail,
    mutationFn: verifyEmailRequest,
    onSuccess: () => {
      toast.success("Email verified successfully! Please log in.");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(
        error.message || "Email verification failed. Please check your details and try again.",
      );
    },
  });
};

export const useResendOTPMutation = () => {
  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.resendOTP,
    mutationFn: resendOTPRequest,
    onSuccess: () => {
      toast.success("Verification OTP resent successfully!");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to resend verification OTP. Please check the email and try again.",
      );
    },
  });
};

export const useSocialLoginMutation = () => {
  return useMutation<string, Error, SocialProvider>({
    mutationKey: AUTH_MUTATION_KEYS.socialLogin,
    mutationFn: async (provider) => {
      const payloadRes = await fetch(
        `${envVars.API_URL}/v1/auth/login/${provider}?redirect=/dashboard`,
      );
      if (!payloadRes.ok) throw new Error("Failed to initiate social login.");
      const { data: payload } = await payloadRes.json();

      const authRes = await fetch(
        `${envVars.BETTER_AUTH_URL}${payload.signInEndpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            provider: payload.provider,
            callbackURL: payload.callbackURL,
          }),
        },
      );
      if (!authRes.ok) throw new Error("Social login request failed.");

      const json = await authRes.json();
      const redirectUrl: string | undefined = json?.url || json?.redirectUrl;

      if (!redirectUrl)
        throw new Error("No redirect URL returned from social login.");

      return redirectUrl;
    },
    onSuccess: (redirectUrl) => {
      window.location.href = redirectUrl;
    },
    onError: (error) => {
      toast.error(error.message || "Social login failed. Please try again.");
    },
  });
};

export const useChangePasswordMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.changePassword,
    mutationFn: ChangePassword,
    onSuccess: () => {
      toast.success(
        "Password changed successfully! Please log in with your new password.",
      );
      navigate("/login");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to change password. Please check your details and try again.",
      );
    },
  });
};

export const useUpdateProfileMutation = () => {
  const queryClient = useQueryClient();

  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}

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

export const useLogoutMutation = () => {
  {{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  {{else}}
  const navigate = useNavigate();
  {{/if}}
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.logout,
    mutationFn: logoutRequest,
    onSuccess: async () => {
      queryClient.clear();
      toast.success("Logged out successfully");
      navigate("/login");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to log out. Please try again.");
    },
  });
};
