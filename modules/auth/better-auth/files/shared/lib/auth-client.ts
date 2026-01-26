import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.BETTER_AUTH_URL || "http://localhost:4000",
});

export const { signIn, signUp, signOut, useSession } = authClient;