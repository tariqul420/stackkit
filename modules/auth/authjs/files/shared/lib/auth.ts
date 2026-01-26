import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import { decode, encode } from 'next-auth/jwt';
import Credentials from 'next-auth/providers/credentials';
import Google from "next-auth/providers/google";
import { cookies } from 'next/headers';
import { prisma } from "./prisma";

class AuthError extends Error {
  code?: string;
  constructor(message?: string) {
    super(message);
    this.name = "AuthError";
  }
}

class InvalidCredentialsError extends AuthError {
  code = "invalid-credentials";
  constructor() {
    super("Invalid credentials");
  }
}

class OauthError extends AuthError {
  code = "OauthError";
  constructor() {
    super("Please use Social Login to continue");
  }
}

async function getUserByUsername(username: string) {
  return prisma.user.findUnique({ where: { email: username } });
}

async function getUserById(id: string) {
  return prisma.user.findUnique({ where: { id } });
}

async function getUserByProviderAccountId(providerAccountId: string) {
  const account = await prisma.account.findFirst({
    where: { providerAccountId },
    include: { user: true },
  });
  return account?.user ?? null;
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      async profile(profile) {
        return { role: (profile as any).role ?? "USER", ...(profile as any) };
      },
    }),
    Credentials({
      id: 'credentials',
      name: 'credentials',
      credentials: {
        username: { label: 'Username', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.username || !credentials?.password) {
          throw new InvalidCredentialsError();
        }

        const user = await getUserByUsername(credentials.username as string);

        if (!user) {
          throw new InvalidCredentialsError();
        }

        // If no hashed password stored, assume OAuth-only account
        const hashed = (user as any)?.password;
        if (!hashed) {
          throw new OauthError();
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          hashed,
        );

        if (!isValid) {
          throw new InvalidCredentialsError();
        }
        return user as any;
      },
    }),
  ],
  callbacks: {
    async signIn({ user, credentials, account }) {
      const cookieStore = await cookies();
      const sessionToken = cookieStore.get('authjs.session-token');
      if (credentials) {
        if ((credentials as any).TOTP === "TOTP") {
          return true;
        }
      }

      // check if account is already linked or not after user is authenticated
      if (sessionToken?.value) {
        if (account) {
          const linkedUser = await getUserByProviderAccountId(
            account.providerAccountId,
          );
          if (!linkedUser) {
            return true;
          }
          return '/sign-in/?error=OAuthAccountNotLinked';
        }
      }

      // Guard TOTP check — don't require DB fields
      if ((user as any)?.isTotpEnabled) {
        const cookieStore2 = await cookies();
        cookieStore2.set({
          name: 'authjs.two-factor',
          value: user.id!,
          httpOnly: true,
          path: '/',
        });
        return '/sign-in/two-factor';
      }
      return true;
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const paths = ['/profile', '/dashboard'];
      const isProtected = paths.some((path) =>
        nextUrl.pathname.startsWith(path),
      );

      const publicPath = ['/sign-up'];
      const isPublic = publicPath.some((path) =>
        nextUrl.pathname.startsWith(path),
      );
      if (isPublic && isLoggedIn) {
        return Response.redirect(new URL('/profile', nextUrl.origin));
      }

      if (isProtected && !isLoggedIn) {
        const redirectUrl = new URL('/sign-in', nextUrl.origin);
        redirectUrl.searchParams.append('callbackUrl', nextUrl.href);
        return Response.redirect(redirectUrl);
      }
      return true;
    },
    jwt: async ({ token }) => {
      if (!token.sub) return token;
      const user = await getUserById(token.sub!);
      if (user) {
        (token as any).user = user;
        (token as any).role = (user as any).role;
        return token;
      } else {
        return token;
      }
    },
    session: async ({ session, token }) => {
      if (token) {
        (session as any).role = (token as any).role;
        (session as any).user = (token as any).user;
        if ((session as any).user) (session as any).user.id = token.sub!;
        return session;
      }
      return session;
    },
  },
  session: { strategy: "jwt" },
  jwt: { encode, decode },
  secret: process.env.AUTH_SECRET,
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
})