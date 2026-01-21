import fs from "fs-extra";
import path from "path";
import { getPackageRoot } from "../utils/package-root";

export interface ModuleMetadata {
  name: string;
  displayName: string;
  description: string;
  category: string;
  provider?: string;
  supportedFrameworks?: string[];
  frameworkConfigs?: Record<string, unknown>;
  dependencies?: Record<string, unknown>;
  devDependencies?: Record<string, unknown>;
  envVars?: Record<string, unknown>;
  patches?: unknown[];
  postInstall?: string[];
  compatibility?: {
    databases?: string[];
    auth?: string[];
    languages?: string[];
  };
  framework?: string;
  files?: string[];
  scripts?: Record<string, string>;
  jsScripts?: Record<string, string>;
}

export interface DiscoveredModules {
  frameworks: ModuleMetadata[];
  databases: ModuleMetadata[];
  auth: ModuleMetadata[];
}

/**
 * Discover all available modules from the modules directory
 */
export async function discoverModules(modulesDir: string): Promise<DiscoveredModules> {
  const discovered: DiscoveredModules = {
    frameworks: [],
    databases: [],
    auth: [],
  };

  // If modulesDir isn't provided or doesn't exist, try common locations
  const candidates = [] as string[];
  if (modulesDir) candidates.push(modulesDir);
  candidates.push(path.join(getPackageRoot(), "modules")); // package root

  let resolvedModulesDir: string | undefined;
  for (const c of candidates) {
    if (await fs.pathExists(c)) {
      resolvedModulesDir = c;
      break;
    }
  }

  if (!resolvedModulesDir) return discovered;

  modulesDir = resolvedModulesDir;

  // Discover frameworks from templates directory
  const templatesDir = path.join(modulesDir, "..", "templates");
  if (await fs.pathExists(templatesDir)) {
    const frameworkDirs = await fs.readdir(templatesDir);
    for (const frameworkName of frameworkDirs) {
      const templateJsonPath = path.join(templatesDir, frameworkName, "template.json");
      if (await fs.pathExists(templateJsonPath)) {
        try {
          const templateConfig = (await fs.readJson(templateJsonPath)) as ModuleMetadata;
          discovered.frameworks.push({
            ...templateConfig,
            name: frameworkName,
            category: "framework",
          });
        } catch {
          // Silently skip invalid templates
        }
      }
    }
  }

  // Discover database modules
  const databaseDir = path.join(modulesDir, "database");
  if (await fs.pathExists(databaseDir)) {
    const dbModules = await fs.readdir(databaseDir);
    // Sort to ensure consistent order: prisma first, then others
    dbModules.sort((a, b) => {
      if (a === "prisma") return -1;
      if (b === "prisma") return 1;
      return a.localeCompare(b);
    });
    for (const moduleName of dbModules) {
      const modulePath = path.join(databaseDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        try {
          const metadata = (await fs.readJson(moduleJsonPath)) as ModuleMetadata;
          // Ensure name/displayName fallbacks
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.databases.push(metadata);
        } catch {
          // Silently skip invalid modules
        }
      }
    }
  }

  // Discover auth modules
  const authDir = path.join(modulesDir, "auth");
  if (await fs.pathExists(authDir)) {
    const authModules = await fs.readdir(authDir);
    for (const moduleName of authModules) {
      const modulePath = path.join(authDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        try {
          const metadata = (await fs.readJson(moduleJsonPath)) as ModuleMetadata;
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.auth.push(metadata);
        } catch {
          // Silently skip invalid modules
        }
      }
    }
  }

  return discovered;
}

/**
 * Get valid database options for CLI
 */
export function getValidDatabaseOptions(databases: ModuleMetadata[]): string[] {
  const options: string[] = ["none"];

  for (const db of databases) {
    if (db.name === "prisma") {
      // Try to discover provider variants from prisma generator.json operations
      try {
        const genPath = require("path").join(getPackageRoot(), "modules", "database", "prisma", "generator.json");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const gen = require(genPath);
        const providers = new Set<string>();
        if (Array.isArray(gen.operations)) {
          for (const op of gen.operations) {
            if (op.condition && op.condition.prismaProvider) {
              providers.add(String(op.condition.prismaProvider));
            }
          }
        }
        if (providers.size > 0) {
          for (const p of providers) options.push(`prisma-${p}`);
        } else {
          options.push("prisma-postgresql", "prisma-mongodb", "prisma-mysql", "prisma-sqlite");
        }
      } catch {
        options.push("prisma-postgresql", "prisma-mongodb", "prisma-mysql", "prisma-sqlite");
      }
    } else if (db.name === "mongoose") {
      options.push("mongoose");
    } else {
      // For other databases, add the name directly
      options.push(db.name);
    }
  }

  return options;
}

