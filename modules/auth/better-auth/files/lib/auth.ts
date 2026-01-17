import { betterAuth } from "better-auth";
import { sendEmail } from "./email/email-service";
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "./email/email-templates";
{{#if database == 'prisma'}}
import { prisma } from "{{framework == 'nextjs' ? '@/lib' : '.'}}/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}
{{#if database == 'mongoose'}}
import { mongoClient, db } from "{{framework == 'nextjs' ? '@/lib' : '.'}}/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

export const auth = betterAuth({
{{#if database == 'prisma'}}
  database: prismaAdapter(prisma, {
      provider: "{{prismaProvider}}",
  }),
{{/if}}
{{#if database == 'mongoose'}}
  database: mongodbAdapter(db),
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
  password: {
    reset: {
      sendResetEmail: async ({ user, url }) => {
        const { html, text } = getPasswordResetEmailTemplate(user, url);
        await sendEmail({
          to: user.email,
          subject: "Reset Your Password",
          text,
          html,
        });
      },
    },
  },
  rateLimit: {
    window: 10, // 10 seconds
    max: 100, // max requests per window
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
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24, // 1 day
  }
});