import * as fs from "fs-extra";
import * as path from "path";

export interface FrameworkConfig {
  name: string;
  displayName: string;
  compatibility: {
    databases: string[];
    auth: string[];
  };
}

export interface ModuleConfig {
  name: string;
  displayName: string;
  type: "database" | "auth";
  compatibility?: {
    frameworks?: string[];
    databases?: string[];
  };
}

const frameworkConfigs: Map<string, FrameworkConfig> = new Map();

async function collectModuleNames(baseDir: string): Promise<string[]> {
  if (!(await fs.pathExists(baseDir))) {
    return [];
  }

  const names: string[] = [];
  const entries = await fs.readdir(baseDir);
  for (const entry of entries) {
    const moduleJson = path.join(baseDir, entry, "module.json");
    if (!(await fs.pathExists(moduleJson))) {
      continue;
    }

    try {
      const moduleConfig = (await fs.readJson(moduleJson)) as { name?: string };
      if (moduleConfig.name) {
        names.push(moduleConfig.name);
      }
    } catch {
      continue;
    }
  }

  return names;
}

export const FrameworkUtils = {
  async loadFrameworkConfig(frameworkName: string, templatesDir: string): Promise<FrameworkConfig> {
    const configPath = path.join(templatesDir, frameworkName, "template.json");
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      frameworkConfigs.set(frameworkName, config);
      return config;
    }

    const defaultConfig: FrameworkConfig = {
      name: frameworkName,
      displayName: frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1),
      compatibility: {
        databases: [],
        auth: [],
      },
    };

    try {
      const modulesDir = path.join(templatesDir, "..", "modules");

      defaultConfig.compatibility.databases = await collectModuleNames(
        path.join(modulesDir, "database"),
      );
      defaultConfig.compatibility.auth = await collectModuleNames(path.join(modulesDir, "auth"));
    } catch {
      defaultConfig.compatibility.databases = [];
      defaultConfig.compatibility.auth = [];
    }

    frameworkConfigs.set(frameworkName, defaultConfig);
    return defaultConfig;
  },

  isCompatible(framework: string, database?: string, auth?: string): boolean {
    const config = frameworkConfigs.get(framework);
    if (!config) return true;

    if (database && !config.compatibility.databases.includes(database)) {
      return false;
    }

    if (auth && !config.compatibility.auth.includes(auth)) {
      return false;
    }

    return true;
  },
};
