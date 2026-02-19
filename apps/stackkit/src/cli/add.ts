import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import {
  DiscoveredModules,
  discoverModules,
  getCompatibleAuthOptions,
  getDatabaseChoices,
} from "../lib/discovery/module-discovery";
import { parseDatabaseOption } from "../lib/discovery/shared";
import { addEnvVariables, type EnvVariable as EnvEditorVar } from "../lib/env/env-editor";
import { FrameworkUtils } from "../lib/framework/framework-utils";
import { createFile, fileExists } from "../lib/fs/files";
import {
  AdvancedCodeGenerator,
  Operation,
  TemplateCondition,
} from "../lib/generation/code-generator";
import { addDependencies, installDependencies } from "../lib/pm/package-manager";
import { detectProjectInfo, getLibPath, getRouterBasePath } from "../lib/project/detect";
import { logger } from "../lib/ui/logger";
import { getPackageRoot } from "../lib/utils/package-root";
import { CreateFilePatch, ModuleMetadata, ProjectInfo } from "../types";

interface AddConfig {
  module: string;
  provider?: string;
  displayName: string;
  metadata: ModuleMetadata;
  preAdded?: AddConfig[];
}

interface AddOptions {
  provider?: string;
  force?: boolean;
  dryRun?: boolean;
  install?: boolean;
  yes?: boolean;
}

