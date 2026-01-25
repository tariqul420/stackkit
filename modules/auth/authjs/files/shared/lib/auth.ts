import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "./prisma";
import Google from "next-auth/providers/google"
import { encode, decode } from 'next-auth/jwt';

export const { handlers, signIn, signOut, auth } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  ],
  session: { strategy: "jwt" },
  secret: process.env.AUTH_SECRET,
  jwt: { encode, decode },
  pages: {
    signIn: '/sign-in',
    error: '/error',
  },
})