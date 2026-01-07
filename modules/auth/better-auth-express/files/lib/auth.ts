import { betterAuth } from 'better-auth';

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET!,
  baseURL: process.env.BETTER_AUTH_URL!,

  emailAndPassword: {
    enabled: true,
  },

  // Uncomment to add database adapter
  // database: {
  //   provider: "pg", // or "mongodb", "mysql"
  //   url: process.env.DATABASE_URL!,
  // },
});
