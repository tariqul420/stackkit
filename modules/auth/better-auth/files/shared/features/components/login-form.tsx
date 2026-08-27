{{#if framework == "nextjs"}}
"use client";
{{/if}}

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
import { authClient } from "@/lib/auth/auth-client";
import type { ILoginPayload } from "@/features/auth/validators/login.validator";
import { loginZodSchema } from "@/features/auth/validators/login.validator";
import { zodResolver } from "@hookform/resolvers/zod";
{{#if framework == "nextjs"}}
import { useRouter } from "next/navigation";
import Link from "next/link";
{{else}}
import { Link, useNavigate, useSearchParams } from "react-router";
{{/if}}
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { AUTH_QUERY_KEYS } from "../queries/auth.queries";
import SocialLoginButtons from "./social-login-buttons";

{{#if framework == "nextjs"}}
export default function LoginForm({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
  const redirectPath = searchParams?.redirect || "";
{{else}}
export default function LoginForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("redirect") || "";
{{/if}}
  const queryClient = useQueryClient();

  const form = useForm<ILoginPayload>({
    mode: "onTouched",
    resolver: zodResolver(loginZodSchema),
    defaultValues: { email: "", password: "" },
  });

  async function onSubmit(values: ILoginPayload) {
    try {
      const { data, error } = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (error) {
        if (error.message?.toLowerCase().includes("email not verified")) {
          navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
          return;
        }
        toast.error(error.message || "Login failed. Please check your credentials and try again.");
        return;
      }

      toast.success("Login successful!");
      await queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEYS.me });
      const role = data?.user?.role;
      const defaultRoute = role === "ADMIN" ? "/dashboard/admin" : "/dashboard";
      navigate(redirectPath || defaultRoute);
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
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
                  {{#if framework == "nextjs"}}
                  <Link href="/register" className="text-muted-foreground underline">
                    Don&apos;t have an account? Create one
                  </Link>
                  {{else}}
                  <Link to="/register" className="text-muted-foreground underline">
                    Don&apos;t have an account? Create one
                  </Link>
                  {{/if}}
                </div>
                {{#if framework == "nextjs"}}
                <Link href="/forgot-password" className="text-muted-foreground underline flex items-end text-sm">
                  Forgot password?
                </Link>
                {{else}}
                <Link to="/forgot-password" className="text-muted-foreground underline flex items-end text-sm">
                  Forgot password?
                </Link>
                {{/if}}
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
