import VerifyEmailForm from "@/features/auth/components/verify-email-form";
import { Suspense } from "react";

export default function VerifyEmail() {
  return (
    <Suspense>
      <VerifyEmailForm />
    </Suspense>
  );
}
