import "dotenv/config";
import { PrismaClient } from "@/generated/prisma/client";

{{prismaClientInit}}

export { prisma };
