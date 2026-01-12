import { betterAuth } from "better-auth";

{{databaseAdapter}}
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    // Uncomment to add OAuth providers
    // google: {
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // },
    // github: {
    //   clientId: process.env.GITHUB_CLIENT_ID!,
    //   clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    // },
  },
});