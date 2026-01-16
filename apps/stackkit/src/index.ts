#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from "./cli/create";
import { addCommand } from "./cli/add";
import { doctorCommand } from "./cli/doctor";
import { listCommand } from "./cli/list";
import { logger } from "./lib/ui/logger";

interface CreateOptions {
  framework?: "nextjs" | "express" | "react";
  database?: "prisma" | "mongoose" | "none";
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
  .version("0.1.0");

// Create command
program
  .command("create <project-name>")
  .description("Create a new StackKit project")
  .option("-f, --framework <framework>", "Framework: nextjs, express, react")
  .option("-d, --database <database>", "Database: prisma, mongoose, none")
  .option("-a, --auth <auth>", "Auth: better-auth, authjs, none")
  .option("-l, --language <language>", "Language: typescript, javascript")
  .option("-p, --package-manager <pm>", "Package manager: pnpm, npm, yarn, bun")
  .option("--skip-install", "Skip dependency installation")
  .option("--no-git", "Skip git initialization")
  .option("-y, --yes", "Use default options")
  .action(async (projectName: string, options: CreateOptions) => {
    try {
      await createProject(projectName, options);
    } catch (error) {
      logger.error(`Error: ${(error as Error).message}`);
      process.exit(1);
    }
  });

// Add command
program
  .command("add <module>")
  .description("Add a module to your existing project")
  .option("--provider <provider>", "Specific provider/variant to use")
  .option("--force", "Overwrite existing files")
  .option("--dry-run", "Show what would be changed without making changes")
  .option("--no-install", "Skip installing dependencies")
  .action(async (module: string, options: AddOptions) => {
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
