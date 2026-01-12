export interface TemplateMetadata {
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  defaultPackageManager: "pnpm" | "npm" | "yarn" | "bun";
  features: string[];
}

export interface ModuleMetadata {
  name: string;
  displayName: string;
  description: string;
  category: "auth" | "database" | "ui" | "other";
  supportedFrameworks: string[];
  dependencies:
    | {
        common?: Record<string, string>;
        providers?: Record<string, Record<string, string>>;
      }
    | Record<string, string>;
  devDependencies?:
    | {
        common?: Record<string, string>;
        providers?: Record<string, Record<string, string>>;
      }
    | Record<string, string>;
  envVars: EnvVar[];
  patches: ModulePatch[];
  frameworkPatches?: Record<string, { [file: string]: { merge?: Record<string, unknown> } }>;
  postInstall?: string[];
}

export interface EnvVar {
  key: string;
  value?: string;
  description: string;
  required: boolean;
}

export interface ModulePatch {
  type: "create-file" | "modify-json" | "append-env" | "inject-code";
  description: string;
  [key: string]: unknown;
}

export interface CreateFilePatch extends ModulePatch {
  type: "create-file";
  source: string;
  destination: string;
  condition?: {
    router?: "app" | "pages";
    language?: "ts" | "js";
  };
}

export interface ModifyJsonPatch extends ModulePatch {
  type: "modify-json";
  file: string;
  operations: {
    path: string;
    value: unknown;
    merge?: boolean;
  }[];
}

export interface ProjectInfo {
  framework: "nextjs" | "express" | "react" | "react-vite" | "unknown";
  router: "app" | "pages" | "unknown";
  language: "ts" | "js";
  packageManager: "npm" | "yarn" | "pnpm" | "bun";
  hasAuth: boolean;
  hasPrisma: boolean;
  hasDatabase: boolean;
  rootDir: string;
}

export interface CLIOptions {
  force?: boolean;
  dryRun?: boolean;
  yes?: boolean;
  noInstall?: boolean;
  pm?: "npm" | "yarn" | "pnpm" | "bun";
}
