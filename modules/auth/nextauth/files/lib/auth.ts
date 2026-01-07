import { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';

/**
 * NextAuth.js Configuration
 *
 * Configure authentication providers and options here.
 * See: https://next-auth.js.org/configuration/options
 */
export const authOptions: AuthOptions = {
  providers: [
    // GitHub OAuth Provider
    // Uncomment and add GITHUB_ID and GITHUB_SECRET to .env
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID!,
    //   clientSecret: process.env.GITHUB_SECRET!,
    // }),

    // Google OAuth Provider
    // Uncomment and add GOOGLE_ID and GOOGLE_SECRET to .env
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_ID!,
    //   clientSecret: process.env.GOOGLE_SECRET!,
    // }),

    // Credentials Provider (email/password)
    // Replace with your own authentication logic
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'user@example.com' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Add your own authentication logic here
        // This is just a demo - DO NOT use in production
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

  // Database adapter (optional)
  // Uncomment to persist sessions in database
  // adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
  },

  pages: {
    signIn: '/auth/signin',
    // signOut: '/auth/signout',
    // error: '/auth/error',
    // verifyRequest: '/auth/verify-request',
    // newUser: '/auth/new-user'
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  // Enable debug messages in development
  debug: process.env.NODE_ENV === 'development',
};
