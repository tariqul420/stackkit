"use client";

import { Button } from "@/components/ui/button";
import * as React from "react";
import { useSocialLoginMutation } from "../queries/auth.mutations";

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" width="20" height="20" {...props}>
      <path
        fill="#4285F4"
        d="M533.5 278.4c0-18.5-1.5-36.3-4.4-53.6H272v101.5h147.1c-6.4 34.6-25.3 63.9-54 83.5v69.4h87.2c51-47 80.2-116.3 80.2-200.8z"
      />
      <path
        fill="#34A853"
        d="M272 544.3c73.6 0 135.4-24.4 180.6-66.2l-87.2-69.4c-24.2 16.3-55.3 25.9-93.4 25.9-71.7 0-132.6-48.3-154.3-113.3H28.8v71.1C73.8 492.9 166.8 544.3 272 544.3z"
      />
      <path
        fill="#FBBC05"
        d="M117.7 324.3c-10.8-32.3-10.8-67 0-99.3V153.9H28.8c-36.7 73.6-36.7 160.6 0 234.2l88.9-63.8z"
      />
      <path
        fill="#EA4335"
        d="M272 109.1c39.9 0 75.8 13.7 104.1 40.6l78-78C402.1 28 339.7 0 272 0 166.8 0 73.8 51.4 28.8 125.1l88.9 71.1C139.4 157.4 200.3 109.1 272 109.1z"
      />
    </svg>
  );
}

export default function SocialLoginButtons() {
  const { mutate: socialLogin, isPending } = useSocialLoginMutation();

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={() => socialLogin("google")}
      disabled={isPending}
      className="w-full bg-background text-accent-foreground"
    >
      <span className="flex items-center justify-center w-6 h-6">
        <GoogleIcon />
      </span>
      {isPending ? "Redirecting..." : "Continue with Google"}
    </Button>
  );
}
