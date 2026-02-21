import { betterAuth } from "better-auth";
import { bearer, emailOTP } from "better-auth/plugins";
{{#if combo == "prisma:express"}}
import { Role, UserStatus } from "@prisma/client";
import { envVars } from "../config/env";
import { sendEmail } from "../shared/utils/email";
import { prisma } from "../database/prisma";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}
{{#if combo == "prisma:nextjs"}}
import { Role, UserStatus } from "@prisma/client";
import { sendEmail } from "../service/email/email-service";
import { prisma } from "../database/prisma";
import { envVars } from "@/lib/env";
import { prismaAdapter } from "better-auth/adapters/prisma";
{{/if}}
{{#if combo == "mongoose:express"}}
import { envVars } from "../config/env";
import { Role, UserStatus } from "../modules/auth/auth.constants";
import { sendEmail } from "../shared/utils/email";
import { getMongoClient, getMongoDb, mongoose } from "../database/mongoose";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}
{{#if combo == "mongoose:nextjs"}}
import { sendEmail } from "../service/email/email-service";
import { getMongoClient, getMongoDb, mongoose } from "../database/mongoose";
import { Role, UserStatus } from "@/lib/auth/auth-constants";
import { envVars } from "@/lib/env";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
{{/if}}

{{#if database == "mongoose"}}
await mongoose();
const client = getMongoClient();
const db = getMongoDb();
const usersCollection = db.collection("user");
{{/if}}

export const auth = betterAuth({
{{#if database == "prisma"}}
  database: prismaAdapter(prisma, {
    provider: "{{prismaProvider}}",
  }),
{{/if}}
{{#if database == "mongoose"}}
  database: mongodbAdapter(db, { client, transaction: false }),
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
          {{#if database == "prisma"}}
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
          {{/if}}
          {{#if database == "mongoose"}}
          const user = await usersCollection.findOne({ email });
          {{/if}}

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
          {{#if database == "prisma"}}
          const user = await prisma.user.findUnique({
            where: {
              email,
            },
          });
          {{/if}}
          {{#if database == "mongoose"}}
          const user = await usersCollection.findOne({ email });
          {{/if}}

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
});