export async function addCommand(module?: string, options?: AddOptions): Promise<void> {
  try {
    const projectRoot = process.cwd();

    const spinner = logger.startSpinner("Detecting project...");
    const projectInfo = await detectProjectInfo(projectRoot);
    spinner.succeed(
      `Detected ${projectInfo.framework} (${projectInfo.router} router, ${projectInfo.language})`,
    );

    const config = await getAddConfig(module, options, projectInfo);

    const refreshedProjectInfo = await detectProjectInfo(projectRoot);

    await addModuleToProject(projectRoot, refreshedProjectInfo, config, options);

    logger.newLine();
    if (config.preAdded && config.preAdded.length > 0) {
      const addedNames = [...config.preAdded.map((p) => p.displayName), config.displayName].map(
        (s) => chalk.bold(s),
      );
      logger.success(`Added ${addedNames.join(" and ")}`);
    } else {
      logger.success(`Added ${chalk.bold(config.displayName)}`);
    }
    logger.newLine();
  } catch (error) {
    logger.error(`Failed to add module: ${(error as Error).message}`);
    if (error instanceof Error && error.stack) {
      logger.log(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

async function getAddConfig(
  module?: string,
  options?: AddOptions,
  projectInfo?: ProjectInfo,
): Promise<AddConfig> {
  const modulesDir = path.join(getPackageRoot(), "modules");

  if (!module) {
    return await getInteractiveConfig(modulesDir, projectInfo, options);
  }
  if (module === "database" || module === "auth") {
    if (!options?.provider) {
      if (module === "database") {
        throw new Error(
          "Provider is required for database. Use: `npx stackkit@latest add database --provider <provider>`",
        );
      } else {
        throw new Error(
          "Provider is required for auth. Use: `npx stackkit@latest add auth --provider <provider>`",
        );
      }
    }

    if (module === "database") {
      const parsed = parseDatabaseOption(options.provider || "");
      const baseProvider = parsed.database;
      const adapterProvider = parsed.provider
        ? `${parsed.database}-${parsed.provider}`
        : parsed.database;

      const moduleMetadata = await loadModuleMetadata(modulesDir, baseProvider, baseProvider);
      if (!moduleMetadata) {
        throw new Error(`Database provider "${baseProvider}" not found`);
      }

      return {
        module: "database",
        provider: adapterProvider,
        displayName:
          parsed.database === "prisma" && parsed.provider
            ? `${moduleMetadata.displayName || baseProvider} (${parsed.provider})`
            : moduleMetadata.displayName || baseProvider,
        metadata: moduleMetadata,
      };
    } else if (module === "auth") {
      const provider = options.provider;
      const moduleMetadata = await loadModuleMetadata(modulesDir, provider, provider);
      if (!moduleMetadata) {
        throw new Error(`Auth provider "${provider}" not found`);
      }
      if (projectInfo) {
        if (
          moduleMetadata.supportedFrameworks &&
          !moduleMetadata.supportedFrameworks.includes(projectInfo.framework)
        ) {
          throw new Error(
            `${moduleMetadata.displayName} is not supported on ${projectInfo.framework}`,
          );
        }

        const dbName = projectInfo.hasPrisma
          ? "prisma"
          : projectInfo.hasDatabase
            ? "other"
            : "none";
        if (
          moduleMetadata.compatibility &&
          moduleMetadata.compatibility.databases &&
          !moduleMetadata.compatibility.databases.includes(dbName)
        ) {
          throw new Error(
            `${moduleMetadata.displayName} is not compatible with the project's database configuration`,
          );
        }
      }

      return {
        module: "auth",
        provider,
        displayName: moduleMetadata.displayName || provider,
        metadata: moduleMetadata,
      };
    }
  }

  throw new Error(
    `Unknown module type "${module}". Use "database" or "auth", or specify a provider directly.`,
  );
}

async function getInteractiveConfig(
  modulesDir: string,
  projectInfo?: ProjectInfo,
  options?: AddOptions,
): Promise<AddConfig> {
  const projectRoot = process.cwd();
  const discovered: DiscoveredModules = await discoverModules(modulesDir);

  const defaultFramework =
    (discovered.frameworks && discovered.frameworks[0]?.name) || projectInfo?.framework || "";
  const compatibleAuths = getCompatibleAuthOptions(
    discovered.auth || [],
    projectInfo?.framework || defaultFramework,
    projectInfo?.hasPrisma ? "prisma" : "none",
    discovered.frameworks,
  );

  const categories: Array<{ name: string; value: string }> = [
    { name: "Database", value: "database" },
  ];

  if (compatibleAuths.length > 0) {
    categories.push({ name: "Auth", value: "auth" });
  }

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "What would you like to add?",
      choices: categories,
    },
  ]);

  const category = answers.category;

  if (category === "database") {
    const dbChoices = getDatabaseChoices(
      discovered.databases || [],
      projectInfo?.framework || defaultFramework,
    );

    const dbAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Select database:",
        choices: dbChoices,
      },
    ]);

    const selectedDb = dbAnswers.database as string;

    if (selectedDb.startsWith("prisma-")) {
      const provider = selectedDb.split("-")[1];
      return {
        module: "database",
        provider: `prisma-${provider}`,
        displayName: `Prisma (${provider})`,
        metadata: (await loadModuleMetadata(modulesDir, "prisma", "prisma")) as ModuleMetadata,
      };
    }

    const meta = (await loadModuleMetadata(modulesDir, selectedDb, selectedDb)) as ModuleMetadata;
    if (!meta) throw new Error(`Database provider "${selectedDb}" not found`);

    return {
      module: "database",
      provider: selectedDb,
      displayName: meta.displayName || selectedDb,
      metadata: meta,
    };
  } else if (category === "auth") {
    let preAddedForReturn: AddConfig | undefined;
    if (!projectInfo?.hasDatabase) {
      logger.warn("No database detected in the project. Authentication requires a database.");
      const dbChoices = getDatabaseChoices(
        discovered.databases || [],
        projectInfo?.framework || defaultFramework,
      );
      const dbAnswer = await inquirer.prompt([
        {
          type: "list",
          name: "database",
          message: "Select a database to add before authentication:",
          choices: dbChoices,
        },
      ]);

      const selectedDb = dbAnswer.database as string;
      if (!selectedDb || selectedDb === "none") {
        logger.info("Cancelled — authentication requires a database");
        process.exit(0);
      }

      let dbConfig: AddConfig;
      if (selectedDb.startsWith("prisma-")) {
        const provider = selectedDb.split("-")[1];
        dbConfig = {
          module: "database",
          provider: `prisma-${provider}`,
          displayName: `Prisma (${provider})`,
          metadata: (await loadModuleMetadata(modulesDir, "prisma", "prisma")) as ModuleMetadata,
        };
      } else {
        const meta = (await loadModuleMetadata(
          modulesDir,
          selectedDb,
          selectedDb,
        )) as ModuleMetadata;
        if (!meta) throw new Error(`Database provider "${selectedDb}" not found`);
        dbConfig = {
          module: "database",
          provider: selectedDb,
          displayName: meta.displayName || selectedDb,
          metadata: meta,
        };
      }

      await addModuleToProject(
        projectRoot,
        projectInfo || (await detectProjectInfo(projectRoot)),
        dbConfig,
        options,
      );

      projectInfo = await detectProjectInfo(projectRoot);

      (dbConfig as AddConfig).preAdded = dbConfig.preAdded || [];
      preAddedForReturn = dbConfig;
    }

    const dbString = projectInfo?.hasPrisma ? "prisma" : "none";
    const authChoices = getCompatibleAuthOptions(
      discovered.auth || [],
      projectInfo?.framework || defaultFramework,
      dbString,
    );
    const authAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "auth",
        message: "Select authentication:",
        choices: authChoices,
      },
    ]);

    const selectedAuth = authAnswers.auth as string;
    if (selectedAuth === "none") {
      logger.info("Cancelled");
      process.exit(0);
    }
    const metadata = await loadModuleMetadata(modulesDir, selectedAuth, selectedAuth);

    if (!metadata) {
      throw new Error(`Auth provider "${selectedAuth}" not found`);
    }

    if (
      projectInfo &&
      metadata.supportedFrameworks &&
      !metadata.supportedFrameworks.includes(projectInfo.framework)
    ) {
      throw new Error(`Auth provider "${selectedAuth}" does not support ${projectInfo.framework}`);
    }

    const result: AddConfig = {
      module: "auth",
      provider: selectedAuth,
      displayName: metadata.displayName || selectedAuth,
      metadata,
    };
    if (typeof preAddedForReturn !== "undefined" && preAddedForReturn) {
      result.preAdded = [preAddedForReturn];
    }
    return result;
  }

  throw new Error("Invalid selection");
}

