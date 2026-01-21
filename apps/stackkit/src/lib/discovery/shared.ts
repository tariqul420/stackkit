import path from "path";
import { getPackageRoot } from "../utils/package-root";

export function parseDatabaseOption(dbOption: string): { database: string; provider?: string } {
  if (!dbOption) return { database: "none" };
  if (dbOption === "none") return { database: "none" };
  if (dbOption.startsWith("prisma-")) {
    const provider = dbOption.split("-")[1];
    return { database: "prisma", provider };
  }
  if (dbOption === "prisma") return { database: "prisma" };
  if (dbOption === "mongoose") return { database: "mongoose" };
  return { database: dbOption };
}

export function getPrismaProvidersFromGenerator(modulesDir?: string): string[] {
  const pkgRoot = modulesDir || getPackageRoot();
  const genPath = path.join(pkgRoot, "modules", "database", "prisma", "generator.json");
  try {
    const gen = require(genPath);
    const providers = new Set<string>();
    if (Array.isArray(gen.operations)) {
      for (const op of gen.operations) {
        if (op.condition && op.condition.prismaProvider)
          providers.add(String(op.condition.prismaProvider));
      }
    }
    return Array.from(providers);
  } catch {
    return [];
  }
}

export function isPrismaOption(value: string): boolean {
  if (!value) return false;
  if (value === "prisma") return true;
  return value.startsWith("prisma-");
}
