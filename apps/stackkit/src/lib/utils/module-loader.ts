import path from "path";
import type { ModuleMetadata } from "../../types";
import { isDirectory, pathExists, readDir } from "./fs-helpers";
import { loadJsonAsync } from "./json-loader";
import { getModulesPath } from "./path-resolver";

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
