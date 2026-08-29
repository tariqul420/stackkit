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
import { authClient } from "@/lib/auth/auth-client";
import { forgotZodSchema } from "@/features/auth/validators/forgot.validator";
import { zodResolver } from "@hookform/resolvers/zod";
{{#if framework == "nextjs"}}
import { useRouter } from "next/navigation";
import Link from "next/link";
{{else}}
import { Link, useNavigate } from "react-router";
{{/if}}
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

type ForgotValues = {
  email: string;
};

export default function ForgotPasswordForm() {
{{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
{{else}}
  const navigate = useNavigate();
{{/if}}

  const form = useForm<ForgotValues>({
    mode: "onTouched",
    resolver: zodResolver(forgotZodSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotValues) {
    try {
      const { error } = await authClient.forgetPassword.emailOtp({
        email: values.email,
      });

      if (error) {
        toast.error(error.message || "Failed to send password reset email. Please check the email and try again.");
        return;
      }

      toast.success("Password reset OTP sent to your email!");
      navigate(`/reset-password?email=${encodeURIComponent(values.email)}`);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
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
                {{#if framework == "nextjs"}}
                <Link href="/login" className="text-muted-foreground underline">
                  Back to sign in
                </Link>
                {{else}}
                <Link to="/login" className="text-muted-foreground underline">
                  Back to sign in
                </Link>
                {{/if}}
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
