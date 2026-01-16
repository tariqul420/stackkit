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

interface AddOptions {
  provider?: string;
  force?: boolean;
  dryRun?: boolean;
  install?: boolean;
}

export async function addCommand(module: string, options: AddOptions): Promise<void> {
  try {
    const projectRoot = process.cwd();

    const spinner = logger.startSpinner("Detecting project...");
    const projectInfo = await detectProjectInfo(projectRoot);
    spinner.succeed(
      `Detected ${projectInfo.framework} (${projectInfo.router} router, ${projectInfo.language})`,
    );

    const moduleMetadata = await loadModuleMetadata(path.join(getPackageRoot(), "modules"), module, options.provider);

    if (!moduleMetadata) {
      logger.error(`Module "${module}" not found`);
      process.exit(1);
    }

    let selectedProvider = options.provider;
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

    if (!moduleMetadata.supportedFrameworks.includes(projectInfo.framework)) {
      logger.error(
        `Module "${module}" does not support ${projectInfo.framework}. Supported: ${moduleMetadata.supportedFrameworks.join(", ")}`,
      );
      process.exit(1);
    }

    if (module === "auth" && projectInfo.hasAuth && !options.force) {
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
        process.exit(0);
      }
    }

    if (options.dryRun) {
      logger.warn("Dry run mode - no changes will be made");
      logger.newLine();
    }

    await applyModulePatches(projectRoot, projectInfo, moduleMetadata, path.join(getPackageRoot(), "modules"), module, options);

    if (moduleMetadata.frameworkPatches && !options.dryRun) {
      await applyFrameworkPatches(
        projectRoot,
        moduleMetadata.frameworkPatches,
        projectInfo.framework,
      );
    }

    if (moduleMetadata.postInstall && moduleMetadata.postInstall.length > 0 && !options.dryRun) {
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

    if (Object.keys(mergedDeps).length > 0 && options.install !== false) {
      const deps = Object.entries(mergedDeps).map(([name, version]) => `${name}@${version}`);
      if (!options.dryRun) {
        await addDependencies(projectRoot, projectInfo.packageManager, deps, false);
      } else {
        logger.info(`Would add dependencies: ${deps.join(", ")}`);
      }
    }

    if (Object.keys(mergedDevDeps).length > 0 && options.install !== false) {
      const devDeps = Object.entries(mergedDevDeps).map(([name, version]) => `${name}@${version}`);
      if (!options.dryRun) {
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
      if (!options.dryRun) {
        await addEnvVariables(projectRoot, processedEnvVars, { force: options.force });
      } else {
        logger.log(`  ${chalk.dim("~")} .env.example`);
      }
    }

    logger.newLine();
    logger.success(`Added ${chalk.bold(moduleMetadata.displayName)}`);
    logger.newLine();

    if (moduleMetadata.envVars && moduleMetadata.envVars.some((v) => v.required)) {
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

        if (!provider && metadata.category === moduleName) {
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
    // Merge envVars, dependencies, etc.
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
    if (generator.scripts) {
      // Perhaps add to metadata, but currently not used
    }
    // For operations, perhaps add to patches or something, but for now, keep manual
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
