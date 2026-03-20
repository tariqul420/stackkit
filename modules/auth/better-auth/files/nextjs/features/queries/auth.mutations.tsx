"use client";

import {
  forgetPasswordRequest,
  loginRequest,
  registerRequest,
  resetPasswordRequest,
  verifyEmailRequest,
} from "@/features/auth/services/auth.service";
import {
  IForgotPayload,
  ILoginPayload,
  ILoginResponse,
  IRegisterPayload,
  IResetPayload,
  IVerifyPayload,
} from "@/features/auth/types";
import { useMutation } from "@tanstack/react-query";

export const useRegisterMutation = () => {
  return useMutation<any, unknown, IRegisterPayload>({
    mutationFn: registerRequest,
  });
};

export const useLoginMutation = () => {
  return useMutation<ILoginResponse, unknown, ILoginPayload>({
    mutationFn: loginRequest,
  });
};

export const useForgotPasswordMutation = () => {
  return useMutation<any, unknown, IForgotPayload>({
    mutationFn: forgetPasswordRequest,
  });
};

export const useResetPasswordMutation = () => {
  return useMutation<any, unknown, IResetPayload>({
    mutationFn: resetPasswordRequest,
  });
};

export const useVerifyEmailMutation = () => {
  return useMutation<any, unknown, IVerifyPayload>({
    mutationFn: verifyEmailRequest,
  });
};
