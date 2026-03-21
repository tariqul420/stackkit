"use client";

import InputField from "@/components/global/form-field/input-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { useLoginMutation } from "@/features/auth/queries/auth.mutations";
import {
  ILoginPayload,
  loginZodSchema,
} from "@/features/auth/validators/login.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import SocialLoginButtons from "./social-login-buttons";

export default function LoginForm({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const mutation = useLoginMutation();

  const form = useForm<ILoginPayload & { redirectPath?: string }>({
    mode: "onTouched",
    resolver: zodResolver(loginZodSchema),
    defaultValues: {
      email: "",
      password: "",
      redirectPath: searchParams?.redirect || "",
    },
  });

  async function onSubmit(values: ILoginPayload & { redirectPath?: string }) {
    try {
      const data = await mutation.mutateAsync({
        email: values.email,
        password: values.password,
        redirectPath: values.redirectPath,
      });

      console.log("Login using login form", data);
    } catch {
      // Error handling is done in the mutation's onError callback
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Sign in to your account</CardTitle>
        <CardDescription>
          Enter your email and password to sign in
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <form
          id="login-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-4"
        >
          <FormProvider {...form}>
            <FieldGroup>
              <InputField
                className="grid gap-3"
                name="email"
                label="Email"
                placeholder="m@example.com"
                type="email"
              />
              <InputField
                className="grid gap-3"
                name="password"
                label="Password"
                type="password"
              />

              <div className="flex justify-between">
                <div className="text-sm flex flex-col gap-1">
                  <Link
                    href="/register"
                    className="text-muted-foreground underline"
                  >
                    Don’t have an account? Create one
                  </Link>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-muted-foreground underline flex items-end"
                >
                  Forgot password?
                </Link>
              </div>
            </FieldGroup>

            <CardFooter className="flex flex-col items-center gap-4">
              <Button
                type="submit"
                size="lg"
                form="login-form"
                disabled={form.formState.isSubmitting}
                className="w-full"
              >
                {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
              </Button>
              <SocialLoginButtons />
            </CardFooter>
          </FormProvider>
        </form>
      </CardContent>
    </Card>
  );
}
