import fs from "fs-extra";
import path from "path";
import { getPackageRoot } from "../utils/package-root";

interface PackageJsonLike {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface ModuleJsonLike {
  name?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

async function readJsonSafe<T>(filePath: string): Promise<T | null> {
  try {
    return (await fs.readJson(filePath)) as T;
  } catch {
    return null;
  }
}

async function collectModulePkgNames(modulePath: string): Promise<string[]> {
  const pkgNames: string[] = [];

  const genPath = path.join(modulePath, "generator.json");
  if (await fs.pathExists(genPath)) {
    const gen = await readJsonSafe<{ operations?: Array<Record<string, unknown>> }>(genPath);
    if (gen && Array.isArray(gen.operations)) {
      if (Array.isArray(gen.operations)) {
        for (const op of gen.operations) {
          if (op.dependencies && typeof op.dependencies === "object") {
            pkgNames.push(...Object.keys(op.dependencies));
          }
          if (op.devDependencies && typeof op.devDependencies === "object") {
            pkgNames.push(...Object.keys(op.devDependencies));
          }
        }
      }
    }
  }

  const modJson = path.join(modulePath, "module.json");
  if (await fs.pathExists(modJson)) {
    const moduleJson = await readJsonSafe<ModuleJsonLike>(modJson);
    if (moduleJson && typeof moduleJson === "object") {
      const deps = moduleJson.dependencies || {};
      if (typeof deps === "object") pkgNames.push(...Object.keys(deps));
      const devDeps = moduleJson.devDependencies || {};
      if (typeof devDeps === "object") pkgNames.push(...Object.keys(devDeps));
    }
  }

  return Array.from(new Set(pkgNames));
}

export async function detectAuthModules(packageJson: PackageJsonLike): Promise<string[]> {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const modules: string[] = [];

  try {
    const modulesDir = path.join(getPackageRoot(), "modules", "auth");
    if (await fs.pathExists(modulesDir)) {
      const authDirs = await fs.readdir(modulesDir);
      for (const authDir of authDirs) {
        try {
          const modulePath = path.join(modulesDir, authDir);
          const pkgNames = await collectModulePkgNames(modulePath);

          let moduleName = authDir;
          const modJson = path.join(modulePath, "module.json");
          if (await fs.pathExists(modJson)) {
            const moduleJson = await readJsonSafe<ModuleJsonLike>(modJson);
            if (moduleJson?.name) {
              moduleName = moduleJson.name;
            }
          }

          for (const pkg of pkgNames) {
            if (deps[pkg]) {
              modules.push(moduleName);
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    return Array.from(new Set(modules));
  }

  return Array.from(new Set(modules));
}

export async function detectDatabaseModules(packageJson: PackageJsonLike): Promise<string[]> {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const modules: string[] = [];

  try {
    const modulesDir = path.join(getPackageRoot(), "modules", "database");
    if (await fs.pathExists(modulesDir)) {
      const dbDirs = await fs.readdir(modulesDir);
      for (const dbDir of dbDirs) {
        try {
          const modulePath = path.join(modulesDir, dbDir);
          const pkgNames = await collectModulePkgNames(modulePath);

          let moduleName = dbDir;
          const modJson = path.join(modulePath, "module.json");
          if (await fs.pathExists(modJson)) {
            const moduleJson = await readJsonSafe<ModuleJsonLike>(modJson);
            if (moduleJson?.name) {
              moduleName = moduleJson.name;
            }
          }

          for (const pkg of pkgNames) {
            if (deps[pkg]) {
              modules.push(moduleName);
              break;
            }
          }
        } catch {
          continue;
        }
      }
    }
  } catch {
    return Array.from(new Set(modules));
  }

  return Array.from(new Set(modules));
}
