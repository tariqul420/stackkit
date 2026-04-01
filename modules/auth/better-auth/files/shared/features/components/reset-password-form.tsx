{{#if framework == "nextjs"}}
"use client";
{{/if}}

import InputField from "@/components/global/form-field/input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useResetPasswordMutation } from "@/features/auth/queries/auth.mutations";
import { resetZodSchema } from "@/features/auth/validators/reset.validator";
import { zodResolver } from "@hookform/resolvers/zod";
{{#if framework == "nextjs"}}
import { useSearchParams } from "next/navigation";
{{else}}
import { useSearchParams } from "react-router";
{{/if}}
import { FormProvider, useForm } from "react-hook-form";

type ResetValues = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string;
};

export default function ResetPasswordForm() {
  {{#if framework == "nextjs"}}
  const params = useSearchParams();
  const prefillEmail = params?.get("email") || "";
  {{else}}
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";
  {{/if}}

  const mutation = useResetPasswordMutation();

  const form = useForm<ResetValues>({
    mode: "onTouched",
    resolver: zodResolver(resetZodSchema),
    defaultValues: {
      email: prefillEmail,
      otp: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(values: ResetValues) {
    if (values.newPassword !== values.confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    try {
      await mutation.mutateAsync({
        email: values.email,
        otp: values.otp,
        newPassword: values.newPassword,
      });
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset password</CardTitle>
        <CardDescription>
          Enter your email and new password to reset your password
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormProvider {...form}>
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
            />
            <InputField name="otp" label="OTP" placeholder="Enter OTP" />
            <InputField
              name="newPassword"
              label="New password"
              type="password"
            />
            <InputField
              name="confirmPassword"
              label="Confirm new password"
              type="password"
            />

            <div className="flex items-center justify-between mt-2">
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? "Resetting..."
                  : "Reset password"}
              </Button>
            </div>
          </FormProvider>
        </form>
      </CardContent>
    </Card>
  );
}
