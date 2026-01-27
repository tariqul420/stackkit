/* eslint-disable @typescript-eslint/no-explicit-any */
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import EmailProvider from "next-auth/providers/email";
import Google from "next-auth/providers/google";
import {
  getUserById,
  getUserByProviderAccountId,
  getUserByUsername,
} from "./actions/auth";
import { sendEmail } from "./email/email-service";
import { getVerificationEmailTemplate } from "./email/email-templates";
import { prisma } from "./prisma";

const options: any = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      profile(profile: any) {
        const p = profile as Record<string, any>;
        return {
          id: p.sub ?? p.id,
          name: p.name,
          email: p.email,
          image: p.picture,
          role: p.role ?? "USER",
        };
      },
    }),
    (Credentials({
      id: "credentials",
      name: "Credentials",
      credentials: {
        username: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: any) {
        if (!credentials?.username || !credentials?.password) return null;
        const user = await getUserByUsername(credentials.username as string);
        if (!user) return null;
        const hashed = (user as any).password;
        if (!hashed) return null; // OAuth-only account
        const ok = await bcrypt.compare(credentials.password as string, hashed);
        if (!ok) return null;
        // strip sensitive fields
        const safe = { ...user } as Record<string, any>;
        delete safe.password;
        return safe;
      },
    }),
    EmailProvider({
      server: process.env.EMAIL_SERVER,
      from: process.env.EMAIL_FROM,
      async sendVerificationRequest({ identifier, url, provider }: any) {
        const { html, text } = getVerificationEmailTemplate(
          { email: identifier },
          url,
        );
        await sendEmail({
          to: identifier,
          subject: "Verify your email",
          html,
          text,
          from: provider?.from,
        });
      },
    })),
  ],
  callbacks: {
    // ensure provider-account linking is safe
    async signIn({ user, account }: any) {
      if (account && account.provider !== "credentials") {
        const linked = await getUserByProviderAccountId(
          account.providerAccountId as string,
        );
        if (linked && linked.id !== user.id)
          return "/sign-in/?error=OAuthAccountNotLinked";
      }
      return true;
    },
    // keep session payload minimal
    async jwt({ token, user }: any) {
      if (user) {
        token.user = {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role ?? "USER",
        };
        token.role = token.user.role;
      }
      if (token.sub && !token.user) {
        const dbUser = await getUserById(token.sub as string);
        if (dbUser)
          token.user = {
            id: dbUser.id,
            email: dbUser.email,
            name: dbUser.name,
            role: (dbUser as any).role ?? "USER",
          };
      }
      return token;
    },
    async session({ session, token }: any) {
      session.user = token.user;
      session.role = token.role ?? "USER";
      return session;
    },
  },
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  debug: process.env.NODE_ENV !== "production",
};

export const { handlers, signIn, signOut, auth } = NextAuth(options);
