import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { CreateFilePatch, ModuleMetadata, ProjectInfo } from "../types";
import {
  AdvancedCodeGenerator,
  Operation,
  TemplateCondition,
} from "../lib/generation/code-generator";
import { detectProjectInfo, getLibPath, getRouterBasePath } from "../lib/project/detect";
import { addEnvVariables } from "../lib/env/env-editor";
import { createFile, fileExists } from "../lib/fs/files";
import { logger } from "../lib/ui/logger";
import { addDependencies, installDependencies } from "../lib/pm/package-manager";
import { getPackageRoot } from "../lib/utils/package-root";
import { FrameworkUtils } from "../lib/framework/framework-utils";
import { mergeGeneratorIntoModuleMetadata } from "../lib/generation/generator-utils";
import { discoverModules, getDatabaseChoices, DiscoveredModules } from "../lib/discovery/module-discovery";

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
    return await getInteractiveConfig(modulesDir, projectInfo);
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
      let baseProvider = options.provider;
      let adapterProvider = options.provider;

      if (options.provider.includes("-")) {
        const parts = options.provider.split("-");
        baseProvider = parts[0]; // e.g., "prisma"
        adapterProvider = options.provider; // e.g., "prisma-postgresql"
      }

      const moduleMetadata = await loadModuleMetadata(modulesDir, baseProvider, baseProvider);
      if (!moduleMetadata) {
        throw new Error(`Database provider "${baseProvider}" not found`);
      }

      return {
        module: "database",
        provider: adapterProvider,
        displayName: `${moduleMetadata.displayName} (${adapterProvider.split("-")[1] || adapterProvider})`,
        metadata: moduleMetadata,
      };
    } else if (module === "auth") {
      const provider = options.provider;
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

  // Unknown module type
  throw new Error(
    `Unknown module type "${module}". Use "database" or "auth", or specify a provider directly.`,
  );
}

async function getInteractiveConfig(
  modulesDir: string,
  projectInfo?: ProjectInfo,
): Promise<AddConfig> {
  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "category",
      message: "What would you like to add?",
      choices: [
        { name: "Database", value: "database" },
        { name: "Auth", value: "auth" },
      ],
    },
  ]);

  const category = answers.category;

  const discovered: DiscoveredModules = await discoverModules(modulesDir);

  if (category === "database") {
    const dbChoices = getDatabaseChoices(discovered.databases || [], projectInfo?.framework || "nextjs");

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

    // Other databases (mongoose, etc.)
    const meta = (await loadModuleMetadata(modulesDir, selectedDb, selectedDb)) as ModuleMetadata;
    if (!meta) throw new Error(`Database provider "${selectedDb}" not found`);

    return {
      module: "database",
      provider: selectedDb,
      displayName: meta.displayName || selectedDb,
      metadata: meta,
    };
  } else if (category === "auth") {
    const authChoices = (discovered.auth || []).map((a) => ({ name: a.displayName, value: a.name }));
    const authAnswers = await inquirer.prompt([
      {
        type: "list",
        name: "auth",
        message: "Select authentication:",
        choices: authChoices,
      },
    ]);

    const selectedAuth = authAnswers.auth as string;
    const metadata = await loadModuleMetadata(modulesDir, selectedAuth, selectedAuth);

    if (!metadata) {
      throw new Error(`Auth provider "${selectedAuth}" not found`);
    }

    if (projectInfo && metadata.supportedFrameworks && !metadata.supportedFrameworks.includes(projectInfo.framework)) {
      throw new Error(`Auth provider "${selectedAuth}" does not support ${projectInfo.framework}`);
    }

    return {
      module: "auth",
      provider: selectedAuth,
      displayName: metadata.displayName || selectedAuth,
      metadata,
    };
  }

  throw new Error("Invalid selection");
}

/* removed unused getProviderConfig — discovery-based flows handle providers */


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
    if (config.module === "database" && config.provider) {
      if (config.provider.startsWith("prisma-")) {
        selectedModules.database = "prisma";
        selectedModules.prismaProvider = config.provider.split("-")[1];
      } else {
        selectedModules.database = config.provider;
      }
    }
    if (config.module === "auth" && config.provider) {
      selectedModules.auth = config.provider;
    }

    const postInstall = await gen.applyToProject(selectedModules, [], projectRoot);
    if (postInstall && postInstall.length > 0 && !options?.dryRun) {
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

    return;
  }

  const mergedDeps: Record<string, string> = {};
  const mergedDevDeps: Record<string, string> = {};

  if (moduleMetadata.frameworkConfigs?.shared?.dependencies) {
    Object.assign(mergedDeps, moduleMetadata.frameworkConfigs.shared.dependencies);
  }
  if (moduleMetadata.frameworkConfigs?.shared?.devDependencies) {
    Object.assign(mergedDevDeps, moduleMetadata.frameworkConfigs.shared.devDependencies);
  }

  // Adapter-specific dependencies are applied via generator metadata; frameworkConfigs still merge above.
  // Do not mutate the loaded module metadata here; use mergedDeps/mergedDevDeps for installation.

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
