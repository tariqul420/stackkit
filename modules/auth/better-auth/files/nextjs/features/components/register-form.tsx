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
import { useRegisterMutation } from "@/features/auth/queries/auth.mutations";
import { registerZodSchema } from "@/features/auth/validators/register.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

type RegisterFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};

export default function RegisterForm() {
  const router = useRouter();
  const mutation = useRegisterMutation();

  const form = useForm<RegisterFormValues>({
    mode: "onTouched",
    resolver: zodResolver(registerZodSchema),
    defaultValues: { name: "", email: "", password: "", confirmPassword: "" },
  });

  async function onSubmit(values: RegisterFormValues) {
    if (values.password !== values.confirmPassword) {
      form.setError("confirmPassword", { message: "Passwords do not match" });
      return;
    }

    try {
      await mutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.push("/login");
    } catch {
      toast.error(
        "Registration failed. Please check your details and try again.",
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
              <InputField
                name="name"
                label="Name"
                placeholder="Your full name"
              />
              <InputField
                name="email"
                label="Email"
                placeholder="you@example.com"
                type="email"
              />
              <InputField name="password" label="Password" type="password" />
              <InputField
                name="confirmPassword"
                label="Confirm password"
                type="password"
              />

              <div className="flex items-center justify-between mt-2">
                <div className="text-sm">
                  <Link
                    href="/login"
                    className="text-muted-foreground underline"
                  >
                    Already have an account? Sign in
                  </Link>
                </div>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting
                    ? "Creating..."
                    : "Create account"}
                </Button>
              </div>
            </FormProvider>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
