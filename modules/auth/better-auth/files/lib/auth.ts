import { betterAuth } from "better-auth";
{{dbImport}}

export const auth = betterAuth({
{{databaseAdapter}}
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
});