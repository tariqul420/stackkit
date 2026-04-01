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
import {
  useResendOTPMutation,
  useVerifyEmailMutation,
} from "@/features/auth/queries/auth.mutations";
import { verifyZodSchema } from "@/features/auth/validators/verify.validator";
import { zodResolver } from "@hookform/resolvers/zod";
{{#if framework == "nextjs"}}
import { useSearchParams } from "next/navigation";
{{else}}
import { useSearchParams } from "react-router";
{{/if}}
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

type VerifyValues = {
  email: string;
  otp: string;
};

export default function VerifyEmailForm() {
  const mutation = useVerifyEmailMutation();
  const resendMutation = useResendOTPMutation();

  {{#if framework == "nextjs"}}
  const params = useSearchParams();
  const prefillEmail = params?.get("email") || "";
  {{else}}
  const [searchParams] = useSearchParams();
  const prefillEmail = searchParams.get("email") || "";
  {{/if}}

  const form = useForm<VerifyValues>({
    mode: "onTouched",
    resolver: zodResolver(verifyZodSchema),
    defaultValues: { email: prefillEmail, otp: "" },
  });

  async function onSubmit(values: VerifyValues) {
    try {
      await mutation.mutateAsync(values);
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  const resend = async () => {
    const email = form.getValues("email") || prefillEmail;

    if (!email) {
      toast.error("Email not available to resend OTP");
      return;
    }

    try {
      await resendMutation.mutateAsync({ email });
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Verify your email</CardTitle>
        <CardDescription>
          Enter the OTP sent to your email to verify your account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormProvider {...form}>
            {!prefillEmail ? (
              <InputField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
              />
            ) : null}
            <InputField name="otp" label="OTP" placeholder="Enter OTP" />

            <div className="flex items-center justify-between mt-2 gap-2">
              <div className="flex gap-2">
                <Button type="button" variant="ghost" onClick={resend}>
                  Resend code
                </Button>
              </div>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? "Verifying..." : "Verify email"}
              </Button>
            </div>
          </FormProvider>
        </form>
      </CardContent>
    </Card>
  );
}
