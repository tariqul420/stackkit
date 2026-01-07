import { Auth } from '@auth/core';
import GitHub from '@auth/core/providers/github';
import Google from '@auth/core/providers/google';
import Credentials from '@auth/core/providers/credentials';

export const authConfig = {
  secret: process.env.AUTH_SECRET,
  trustHost: true,
  providers: [
    // GitHub OAuth Provider
    // Uncomment and add GITHUB_ID and GITHUB_SECRET to .env
    // GitHub({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),

    // Google OAuth Provider
    // Uncomment and add GOOGLE_ID and GOOGLE_SECRET to .env
    // Google({
    //   clientId: process.env.GOOGLE_ID!,
    //   clientSecret: process.env.GOOGLE_SECRET!,
    // }),

    // Credentials Provider (email/password)
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        // Add your own authentication logic here
        if (credentials?.email === 'demo@example.com' && credentials?.password === 'demo') {
          return {
            id: '1',
            name: 'Demo User',
            email: 'demo@example.com',
          };
        }
        return null;
      },
    }),
  ],
};
