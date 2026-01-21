import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { logger } from "../lib/ui/logger";
import { getPackageRoot } from "../lib/utils/package-root";

// Constants for consistent messaging
const MESSAGES = {
  NO_PACKAGE_JSON: "No package.json found in current directory or any parent directory.",
  UNSUPPORTED_PROJECT:
    "Unsupported project type. Only Next.js, Express, and React projects are supported.",
  NODE_TOO_OLD: (version: string) =>
    `Node.js version ${version} is not supported. Minimum required: Node 18.`,
  NODE_WARNING: (version: string) =>
    `Node.js version ${version} is supported but Node 20+ is recommended.`,
  NODE_SUCCESS: (version: string) => `Node.js version ${version} is supported.`,
  ENV_EXAMPLE_MISSING: ".env.example file missing (recommended for documentation)",
  ENV_EXAMPLE_FOUND: ".env.example file found",
  ENV_MISSING: "No .env or .env.local file found",
  ENV_FOUND: ".env/.env.local file found",
  PRISMA_SCHEMA_MISSING: "Prisma schema missing (required for Prisma)",
  PRISMA_SCHEMA_FOUND: "Prisma schema found",
  AUTH_ROUTES_MISSING: "Auth routes not found (may need configuration)",
  AUTH_ROUTES_FOUND: "Auth routes configured",
  ENV_VARS_MISSING: (vars: string[]) => `Missing: ${vars.join(", ")}`,
  ENV_VARS_PRESENT: (vars: string[]) => `Present: ${vars.join(", ")}`,
  TSCONFIG_MISSING: "tsconfig.json missing (required for TypeScript)",
  TSCONFIG_FOUND: "tsconfig.json found",
  ESLINT_CONFIG_MISSING: "ESLint config missing (recommended for code quality)",
  ESLINT_CONFIG_FOUND: "ESLint config found",
  BUILD_SCRIPT_MISSING: "Build script missing in package.json",
  BUILD_SCRIPT_FOUND: "Build script found",
  DEPENDENCY_OUTDATED: (deps: string[]) => `Outdated dependencies: ${deps.join(", ")}`,
  DEPENDENCY_UP_TO_DATE: "Dependencies are up to date",
  GIT_REPO_MISSING: "Not a git repository (recommended for version control)",
  GIT_REPO_FOUND: "Git repository initialized",
} as const;

interface DoctorOptions {
  json?: boolean;
  verbose?: boolean;
  strict?: boolean;
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  [key: string]: unknown;
}

interface CheckResult {
  status: "success" | "warning" | "error";
  message: string;
  details?: string;
}

interface DoctorReport {
  project: {
    type: string;
    root: string;
    packageManager: string;
  };
  runtime: {
    nodeVersion: string;
    nodeVersionStatus: "success" | "warning" | "error";
  };
  modules: {
    auth: string[];
    database: string[];
  };
  files: {
    envExample: boolean;
    env: boolean;
    prismaSchema?: boolean;
    authRoutes?: boolean;
    tsconfig?: boolean;
    eslintConfig?: boolean;
    git?: boolean;
  };
  env: {
    missing: string[];
    present: string[];
  };
  dependencies: {
    outdated: string[];
  };
  conflicts: string[];
  checks: CheckResult[];
  summary: {
    errors: number;
    warnings: number;
    suggestions: string[];
  };
}

