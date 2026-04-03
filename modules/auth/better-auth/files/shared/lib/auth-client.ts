import { createAuthClient } from "better-auth/react";
import { envVars } from "../env";

export const authClient = createAuthClient({
  baseURL: envVars.BETTER_AUTH_URL || "http://localhost:5000",
});

export const { signIn, signUp, signOut, useSession } = authClient;