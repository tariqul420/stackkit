"use client";

import InputField from "@/components/global/form-field/input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useForgotPasswordMutation } from "@/features/auth/queries/auth.mutations";
import { forgotZodSchema } from "@/features/auth/validators/forgot.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";

type ForgotValues = {
  email: string;
};

export default function ForgotPasswordForm() {
  const mutation = useForgotPasswordMutation();

  const form = useForm<ForgotValues>({
    mode: "onTouched",
    resolver: zodResolver(forgotZodSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Forgot password</CardTitle>
        <CardDescription>
          Enter your email to receive a password reset OTP
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormProvider {...form}>
            <InputField
              name="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
            />

            <div className="flex items-center justify-between mt-2">
              <div className="text-sm flex flex-col gap-1">
                <Link href="/login" className="text-muted-foreground underline">
                  Back to sign in
                </Link>
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Sending..." : "Send reset OTP"}
              </Button>
            </div>
          </FormProvider>
        </form>
      </CardContent>
    </Card>
  );
}