/**
 * Get valid auth options for CLI
 */
export function getValidAuthOptions(authModules: ModuleMetadata[]): string[] {
  const options: string[] = ["none"];

  for (const auth of authModules) {
    options.push(auth.name);
  }

  return options;
}

/**
 * Parse database option into database name and provider
 */
export function parseDatabaseOption(dbOption: string): { database: string; provider?: string } {
  if (dbOption === "none") {
    return { database: "none" };
  }

  if (dbOption.startsWith("prisma-")) {
    const provider = dbOption.split("-")[1];
    return { database: "prisma", provider };
  }

  if (dbOption === "mongoose" || dbOption === "mongoose") {
    return { database: "mongoose" };
  }

  return { database: dbOption };
}

/**
 * Get compatible auth options for given framework and database
 */
export function getCompatibleAuthOptions(
  authModules: ModuleMetadata[],
  framework: string,
  database: string,
): Array<{ name: string; value: string }> {
  const compatible: Array<{ name: string; value: string }> = [];

  for (const auth of authModules) {
    // Check if auth supports the framework
    if (auth.supportedFrameworks && !auth.supportedFrameworks.includes(framework)) {
      continue;
    }

    // Special compatibility rules
    if (auth.name === "authjs" && (database !== "prisma" || framework !== "nextjs")) {
      continue;
    }

    if (auth.name === "better-auth" && database === "none" && framework !== "react") {
      continue;
    }

    compatible.push({
      name: auth.displayName,
      value: auth.name,
    });
  }

  // Add "None" at the end
  compatible.push({ name: "None", value: "none" });

  return compatible;
}

/**
 * Get database choices for inquirer prompts
 */
export function getDatabaseChoices(
  databases: ModuleMetadata[],
  framework: string,
): Array<{ name: string; value: string }> {
  const choices: Array<{ name: string; value: string }> = [];

  for (const db of databases) {
    // Check framework compatibility
    if (db.supportedFrameworks && !db.supportedFrameworks.includes(framework)) {
      continue;
    }

    if (db.name === "prisma") {
      // Dynamically build provider choices from generator.json if available
      try {
        const genPath = require("path").join(getPackageRoot(), "modules", "database", "prisma", "generator.json");
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const gen = require(genPath);
        const providers = new Set<string>();
        if (Array.isArray(gen.operations)) {
          for (const op of gen.operations) {
            if (op.condition && op.condition.prismaProvider) providers.add(String(op.condition.prismaProvider));
          }
        }
        if (providers.size > 0) {
          for (const p of providers) choices.push({ name: `Prisma (${p.charAt(0).toUpperCase() + p.slice(1)})`, value: `prisma-${p}` });
        } else {
          choices.push(
            { name: "Prisma (PostgreSQL)", value: "prisma-postgresql" },
            { name: "Prisma (MongoDB)", value: "prisma-mongodb" },
            { name: "Prisma (MySQL)", value: "prisma-mysql" },
            { name: "Prisma (SQLite)", value: "prisma-sqlite" },
          );
        }
      } catch {
        choices.push(
          { name: "Prisma (PostgreSQL)", value: "prisma-postgresql" },
          { name: "Prisma (MongoDB)", value: "prisma-mongodb" },
          { name: "Prisma (MySQL)", value: "prisma-mysql" },
          { name: "Prisma (SQLite)", value: "prisma-sqlite" },
        );
      }
    } else if (db.name === "mongoose") {
      choices.push({ name: "Mongoose", value: "mongoose" });
    } else {
      choices.push({ name: db.displayName, value: db.name });
    }
  }

  // Add "None" at the end
  choices.push({ name: "None", value: "none" });

  return choices;
}
