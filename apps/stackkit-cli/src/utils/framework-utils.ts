import * as fs from 'fs-extra';
import * as path from 'path';

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
  type: 'database' | 'auth';
  compatibility?: {
    frameworks?: string[];
    databases?: string[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class FrameworkUtils {
  private static frameworkConfigs: Map<string, FrameworkConfig> = new Map();

  static async loadFrameworkConfig(frameworkName: string, templatesDir: string): Promise<FrameworkConfig> {
    const configPath = path.join(templatesDir, frameworkName, 'template.json');
    if (await fs.pathExists(configPath)) {
      const config = await fs.readJson(configPath);
      this.frameworkConfigs.set(frameworkName, config);
      return config;
    }

    // Default config if no template.json exists
    const defaultConfig: FrameworkConfig = {
      name: frameworkName,
      displayName: frameworkName.charAt(0).toUpperCase() + frameworkName.slice(1),
      compatibility: {
        databases: ['prisma', 'mongoose'],
        auth: ['better-auth', 'authjs'],
      },
    };

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