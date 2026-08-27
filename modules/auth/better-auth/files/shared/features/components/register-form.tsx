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
import { authClient } from "@/lib/auth/auth-client";
import { registerZodSchema } from "@/features/auth/validators/register.validator";
import { zodResolver } from "@hookform/resolvers/zod";
{{#if framework == "nextjs"}}
import { useRouter } from "next/navigation";
import Link from "next/link";
{{else}}
import { Link, useNavigate } from "react-router";
{{/if}}
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import SocialLoginButtons from "./social-login-buttons";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
};

export default function RegisterForm() {
{{#if framework == "nextjs"}}
  const router = useRouter();
  const navigate = (path: string) => router.push(path);
{{else}}
  const navigate = useNavigate();
{{/if}}

  const form = useForm<RegisterFormValues>({
    mode: "onTouched",
    resolver: zodResolver(registerZodSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      const { error } = await authClient.signUp.email({
        name: values.name,
        email: values.email,
        password: values.password,
      });

      if (error) {
        toast.error(error.message || "Registration failed. Please check your details and try again.");
        return;
      }

      navigate(`/verify-email?email=${encodeURIComponent(values.email)}`);
      toast.success("Registration successful! Please verify your email.");
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your details to create an account
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormProvider {...form}>
            <InputField name="name" label="Name" placeholder="Your full name" />
            <InputField
              name="email"
              label="Email"
              placeholder="you@example.com"
              type="email"
            />
            <InputField name="password" label="Password" type="password" />

            <CardFooter className="flex flex-col gap-4">
              <div className="flex w-full items-center justify-between">
                {{#if framework == "nextjs"}}
                <Link href="/login" className="text-muted-foreground underline">
                  Already have an account? Sign in
                </Link>
                {{else}}
                <Link to="/login" className="text-muted-foreground underline">
                  Already have an account? Sign in
                </Link>
                {{/if}}

                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Creating..."
                    : "Create account"}
                </Button>
              </div>
              <SocialLoginButtons />
            </CardFooter>
          </FormProvider>
        </form>
      </CardContent>
    </Card>
  );
}
