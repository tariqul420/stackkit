import fs from "fs-extra";
import path from "path";
import { getPackageRoot } from "../utils/package-root";
import { getPrismaProvidersFromGenerator, parseDatabaseOption } from "./shared";

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
  ui?: ModuleMetadata[];
  storage?: ModuleMetadata[];
  components?: ModuleMetadata[];
}

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    return (await fs.readJson(filePath)) as T;
  } catch {
    return null;
  }
}

export async function discoverModules(modulesDir: string): Promise<DiscoveredModules> {
  const discovered: DiscoveredModules = {
    frameworks: [],
    databases: [],
    auth: [],
  };

  const candidates = [] as string[];
  if (modulesDir) candidates.push(modulesDir);
  candidates.push(path.join(getPackageRoot(), "modules"));

  let resolvedModulesDir: string | undefined;
  for (const c of candidates) {
    if (await fs.pathExists(c)) {
      resolvedModulesDir = c;
      break;
    }
  }

  if (!resolvedModulesDir) return discovered;

  modulesDir = resolvedModulesDir;

  const templatesDir = path.join(modulesDir, "..", "templates");
  if (await fs.pathExists(templatesDir)) {
    const frameworkDirs = await fs.readdir(templatesDir);
    for (const frameworkName of frameworkDirs) {
      const templateJsonPath = path.join(templatesDir, frameworkName, "template.json");
      if (await fs.pathExists(templateJsonPath)) {
        const templateConfig = await readJsonSafe<ModuleMetadata>(templateJsonPath);
        if (templateConfig) {
          discovered.frameworks.push({
            ...templateConfig,
            name: frameworkName,
            category: "framework",
          });
        }
      }
    }
  }

  const databaseDir = path.join(modulesDir, "database");
  if (await fs.pathExists(databaseDir)) {
    const dbModules = await fs.readdir(databaseDir);
    dbModules.sort((a, b) => {
      if (a === "prisma") return -1;
      if (b === "prisma") return 1;
      return a.localeCompare(b);
    });
    for (const moduleName of dbModules) {
      const modulePath = path.join(databaseDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        const metadata = await readJsonSafe<ModuleMetadata>(moduleJsonPath);
        if (metadata) {
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.databases.push(metadata);
        }
      }
    }
  }

  const authDir = path.join(modulesDir, "auth");
  if (await fs.pathExists(authDir)) {
    const authModules = await fs.readdir(authDir);
    for (const moduleName of authModules) {
      const modulePath = path.join(authDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        const metadata = await readJsonSafe<ModuleMetadata>(moduleJsonPath);
        if (metadata) {
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.auth.push(metadata);
        }
      }
    }
  }

  // discover UI modules (modules/ui)
  const uiDir = path.join(modulesDir, "ui");
  if (await fs.pathExists(uiDir)) {
    discovered.ui = [];
    const uiModules = await fs.readdir(uiDir);
    for (const moduleName of uiModules) {
      const modulePath = path.join(uiDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        const metadata = await readJsonSafe<ModuleMetadata>(moduleJsonPath);
        if (metadata) {
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.ui.push(metadata);
        }
      }
    }
  }

  // discover storage/provider modules (modules/storage)
  const storageDir = path.join(modulesDir, "storage");
  if (await fs.pathExists(storageDir)) {
    discovered.storage = [];
    const storageModules = await fs.readdir(storageDir);
    for (const moduleName of storageModules) {
      const modulePath = path.join(storageDir, moduleName);
      const moduleJsonPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(moduleJsonPath)) {
        const metadata = await readJsonSafe<ModuleMetadata>(moduleJsonPath);
        if (metadata) {
          if (!metadata.name) metadata.name = moduleName;
          if (!metadata.displayName) metadata.displayName = moduleName;
          discovered.storage.push(metadata);
        }
      }
    }
  }

  // discover frontend components module (flat: modules/components/module.json)
  const componentsDir = path.join(modulesDir, "components");
  if (await fs.pathExists(componentsDir)) {
    const moduleJsonPath = path.join(componentsDir, "module.json");
    if (await fs.pathExists(moduleJsonPath)) {
      const metadata = await readJsonSafe<ModuleMetadata>(moduleJsonPath);
      if (metadata) {
        if (!metadata.name) metadata.name = "components";
        if (!metadata.displayName) metadata.displayName = "Components";
        discovered.components = [metadata];
      }
    }
  }

  return discovered;
}

export function getValidDatabaseOptions(databases: ModuleMetadata[]): string[] {
  const options: string[] = ["none"];

  for (const db of databases) {
    if (db.name === "prisma") {
      const providers = getPrismaProvidersFromGenerator();
      if (providers.length > 0) {
        for (const p of providers) options.push(`prisma-${p}`);
      } else {
        options.push("prisma");
      }
    } else {
      options.push(db.name);
    }
  }

  return options;
}

export function getValidAuthOptions(authModules: ModuleMetadata[]): string[] {
  const options: string[] = ["none"];

  for (const auth of authModules) {
    options.push(auth.name);
  }

  return options;
}

export function getCompatibleAuthOptions(
  authModules: ModuleMetadata[],
  framework: string,
  database: string,
  frameworksMeta?: ModuleMetadata[],
): Array<{ name: string; value: string; description?: string }> {
  const compatible: Array<{ name: string; value: string; description?: string }> = [];

  for (const auth of authModules) {
    if (auth.supportedFrameworks && !auth.supportedFrameworks.includes(framework)) {
      continue;
    }

    const parsedDb = parseDatabaseOption(database || "").database;

    let dbCompatible = true;
    if (auth.compatibility && auth.compatibility.databases) {
      dbCompatible = auth.compatibility.databases.includes(parsedDb);
    }

    let explicitlyAllowedByFramework = false;
    if (frameworksMeta && Array.isArray(frameworksMeta)) {
      const fw = frameworksMeta.find((f) => f.name === framework);
      if (fw && fw.compatibility) {
        const authList = fw.compatibility.auth;
        if (Array.isArray(authList) && authList.includes(auth.name)) {
          explicitlyAllowedByFramework = true;
        }
      }
    }

    if (!dbCompatible && !explicitlyAllowedByFramework) continue;

    compatible.push({
      name: auth.displayName,
      value: auth.name,
      description: auth.description || "",
    });
  }

  compatible.push({ name: "None", value: "none" });

  return compatible;
}

export function getDatabaseChoices(
  databases: ModuleMetadata[],
  framework: string,
): Array<{ name: string; value: string }> {
  const choices: Array<{ name: string; value: string }> = [];

  for (const db of databases) {
    if (db.supportedFrameworks && !db.supportedFrameworks.includes(framework)) {
      continue;
    }

    if (db.name === "prisma") {
      const providers = getPrismaProvidersFromGenerator();
      if (providers.length > 0) {
        for (const p of providers)
          choices.push({
            name: `Prisma (${p.charAt(0).toUpperCase() + p.slice(1)})`,
            value: `prisma-${p}`,
          });
      } else {
        choices.push({ name: "Prisma", value: "prisma" });
      }
    } else {
      choices.push({ name: db.displayName || db.name, value: db.name });
    }
  }

  choices.push({ name: "None", value: "none" });

  return choices;
}
