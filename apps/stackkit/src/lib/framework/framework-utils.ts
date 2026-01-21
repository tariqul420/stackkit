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

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FrameworkUtils {
  private static frameworkConfigs: Map<string, FrameworkConfig> = new Map();

  static async loadFrameworkConfig(
    frameworkName: string,
    templatesDir: string,
  ): Promise<FrameworkConfig> {
    const configPath = path.join(templatesDir, frameworkName, "template.json");
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      this.frameworkConfigs.set(frameworkName, config);
      return config;
    }
    // Derive compatibility dynamically from available modules if possible
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
      const dbDir = path.join(modulesDir, "database");
      const authDir = path.join(modulesDir, "auth");

      if (await fs.pathExists(dbDir)) {
        const dbs = await fs.readdir(dbDir);
        for (const d of dbs) {
          const moduleJson = path.join(dbDir, d, "module.json");
          if (await fs.pathExists(moduleJson)) {
            try {
              const m = await fs.readJson(moduleJson);
              if (m && m.name) defaultConfig.compatibility.databases.push(m.name);
            } catch {
              // ignore malformed
            }
          }
        }
      }

      if (await fs.pathExists(authDir)) {
        const auths = await fs.readdir(authDir);
        for (const a of auths) {
          const moduleJson = path.join(authDir, a, "module.json");
          if (await fs.pathExists(moduleJson)) {
            try {
              const m = await fs.readJson(moduleJson);
              if (m && m.name) defaultConfig.compatibility.auth.push(m.name);
            } catch {
              // ignore malformed
            }
          }
        }
      }
    } catch {
      // ignore discovery errors and leave empty lists
    }

    this.frameworkConfigs.set(frameworkName, defaultConfig);
    return defaultConfig;
  }

  static isCompatible(framework: string, database?: string, auth?: string): boolean {
    const config = this.frameworkConfigs.get(framework);
    if (!config) return true; // Assume compatible if no config

    if (database && !config.compatibility.databases.includes(database)) {
      return false;
    }

    if (auth && !config.compatibility.auth.includes(auth)) {
      return false;
    }

    return true;
  }
}
