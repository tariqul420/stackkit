import { betterAuth } from "better-auth";
import { sendEmail } from "./email/email-service";
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "./email/email-templates";
{{#if database == 'prisma'}}
import { prisma } from "{{framework == 'nextjs' ? '@/lib' : '.'}}/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}
{{#if database == 'mongoose'}}
import { mongoose } from "{{framework == 'nextjs' ? '@/lib' : '.'}}/mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

export async function initAuth() {
return betterAuth({
{{#if database == 'prisma'}}
  database: prismaAdapter(prisma, {
    provider: "{{prismaProvider}}",
  }),
{{/if}}
{{#if database == 'mongoose'}}
  const mongooseInstance = await mongoose();
  const client = mongooseInstance.connection.getClient();
  const db = client.db();
  database: mongodbAdapter(db, { client }),
{{/if}}
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: true,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    sendResetPassword: async ({ user, url }) => {
    const { html, text } = getPasswordResetEmailTemplate(user, url);
      await sendEmail({
        to: user.email,
        subject: "Reset Your Password",
        text,
        html,
      });
    },
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url }) => {
      const { html, text } = getVerificationEmailTemplate(user, url);
      await sendEmail({
        to: user.email,
        subject: "Verify Your Email Address",
        text,
        html,
      });
    },
    sendOnSignIn: true,
  },
  rateLimit: {
    window: 10,
    max: 100,
  },
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  session: {
    cookieCache: {
      enabled: true,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  }
 })
};

export const auth = await initAuth();