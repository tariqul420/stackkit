import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { CreateFilePatch, ModuleMetadata, ProjectInfo } from "../types";
import { detectProjectInfo, getLibPath, getRouterBasePath } from "../lib/project/detect";
import { addEnvVariables } from "../lib/env/env-editor";
import { createFile, fileExists } from "../lib/fs/files";
import { logger } from "../lib/ui/logger";
import { addDependencies } from "../lib/pm/package-manager";
import { DATABASE_CONNECTION_STRINGS } from "../lib/database/database-config";
import { getPackageRoot } from "../lib/utils/package-root";

interface AddConfig {
  module: string;
  provider?: string;
  displayName: string;
  metadata: ModuleMetadata;
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

    await addModuleToProject(projectRoot, projectInfo, config, options);

    logger.newLine();
    logger.success(`Added ${chalk.bold(config.displayName)}`);
    logger.newLine();

    if (config.metadata.envVars && config.metadata.envVars.length > 0) {
      logger.log("Next: Fill in environment variables in .env");
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

async function getAddConfig(module?: string, options?: AddOptions, projectInfo?: ProjectInfo): Promise<AddConfig> {
  const modulesDir = path.join(getPackageRoot(), 'modules');

  // Check if options are provided
  const argv = process.argv.slice(2);
  const addIndex = argv.indexOf('add');
  const argsAfterAdd = addIndex >= 0 ? argv.slice(addIndex + 1) : [];
  const flagsProvided = argsAfterAdd.some(arg => arg.startsWith('-'));
  const optionsProvided = flagsProvided || !!(options && (options.yes || options.provider || options.force || options.dryRun));

  if (optionsProvided) {
    // Use provided options
    if (!module) {
      throw new Error("Module name is required when using flags");
    }

    // Handle category names
    if (module === "database" || module === "auth") {
      if (module === "database") {
        if (!options?.provider) {
          throw new Error("Provider is required for database. Use --provider <provider>");
        }
        
        // Handle compound provider names like "prisma-postgresql"
        let baseProvider = options.provider;
        let adapterProvider = options.provider;
        
        if (options.provider.includes('-')) {
          const parts = options.provider.split('-');
          baseProvider = parts[0]; // e.g., "prisma"
          adapterProvider = options.provider; // e.g., "prisma-postgresql"
        }
        
        const moduleMetadata = await loadModuleMetadata(modulesDir, baseProvider, baseProvider);
        if (!moduleMetadata) {
          throw new Error(`Database provider "${baseProvider}" not found`);
        }
        
        // Validate that the adapter exists in databaseAdapters
        if (moduleMetadata.databaseAdapters?.providers && !(adapterProvider in moduleMetadata.databaseAdapters.providers)) {
          throw new Error(`Database adapter "${adapterProvider}" not found for ${baseProvider}`);
        }
        
        return {
          module: "database",
          provider: adapterProvider,
          displayName: `${moduleMetadata.displayName} (${adapterProvider.split('-')[1] || adapterProvider})`,
          metadata: moduleMetadata,
        };
      } else if (module === "auth") {
        const provider = options?.provider || "better-auth";
        const moduleMetadata = await loadModuleMetadata(modulesDir, provider, provider);
        if (!moduleMetadata) {
          throw new Error(`Auth provider "${provider}" not found`);
        }
        return {
          module: "auth",
          provider,
          displayName: moduleMetadata.displayName,
          metadata: moduleMetadata,
        };
      }
    }

    // Handle direct module/provider names
    const moduleMetadata = await loadModuleMetadata(modulesDir, module, options?.provider);

    if (!moduleMetadata) {
      throw new Error(`Module "${module}" not found`);
    }

    let selectedProvider = options?.provider;
    if (!selectedProvider && moduleMetadata.category !== module) {
      // module was a provider name, not category name
      selectedProvider = module;
    }

    if (moduleMetadata.category === "database" && !selectedProvider) {
      if (typeof moduleMetadata.dependencies === "object" && "providers" in moduleMetadata.dependencies) {
        const providers = Object.keys(moduleMetadata.dependencies.providers || {});
        if (providers.length > 0) {
          const { provider } = await inquirer.prompt([
            {
              type: "list",
              name: "provider",
              message: "Select database provider:",
              choices: providers.map((p) => ({ name: p, value: p })),
            },
          ]);
          selectedProvider = provider;
        }
      }
    }

    // Validate compatibility
    if (projectInfo && !moduleMetadata.supportedFrameworks.includes(projectInfo.framework)) {
      throw new Error(`Module "${module}" does not support ${projectInfo.framework}. Supported: ${moduleMetadata.supportedFrameworks.join(", ")}`);
    }

    return {
      module,
      provider: selectedProvider,
      displayName: moduleMetadata.displayName,
      metadata: moduleMetadata,
    };
  }

  // Interactive mode
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "What would you like to add?",
      choices: [
        { name: "Database", value: "database" },
        { name: "Authentication", value: "auth" },
      ],
    },
  ]);

  const category = answers.category;

  if (category === "database") {
    const dbAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "database",
        message: "Select database:",
        choices: [
          { name: "Prisma", value: "prisma" },
          { name: "Mongoose", value: "mongoose" },
        ],
      },
    ]);

    const selectedDb = dbAnswers.database;

    if (selectedDb === "prisma") {
      const providerAnswers = await inquirer.prompt([
        {
          type: "list",
          name: "provider",
          message: "Select Prisma provider:",
          choices: [
            { name: "PostgreSQL", value: "postgresql" },
            { name: "MongoDB", value: "mongodb" },
            { name: "MySQL", value: "mysql" },
            { name: "SQLite", value: "sqlite" },
          ],
        },
      ]);

      return {
        module: "database",
        provider: "prisma",
        displayName: `Prisma (${providerAnswers.provider})`,
        metadata: await loadModuleMetadata(modulesDir, "prisma", "prisma") as ModuleMetadata,
      };
    } else {
      return {
        module: "database",
        provider: "mongoose",
        displayName: "Mongoose (MongoDB)",
        metadata: await loadModuleMetadata(modulesDir, "mongoose", "mongoose") as ModuleMetadata,
      };
    }
  } else if (category === "auth") {
    const authAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "auth",
        message: "Select authentication:",
        choices: [
          { name: "Better Auth", value: "better-auth" },
          { name: "Auth.js", value: "authjs" },
        ],
      },
    ]);

    const selectedAuth = authAnswers.auth;
    const metadata = await loadModuleMetadata(modulesDir, selectedAuth, selectedAuth);

    if (!metadata) {
      throw new Error(`Auth provider "${selectedAuth}" not found`);
    }

    // Validate compatibility
    if (projectInfo && !metadata.supportedFrameworks.includes(projectInfo.framework)) {
      throw new Error(`Auth provider "${selectedAuth}" does not support ${projectInfo.framework}`);
    }

    return {
      module: "auth",
      provider: selectedAuth,
      displayName: selectedAuth === "better-auth" ? "Better Auth" : "Auth.js",
      metadata,
    };
  }

  throw new Error("Invalid selection");
}