async function addModuleToProject(
  projectRoot: string,
  projectInfo: ProjectInfo,
  config: AddConfig,
  options?: AddOptions,
): Promise<void> {
  const moduleMetadata = config.metadata;
  const selectedProvider = config.provider;

  if (config.module === "auth" && projectInfo.hasAuth && !options?.force) {
    logger.warn("Auth library already detected in this project");
    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Continue anyway? (use --force to skip this prompt)",
        default: false,
      },
    ]);

    if (!proceed) {
      logger.info("Cancelled");
      return;
    }
  }

  if (config.module === "database" && projectInfo.hasDatabase && !options?.force) {
    logger.warn("Database library already detected in this project");
    const { proceed } = await inquirer.prompt([
      {
        type: "confirm",
        name: "proceed",
        message: "Continue anyway? (use --force to skip this prompt)",
        default: false,
      },
    ]);

    if (!proceed) {
      logger.info("Cancelled");
      return;
    }
  }

  if (options?.dryRun) {
    logger.warn("Dry run mode - no changes will be made");
    logger.newLine();
  }

  const moduleBasePath = await findModulePath(
    path.join(getPackageRoot(), "modules"),
    config.module,
    config.provider,
  );
  if (moduleBasePath) {
    const frameworkConfig = await FrameworkUtils.loadFrameworkConfig(
      projectInfo.framework,
      path.join(getPackageRoot(), "templates"),
    );
    const gen = new AdvancedCodeGenerator(frameworkConfig);
    await gen.loadGenerators(path.join(getPackageRoot(), "modules"));

    const moduleName = path.basename(moduleBasePath);
    const available = gen.getAvailableGenerators();
    const alreadyRegistered =
      (config.module === "database" && available.databases.includes(moduleName)) ||
      (config.module === "auth" && available.auths.includes(moduleName));
    if (!alreadyRegistered) {
      const ops: Operation[] = [];
      if (Array.isArray(moduleMetadata.patches)) {
        for (const p of moduleMetadata.patches as Array<CreateFilePatch>) {
          if (p.type === "create-file") {
            ops.push({
              type: "create-file",
              source: p.source,
              destination: p.destination,
              condition: p.condition as unknown as TemplateCondition,
            });
          }
        }
      }

      if (ops.length > 0) {
        gen.registerGenerator(config.module as "database" | "auth" | "framework", moduleName, {
          name: moduleName,
          type: config.module as "database" | "auth" | "framework",
          priority: 0,
          operations: ops,
          dependencies: {},
        });
      }
    }

    const selectedModules: {
      framework: string;
      database?: string;
      auth?: string;
      prismaProvider?: string;
    } = { framework: projectInfo.framework };

    try {
      const pkg = await fs.readJson(path.join(projectRoot, "package.json"));
      const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) } as Record<
        string,
        string
      >;
      if (projectInfo.hasPrisma) {
        selectedModules.database = "prisma";
        const prismaSchema = path.join(projectRoot, "prisma", "schema.prisma");
        if (await fs.pathExists(prismaSchema)) {
          const content = await fs.readFile(prismaSchema, "utf-8");
          const dsMatch = content.match(/datasource\s+\w+\s*\{([\s\S]*?)\}/i);
          if (dsMatch && dsMatch[1]) {
            const provMatch = dsMatch[1].match(/provider\s*=\s*["']([^"']+)["']/i);
            if (provMatch && provMatch[1]) selectedModules.prismaProvider = provMatch[1];
          }
        }
      } else if (deps["mongoose"]) {
        selectedModules.database = "mongoose";
      }
    } catch (error) {
      void error;
    }

    if (config.module === "database" && config.provider) {
      const parsed = parseDatabaseOption(config.provider);
      selectedModules.database = parsed.database;
      if (parsed.database === "prisma" && parsed.provider) {
        selectedModules.prismaProvider = parsed.provider;
      }
    }

    if (config.module === "auth" && config.provider) {
      selectedModules.auth = config.provider;
    }

    const postInstall = await gen.applyToProject(selectedModules, [], projectRoot);

    if (!options?.dryRun && options?.install !== false) {
      const installSpinner = logger.startSpinner("Installing dependencies...");
      try {
        await installDependencies(projectRoot, projectInfo.packageManager);
        installSpinner.succeed("Dependencies installed");
      } catch (err) {
        installSpinner.fail("Failed to install dependencies");
        throw err;
      }
    }

    if (postInstall && postInstall.length > 0 && !options?.dryRun) {
      const createdFiles = gen.getCreatedFiles ? gen.getCreatedFiles() : [];
      if (createdFiles.length === 0) {
        logger.warn(
          "Skipping post-install commands — no files were created by generators to act upon.",
        );
      } else {
        const postInstallSpinner = logger.startSpinner("Running post-install commands...");
        try {
          for (const command of postInstall) {
            execSync(command, { cwd: projectRoot, stdio: "pipe" });
          }
          postInstallSpinner.succeed("Post-install commands completed");
        } catch (error) {
          postInstallSpinner.fail("Failed to run post-install commands");
          throw error;
        }
      }
    }

    return;
  }

  const mergedDeps: Record<string, string> = {};
  const mergedDevDeps: Record<string, string> = {};

  try {
    const shared = (moduleMetadata.frameworkConfigs as unknown as Record<string, unknown>)
      ?.shared as
      | { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
      | undefined;
    if (shared && shared.dependencies) Object.assign(mergedDeps, shared.dependencies);
    if (shared && shared.devDependencies) Object.assign(mergedDevDeps, shared.devDependencies);
  } catch (error) {
    void error;
  }

  const variables: Record<string, string> = {};

  if (selectedProvider) {
    variables.provider = selectedProvider;
  }

  if (moduleMetadata.envVars) {
    const envArray: Array<{ key?: string; value?: string }> = Array.isArray(moduleMetadata.envVars)
      ? (moduleMetadata.envVars as Array<{ key?: string; value?: string }>)
      : Object.entries(moduleMetadata.envVars as Record<string, string>).map(([k, v]) => ({
          key: k,
          value: String(v),
        }));

    for (const ev of envArray) {
      if (ev.key && typeof ev.value === "string") variables[ev.key] = ev.value as string;
    }

    for (let pass = 0; pass < 5; pass++) {
      let changed = false;
      for (const ev of envArray) {
        if (!ev.key || typeof ev.value !== "string") continue;
        const resolved = ev.value.replace(/\{\{(\w+)\}\}/g, (_m, k) => variables[k] ?? _m);
        if (variables[ev.key] !== resolved) {
          variables[ev.key] = resolved;
          changed = true;
        }
      }
      if (!changed) break;
    }
  }

  await applyModulePatches(
    projectRoot,
    projectInfo,
    moduleMetadata,
    path.join(getPackageRoot(), "modules"),
    config.module,
    options || {},
  );

  if (moduleMetadata.frameworkPatches && !options?.dryRun) {
    await applyFrameworkPatches(
      projectRoot,
      moduleMetadata.frameworkPatches,
      projectInfo.framework,
    );
  }

  if (moduleMetadata.postInstall && moduleMetadata.postInstall.length > 0 && !options?.dryRun) {
    const createdFiles: string[] = [];
    if (Array.isArray(moduleMetadata.patches)) {
      for (const p of moduleMetadata.patches) {
        if (p.type === "create-file") {
          const destPath = (p as CreateFilePatch).destination;
          if (typeof destPath === "string") {
            const dest = path.join(projectRoot, destPath);
            if (await fs.pathExists(dest)) createdFiles.push(destPath);
          }
        }
      }
    }

    if (createdFiles.length === 0) {
      logger.warn(
        "Skipping module post-install commands — no files were created by module patches to act upon.",
      );
    } else {
      const postInstallSpinner = logger.startSpinner("Running post-install commands...");
      try {
        for (const command of moduleMetadata.postInstall) {
          execSync(command, { cwd: projectRoot, stdio: "pipe" });
        }
        postInstallSpinner.succeed("Post-install commands completed");
      } catch (error) {
        postInstallSpinner.fail("Failed to run post-install commands");
        throw error;
      }
    }
  }

  if (Object.keys(mergedDeps).length > 0 && options?.install !== false) {
    const deps = Object.entries(mergedDeps).map(([name, version]) => `${name}@${version}`);
    if (!options?.dryRun) {
      await addDependencies(projectRoot, projectInfo.packageManager, deps, false);
    } else {
      logger.info(`Would add dependencies: ${deps.join(", ")}`);
    }
  }

  if (Object.keys(mergedDevDeps).length > 0 && options?.install !== false) {
    const devDeps = Object.entries(mergedDevDeps).map(([name, version]) => `${name}@${version}`);
    if (!options?.dryRun) {
      await addDependencies(projectRoot, projectInfo.packageManager, devDeps, true);
    } else {
      logger.info(`Would add dev dependencies: ${devDeps.join(", ")}`);
    }
  }

  if (moduleMetadata.envVars) {
    let envArray: Array<{ key?: string; value?: string }> = [];
    if (Array.isArray(moduleMetadata.envVars)) {
      envArray = moduleMetadata.envVars as Array<{ key?: string; value?: string }>;
    } else if (typeof moduleMetadata.envVars === "object") {
      envArray = Object.entries(moduleMetadata.envVars as Record<string, string>).map(([k, v]) => ({
        key: k,
        value: String(v),
      }));
    }

    if (envArray.length > 0) {
      const processedEnvVars = envArray.map((envVar) => ({
        key: envVar.key || "",
        value: envVar.value?.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match),
        required: false,
      }));
      if (!options?.dryRun) {
        const envVarsToAdd: EnvEditorVar[] = processedEnvVars.map((e) => ({
          key: e.key,
          value: e.value,
          required: !!e.required,
        }));
        await addEnvVariables(projectRoot, envVarsToAdd, { force: options?.force });
      } else {
        logger.log(`  ${chalk.dim("~")} .env.example`);
      }
    }
  }
}

