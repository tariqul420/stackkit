import { betterAuth } from "better-auth";
import { sendEmail } from "./email/email-service";
import { getVerificationEmailTemplate, getPasswordResetEmailTemplate } from "./email/email-templates";
{{#switch database}}
{{#case prisma}}
import { prisma } from "./prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/case}}
{{#case mongoose}}
import { mongoose } from "./mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/case}}
{{/switch}}

export async function initAuth() {
{{#if database == 'mongoose'}}
const mongooseInstance = await mongoose();
const client = mongooseInstance.connection.getClient();
const db = client.db();
{{/if}}

return betterAuth({
{{#switch database}}
{{#case prisma}}
  database: prismaAdapter(prisma, {
    provider: "{{prismaProvider}}",
  }),
{{/case}}
{{#case mongoose}}
  database: mongodbAdapter(db, { client }),
{{/case}}
{{/switch}}
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  trustedOrigins: [process.env.APP_URL!],
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
      maxAge: 60 * 60 * 24 * 7,
    },
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
    cookieName: "better-auth.session_token",
  }
 })
};

export const auth = await initAuth();