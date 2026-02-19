export const PACKAGE_MANAGERS = {
  PNPM: "pnpm" as const,
  NPM: "npm" as const,
  YARN: "yarn" as const,
  BUN: "bun" as const,
};

export const LOCK_FILES = {
  [PACKAGE_MANAGERS.PNPM]: "pnpm-lock.yaml",
  [PACKAGE_MANAGERS.YARN]: "yarn.lock",
  [PACKAGE_MANAGERS.BUN]: "bun.lockb",
  [PACKAGE_MANAGERS.NPM]: "package-lock.json",
} as const;

export const LOCK_FILES_ARRAY = [
  { file: LOCK_FILES.pnpm, pm: PACKAGE_MANAGERS.PNPM },
  { file: LOCK_FILES.yarn, pm: PACKAGE_MANAGERS.YARN },
  { file: LOCK_FILES.bun, pm: PACKAGE_MANAGERS.BUN },
  { file: LOCK_FILES.npm, pm: PACKAGE_MANAGERS.NPM },
] as const;

export const LANGUAGES = {
  TYPESCRIPT: "typescript" as const,
  JAVASCRIPT: "javascript" as const,
};

export const MODULE_CATEGORIES = {
  DATABASE: "database" as const,
  AUTH: "auth" as const,
  FRAMEWORK: "framework" as const,
};

export const DIRECTORY_NAMES = {
  MODULES: "modules",
  TEMPLATES: "templates",
  NODE_MODULES: "node_modules",
  GIT: ".git",
  PRISMA: "prisma",
  FILES: "files",
  SRC: "src",
  DIST: "dist",
  BIN: "bin",
} as const;

export const FILE_NAMES = {
  PACKAGE_JSON: "package.json",
  TSCONFIG_JSON: "tsconfig.json",
  MODULE_JSON: "module.json",
  GENERATOR_JSON: "generator.json",
  TEMPLATE_JSON: "template.json",
  CONFIG_JSON: "config.json",
  ENV: ".env",
  ENV_LOCAL: ".env.local",
  ENV_EXAMPLE: ".env.example",
  GITIGNORE: ".gitignore",
  README: "README.md",
  SCHEMA_PRISMA: "schema.prisma",
} as const;

export const ENV_FILES = [FILE_NAMES.ENV, FILE_NAMES.ENV_LOCAL] as const;

export const EXCLUDE_FROM_COPY = [
  FILE_NAMES.TEMPLATE_JSON,
  FILE_NAMES.CONFIG_JSON,
  DIRECTORY_NAMES.NODE_MODULES,
  DIRECTORY_NAMES.GIT,
] as const;

export const TIMEOUTS = {
  PACKAGE_INSTALL: 300000,
  GIT_INIT: 30000,
  RETRY_DELAY_BASE: 1000,
} as const;

export const RETRY_CONFIG = {
  MAX_ATTEMPTS: 2,
  PACKAGE_ROOT_MAX_ATTEMPTS: 10,
} as const;

export const ENV_PATTERNS = {
  KEY: /^[A-Z_][A-Z0-9_]*$/,
  COMMENT: /^\s*#/,
} as const;

export const ROUTER_TYPES = {
  APP: "app" as const,
  PAGES: "pages" as const,
} as const;

export const DISPLAY_NAMES = {
  [MODULE_CATEGORIES.DATABASE]: "Database",
  [MODULE_CATEGORIES.AUTH]: "Auth",
  [MODULE_CATEGORIES.FRAMEWORK]: "Framework",
} as const;

export const ERROR_MESSAGES = {
  NO_PACKAGE_JSON: "No package.json found in current directory or any parent directory.",
  INVALID_DIRECTORY: "Target directory already exists and is not empty.",
  INVALID_PROJECT_NAME: "Invalid project name. Please use a valid npm package name.",
  UNKNOWN_MODULE_TYPE: (module: string) =>
    `Unknown module type "${module}". Use "${MODULE_CATEGORIES.DATABASE}" or "${MODULE_CATEGORIES.AUTH}", or specify a provider directly.`,
  MODULE_NOT_FOUND: (moduleName: string) => `Module "${moduleName}" not found.`,
  TEMPLATE_NOT_FOUND: (framework: string) => `Base template not found for framework: ${framework}`,
  GIT_INIT_FAILED: "Failed to initialize git repository",
  PACKAGE_INSTALL_FAILED: "Failed to install dependencies",
} as const;

export const SUCCESS_MESSAGES = {
  PROJECT_CREATED: "✨ Project created successfully!",
  MODULE_ADDED: "✨ Module added successfully!",
  DEPENDENCIES_INSTALLED: "✓ Dependencies installed",
  GIT_INITIALIZED: "✓ Git repository initialized",
} as const;

export const CLI_COLORS = {
  PRIMARY: "cyan",
  SUCCESS: "green",
  WARNING: "yellow",
  ERROR: "red",
  INFO: "blue",
  HEADER: "magenta",
} as const;

export const PACKAGE_NAME = "stackkit" as const;

export const DEFAULT_PACKAGE_MANAGER = PACKAGE_MANAGERS.NPM;
export const DEFAULT_LANGUAGE = LANGUAGES.TYPESCRIPT;
