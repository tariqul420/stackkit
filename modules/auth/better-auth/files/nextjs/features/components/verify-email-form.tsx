"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useVerifyEmailMutation } from "@/features/auth/queries/auth.mutations";
import { verifyZodSchema } from "@/features/auth/validators/verify.validator";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

type VerifyValues = {
  email: string;
  otp: string;
};

export default function VerifyEmailForm() {
  const router = useRouter();
  const mutation = useVerifyEmailMutation();

  const form = useForm<VerifyValues>({
    mode: "onTouched",
    resolver: zodResolver(verifyZodSchema),
    defaultValues: { email: "", otp: "" },
  });

  async function onSubmit(values: VerifyValues) {
    try {
      await mutation.mutateAsync(values);
      router.push("/login");
    } catch {
      toast.error(
        "Verification failed. Please check your details and try again.",
      );
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardContent className="p-8">
          <h1 className="text-2xl font-semibold mb-4">Verify email</h1>

          <Form
            form={form}
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField name="email">
              {({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="email">Email</FormLabel>
                  <FormControl>
                    <Input id="email" type="email" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            </FormField>

            <FormField name="otp">
              {({ field, fieldState }) => (
                <FormItem>
                  <FormLabel htmlFor="otp">OTP</FormLabel>
                  <FormControl>
                    <Input id="otp" {...field} />
                  </FormControl>
                  <FormMessage>{fieldState?.error?.message}</FormMessage>
                </FormItem>
              )}
            </FormField>

            <div className="flex items-center justify-between mt-2">
              <div />
              <Button type="submit" disabled={mutation.isLoading}>
                {mutation.isLoading ? "Verifying..." : "Verify email"}
              </Button>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
