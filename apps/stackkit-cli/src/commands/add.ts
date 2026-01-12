import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import path from "path";
import { CreateFilePatch, ModuleMetadata, ProjectInfo } from "../types";
import { detectProjectInfo, getLibPath, getRouterBasePath } from "../utils/detect";
import { addEnvVariables } from "../utils/env-editor";
import { createFile, fileExists } from "../utils/files";
import { logger } from "../utils/logger";
import { addDependencies } from "../utils/package-manager";

interface AddOptions {
  provider?: string;
  force?: boolean;
  dryRun?: boolean;
  install?: boolean;
}

export async function addCommand(module: string, options: AddOptions): Promise<void> {
  try {
    const projectRoot = process.cwd();

    // Detect project info
    const spinner = logger.startSpinner("Detecting project...");
    const projectInfo = await detectProjectInfo(projectRoot);
    spinner.succeed(
      `Detected ${projectInfo.framework} (${projectInfo.router} router, ${projectInfo.language})`,
    );

    // Load module metadata
    const modulesDir = path.join(__dirname, "..", "..", "modules");
    const moduleMetadata = await loadModuleMetadata(modulesDir, module, options.provider);

    if (!moduleMetadata) {
      logger.error(`Module "${module}" not found`);
      process.exit(1);
    }

    // For database modules, ensure provider is selected
    let selectedProvider = options.provider;
    if (moduleMetadata.category === "database" && !selectedProvider) {
      if (
        typeof moduleMetadata.dependencies === "object" &&
        "providers" in moduleMetadata.dependencies
      ) {
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

    // Merge dependencies based on provider
    const mergedDeps: Record<string, string> = {};
    const mergedDevDeps: Record<string, string> = {};

    if (
      typeof moduleMetadata.dependencies === "object" &&
      !("common" in moduleMetadata.dependencies)
    ) {
      // Already flat
      Object.assign(mergedDeps, moduleMetadata.dependencies);
    } else if (
      typeof moduleMetadata.dependencies === "object" &&
      "common" in moduleMetadata.dependencies
    ) {
      Object.assign(mergedDeps, moduleMetadata.dependencies.common);
      if (
        selectedProvider &&
        typeof moduleMetadata.dependencies === "object" &&
        "providers" in moduleMetadata.dependencies &&
        typeof moduleMetadata.dependencies.providers === "object" &&
        selectedProvider in moduleMetadata.dependencies.providers
      ) {
        Object.assign(mergedDeps, moduleMetadata.dependencies.providers[selectedProvider]);
      }
    }

    if (moduleMetadata.devDependencies) {
      if (
        typeof moduleMetadata.devDependencies === "object" &&
        !("common" in moduleMetadata.devDependencies)
      ) {
        Object.assign(mergedDevDeps, moduleMetadata.devDependencies);
      } else if (
        typeof moduleMetadata.devDependencies === "object" &&
        "common" in moduleMetadata.devDependencies
      ) {
        Object.assign(mergedDevDeps, moduleMetadata.devDependencies.common);
        if (
          selectedProvider &&
          typeof moduleMetadata.devDependencies === "object" &&
          "providers" in moduleMetadata.devDependencies &&
          typeof moduleMetadata.devDependencies.providers === "object" &&
          selectedProvider in moduleMetadata.devDependencies.providers
        ) {
          Object.assign(mergedDevDeps, moduleMetadata.devDependencies.providers[selectedProvider]);
        }
      }
    }

    // Update metadata with merged deps
    moduleMetadata.dependencies = mergedDeps;
    moduleMetadata.devDependencies = mergedDevDeps;

    // Set variables for replacements
    const variables: Record<string, string> = {};
    if (selectedProvider) {
      variables.provider = selectedProvider;
      if (selectedProvider === "postgresql") {
        variables.connectionString = "postgresql://user:password@localhost:5432/mydb?schema=public";
      } else if (selectedProvider === "mongodb") {
        variables.connectionString = "mongodb://localhost:27017/mydb";
      } else if (selectedProvider === "mysql") {
        variables.connectionString = "mysql://user:password@localhost:3306/mydb";
      } else if (selectedProvider === "sqlite") {
        variables.connectionString = "file:./dev.db";
      }
    }

    // Check if framework is supported
    if (!moduleMetadata.supportedFrameworks.includes(projectInfo.framework)) {
      logger.error(
        `Module "${module}" does not support ${projectInfo.framework}. Supported: ${moduleMetadata.supportedFrameworks.join(", ")}`,
      );
      process.exit(1);
    }

    // Check for conflicts
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

    // Apply module patches
    await applyModulePatches(projectRoot, projectInfo, moduleMetadata, modulesDir, module, options);

    // Apply framework patches
    if (moduleMetadata.frameworkPatches && !options.dryRun) {
      await applyFrameworkPatches(
        projectRoot,
        moduleMetadata.frameworkPatches,
        projectInfo.framework,
      );
    }

    // Run post-install commands
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

    // Add dependencies
    if (Object.keys(moduleMetadata.dependencies).length > 0 && options.install !== false) {
      const deps = Object.entries(moduleMetadata.dependencies).map(
        ([name, version]) => `${name}@${version}`,
      );

      if (!options.dryRun) {
        await addDependencies(projectRoot, projectInfo.packageManager, deps, false);
      } else {
        logger.info(`Would add dependencies: ${deps.join(", ")}`);
      }
    }

    // Add dev dependencies
    if (
      moduleMetadata.devDependencies &&
      Object.keys(moduleMetadata.devDependencies).length > 0 &&
      options.install !== false
    ) {
      const devDeps = Object.entries(moduleMetadata.devDependencies).map(
        ([name, version]) => `${name}@${version}`,
      );

      if (!options.dryRun) {
        await addDependencies(projectRoot, projectInfo.packageManager, devDeps, true);
      } else {
        logger.info(`Would add dev dependencies: ${devDeps.join(", ")}`);
      }
    }

    // Add environment variables
    if (moduleMetadata.envVars.length > 0) {
      // Replace variables in envVars
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

    // Print next steps
    if (moduleMetadata.envVars.some((v) => v.required)) {
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

async function loadModuleMetadata(
  modulesDir: string,
  moduleName: string,
  provider?: string,
): Promise<ModuleMetadata | null> {
  if (!(await fs.pathExists(modulesDir))) {
    return null;
  }

  // Try to find module in any category
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    // Get all modules in this category
    const moduleDirs = await fs.readdir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const modulePath = path.join(categoryPath, moduleDir);
      const moduleStat = await fs.stat(modulePath);

      if (!moduleStat.isDirectory()) continue;

      const metadataPath = path.join(modulePath, "module.json");

      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);

        // If provider is specified, match by directory name (exact match)
        if (provider && moduleDir === provider) {
          return metadata;
        }

        // Otherwise, match by module name (category)
        if (!provider && metadata.name === moduleName) {
          return metadata;
        }
      }
    }
  }

  return null;
}

// (removed duplicate import)

async function applyModulePatches(
  projectRoot: string,
  projectInfo: ProjectInfo,
  moduleMetadata: ModuleMetadata,
  modulesDir: string,
  moduleName: string,
  options: AddOptions,
): Promise<void> {
  // Find the module path

  const moduleBasePath = await findModulePath(modulesDir, moduleName, options.provider);

  if (!moduleBasePath) {
    throw new Error("Module files not found");
  }

  for (const patch of moduleMetadata.patches) {
    if (patch.type === "create-file") {
      const filePatch = patch as CreateFilePatch;

      // Check conditions
      if (filePatch.condition) {
        if (filePatch.condition.router && filePatch.condition.router !== projectInfo.router) {
          continue; // Skip this patch
        }
        if (filePatch.condition.language && filePatch.condition.language !== projectInfo.language) {
          continue; // Skip this patch
        }
      }

      const sourceFile = path.join(moduleBasePath, "files", filePatch.source);
      let destFile = path.join(projectRoot, filePatch.destination);

      // Replace placeholders in destination
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

        // If provider is specified, match by directory name (exact match)
        if (provider && moduleDir === provider) {
          return modulePath;
        }

        // Otherwise, match by module name (category)
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
