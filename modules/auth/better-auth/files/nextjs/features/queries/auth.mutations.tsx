"use client";

import {
  forgetPasswordRequest,
  loginRequest,
  logoutRequest,
  registerRequest,
  resendOTPRequest,
  resetPasswordRequest,
  setTokens,
  socialLogin,
  socialLoginPayload,
  verifyEmailRequest,
} from "@/features/auth/services/auth.service";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ILoginResponse, SocialProvider } from "../types/auth.type";
import { ILoginPayload } from "../validators/login.validator";

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
  logout: ["auth", "logout"] as const,
};

export const useRegisterMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.register,
    mutationFn: registerRequest,
    onSuccess: (data, variables) => {
      router.push(`/verify-email?email=${encodeURIComponent(variables.email)}`);

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
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation<
    ILoginResponse,
    unknown,
    ILoginPayload & { redirectPath?: string }
  >({
    mutationKey: AUTH_MUTATION_KEYS.login,
    mutationFn: loginRequest,
    onSuccess: async (data, variables) => {
      toast.success("Login successful!");

      // Persist tokens in HTTP-only cookies via server action so `me` can read them
      try {
        await setTokens({
          accessToken: data?.accessToken,
          refreshToken: data?.refreshToken,
          token: data?.token,
        });
      } catch (err) {
        console.error("Failed to set tokens in cookies:", err);
      }

      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(variables?.redirectPath || "/");
    },
    onError: (error: unknown, variables) => {
      if (error instanceof Error && error.message === "Email not verified") {
        router.push(
          `/verify-email?email=${encodeURIComponent(variables.email)}`,
        );
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Login failed. Please check your credentials and try again.",
      );
    },
  });
};

export const useForgotPasswordMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.forgotPassword,
    mutationFn: forgetPasswordRequest,
    onSuccess: async () => {
      toast.success("Password reset email sent!");
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to send password reset email. Please check the email and try again.",
      );
    },
  });
};

export const useResetPasswordMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.resetPassword,
    mutationFn: resetPasswordRequest,
    onSuccess: () => {
      toast.success(
        "Password reset successful! Please log in with your new password.",
      );
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Failed to reset password. Please check your details and try again.",
      );
    },
  });
};

export const useVerifyEmailMutation = () => {
  const router = useRouter();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.verifyEmail,
    mutationFn: verifyEmailRequest,
    onSuccess: () => {
      toast.success("Email verified successfully! Please log in.");
      router.push("/login");
    },
    onError: (error) => {
      toast.error(
        error.message ||
          "Email verification failed. Please check your details and try again.",
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
  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.socialLogin,
    mutationFn: async (provider: SocialProvider) => {
      const payload = await socialLoginPayload(provider);

      if (
        !payload?.provider ||
        !payload?.callbackURL ||
        !payload?.signInEndpoint
      ) {
        throw new Error("Invalid social login payload");
      }

      return socialLogin(payload);
    },
    onSuccess: (url) => {
      if (!url) {
        toast.error("Login URL not found. Please try again.");
        return;
      }

      window.location.href = url;
    },
    onError: (error) => {
      toast.error(error.message || "Social login failed. Please try again.");
    },
  });
};

export const useLogoutMutation = () => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: AUTH_MUTATION_KEYS.logout,
    mutationFn: logoutRequest,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      toast.success("Logged out successfully");
      router.push("/login");
      router.refresh();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to log out. Please try again.");
    },
  });
};
