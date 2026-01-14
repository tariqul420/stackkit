import chalk from "chalk";
import fs from "fs-extra";
import path from "path";
import { ModuleMetadata } from "../types";
import { logger } from "../utils/logger";

interface ListOptions {
  frameworks?: boolean;
  modules?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const showFrameworks = !options.modules || options.frameworks;
  const showModules = !options.frameworks || options.modules;

  try {
    logger.newLine();

    // List frameworks
    if (showFrameworks) {
      const templatesDir = path.join(__dirname, "..", "..", "templates");
      const frameworks = await getAvailableFrameworks(templatesDir);

      logger.log(chalk.bold.cyan("▸ FRAMEWORKS") + chalk.gray(` (${frameworks.length})`));
      logger.newLine();

      if (frameworks.length === 0) {
        logger.log(chalk.dim("  No frameworks available"));
      } else {
        frameworks.forEach((framework) => {
          logger.log(`  ${chalk.cyan("•")} ${framework.displayName}`);
        });
      }
      logger.newLine();
    }

    // List modules
    if (showModules) {
      const modulesDir = path.join(__dirname, "..", "..", "modules");
      const modules = await getAvailableModules(modulesDir);

      logger.log(chalk.bold.cyan("▸ MODULES") + chalk.gray(` (${modules.length})`));

      if (modules.length === 0) {
        logger.newLine();
        logger.log(chalk.dim("  No modules available"));
        logger.newLine();
      } else {
        // Group by category
        const grouped = modules.reduce(
          (acc, mod) => {
            if (!acc[mod.category]) {
              acc[mod.category] = [];
            }
            acc[mod.category].push(mod);
            return acc;
          },
          {} as Record<string, ModuleMetadata[]>,
        );

        for (const [category, mods] of Object.entries(grouped)) {
          logger.newLine();
          logger.log(
            `  ${chalk.yellow("→")} ${chalk.bold.yellow(category.toUpperCase())} ${chalk.dim(`(${mods.length})`)}`,
          );
          mods.forEach((mod) => {
            logger.log(`    ${chalk.cyan("•")} ${mod.displayName}`);
          });
        }
        logger.newLine();
      }
    }
  } catch (error) {
    logger.error(`Failed to list resources: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function getAvailableFrameworks(templatesDir: string): Promise<{ name: string; displayName: string }[]> {
  if (!(await fs.pathExists(templatesDir))) {
    return [];
  }

  const frameworkDirs = await fs.readdir(templatesDir);
  const frameworks = frameworkDirs
    .filter((dir) => dir !== "node_modules" && dir !== ".git")
    .map((dir) => ({
      name: dir,
      displayName: dir.charAt(0).toUpperCase() + dir.slice(1).replace("-", " "),
    }));

  return frameworks;
}

async function getAvailableModules(modulesDir: string): Promise<ModuleMetadata[]> {
  if (!(await fs.pathExists(modulesDir))) {
    return [];
  }

  const modules: ModuleMetadata[] = [];
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    const moduleDirs = await fs.readdir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const metadataPath = path.join(categoryPath, moduleDir, "module.json");
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);
        modules.push(metadata);
      }
    }
  }

  return modules;
}