async function loadModuleMetadata(
  modulesDir: string,
  moduleName: string,
  provider?: string,
): Promise<ModuleMetadata | null> {
  if (!(await fs.pathExists(modulesDir))) {
    return null;
  }

  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    const moduleDirs = await fs.readdir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(categoryPath, moduleDir);
      const moduleStat = await fs.stat(modulePath);

      if (!moduleStat.isDirectory()) continue;

      const metadataPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);

        if (provider && moduleDir === provider) {
          return metadata;
        }

        if (!provider && (metadata.category === moduleName || moduleDir === moduleName)) {
          return metadata;
        }
      }
    }
  }

  return null;
}

async function applyModulePatches(
  projectRoot: string,
  projectInfo: ProjectInfo,
  moduleMetadata: ModuleMetadata,
  modulesDir: string,
  moduleName: string,
  options: AddOptions,
): Promise<void> {
  if (!moduleMetadata.patches || !Array.isArray(moduleMetadata.patches)) {
    return;
  }

  const moduleBasePath = await findModulePath(modulesDir, moduleName, options.provider);

  if (!moduleBasePath) {
    throw new Error("Module files not found");
  }

  for (const patch of moduleMetadata.patches) {
    if (patch.type === "create-file") {
      const filePatch = patch as CreateFilePatch;

      if (filePatch.condition) {
        if (filePatch.condition.router && filePatch.condition.router !== projectInfo.router) {
          continue;
        }
        if (filePatch.condition.language && filePatch.condition.language !== projectInfo.language) {
          continue;
        }
      }

      const sourceFile = path.join(moduleBasePath, "files", filePatch.source);
      let destFile = path.join(projectRoot, filePatch.destination);

      destFile = destFile
        .replace("{{router}}", getRouterBasePath(projectInfo))
        .replace("{{lib}}", getLibPath(projectInfo));

      if (!options.dryRun) {
        if (await fileExists(sourceFile)) {
          const content = await fs.readFile(sourceFile, "utf-8");
          await createFile(destFile, content, { force: options.force });
          const relativePath = path.relative(projectRoot, destFile);
          logger.log(`  ${chalk.green("+")} ${relativePath}`);
        } else {
          logger.warn(`Source file not found: ${filePatch.source}`);
        }
      } else {
        const relativePath = path.relative(projectRoot, destFile);
        logger.log(`  ${chalk.dim("+")} ${relativePath}`);
      }
    }
  }
}

