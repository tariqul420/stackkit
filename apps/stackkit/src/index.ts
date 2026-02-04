#!/usr/bin/env node
import { Command } from "commander";
import * as fs from "fs";
import { join } from "path";
import { addCommand } from "./cli/add";
import { createProject } from "./cli/create";
import { doctorCommand } from "./cli/doctor";
import { listCommand } from "./cli/list";
import { MODULE_CATEGORIES } from "./lib/constants";
import { getPrismaProvidersFromGenerator } from "./lib/discovery/shared";
import { logger } from "./lib/ui/logger";
import { loadJsonSync } from "./lib/utils/json-loader";
import { getPackageRoot } from "./lib/utils/package-root";
import {
  getAuthModulesPath,
  getDatabaseModulesPath,
  getModuleJsonPath,
} from "./lib/utils/path-resolver";

interface PackageJsonType {
  version: string;
}

const packageJson = loadJsonSync<PackageJsonType>(join(__dirname, "../package.json"));

interface CreateOptions {
  framework?: string;
  database?: string;
  prismaProvider?: string;
  auth?: string;
  language?: "typescript" | "javascript";
  packageManager?: "pnpm" | "npm" | "yarn" | "bun";
  skipInstall?: boolean;
  git?: boolean;
  yes?: boolean;
}

interface AddOptions {
  provider?: string;
  force?: boolean;
  dryRun?: boolean;
  install?: boolean;
  yes?: boolean;
}

interface DoctorOptions {
  json?: boolean;
  verbose?: boolean;
  strict?: boolean;
}

interface ListOptions {
  frameworks?: boolean;
  modules?: boolean;
}

function buildOptionHints() {
  try {
    const databaseModulesPath = getDatabaseModulesPath();
    const authModulesPath = getAuthModulesPath();
    const dbs: string[] = [];
    const auths: string[] = [];

    if (fs.existsSync(databaseModulesPath)) {
      for (const d of fs.readdirSync(databaseModulesPath)) {
        const moduleJson = getModuleJsonPath(MODULE_CATEGORIES.DATABASE, d);
        if (fs.existsSync(moduleJson)) {
          const m = loadJsonSync<{ name?: string }>(moduleJson);
          if (m && m.name === "prisma") {
            const providers = getPrismaProvidersFromGenerator(getPackageRoot());
            if (providers.length > 0) {
              providers.forEach((p) => dbs.push(`prisma-${p}`));
            } else {
              dbs.push("prisma");
            }
          } else if (m && m.name) {
            dbs.push(m.name);
          }
        }
      }
    }

    if (fs.existsSync(authModulesPath)) {
      for (const a of fs.readdirSync(authModulesPath)) {
        const moduleJson = getModuleJsonPath(MODULE_CATEGORIES.AUTH, a);
        if (fs.existsSync(moduleJson)) {
          const m = loadJsonSync<{ name?: string }>(moduleJson);
          if (m && m.name) auths.push(m.name);
        }
      }
    }

    return {
      databaseHint: dbs.length > 0 ? dbs.join(", ") : "none",
      authHint: auths.length > 0 ? auths.join(", ") : "none",
    };
  } catch {
    return { databaseHint: "none", authHint: "none" };
  }
}

const hints = buildOptionHints();
const program = new Command();

program
  .name("stackkit")
  .description("CLI for creating and managing StackKit projects")
  .version(packageJson?.version || "0.0.0")
  .configureHelp({
    subcommandTerm: (cmd) => {
      const name = cmd.name();
      if (name === "create") return "create [project-name] [options]";
      if (name === "add") return "add <module> [options]";
      if (name === "doctor") return "doctor [options]";
      if (name === "list") return "list [options]";
      if (name === "help") return "help [command]";
      return name + " [options]";
    },
  });

program
  .command("create [project-name]")
  .description("Create a new StackKit project")
  .usage("[project-name] [options]")
  .option("-f, --framework <framework>", "Framework (discovered)")
  .option("-d, --database <database>", `Database: ${hints.databaseHint}`)
  .option("--prisma-provider <provider>", "Prisma provider")
  .option("-a, --auth <auth>", `Auth: ${hints.authHint}`)
  .option("-l, --language <language>", "Language: typescript, javascript")
  .option("-p, --package-manager <pm>", "Package manager: pnpm, npm, yarn, bun")
  .option("--skip-install", "Skip dependency installation")
  .option("--no-git", "Skip git initialization")
  .option("-y, --yes", "Use default options")
  .action(async (projectName: string | undefined, options: CreateOptions) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("add [module]")
  .description("Add a module or category to your existing project")
  .usage("[module] [options]")
  .option("--provider <provider>", "Specific provider/variant to use")
  .option("--force", "Overwrite existing files")
  .option("--dry-run", "Show what would be changed without making changes")
  .option("--no-install", "Skip installing dependencies")
  .option("-y, --yes", "Use default options")
  .action(async (module: string | undefined, options: AddOptions) => {
    try {
      await addCommand(module, options);
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("doctor")
  .description("Check project health and compatibility with StackKit modules")
  .option("--json", "Output results in JSON format")
  .option("--verbose", "Show detailed information")
  .option("--strict", "Treat warnings as errors")
  .action(async (options: DoctorOptions) => {
    try {
      await doctorCommand(options);
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program
  .command("list")
  .description("List available frameworks and modules")
  .option("-f, --frameworks", "List only frameworks")
  .option("-m, --modules", "List only modules")
  .action(async (options: ListOptions) => {
    try {
      await listCommand(options);
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

program.on("command:*", () => {
  logger.error(`Invalid command: ${program.args.join(" ")}`);
  logger.log("Run stackkit --help for a list of available commands.");
  process.exit(1);
});

program.parse();
