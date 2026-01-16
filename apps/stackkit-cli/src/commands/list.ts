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
    logger.header("StackKit Resources");
    logger.newLine();

    let hasFrameworks = false;
    let hasModules = false;

    if (showFrameworks) {
      const templatesDir = path.join(__dirname, "..", "..", "templates");
      const frameworks = await getAvailableFrameworks(templatesDir);

      if (frameworks.length > 0) {
        hasFrameworks = true;
        logger.log(chalk.bold.blue("FRAMEWORKS"));

        frameworks.forEach((framework, index) => {
          const isLast = index === frameworks.length - 1;
          const prefix = isLast ? "└──" : "├──";
          logger.log(`  ${chalk.gray(prefix)} ${chalk.cyan(framework.displayName)}`);
        });
        logger.newLine();
      }
    }

    // List modules
    if (showModules) {
      const modulesDir = path.join(__dirname, "..", "..", "modules");
      const modules = await getAvailableModules(modulesDir);

      if (modules.length > 0) {
        hasModules = true;
        logger.log(chalk.bold.magenta("MODULES"));

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

        const categories = Object.keys(grouped);
        categories.forEach((category, categoryIndex) => {
          const mods = grouped[category];
          const isLastCategory = categoryIndex === categories.length - 1;
          const categoryPrefix = isLastCategory ? "└──" : "├──";

          logger.log(`  ${chalk.gray(categoryPrefix)} ${chalk.yellow(formatCategoryName(category))} ${chalk.dim(`(${mods.length})`)}`);

          mods.forEach((mod, modIndex) => {
            const isLastMod = modIndex === mods.length - 1;
            const modPrefix = isLastCategory ? (isLastMod ? "    └──" : "    ├──") : (isLastMod ? "│   └──" : "│   ├──");
            logger.log(`  ${chalk.gray(modPrefix)} ${chalk.green(mod.displayName)}`);

            // Show additional details for database modules
            if (mod.category === "database" && mod.name === "prisma") {
              const providerPrefix = isLastCategory ? (isLastMod ? "        └──" : "        ├──") : (isLastMod ? "│       └──" : "│       ├──");
              logger.log(`  ${chalk.gray(providerPrefix)} ${chalk.dim("Providers: PostgreSQL, MongoDB, MySQL, SQLite")}`);
            }
          });
        });
        logger.newLine();
      }
    }

    if (!hasFrameworks && !hasModules) {
      logger.log(chalk.dim("No resources available"));
      logger.newLine();
    }

    logger.log(chalk.dim("Use 'stackkit add <module>' to add modules to your project"));
    logger.newLine();

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
      displayName: formatFrameworkName(dir),
    }));

  return frameworks;
}

function formatFrameworkName(name: string): string {
  return name
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatCategoryName(name: string): string {
  return name.charAt(0).toUpperCase() + name.slice(1);
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
