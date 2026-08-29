import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import { envVars } from "../env";

export const authClient = createAuthClient({
  baseURL: envVars.BETTER_AUTH_URL || "http://localhost:5000",
  plugins: [
    emailOTPClient(),
    inferAdditionalFields({
      user: {
        role: { type: "string", required: false },
        status: { type: "string", required: false },
        needPasswordChange: { type: "boolean", required: false },
        isDeleted: { type: "boolean", required: false },
        deletedAt: { type: "date", required: false },
      },
    }),
  ],
});

export const { signIn, signUp, signOut, useSession } = authClient;
