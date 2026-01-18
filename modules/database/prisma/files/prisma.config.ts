import "dotenv/config";
import { defineConfig, {{#if prismaProvider == "mongodb"}env{{/if}}} } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  {{#if prismaProvider == "mongodb"}}engine: "classic",{{/if}}
  {{#if prismaProvider != "mongodb"}}
  datasource: {
    url: env('DATABASE_URL'),
  },
  {{/if}}
  datasource: {
    url: process.env["DATABASE_URL"],
  },
});
