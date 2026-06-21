import 'dotenv/config';
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

{{#switch prismaProvider}}
{{#case "postgresql"}}
import { PrismaPg } from '@prisma/adapter-pg'

const connectionString = `${process.env.DATABASE_URL}`

const adapter = new PrismaPg({ connectionString })
const prisma = new PrismaClient({ adapter })
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
{{/case}}

{{#case "mysql"}}
import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});
const prisma = new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }
{{/case}}
{{#case "sqlite"}}
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
const prisma = new PrismaClient({ adapter });
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma };
{{/case}}
{{/switch}}
