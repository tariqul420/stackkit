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
import { useRegisterMutation } from "@/features/auth/queries/auth.mutations";
import { registerZodSchema } from "@/features/auth/validators/register.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { FormProvider, useForm } from "react-hook-form";
import SocialLoginButtons from "./social-login-buttons";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export default function RegisterForm() {
  const mutation = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    mode: "onTouched",
    resolver: zodResolver(registerZodSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    try {
      await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
    } catch {
      // Error handling is done in the mutation's onError callback
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
                <Link
                  href="/login"
                  className="text-sm text-muted-foreground underline"
                >
                  Already have an account? Sign in
                </Link>

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
