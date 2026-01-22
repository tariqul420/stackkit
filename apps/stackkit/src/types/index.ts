export interface TemplateMetadata {
  name: string;
  displayName: string;
  description: string;
  tags: string[];
  defaultPackageManager: "pnpm" | "npm" | "yarn" | "bun";
  features: string[];
}

export interface ModuleMetadata {
  name?: string;
  displayName?: string;
  description?: string;
  category?: string;
  provider?: string;
  supportedFrameworks?: string[];
  frameworkConfigs?: Record<string, unknown>;
  dependencies?:
    | Record<string, unknown>
    | { common?: Record<string, string>; providers?: Record<string, Record<string, string>> };
  devDependencies?:
    | Record<string, unknown>
    | { common?: Record<string, string>; providers?: Record<string, Record<string, string>> };
  envVars?: EnvVar[] | Record<string, string>;
  patches?: ModulePatch[];
  frameworkPatches?: Record<string, { [file: string]: { merge?: Record<string, unknown> } }>;
  postInstall?: string[];
  compatibility?: {
    databases?: string[];
    auth?: string[];
    languages?: string[];
  };
  files?: string[];
  scripts?: Record<string, string>;
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
  // Framework name is driven by templates/modules; keep flexible for discovery
  framework: string;
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
