import { Role, UserStatus } from "@prisma/client";
import { betterAuth } from "better-auth";
import { bearer, emailOTP } from "better-auth/plugins";
{{#if combo == "prisma:express"}}
import { sendEmail } from "../shared/utils/email";
import { prisma } from "../database/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}

{{#if combo == "prisma:nextjs"}}
import { sendEmail } from "../service/email/email-service";
import { prisma } from "../database/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}

{{#if combo == "mongoose:express"}}
import { sendEmail } from "../../shared/email/email-service";
import { mongoose } from "../../database/mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

{{#if combo == "mongoose:nextjs"}}
import { sendEmail } from "../service/email/email-service";
import { mongoose } from "../database/mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

{{#if database == "mongoose"}}
export async function initAuth() {
const mongooseInstance = await mongoose();
const client = mongooseInstance.connection.getClient();
const db = client.db();
{{/if}}

{{#if database == "mongoose"}}return{{else}}export const auth = {{/if}} betterAuth({
{{#if database == "prisma"}}
  database: prismaAdapter(prisma, {
    provider: "{{prismaProvider}}",
  }),
{{/if}}
{{#if database == "mongoose"}}
  database: mongodbAdapter(db, { client }),
{{/if}}
  baseURL: envVars.BETTER_AUTH_URL,
  secret: envVars.BETTER_AUTH_SECRET,
  trustedOrigins: [
    envVars.FRONTEND_URL || envVars.BETTER_AUTH_URL || "http://localhost:3000",
  ],
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  socialProviders: {
    google: {
      clientId: envVars.GOOGLE_CLIENT_ID as string,
      clientSecret: envVars.GOOGLE_CLIENT_SECRET as string,
      accessType: "offline",
      prompt: "select_account consent",
      mapProfileToUser: () => {
        return {
          role: Role.USER,
          status: UserStatus.ACTIVE,
          needPasswordChange: false,
          emailVerified: true,
          isDeleted: false,
          deletedAt: null,
        };
      },
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    sendOnSignIn: true,
    autoSignInAfterVerification: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: Role.USER,
      },
      status: {
        type: "string",
        required: true,
        defaultValue: UserStatus.ACTIVE,
      },
      needPasswordChange: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      isDeleted: {
        type: "boolean",
        required: true,
        defaultValue: false,
      },
      deletedAt: {
        type: "date",
        required: false,
        defaultValue: null,
      },
    },
  },
  plugins: [
    bearer(),
    emailOTP({
      overrideDefaultEmailVerification: true,
      async sendVerificationOTP({ email, otp, type }) {
        if (type === "email-verification") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (!user) {
            console.error(
              `User with email ${email} not found. Cannot send verification OTP.`,
            );
            return;
          }

          if (user && user.role === Role.SUPER_ADMIN) {
            console.log(
              `User with email ${email} is a super admin. Skipping sending verification OTP.`,
            );
            return;
          }

          if (user && !user.emailVerified) {
            sendEmail({
              to: email,
              subject: "Verify your email",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        } else if (type === "forget-password") {
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });

          if (user) {
            sendEmail({
              to: email,
              subject: "Password Reset OTP",
              templateName: "otp",
              templateData: {
                name: user.name,
                otp,
              },
            });
          }
        }
      },
      expiresIn: 2 * 60, // 2 minutes in seconds
      otpLength: 6,
    }),
  ],
  session: {
    expiresIn: 60 * 60 * 60 * 24, // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24, // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24, // 1 day in seconds
    },
  },
  redirectURLs: {
    signIn: `${envVars.BETTER_AUTH_URL}/api/v1/auth/google/success`,
  },
  advanced: {
    // disableCSRFCheck: true,
    useSecureCookies: false,
    cookies: {
      state: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
      sessionToken: {
        attributes: {
          sameSite: "none",
          secure: true,
          httpOnly: true,
          path: "/",
        },
      },
    },
  },
 })
{{#if database == "mongoose"}}
};

export let auth: ReturnType<typeof betterAuth> | undefined = undefined;

export async function setupAuth() {
  auth = await initAuth();
  return auth;
}
{{/if}}