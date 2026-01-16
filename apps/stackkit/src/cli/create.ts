import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import validateNpmPackageName from "validate-npm-package-name";
import { initGit } from "../lib/git-utils";
import { convertToJavaScript } from "../lib/conversion/js-conversion";
import { installDependencies } from "../lib/pm/package-manager";
import { logger } from "../lib/ui/logger";
import { FrameworkUtils } from "../lib/framework/framework-utils";
import { discoverModules, getValidDatabaseOptions, getValidAuthOptions, parseDatabaseOption, getCompatibleAuthOptions } from "../lib/discovery/module-discovery";
import { AdvancedCodeGenerator } from "../lib/generation/code-generator";

interface ProjectConfig {
  projectName: string;
  framework: "nextjs" | "express" | "react";
  database: "prisma" | "mongoose" | "none";
  prismaProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth: "better-auth" | "authjs" | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

interface Answers {
  projectName?: string;
  framework: "nextjs" | "express" | "react";
  database?: "prisma" | "mongoose" | "none";
  prismaProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth?: "better-auth" | "authjs" | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

interface CliOptions {
  framework?: string;
  f?: string;
  database?: string;
  d?: string;
  auth?: string;
  a?: string;
  language?: string;
  l?: string;
  packageManager?: string;
  p?: string;
  install?: boolean;
  'skip-install'?: boolean;
  skipInstall?: boolean;
  git?: boolean;
  'no-git'?: boolean;
  noGit?: boolean;
  yes?: boolean;
  y?: boolean;
}

export async function createProject(projectName?: string, options?: CliOptions): Promise<void> {
  logger.newLine();
  logger.log(chalk.bold.cyan("📦 Create StackKit App"));
  logger.newLine();

  const config = await getProjectConfig(projectName, options);

  const targetDir = path.join(process.cwd(), config.projectName);
  if (await fs.pathExists(targetDir)) {
    logger.error(`Directory "${config.projectName}" already exists`);
    logger.log(chalk.gray("Please choose a different name or remove the existing directory.\n"));
    process.exit(1);
  }

  await generateProject(config, targetDir, options);

  showNextSteps(config);
}

async function getProjectConfig(projectName?: string, options?: CliOptions): Promise<ProjectConfig> {
  // Resolve modules directory (dist first, then package root)
  const modulesCandidates = [
    path.join(__dirname, "..", "..", "..", "modules"),
    path.join(__dirname, "..", "..", "..", "..", "modules"),
  ];

  let modulesDir: string | undefined;
  for (const c of modulesCandidates) {
    if (await fs.pathExists(c)) {
      modulesDir = c;
      break;
    }
  }

  const discoveredModules = await discoverModules(modulesDir || modulesCandidates[1]);

  // Detect flags or `--yes` after `create`; project-name-only remains interactive
  const argv = process.argv.slice(2);
  const createIndex = argv.indexOf('create');
  const argsAfterCreate = createIndex >= 0 ? argv.slice(createIndex + 1) : [];
  const flagsProvided = argsAfterCreate.some(arg => arg.startsWith('-'));
  const optionsProvided = flagsProvided || !!(options && (options.yes || options.y));

  if (optionsProvided) {
    if ((options && (options.yes || options.y))) {
      return {
        projectName: projectName || "my-app",
        framework: "nextjs",
        database: "prisma",
        prismaProvider: "postgresql",
        auth: "better-auth",
        language: "typescript",
        packageManager: "pnpm",
      };
    }
    // Validate options using discovered modules (if any discovered)
    const framework = (options && (options.framework || options.f)) || undefined;
    if (discoveredModules.frameworks && discoveredModules.frameworks.length > 0) {
      const validFrameworks = discoveredModules.frameworks.map(f => f.name);
      if (framework && !validFrameworks.includes(framework)) {
        throw new Error(`Invalid framework: ${framework}. Valid options: ${validFrameworks.join(', ')}`);
      }
    }

    const db = (options && (options.database || options.d)) || undefined;
    let allValidDatabases: string[] = [];
    if (discoveredModules.databases && discoveredModules.databases.length > 0) {
      const validDatabases = getValidDatabaseOptions(discoveredModules.databases);
      // Also allow base database names like 'prisma', 'mongoose'
      const validBaseDatabases = discoveredModules.databases.map(db => db.name);
      allValidDatabases = [...validDatabases, ...validBaseDatabases];
      if (db && !allValidDatabases.includes(db)) {
        throw new Error(`Invalid database: ${db}. Valid options: ${allValidDatabases.filter((v, i, arr) => arr.indexOf(v) === i).join(', ')}`);
      }
    }

    const authOpt = (options && (options.auth || options.a)) || undefined;
    if (discoveredModules.auth && discoveredModules.auth.length > 0) {
      const validAuth = getValidAuthOptions(discoveredModules.auth);
      if (authOpt && !validAuth.includes(authOpt)) {
        throw new Error(`Invalid auth: ${authOpt}. Valid options: ${validAuth.join(', ')}`);
      }
    }

    const validLanguages = ['typescript', 'javascript'];
    const language = (options && (options.language || options.l)) || undefined;
    if (language && !validLanguages.includes(language)) {
      throw new Error(`Invalid language: ${language}. Valid options: ${validLanguages.join(', ')}`);
    }

    const validPackageManagers = ['pnpm', 'npm', 'yarn', 'bun'];
    const pm = (options && (options.packageManager || options.p)) || undefined;
    if (pm && !validPackageManagers.includes(pm)) {
      throw new Error(`Invalid package manager: ${pm}. Valid options: ${validPackageManagers.join(', ')}`);
    }

    let database: "prisma" | "mongoose" | "none" = "none";
    let prismaProvider: "postgresql" | "mongodb" | "mysql" | "sqlite" | undefined;

    if (db && db !== "none") {
      const parsed = parseDatabaseOption(db);
      database = parsed.database as "prisma" | "mongoose";
      prismaProvider = parsed.provider as "postgresql" | "mongodb" | "mysql" | "sqlite";
    }

    let auth: "better-auth" | "authjs" | "none" = "none";
    if (authOpt && authOpt !== "none") {
      auth = authOpt as "better-auth" | "authjs";
    }

    const finalFramework = (framework || "nextjs") as "nextjs" | "express" | "react";

    // Validate auth compatibility
    if (auth === "authjs" && (database !== "prisma" || finalFramework !== "nextjs")) {
      throw new Error("Auth.js is only supported with Next.js and Prisma database");
    }
    if (auth === "better-auth" && database === "none" && finalFramework !== "react") {
      throw new Error("Better Auth requires a database for server frameworks");
    }

    return {
      projectName: projectName || "my-app",
      framework: finalFramework,
      database,
      prismaProvider,
      auth,
      language: (language || "typescript") as "typescript" | "javascript",
      packageManager: (pm || "pnpm") as "pnpm" | "npm" | "yarn" | "bun",
    };
  }
  // Interactive prompts
  const answers = (await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: projectName || "my-app",
      when: !projectName,
      validate: (input: string) => {
        const validation = validateNpmPackageName(input);
        if (!validation.validForNewPackages) {
          return validation.errors?.[0] || "Invalid package name";
        }
        if (fs.existsSync(path.join(process.cwd(), input))) {
          return "Directory already exists";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "framework",
      message: "Select framework:",
      choices: discoveredModules.frameworks.map(f => ({
        name: f.displayName,
        value: f.name
      })),
    },
    {
      type: "list",
      name: "database",
      message: "Select database/ORM:",
      when: (answers: Answers) => answers.framework !== "react",
      choices: [
        { name: "Prisma", value: "prisma" },
        { name: "Mongoose", value: "mongoose" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "prismaProvider",
      message: "Select database provider for Prisma:",
      when: (answers: Answers) => answers.database === "prisma",
      choices: [
        { name: "PostgreSQL", value: "postgresql" },
        { name: "MongoDB", value: "mongodb" },
        { name: "MySQL", value: "mysql" },
        { name: "SQLite", value: "sqlite" },
      ],
    },
    {
      type: "list",
      name: "auth",
      message: "Select authentication:",
      when: (answers: Answers) => (answers.database !== "none" || answers.framework === "react"),
      choices: (answers: Answers) => getCompatibleAuthOptions(
        discoveredModules.auth,
        answers.framework,
        answers.database || "none"
      ),
    },
    {
      type: "list",
      name: "language",
      message: "Language:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" },
      ],
      default: "typescript",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Package manager:",
      choices: [
        { name: "pnpm (recommended)", value: "pnpm" },
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: "pnpm",
    },
  ])) as Answers;

  return {
    projectName: (projectName || answers.projectName) as string,
    framework: answers.framework,
    database: (answers.framework === "react"
      ? "none"
      : answers.database) as ProjectConfig["database"],
    prismaProvider: answers.prismaProvider as "postgresql" | "mongodb" | "mysql" | "sqlite" | undefined,
    auth: (answers.auth || "none"),
    language: answers.language,
    packageManager: answers.packageManager,
  };
}

async function generateProject(config: ProjectConfig, targetDir: string, options?: CliOptions): Promise<void> {
  const copySpinner = logger.startSpinner("Creating project files...");
  let postInstallCommands: string[] = [];
  try {
    postInstallCommands = await composeTemplate(config, targetDir);
    copySpinner.succeed("Project files created");
  } catch (error) {
    copySpinner.fail("Failed to create project files");
    throw error;
  }

  // Install dependencies
  if (options?.install !== false && !(options?.['skip-install'] || options?.skipInstall)) {
    const installSpinner = logger.startSpinner("Installing dependencies...");
    try {
      await installDependencies(targetDir, config.packageManager);
      installSpinner.succeed("Dependencies installed");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      throw error;
    }
  }

  // Run post-install commands (skip if install was skipped)
  if (postInstallCommands.length > 0 && options?.install !== false && !(options?.['skip-install'] || options?.skipInstall)) {
    const postInstallSpinner = logger.startSpinner("Running post-install commands...");
    try {
      for (const command of postInstallCommands) {
        execSync(command, { cwd: targetDir, stdio: "pipe" });
      }
      postInstallSpinner.succeed("Post-install commands completed");
    } catch (error) {
      postInstallSpinner.fail("Failed to run post-install commands");
      throw error;
    }
  }

  // Initialize git
  if (options?.git !== false && !(options?.['no-git'] || options?.noGit)) {
    const gitSpinner = logger.startSpinner("Initializing git repository...");
    try {
      await initGit(targetDir);
      gitSpinner.succeed("Git repository initialized");
    } catch {
      gitSpinner.warn("Failed to initialize git repository");
    }
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<string[]> {
  // Resolve templates/modules paths
  const templatesCandidates = [
    path.join(__dirname, "..", "..", "..", "templates"),
    path.join(__dirname, "..", "..", "..", "..", "templates"),
  ];
  const modulesCandidates2 = [
    path.join(__dirname, "..", "..", "..", "modules"),
    path.join(__dirname, "..", "..", "..", "..", "modules"),
  ];

  const templatesDir = (await (async () => { for (const c of templatesCandidates) if (await fs.pathExists(c)) return c; return templatesCandidates[1]; })());
  const modulesDirForGenerator = (await (async () => { for (const c of modulesCandidates2) if (await fs.pathExists(c)) return c; return modulesCandidates2[1]; })());

  await fs.ensureDir(targetDir);

  // Load framework configuration
  const frameworkConfig = await FrameworkUtils.loadFrameworkConfig(config.framework, templatesDir);

  // Initialize advanced code generator
  const generator = new AdvancedCodeGenerator(frameworkConfig);
  await generator.loadGenerators(modulesDirForGenerator);

  // Generate project using advanced code generator
  const features: string[] = [];

  const postInstallCommands = await generator.generate(
    {
      framework: config.framework,
      database: config.database === 'none' ? undefined : config.database,
      auth: config.auth === 'none' ? undefined : config.auth,
      prismaProvider: config.prismaProvider,
    },
    features,
    targetDir
  );

  // Update project name in package.json
  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Ensure .env exists: if .env.example was copied from the template, create .env from it
  try {
    const envExamplePath = path.join(targetDir, ".env.example");
    const envPath = path.join(targetDir, ".env");
    if ((await fs.pathExists(envExamplePath)) && !(await fs.pathExists(envPath))) {
      const envContent = await fs.readFile(envExamplePath, "utf-8");
      await fs.writeFile(envPath, envContent);
    }
  } catch {
    // non-fatal
  }

  if (config.language === "javascript") {
    await convertToJavaScript(targetDir, config.framework);
  }

  // For now, return empty array as post-install commands are handled by the generator
  return postInstallCommands;
}

function showNextSteps(config: ProjectConfig): void {
  logger.newLine();
  logger.success(`Created ${config.projectName}`);
  logger.newLine();
  logger.log("Next steps:");
  logger.log(`  cd ${config.projectName}`);
  logger.log(`  ${config.packageManager} run dev`);
  logger.newLine();
}
