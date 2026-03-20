"use client";

import InputField from "@/components/global/form-field/input-field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useResetPasswordMutation } from "@/features/auth/queries/auth.mutations";
import { resetZodSchema } from "@/features/auth/validators/reset.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

type ResetValues = {
  email: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string;
};

export default function ResetPasswordForm() {
  const router = useRouter();
  const params = useSearchParams();
  const prefillEmail = params?.get("email") || "";

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
      router.push("/login");
    } catch {
      toast.error(
        "Failed to reset password. Please check your details and try again.",
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Reset password</h1>

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
                <div />
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
    </div>
  );
}
