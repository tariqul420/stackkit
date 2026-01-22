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

async function collectModulePkgNames(modulePath: string): Promise<string[]> {
  const pkgNames: string[] = [];

  const genPath = path.join(modulePath, "generator.json");
  if (await fs.pathExists(genPath)) {
    try {
      const gen = await fs.readJson(genPath);
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
    } catch {
      // ignore malformed generator
    }
  }

  // Also check module.json for declared deps
  const modJson = path.join(modulePath, "module.json");
  if (await fs.pathExists(modJson)) {
    try {
      const m = (await fs.readJson(modJson)) as ModuleJsonLike;
      if (m && typeof m === "object") {
        const deps = m.dependencies || {};
        if (typeof deps === "object") pkgNames.push(...Object.keys(deps));
        const devDeps = m.devDependencies || {};
        if (typeof devDeps === "object") pkgNames.push(...Object.keys(devDeps));
      }
    } catch {
      // ignore
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

          // Fallback: check module.json provider/name for display
          let moduleName = authDir;
          const modJson = path.join(modulePath, "module.json");
          if (await fs.pathExists(modJson)) {
            try {
              const m = (await fs.readJson(modJson)) as ModuleJsonLike;
              if (m && m.name) moduleName = m.name;
            } catch {
              /* ignore */
            }
          }

          for (const pkg of pkgNames) {
            if (deps[pkg]) {
              modules.push(moduleName);
              break;
            }
          }
        } catch {
          // ignore per-module errors
        }
      }
    }
  } catch {
    // ignore discovery errors
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
            try {
              const m = await fs.readJson(modJson);
              if (m && m.name) moduleName = m.name;
            } catch {
              /* ignore */
            }
          }

          for (const pkg of pkgNames) {
            if (deps[pkg]) {
              modules.push(moduleName);
              break;
            }
          }
        } catch {
          // ignore per-module errors
        }
      }
    }
  } catch {
    // ignore discovery errors
  }

  return Array.from(new Set(modules));
}
