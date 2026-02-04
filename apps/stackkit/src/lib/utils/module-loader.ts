import path from "path";
import type { ModuleMetadata } from "../../types";
import { isDirectory, pathExists, readDir } from "./fs-helpers";
import { loadJsonAsync } from "./json-loader";
import { getGeneratorJsonPath, getModuleJsonPath, getModulesPath } from "./path-resolver";

export async function loadModuleMetadata(
  category: string,
  moduleName: string,
): Promise<ModuleMetadata | null> {
  const moduleJsonPath = getModuleJsonPath(category, moduleName);
  return loadJsonAsync<ModuleMetadata>(moduleJsonPath);
}

export async function loadGeneratorConfig<T = unknown>(
  category: string,
  moduleName: string,
): Promise<T | null> {
  const generatorPath = getGeneratorJsonPath(category, moduleName);
  return loadJsonAsync<T>(generatorPath);
}

export async function findModuleByName(
  moduleName: string,
  provider?: string,
): Promise<{ category: string; metadata: ModuleMetadata } | null> {
  const modulesDir = getModulesPath();

  if (!(await pathExists(modulesDir))) {
    return null;
  }

  const categories = await readDir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);

    if (!(await isDirectory(categoryPath))) {
      continue;
    }

    const moduleDirs = await readDir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(categoryPath, moduleDir);

      if (!(await isDirectory(modulePath))) {
        continue;
      }

      const metadataPath = path.join(modulePath, "module.json");

      if (await pathExists(metadataPath)) {
        const metadata = await loadJsonAsync<ModuleMetadata>(metadataPath);

        if (!metadata) continue;

        if (provider && moduleDir === provider) {
          return { category, metadata };
        }

        if (!provider && (metadata.category === moduleName || moduleDir === moduleName)) {
          return { category, metadata };
        }
      }
    }
  }

  return null;
}

export async function getAllModules(): Promise<ModuleMetadata[]> {
  const modulesDir = getModulesPath();

  if (!(await pathExists(modulesDir))) {
    return [];
  }

  const modules: ModuleMetadata[] = [];
  const categories = await readDir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);

    if (!(await isDirectory(categoryPath))) {
      continue;
    }

    const moduleDirs = await readDir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const metadataPath = path.join(categoryPath, moduleDir, "module.json");

      if (await pathExists(metadataPath)) {
        const metadata = await loadJsonAsync<ModuleMetadata>(metadataPath);
        if (metadata) {
          modules.push(metadata);
        }
      }
    }
  }

  return modules;
}

export async function getModulesByCategory(category: string): Promise<ModuleMetadata[]> {
  const categoryPath = path.join(getModulesPath(), category);

  if (!(await pathExists(categoryPath))) {
    return [];
  }

  const modules: ModuleMetadata[] = [];
  const moduleDirs = await readDir(categoryPath);

  for (const moduleDir of moduleDirs) {
    const metadataPath = path.join(categoryPath, moduleDir, "module.json");

    if (await pathExists(metadataPath)) {
      const metadata = await loadJsonAsync<ModuleMetadata>(metadataPath);
      if (metadata) {
        modules.push(metadata);
      }
    }
  }

  return modules;
}