async function addModuleToProject(projectRoot: string, projectInfo: ProjectInfo, config: AddConfig, options?: AddOptions): Promise<void> {
  const moduleMetadata = config.metadata;
  const selectedProvider = config.provider;

  // Check for existing auth
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

  if (options?.dryRun) {
    logger.warn("Dry run mode - no changes will be made");
    logger.newLine();
  }

  // Merge dependencies
  const mergedDeps: Record<string, string> = {};
  const mergedDevDeps: Record<string, string> = {};

  if (moduleMetadata.frameworkConfigs?.shared?.dependencies) {
    Object.assign(mergedDeps, moduleMetadata.frameworkConfigs.shared.dependencies);
  }
  if (moduleMetadata.frameworkConfigs?.shared?.devDependencies) {
    Object.assign(mergedDevDeps, moduleMetadata.frameworkConfigs.shared.devDependencies);
  }

  if (selectedProvider && moduleMetadata.databaseAdapters?.providers?.[selectedProvider]?.dependencies) {
    Object.assign(mergedDeps, moduleMetadata.databaseAdapters.providers[selectedProvider].dependencies);
  }
  if (selectedProvider && moduleMetadata.databaseAdapters?.providers?.[selectedProvider]?.devDependencies) {
    Object.assign(mergedDevDeps, moduleMetadata.databaseAdapters.providers[selectedProvider].devDependencies);
  }

  moduleMetadata.dependencies = mergedDeps;
  moduleMetadata.devDependencies = mergedDevDeps;

  const variables: Record<string, string> = {};
  if (selectedProvider) {
    variables.provider = selectedProvider;
    variables.connectionString = DATABASE_CONNECTION_STRINGS[selectedProvider as keyof typeof DATABASE_CONNECTION_STRINGS] || "";
  }

  await applyModulePatches(projectRoot, projectInfo, moduleMetadata, path.join(getPackageRoot(), "modules"), config.module, options || {});

  if (moduleMetadata.frameworkPatches && !options?.dryRun) {
    await applyFrameworkPatches(
      projectRoot,
      moduleMetadata.frameworkPatches,
      projectInfo.framework,
    );
  }

  if (moduleMetadata.postInstall && moduleMetadata.postInstall.length > 0 && !options?.dryRun) {
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

  if (moduleMetadata.envVars && moduleMetadata.envVars.length > 0) {
    const processedEnvVars = moduleMetadata.envVars.map((envVar) => ({
      ...envVar,
      value: envVar.value?.replace(/\{\{(\w+)\}\}/g, (match, key) => variables[key] || match),
    }));
    if (!options?.dryRun) {
      await addEnvVariables(projectRoot, processedEnvVars, { force: options?.force });
    } else {
      logger.log(`  ${chalk.dim("~")} .env.example`);
    }
  }
}

async function loadModuleMetadata(modulesDir: string, moduleName: string, provider?: string): Promise<ModuleMetadata | null> {
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
          return await loadGeneratorAndMerge(metadata, modulePath);
        }

        if (!provider && (metadata.category === moduleName || moduleDir === moduleName)) {
          return await loadGeneratorAndMerge(metadata, modulePath);
        }
      }
    }
  }

  return null;
}

async function loadGeneratorAndMerge(metadata: ModuleMetadata, modulePath: string): Promise<ModuleMetadata> {
  const generatorPath = path.join(modulePath, "generator.json");
  if (await fs.pathExists(generatorPath)) {
    const generator = await fs.readJSON(generatorPath);
    if (generator.envVars) {
      metadata.envVars = metadata.envVars || [];
      for (const [key, value] of Object.entries(generator.envVars)) {
        metadata.envVars.push({ key, value: value as string, description: `Environment variable for ${key}`, required: true });
      }
    }
    if (generator.dependencies) {
      metadata.dependencies = { ...metadata.dependencies, ...generator.dependencies };
    }
    if (generator.devDependencies) {
      metadata.devDependencies = { ...metadata.devDependencies, ...generator.devDependencies };
    }
  }
  return metadata;
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

async function findModulePath(modulesDir: string, moduleName: string, provider?: string): Promise<string | null> {
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
          return modulePath;
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
