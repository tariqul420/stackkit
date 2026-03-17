import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import path from "path";
import prompts from "prompts";
import validateNpmPackageName from "validate-npm-package-name";
import { convertToJavaScript } from "../lib/conversion/js-conversion";
import {
  discoverModules,
  getCompatibleAuthOptions,
  getDatabaseChoices,
  getValidAuthOptions,
  getValidDatabaseOptions,
} from "../lib/discovery/module-discovery";
import { getPrismaProvidersFromGenerator, parseDatabaseOption } from "../lib/discovery/shared";
import { addEnvVariables } from "../lib/env/env-editor";
import { FrameworkUtils } from "../lib/framework/framework-utils";
import { AdvancedCodeGenerator } from "../lib/generation/code-generator";
import { initGit, installDependencies } from "../lib/pm/package-manager";
import { logger } from "../lib/ui/logger";
import { getPackageRoot } from "../lib/utils/package-root";

interface ProjectConfig {
  projectName: string;
  framework: string;
  database: string;
  prismaProvider?: string;
  auth: string;
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
  "skip-install"?: boolean;
  skipInstall?: boolean;
  git?: boolean;
  "no-git"?: boolean;
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

  await processGeneratorEnvVars(config, targetDir);

  showNextSteps(config);
}

async function getProjectConfig(
  projectName?: string,
  options?: CliOptions,
): Promise<ProjectConfig> {
  const modulesDir = path.join(getPackageRoot(), "modules");

  const discoveredModules = await discoverModules(modulesDir);

  const argv = process.argv.slice(2);
  const createIndex = argv.indexOf("create");
  const argsAfterCreate = createIndex >= 0 ? argv.slice(createIndex + 1) : [];
  const flagsProvided = argsAfterCreate.some((arg) => arg.startsWith("-"));
  const optionsProvided = flagsProvided || !!(options && (options.yes || options.y));

  if (optionsProvided) {
    if (options && (options.yes || options.y) && !flagsProvided) {
      const defaultFramework =
        discoveredModules.frameworks && discoveredModules.frameworks.length > 0
          ? discoveredModules.frameworks[0].name
          : "";

      const defaultDatabase =
        discoveredModules.databases && discoveredModules.databases.length > 0
          ? discoveredModules.databases[0].name
          : "none";

      const prismaProviders = getPrismaProvidersFromGenerator(getPackageRoot());
      const defaultPrismaProvider = prismaProviders.length > 0 ? prismaProviders[0] : undefined;

      const defaultAuth =
        discoveredModules.auth && discoveredModules.auth.length > 0
          ? discoveredModules.auth[0].name
          : "none";

      return {
        projectName: projectName || "my-app",
        framework: defaultFramework as string,
        database: defaultDatabase,
        prismaProvider: defaultPrismaProvider,
        auth: defaultAuth,
        language: "typescript",
        packageManager: "pnpm",
      };
    }
    const framework = (options && (options.framework || options.f)) || undefined;
    if (discoveredModules.frameworks && discoveredModules.frameworks.length > 0) {
      const validFrameworks = discoveredModules.frameworks.map((f) => f.name);
      if (framework && !validFrameworks.includes(framework)) {
        throw new Error(
          `Invalid framework: ${framework}. Valid options: ${validFrameworks.join(", ")}`,
        );
      }
    }

    const db = (options && (options.database || options.d)) || undefined;
    let allValidDatabases: string[] = [];
    if (discoveredModules.databases && discoveredModules.databases.length > 0) {
      const validDatabases = getValidDatabaseOptions(discoveredModules.databases);
      const validBaseDatabases = discoveredModules.databases.map((db) => db.name);
      allValidDatabases = [...validDatabases, ...validBaseDatabases];
      if (db && !allValidDatabases.includes(db)) {
        throw new Error(
          `Invalid database: ${db}. Valid options: ${allValidDatabases.filter((v, i, arr) => arr.indexOf(v) === i).join(", ")}`,
        );
      }
    }

    const authOpt = (options && (options.auth || options.a)) || undefined;
    if (discoveredModules.auth && discoveredModules.auth.length > 0) {
      const validAuth = getValidAuthOptions(discoveredModules.auth);
      if (authOpt && !validAuth.includes(authOpt)) {
        throw new Error(`Invalid auth: ${authOpt}. Valid options: ${validAuth.join(", ")}`);
      }
    }

    const validLanguages = ["typescript", "javascript"];
    const language = (options && (options.language || options.l)) || undefined;
    if (language && !validLanguages.includes(language)) {
      throw new Error(`Invalid language: ${language}. Valid options: ${validLanguages.join(", ")}`);
    }

    const validPackageManagers = ["pnpm", "npm", "yarn", "bun"];
    const pm = (options && (options.packageManager || options.p)) || undefined;
    if (pm && !validPackageManagers.includes(pm)) {
      throw new Error(
        `Invalid package manager: ${pm}. Valid options: ${validPackageManagers.join(", ")}`,
      );
    }

    let database: string = "none";
    let prismaProvider: string | undefined;

    if (db && db !== "none") {
      const parsed = parseDatabaseOption(db);
      database = parsed.database;
      prismaProvider = parsed.provider;
    }

    let auth: string = "none";
    if (authOpt && authOpt !== "none") {
      auth = authOpt;
    }

    const finalFramework = (framework || (discoveredModules.frameworks[0]?.name ?? "")) as string;

    if (auth && auth !== "none" && discoveredModules.auth) {
      const authMeta = discoveredModules.auth.find((a) => a.name === auth);
      if (authMeta) {
        if (
          authMeta.supportedFrameworks &&
          !authMeta.supportedFrameworks.includes(finalFramework)
        ) {
          throw new Error(`${authMeta.displayName || auth} is not supported on ${finalFramework}`);
        }

        const dbName = database === "prisma" ? "prisma" : database === "none" ? "none" : "other";
        if (
          authMeta.compatibility &&
          authMeta.compatibility.databases &&
          !authMeta.compatibility.databases.includes(dbName)
        ) {
          throw new Error(
            `${authMeta.displayName || auth} is not compatible with the selected database configuration`,
          );
        }
      }
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

  const prismaProviders = getPrismaProvidersFromGenerator(getPackageRoot());

  // Sequential prompts using `prompts` to avoid bundling heavy inquirer code
  const result: Partial<ProjectConfig & { prismaProvider?: string }> = {};
  type Choice = { title?: string; name?: string; value?: string };

  if (!projectName) {
    const resp = await prompts({
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: projectName || "my-app",
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
    });
    result.projectName = resp.projectName || projectName || "my-app";
  } else {
    result.projectName = projectName;
  }

  // framework
  const frameworkChoices =
    discoveredModules.frameworks && discoveredModules.frameworks.length > 0
      ? discoveredModules.frameworks.map((f) => ({ title: f.displayName, value: f.name }))
      : (() => {
          try {
            const templatesDir = path.join(getPackageRoot(), "templates");
            if (fs.existsSync(templatesDir)) {
              const dirs = fs.readdirSync(templatesDir).filter((d) => d !== "node_modules");
              return dirs.map((d) => ({ title: d.charAt(0).toUpperCase() + d.slice(1), value: d }));
            }
          } catch {
            return [] as { title: string; value: string }[];
          }
          return [] as { title: string; value: string }[];
        })();

  const fw = await prompts({
    type: "select",
    name: "framework",
    message: "Select framework:",
    choices: frameworkChoices,
  });
  result.framework = fw.framework || (discoveredModules.frameworks?.[0]?.name ?? "");

  // database (skip for react)
  if (result.framework !== "react") {
    const dbChoices: Choice[] =
      discoveredModules.databases && discoveredModules.databases.length > 0
        ? getDatabaseChoices(discoveredModules.databases, result.framework || "")
        : (() => {
            try {
              const modulesDir = path.join(getPackageRoot(), "modules", "database");
              if (fs.existsSync(modulesDir)) {
                const dbs = fs
                  .readdirSync(modulesDir)
                  .map((d) => ({ title: d.charAt(0).toUpperCase() + d.slice(1), value: d }));
                dbs.push({ title: "None", value: "none" });
                return dbs;
              }
            } catch {
              return [{ title: "None", value: "none" }];
            }
            return [{ title: "None", value: "none" }];
          })();

    const dbChoicesNormalized = dbChoices.map((c: Choice) => ({
      title: c.name || c.title || String(c.value ?? ""),
      value: c.value ?? String(c.title ?? ""),
    }));
    const dbResp = await prompts({
      type: "select",
      name: "database",
      message: "Select database/ORM:",
      choices: dbChoicesNormalized,
    });
    result.database = (dbResp as { database?: string }).database || "none";
  } else {
    result.database = "none";
  }

  // prisma provider
  if (result.database === "prisma" && prismaProviders.length > 0) {
    const pp = await prompts({
      type: "select",
      name: "prismaProvider",
      message: "Select database provider for Prisma:",
      choices: prismaProviders.map((p: string) => ({
        title: p.charAt(0).toUpperCase() + p.slice(1),
        value: p,
      })),
    });
    result.prismaProvider = (pp as { prismaProvider?: string }).prismaProvider;
  }

  // auth
  if (result.database !== "none" || result.framework === "react") {
    const authChoices = getCompatibleAuthOptions(
      discoveredModules.auth,
      result.framework || "",
      result.database || "none",
      discoveredModules.frameworks,
    );
    const authChoicesNormalized = (authChoices || []).map(
      (c: { name?: string; value?: string }) => ({
        title: c.name || String(c.value ?? ""),
        value: c.value ?? String(c.name ?? ""),
      }),
    );
    const authResp = await prompts({
      type: "select",
      name: "auth",
      message: "Select authentication:",
      choices: authChoicesNormalized,
    });
    result.auth = (authResp as { auth?: string }).auth || "none";
  } else {
    result.auth = "none";
  }

  const langResp = await prompts({
    type: "select",
    name: "language",
    message: "Language:",
    choices: [
      { title: "TypeScript", value: "typescript" },
      { title: "JavaScript", value: "javascript" },
    ],
    initial: 0,
  });
  result.language = langResp.language || "typescript";

  const pmResp = await prompts({
    type: "select",
    name: "packageManager",
    message: "Package manager:",
    choices: [
      { title: "pnpm (recommended)", value: "pnpm" },
      { title: "npm", value: "npm" },
      { title: "yarn", value: "yarn" },
      { title: "bun", value: "bun" },
    ],
    initial: 0,
  });
  result.packageManager = pmResp.packageManager || "pnpm";

  // Normalise prisma provider if database string contains prisma-xyz
  let databaseAnswer = result.database;
  let prismaProviderAnswer = result.prismaProvider as string | undefined;
  if (typeof databaseAnswer === "string" && databaseAnswer.startsWith("prisma-")) {
    const parts = databaseAnswer.split("-");
    if (parts.length >= 2) {
      prismaProviderAnswer = parts[1] as string;
      databaseAnswer = "prisma";
    }
  }

  return {
    projectName: (projectName || result.projectName) as string,
    framework: result.framework as string,
    database: databaseAnswer as ProjectConfig["database"],
    prismaProvider: prismaProviderAnswer,
    auth: result.auth || "none",
    language: result.language as "typescript" | "javascript",
    packageManager: result.packageManager as "pnpm" | "npm" | "yarn" | "bun",
  };
}

async function generateProject(
  config: ProjectConfig,
  targetDir: string,
  options?: CliOptions,
): Promise<void> {
  const copySpinner = logger.startSpinner("Creating project files...");
  let postInstallCommands: string[] = [];
  try {
    postInstallCommands = await composeTemplate(config, targetDir);
    copySpinner.succeed("Project files created");
  } catch (error) {
    copySpinner.fail("Failed to create project files");
    throw error;
  }

  if (options?.install !== false && !(options?.["skip-install"] || options?.skipInstall)) {
    const installSpinner = logger.startSpinner("Installing dependencies...");
    try {
      await installDependencies(targetDir, config.packageManager);
      installSpinner.succeed("Dependencies installed");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      throw error;
    }
  }

  if (
    postInstallCommands.length > 0 &&
    options?.install !== false &&
    !(options?.["skip-install"] || options?.skipInstall)
  ) {
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

  if (options?.git !== false && !(options?.["no-git"] || options?.noGit)) {
    try {
      await initGit(targetDir);
    } catch (error) {
      logger.warn(`Failed to initialize git repository: ${(error as Error).message}`);
    }
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<string[]> {
  const packageRoot = getPackageRoot();
  const templatesDir = path.join(packageRoot, "templates");
  const modulesDirForGenerator = path.join(packageRoot, "modules");

  await fs.ensureDir(targetDir);

  const frameworkConfig = await FrameworkUtils.loadFrameworkConfig(config.framework, templatesDir);

  const generator = new AdvancedCodeGenerator(frameworkConfig);
  await generator.loadGenerators(modulesDirForGenerator);

  const features: string[] = [];

  const postInstallCommands = await generator.generate(
    {
      framework: config.framework,
      database: config.database === "none" ? undefined : config.database,
      auth: config.auth === "none" ? undefined : config.auth,
      prismaProvider: config.prismaProvider,
    },
    features,
    targetDir,
  );

  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  try {
    const envExamplePath = path.join(targetDir, ".env.example");
    const envPath = path.join(targetDir, ".env");
    if ((await fs.pathExists(envExamplePath)) && !(await fs.pathExists(envPath))) {
      const envContent = await fs.readFile(envExamplePath, "utf-8");
      await fs.writeFile(envPath, envContent);
    }
  } catch (error) {
    void error;
  }

  if (config.language === "javascript") {
    await convertToJavaScript(targetDir, config.framework);
  }

  return postInstallCommands;
}

async function processGeneratorEnvVars(config: ProjectConfig, targetDir: string): Promise<void> {
  const modulesDir = path.join(getPackageRoot(), "modules");
  const envVars: Array<{ key: string; value: string; required: boolean }> = [];

  if (config.database && config.database !== "none") {
    const dbGeneratorPath = path.join(modulesDir, "database", config.database, "generator.json");
    if (await fs.pathExists(dbGeneratorPath)) {
      const generator = await fs.readJson(dbGeneratorPath);
      if (generator.operations) {
        for (const operation of generator.operations) {
          if (
            operation.type === "add-env" &&
            (!operation.condition || checkCondition(operation.condition, config))
          ) {
            for (const [key, value] of Object.entries(operation.envVars)) {
              envVars.push({
                key,
                value: value as string,
                required: true,
              });
            }
          }
        }
      }
    }
  }

  if (config.auth && config.auth !== "none") {
    const authGeneratorPath = path.join(modulesDir, "auth", config.auth, "generator.json");
    if (await fs.pathExists(authGeneratorPath)) {
      const generator = await fs.readJson(authGeneratorPath);
      if (generator.operations) {
        for (const operation of generator.operations) {
          if (
            operation.type === "add-env" &&
            (!operation.condition || checkCondition(operation.condition, config))
          ) {
            for (const [key, value] of Object.entries(operation.envVars)) {
              envVars.push({
                key,
                value: value as string,
                required: true,
              });
            }
          }
        }
      }
    }
  }

  if (envVars.length > 0) {
    await addEnvVariables(targetDir, envVars, { force: true });
  }
}

function checkCondition(condition: Record<string, unknown>, config: ProjectConfig): boolean {
  for (const [key, value] of Object.entries(condition)) {
    if (Array.isArray(value)) {
      if (!value.includes(config[key as keyof ProjectConfig])) {
        return false;
      }
    } else {
      if (config[key as keyof ProjectConfig] !== value) {
        return false;
      }
    }
  }
  return true;
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
