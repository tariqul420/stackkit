#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from "./cli/create";
import { addCommand } from "./cli/add";
import { doctorCommand } from "./cli/doctor";
import { listCommand } from "./cli/list";
import { logger } from "./lib/ui/logger";
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { getPackageRoot } from "./lib/utils/package-root";
import * as fs from "fs";

const packageJson = JSON.parse(readFileSync(join(__dirname, "../package.json"), "utf-8"));

function buildOptionHints() {
  try {
    const pkgRoot = getPackageRoot();
    const modulesDir = join(pkgRoot, "modules");
    const dbs: string[] = [];
    const auths: string[] = [];

    if (fs.existsSync(join(modulesDir, "database"))) {
      for (const d of fs.readdirSync(join(modulesDir, "database"))) {
        const moduleJson = join(modulesDir, "database", d, "module.json");
        if (fs.existsSync(moduleJson)) {
          try {
            const m = JSON.parse(readFileSync(moduleJson, "utf-8"));
            if (m && m.name === "prisma") {
              dbs.push("prisma-postgresql", "prisma-mongodb", "prisma-mysql", "prisma-sqlite");
            } else if (m && m.name) {
              dbs.push(m.name);
            }
          } catch {
            /* ignore */
          }
        }
      }
    }

    if (fs.existsSync(join(modulesDir, "auth"))) {
      for (const a of fs.readdirSync(join(modulesDir, "auth"))) {
        const moduleJson = join(modulesDir, "auth", a, "module.json");
        if (fs.existsSync(moduleJson)) {
          try {
            const m = JSON.parse(readFileSync(moduleJson, "utf-8"));
            if (m && m.name) auths.push(m.name);
          } catch {
            /* ignore */
          }
        }
      }
    }

    return {
      databaseHint: dbs.length > 0 ? dbs.join(", ") : "prisma, mongoose, none",
      authHint: auths.length > 0 ? auths.join(", ") : "better-auth, authjs, none",
    };
  } catch {
    return { databaseHint: "prisma, mongoose, none", authHint: "better-auth, authjs, none" };
  }
}

const hints = buildOptionHints();

interface CreateOptions {
  framework?: "nextjs" | "express" | "react";
  database?: "prisma" | "mongoose" | "none";
  prismaProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth?: "better-auth" | "authjs" | "none";
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

const program = new Command();

program
  .name("stackkit")
  .description("CLI for creating and managing StackKit projects")
  .version(packageJson.version)
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

// Create command
program
  .command("create [project-name]")
  .description("Create a new StackKit project")
  .usage("[project-name] [options]")
  .option("-f, --framework <framework>", "Framework: nextjs, express, react")
  .option("-d, --database <database>", `Database: ${hints.databaseHint}`)
  .option("--prisma-provider <provider>", "Prisma provider: postgresql, mongodb, mysql, sqlite")
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

// Add command
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

// Doctor command
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

// List command
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

// Error handling
program.on("command:*", () => {
  logger.error(`Invalid command: ${program.args.join(" ")}`);
  logger.log("Run stackkit --help for a list of available commands.");
  process.exit(1);
});

program.parse();
