import 'dotenv/config'
import { PrismaClient } from './generated/prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

{{#if prismaProvider == "postgresql"}}
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
});
{{/if}}

{{#if prismaProvider == "mongodb"}}
export const prisma = globalForPrisma.prisma ?? new PrismaClient();
{{/if}}

{{#if prismaProvider == "mysql"}}
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
{{/if}}

{{#if prismaProvider == "sqlite"}}
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });
{{/if}}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