async function findModulePath(
  modulesDir: string,
  moduleName: string,
  provider?: string,
): Promise<string | null> {
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    const moduleDirs = await fs.readdir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(categoryPath, moduleDir);
      const moduleStat = await fs.stat(modulePath);

      if (!moduleStat.isDirectory()) continue;

      const metadataPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);
        if (provider) {
          const baseProvider = String(provider).split("-")[0];
          if (moduleDir === provider || moduleDir === baseProvider) {
            return modulePath;
          }
        }

        if (!provider && metadata.name === moduleName) {
          return modulePath;
        }
      }
    }
  }

  return null;
}
async function applyFrameworkPatches(
  projectRoot: string,
  patches: Record<string, { [file: string]: { merge?: Record<string, unknown> } }>,
  framework: string,
): Promise<void> {
  const frameworkKey = framework;
  const frameworkPatches = patches[frameworkKey];

  if (!frameworkPatches) return;

  for (const [filename, patchConfig] of Object.entries(frameworkPatches)) {
    const filePath = path.join(projectRoot, filename);

    if (await fs.pathExists(filePath)) {
      const fileContent = await fs.readJson(filePath);

      if (patchConfig.merge) {
        const merged = deepMerge(fileContent, patchConfig.merge);
        await fs.writeJson(filePath, merged, { spaces: 2 });
        const relativePath = path.relative(projectRoot, filePath);
        logger.log(`  ${chalk.blue("~")} ${relativePath}`);
      }
    }
  }
}

function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const output = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (target[key]) {
        output[key] = deepMerge(
          target[key] as Record<string, unknown>,
          source[key] as Record<string, unknown>,
        );
      } else {
        output[key] = source[key];
      }
    } else if (Array.isArray(source[key])) {
      output[key] = Array.from(
        new Set([...((target[key] as unknown[]) || []), ...(source[key] as unknown[])]),
      );
    } else {
      output[key] = source[key];
    }
  }

  return output;
}
