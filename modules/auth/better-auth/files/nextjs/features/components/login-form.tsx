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
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";

export default function LoginForm({
  searchParams,
}: {
  searchParams?: { redirect?: string };
}) {
  const router = useRouter();
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
      await mutation.mutateAsync({
        email: values.email,
        password: values.password,
      });

      toast.success("Login successful!");
      form.reset();

      await new Promise((resolve) => setTimeout(resolve, 100));

      router.push(values.redirectPath || "/");
    } catch {
      toast.error("Login failed. Please check your credentials and try again.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
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
              </FieldGroup>
            </FormProvider>
          </form>
        </CardContent>
        <CardFooter className="p-4 flex items-center justify-between">
          <div className="text-sm">
            <Link
              href="/forgot-password"
              className="text-muted-foreground underline"
            >
              Forgot password?
            </Link>
          </div>
          <Button
            type="submit"
            form="login-form"
            disabled={form.formState.isSubmitting}
            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded hover:bg-primary/90 disabled:opacity-50"
          >
            {form.formState.isSubmitting ? "Signing in..." : "Sign in"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
