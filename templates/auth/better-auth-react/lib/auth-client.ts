import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  /** The base URL of the server (optional if you're using the same domain) */
  baseURL: import.meta.env.VITE_AUTH_URL || 'http://localhost:3000',
});

// Export specific methods for convenience
export const { signIn, signUp, signOut, useSession } = authClient;
