import fs from "fs-extra";
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
    const gen = fs.readJsonSync(genPath, { throws: false }) as unknown;
    const providers = new Set<string>();
    const ops =
      gen && typeof gen === "object" ? (gen as Record<string, unknown>)["operations"] : undefined;
    if (Array.isArray(ops)) {
      for (const op of ops) {
        const cond =
          op && typeof op === "object" ? (op as Record<string, unknown>)["condition"] : undefined;
        if (cond && typeof (cond as Record<string, unknown>)["prismaProvider"] === "string") {
          providers.add(String((cond as Record<string, unknown>)["prismaProvider"]));
        }
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