export async function doctorCommand(options: DoctorOptions): Promise<void> {
  try {
    const report = await runDoctorChecks();

    if (options.json) {
      process.stdout.write(JSON.stringify(report, null, 2) + "\n");
      return;
    }

    printDoctorReport(report, options.verbose || false);

    const hasErrors = report.summary.errors > 0;
    const hasWarnings = report.summary.warnings > 0;
    const strictMode = options.strict || false;

    if (hasErrors || (strictMode && hasWarnings)) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  } catch (error) {
    logger.error(`Doctor check failed: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
}

async function runDoctorChecks(): Promise<DoctorReport> {
  const checks: CheckResult[] = [];

  const projectRoot = await findProjectRoot();
  checks.push({
    status: "success",
    message: `Found project root: ${projectRoot}`,
  });

  const packageJson = await readPackageJson(projectRoot);

  const packageManager = await detectPackageManager(projectRoot);

  const projectType = detectProjectType(packageJson);
  if (projectType === "unknown") {
    checks.push({
      status: "error",
      message: MESSAGES.UNSUPPORTED_PROJECT,
    });
  } else {
    checks.push({
      status: "success",
      message: `Detected project type: ${projectType}`,
    });
  }

  const nodeVersionCheck = checkNodeVersion();
  checks.push(nodeVersionCheck);

  const authModules = detectAuthModules(packageJson);
  const databaseModules = detectDatabaseModules(packageJson);

  const filesCheck = await checkKeyFiles(projectRoot, projectType, authModules, databaseModules);
  checks.push(...filesCheck);

  const envCheck = await checkEnvFiles(projectRoot, authModules, databaseModules);
  checks.push(...envCheck.checks);

  const configChecks = await checkConfigFiles(projectRoot, projectType, packageJson);
  checks.push(...configChecks);

  const dependencyCheck = await checkDependencies(packageJson);
  checks.push(dependencyCheck);

  const gitCheck = await checkGitRepo(projectRoot);
  checks.push(gitCheck);

  const conflicts = checkConflicts(authModules, databaseModules);
  conflicts.forEach((conflict) => {
    checks.push({
      status: "warning",
      message: conflict,
    });
  });

  const report: DoctorReport = {
    project: {
      type: projectType,
      root: projectRoot,
      packageManager,
    },
    runtime: {
      nodeVersion: process.version,
      nodeVersionStatus: nodeVersionCheck.status,
    },
    modules: {
      auth: authModules,
      database: databaseModules,
    },
    files: {
      envExample: await fs.pathExists(path.join(projectRoot, ".env.example")),
      env:
        (await fs.pathExists(path.join(projectRoot, ".env"))) ||
        (await fs.pathExists(path.join(projectRoot, ".env.local"))),
      prismaSchema: databaseModules.includes("prisma")
        ? await fs.pathExists(path.join(projectRoot, "prisma", "schema.prisma"))
        : undefined,
      authRoutes:
        authModules.length > 0 ? await checkAuthRoutesExist(projectRoot, projectType) : undefined,
      tsconfig: await fs.pathExists(path.join(projectRoot, "tsconfig.json")),
      eslintConfig: await checkEslintConfigExists(projectRoot),
      git: await fs.pathExists(path.join(projectRoot, ".git")),
    },
    env: envCheck.envStatus,
    dependencies: {
      outdated: dependencyCheck.outdated,
    },
    conflicts,
    checks,
    summary: {
      errors: checks.filter((c) => c.status === "error").length,
      warnings: checks.filter((c) => c.status === "warning").length,
      suggestions: generateSuggestions(authModules, databaseModules),
    },
  };

  return report;
}

async function findProjectRoot(): Promise<string> {
  let currentDir = process.cwd();

  while (currentDir !== path.dirname(currentDir)) {
    const packageJsonPath = path.join(currentDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      return currentDir;
    }
    currentDir = path.dirname(currentDir);
  }

  throw new Error(MESSAGES.NO_PACKAGE_JSON);
}

async function readPackageJson(projectRoot: string): Promise<PackageJson> {
  const packageJsonPath = path.join(projectRoot, "package.json");
  return await fs.readJSON(packageJsonPath);
}

async function detectPackageManager(projectRoot: string): Promise<string> {
  const checks = [
    { file: "pnpm-lock.yaml", manager: "pnpm" },
    { file: "yarn.lock", manager: "yarn" },
    { file: "package-lock.json", manager: "npm" },
  ];

  for (const check of checks) {
    if (await fs.pathExists(path.join(projectRoot, check.file))) {
      return check.manager;
    }
  }

  return "npm";
}

function detectProjectType(packageJson: PackageJson): string {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (deps.next) {
    return "nextjs";
  } else if (deps.express) {
    return "express";
  } else if (deps.vite && deps.react) {
    return "react";
  } else if (deps.react) {
    return "react";
  }

  return "unknown";
}

function checkNodeVersion(): CheckResult {
  const version = process.version;
  const majorVersion = parseInt(version.slice(1).split(".")[0]);

  if (majorVersion < 18) {
    return {
      status: "error",
      message: MESSAGES.NODE_TOO_OLD(version),
    };
  } else if (majorVersion < 20) {
    return {
      status: "warning",
      message: MESSAGES.NODE_WARNING(version),
    };
  } else {
    return {
      status: "success",
      message: MESSAGES.NODE_SUCCESS(version),
    };
  }
}

function detectAuthModules(packageJson: PackageJson): string[] {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const modules: string[] = [];

  try {
    const modulesDir = path.join(getPackageRoot(), "modules", "auth");
    if (fs.existsSync(modulesDir)) {
      const authDirs = fs.readdirSync(modulesDir);
      for (const authDir of authDirs) {
        try {
          const genPath = path.join(modulesDir, authDir, "generator.json");
          const modJson = path.join(modulesDir, authDir, "module.json");
          let pkgNames: string[] = [];
          if (fs.existsSync(genPath)) {
            const gen = JSON.parse(fs.readFileSync(genPath, "utf-8"));
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

          // Fallback: check module.json provider/name
          let moduleName = authDir;
          if (fs.existsSync(modJson)) {
            try {
              const m = JSON.parse(fs.readFileSync(modJson, "utf-8"));
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

  // Fallback to original simple checks if nothing found
  if (modules.length === 0) {
    if (deps["better-auth"]) modules.push("better-auth");
    if (deps["next-auth"]) modules.push("authjs");
  }

  return Array.from(new Set(modules));
}

function detectDatabaseModules(packageJson: PackageJson): string[] {
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  const modules: string[] = [];

  try {
    const modulesDir = path.join(getPackageRoot(), "modules", "database");
    if (fs.existsSync(modulesDir)) {
      const dbDirs = fs.readdirSync(modulesDir);
      for (const dbDir of dbDirs) {
        try {
          const genPath = path.join(modulesDir, dbDir, "generator.json");
          const modJson = path.join(modulesDir, dbDir, "module.json");
          let pkgNames: string[] = [];
          if (fs.existsSync(genPath)) {
            const gen = JSON.parse(fs.readFileSync(genPath, "utf-8"));
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

          let moduleName = dbDir;
          if (fs.existsSync(modJson)) {
            try {
              const m = JSON.parse(fs.readFileSync(modJson, "utf-8"));
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

  // Fallback to original checks if nothing found
  if (modules.length === 0) {
    if (deps["@prisma/client"] || deps["prisma"]) modules.push("prisma");
    if (deps["mongoose"]) modules.push("mongoose");
  }

  return Array.from(new Set(modules));
}

async function checkKeyFiles(
  projectRoot: string,
  projectType: string,
  authModules: string[],
  databaseModules: string[],
): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  const envExampleExists = await fs.pathExists(path.join(projectRoot, ".env.example"));
  checks.push({
    status: envExampleExists ? "success" : "warning",
    message: envExampleExists
      ? ".env.example file found"
      : ".env.example file missing (recommended for documentation)",
  });

  if (databaseModules.includes("prisma")) {
    const schemaExists = await fs.pathExists(path.join(projectRoot, "prisma", "schema.prisma"));
    checks.push({
      status: schemaExists ? "success" : "error",
      message: schemaExists ? "Prisma schema found" : "Prisma schema missing (required for Prisma)",
    });
  }

  if (authModules.length > 0 && projectType === "nextjs") {
    const authRoutesExist = await checkAuthRoutesExist(projectRoot, projectType);
    checks.push({
      status: authRoutesExist ? "success" : "warning",
      message: authRoutesExist
        ? "Auth routes configured"
        : "Auth routes not found (may need configuration)",
    });
  }

  return checks;
}

async function checkAuthRoutesExist(projectRoot: string, projectType: string): Promise<boolean> {
  if (projectType !== "nextjs") return true; // Skip for non-Next.js
  // Build candidate auth route paths from generator.json files in modules/auth
  const candidates = new Set<string>();

  try {
    const authModulesDir = path.join(getPackageRoot(), "modules", "auth");
    if (await fs.pathExists(authModulesDir)) {
      const authDirs = await fs.readdir(authModulesDir);
      for (const dir of authDirs) {
        const genPath = path.join(authModulesDir, dir, "generator.json");
        if (!(await fs.pathExists(genPath))) continue;
        try {
          const gen = await fs.readJson(genPath);
          if (Array.isArray(gen.operations)) {
            for (const op of gen.operations) {
              if (typeof op.destination === "string") candidates.add(op.destination);
              if (Array.isArray(op.operations)) {
                for (const sub of op.operations) {
                  if (typeof sub.destination === "string") candidates.add(sub.destination);
                }
              }
            }
          }
        } catch {
          // ignore malformed generator
        }
      }
    }
  } catch {
    // ignore discovery errors
  }

  // Fallback to known common paths if generators don't provide any
  const fallback = [
    "app/api/auth/[...nextauth]/route.ts",
    "app/api/auth/[...nextauth]/route.js",
    "src/app/api/auth/[...nextauth]/route.ts",
    "src/app/api/auth/[...nextauth]/route.js",
    "pages/api/auth/[...nextauth].ts",
    "pages/api/auth/[...nextauth].js",
    "src/pages/api/auth/[...nextauth].ts",
    "src/pages/api/auth/[...nextauth].js",
    "app/api/auth/[...all]/route.ts",
    "app/api/auth/[...all]/route.js",
    "src/app/api/auth/[...all]/route.ts",
    "src/app/api/auth/[...all]/route.js",
  ];

  for (const p of fallback) candidates.add(p);

  for (const routePath of candidates) {
    if (await fs.pathExists(path.join(projectRoot, routePath))) {
      return true;
    }
  }

  return false;
}

async function checkEnvFiles(
  projectRoot: string,
  authModules: string[],
  databaseModules: string[],
): Promise<{ checks: CheckResult[]; envStatus: { missing: string[]; present: string[] } }> {
  const checks: CheckResult[] = [];
  const requiredKeys: string[] = [];
  const missing: string[] = [];
  const present: string[] = [];

  // Dynamically collect required env keys from generator.json for detected modules
  try {
    const modulesDir = path.join(getPackageRoot(), "modules");

    async function collectEnvKeys(category: string, name: string) {
      const genPath = path.join(modulesDir, category, name, "generator.json");
      if (!(await fs.pathExists(genPath))) return;
      try {
        const gen = await fs.readJson(genPath);
        if (Array.isArray(gen.operations)) {
          for (const op of gen.operations) {
            if (op.type === "add-env" && op.envVars && typeof op.envVars === "object") {
              for (const k of Object.keys(op.envVars)) {
                if (!requiredKeys.includes(k)) requiredKeys.push(k);
              }
            }
            // Also check nested operations (e.g., patch-file -> operations)
            if (Array.isArray(op.operations)) {
              for (const sub of op.operations) {
                if (sub.type === "add-env" && sub.envVars && typeof sub.envVars === "object") {
                  for (const k of Object.keys(sub.envVars)) {
                    if (!requiredKeys.includes(k)) requiredKeys.push(k);
                  }
                }
              }
            }
          }
        }
      } catch {
        // ignore malformed generator
      }
    }

    for (const db of databaseModules) {
      await collectEnvKeys("database", db);
    }
    for (const auth of authModules) {
      await collectEnvKeys("auth", auth);
    }
  } catch {
    // fallback to previous minimal checks if discovery fails
    if (databaseModules.includes("prisma")) {
      requiredKeys.push("DATABASE_URL");
    }
    if (authModules.includes("authjs")) {
      requiredKeys.push("NEXTAUTH_SECRET", "NEXTAUTH_URL");
    }
    if (authModules.includes("better-auth")) {
      requiredKeys.push("BETTER_AUTH_SECRET", "BETTER_AUTH_URL");
    }
  }

  const envPaths = [".env", ".env.local"];
  let envContent = "";

  for (const envPath of envPaths) {
    const fullPath = path.join(projectRoot, envPath);
    if (await fs.pathExists(fullPath)) {
      envContent = await fs.readFile(fullPath, "utf-8");
      break;
    }
  }

  if (!envContent) {
    checks.push({
      status: "warning",
      message: "No .env or .env.local file found",
    });
    return { checks, envStatus: { missing: requiredKeys, present: [] } };
  }

  const envLines = envContent
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#"));
  const envVars = new Set(envLines.map((line) => line.split("=")[0]));

  for (const key of requiredKeys) {
    if (envVars.has(key)) {
      present.push(key);
    } else {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    checks.push({
      status: "error",
      message: `Missing required environment variables: ${missing.join(", ")}`,
    });
  } else if (requiredKeys.length > 0) {
    checks.push({
      status: "success",
      message: "All required environment variables are present",
    });
  }

  return { checks, envStatus: { missing, present } };
}

function checkConflicts(authModules: string[], databaseModules: string[]): string[] {
  const conflicts: string[] = [];

  if (authModules.length > 1) {
    conflicts.push(
      `Multiple auth providers detected: ${authModules.join(", ")}. Consider using only one.`,
    );
  }

  if (databaseModules.length > 1) {
    conflicts.push(
      `Multiple database providers detected: ${databaseModules.join(", ")}. Consider using only one.`,
    );
  }

  return conflicts;
}

async function checkConfigFiles(
  projectRoot: string,
  projectType: string,
  packageJson: PackageJson,
): Promise<CheckResult[]> {
  const checks: CheckResult[] = [];

  const tsconfigExists = await fs.pathExists(path.join(projectRoot, "tsconfig.json"));
  checks.push({
    status: tsconfigExists ? "success" : "error",
    message: tsconfigExists ? MESSAGES.TSCONFIG_FOUND : MESSAGES.TSCONFIG_MISSING,
  });

  const eslintExists = await checkEslintConfigExists(projectRoot);
  checks.push({
    status: eslintExists ? "success" : "warning",
    message: eslintExists ? MESSAGES.ESLINT_CONFIG_FOUND : MESSAGES.ESLINT_CONFIG_MISSING,
  });

  const hasBuildScript =
    packageJson.scripts &&
    typeof packageJson.scripts === "object" &&
    "build" in packageJson.scripts;
  checks.push({
    status: hasBuildScript ? "success" : "warning",
    message: hasBuildScript ? MESSAGES.BUILD_SCRIPT_FOUND : MESSAGES.BUILD_SCRIPT_MISSING,
  });

  return checks;
}

async function checkDependencies(
  packageJson: PackageJson,
): Promise<{ status: "success" | "warning" | "error"; message: string; outdated: string[] }> {
  const outdated: string[] = [];
  // Simple check: if dependencies have ^ or ~, assume up to date for now
  // In production, integrate with npm outdated or similar
  const deps = { ...packageJson.dependencies, ...packageJson.devDependencies };
  for (const [name, version] of Object.entries(deps || {})) {
    if (typeof version === "string" && (version.startsWith("^") || version.startsWith("~"))) {
      // Assume up to date if using flexible versioning
    } else {
      // Assume outdated if using exact versions (simplified check)
      outdated.push(name);
    }
  }
  return {
    status: outdated.length > 0 ? "warning" : "success",
    message:
      outdated.length > 0 ? MESSAGES.DEPENDENCY_OUTDATED(outdated) : MESSAGES.DEPENDENCY_UP_TO_DATE,
    outdated,
  };
}

async function checkGitRepo(projectRoot: string): Promise<CheckResult> {
  const gitExists = await fs.pathExists(path.join(projectRoot, ".git"));
  return {
    status: gitExists ? "success" : "warning",
    message: gitExists ? MESSAGES.GIT_REPO_FOUND : MESSAGES.GIT_REPO_MISSING,
  };
}

async function checkEslintConfigExists(projectRoot: string): Promise<boolean> {
  const possibleConfigs = [
    ".eslintrc.js",
    ".eslintrc.json",
    ".eslintrc.yml",
    ".eslintrc.yaml",
    "eslint.config.js",
    "eslint.config.mjs",
  ];
  for (const config of possibleConfigs) {
    if (await fs.pathExists(path.join(projectRoot, config))) {
      return true;
    }
  }
  return false;
}

function generateSuggestions(authModules: string[], databaseModules: string[]): string[] {
  const suggestions: string[] = [];

  // Show suggestions based on what's missing
  if (authModules.length === 0) {
    suggestions.push("stackkit add auth     - Add authentication module");
  }
  if (databaseModules.length === 0) {
    suggestions.push("stackkit add db       - Add database module");
  }

  // Always show available commands
  suggestions.push("stackkit list         - View available modules");

  return suggestions;
}

function printDoctorReport(report: DoctorReport, verbose: boolean): void {
  logger.header("🔍 StackKit Doctor Report");
  logger.newLine();

  // Project info
  logger.log(chalk.bold("Project"));
  logger.log(`  Type: ${report.project.type}`);
  logger.log(`  Root: ${report.project.root}`);
  logger.log(`  Package Manager: ${report.project.packageManager}`);
  logger.newLine();

  // Runtime
  logger.log(chalk.bold("Runtime"));
  if (report.runtime.nodeVersionStatus === "success") {
    logger.success(`Node.js: ${report.runtime.nodeVersion}`);
  } else if (report.runtime.nodeVersionStatus === "warning") {
    logger.warn(`Node.js: ${report.runtime.nodeVersion}`);
  } else {
    logger.error(`Node.js: ${report.runtime.nodeVersion}`);
  }
  logger.newLine();

  // Modules
  logger.log(chalk.bold("Modules"));
  if (report.modules.auth.length > 0) {
    logger.log(`  Auth: ${report.modules.auth.join(", ")}`);
  } else {
    logger.info("Auth: None");
  }
  if (report.modules.database.length > 0) {
    logger.log(`  Database: ${report.modules.database.join(", ")}`);
  } else {
    logger.info("Database: None");
  }
  logger.newLine();

  // Files
  logger.log(chalk.bold("Files"));
  if (report.files.envExample) {
    logger.success(MESSAGES.ENV_EXAMPLE_FOUND);
  } else {
    logger.warn(MESSAGES.ENV_EXAMPLE_MISSING);
    logger.log("  Hint: Helps other developers understand required environment variables");
  }

  if (report.files.env) {
    logger.success(MESSAGES.ENV_FOUND);
  } else {
    logger.warn(MESSAGES.ENV_MISSING);
    logger.log("  Hint: Required for local development and production deployment");
  }

  if (report.files.prismaSchema !== undefined) {
    if (report.files.prismaSchema) {
      logger.success(MESSAGES.PRISMA_SCHEMA_FOUND);
    } else {
      logger.error(MESSAGES.PRISMA_SCHEMA_MISSING);
      logger.log("  Hint: Defines your database schema and is required for Prisma to work");
    }
  }

  if (report.files.authRoutes !== undefined) {
    if (report.files.authRoutes) {
      logger.success(MESSAGES.AUTH_ROUTES_FOUND);
    } else {
      logger.warn(MESSAGES.AUTH_ROUTES_MISSING);
      logger.log("  Hint: Authentication routes handle login/logout flows");
    }
  }

  if (report.files.tsconfig !== undefined) {
    if (report.files.tsconfig) {
      logger.success(MESSAGES.TSCONFIG_FOUND);
    } else {
      logger.error(MESSAGES.TSCONFIG_MISSING);
      logger.log("  Hint: Required for TypeScript compilation");
    }
  }

  if (report.files.eslintConfig !== undefined) {
    if (report.files.eslintConfig) {
      logger.success(MESSAGES.ESLINT_CONFIG_FOUND);
    } else {
      logger.warn(MESSAGES.ESLINT_CONFIG_MISSING);
      logger.log("  Hint: Helps maintain code quality");
    }
  }

  if (report.files.git !== undefined) {
    if (report.files.git) {
      logger.success(MESSAGES.GIT_REPO_FOUND);
    } else {
      logger.warn(MESSAGES.GIT_REPO_MISSING);
      logger.log("  Hint: Recommended for version control");
    }
  }
  logger.newLine();

  // Dependencies
  if (report.dependencies.outdated.length > 0) {
    logger.log(chalk.bold("Dependencies"));
    logger.warn(MESSAGES.DEPENDENCY_OUTDATED(report.dependencies.outdated));
    logger.log("  Hint: Run package manager update command");
    logger.newLine();
  }

  // Environment
  if (report.env.missing.length > 0 || report.env.present.length > 0) {
    logger.log(chalk.bold("Environment Variables"));
    if (report.env.present.length > 0) {
      logger.success(MESSAGES.ENV_VARS_PRESENT(report.env.present));
    }
    if (report.env.missing.length > 0) {
      logger.error(MESSAGES.ENV_VARS_MISSING(report.env.missing));
    }
    logger.newLine();
  }

  // Conflicts
  if (report.conflicts.length > 0) {
    logger.log(chalk.bold("Conflicts"));
    report.conflicts.forEach((conflict) => {
      logger.warn(conflict);
    });
    logger.newLine();
  }

  // Detailed checks if verbose
  if (verbose) {
    logger.log(chalk.bold("Detailed Checks"));
    report.checks.forEach((check) => {
      if (check.status === "success") {
        logger.success(check.message);
      } else if (check.status === "warning") {
        logger.warn(check.message);
      } else {
        logger.error(check.message);
      }
      if (check.details) {
        logger.log(`    ${chalk.gray(check.details)}`);
      }
    });
    logger.newLine();
  }

  // Summary
  logger.log(chalk.bold("Summary"));
  logger.log(`  Errors: ${report.summary.errors}`);
  logger.log(`  Warnings: ${report.summary.warnings}`);
  logger.newLine();

  if (report.summary.suggestions.length > 0) {
    logger.log(chalk.bold("Suggestions"));
    report.summary.suggestions.forEach((suggestion) => {
      logger.log(`  • ${suggestion}`);
    });
  }
}
