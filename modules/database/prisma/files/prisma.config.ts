import "dotenv/config";
{{#switch prismaProvider}}
{{#case mongodb}}
import { defineConfig, env } from "prisma/config";
{{/case}}
{{#case default}}
import { defineConfig } from "prisma/config";
{{/case}}
{{/switch}}

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  {{#switch prismaProvider}}
  {{#case mongodb}}
  engine: "classic",
  datasource: {
    url: env('DATABASE_URL'),
  },
  {{/case}}
  {{#case default}}
  datasource: {
    url: process.env["DATABASE_URL"],
  },
  {{/case}}
  {{/switch}}
});
