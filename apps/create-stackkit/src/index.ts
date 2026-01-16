#!/usr/bin/env node
import { Command } from "commander";
import { createProject } from "./cli/create";
import { addCommand } from "./cli/add";
import { doctorCommand } from "./cli/doctor";
import { listCommand } from "./cli/list";
import { logger } from "./lib/ui/logger";

const program = new Command();

program
  .name("stackkit")
  .description("CLI for creating and managing StackKit projects")
  .version("0.4.6");

// Create command
program
  .command("create <project-name>")
  .description("Create a new StackKit project")
  .option("-f, --framework <framework>", "Framework: nextjs, express, react-vite")
  .option("-d, --database <database>", "Database: prisma, mongoose, none")
  .option("-a, --auth <auth>", "Auth: better-auth, authjs, none")
  .option("-l, --language <language>", "Language: typescript, javascript")
  .option("-p, --package-manager <pm>", "Package manager: pnpm, npm, yarn, bun")
  .option("--skip-install", "Skip dependency installation")
  .option("--no-git", "Skip git initialization")
  .option("-y, --yes", "Use default options")
  .action(async (projectName: string, options: any) => {
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
  .action(addCommand);

// Doctor command
program
  .command("doctor")
  .description("Check project health and compatibility with StackKit modules")
  .option("--json", "Output results in JSON format")
  .option("--verbose", "Show detailed information")
  .option("--strict", "Treat warnings as errors")
  .action(doctorCommand);

// List command
program
  .command("list")
  .description("List available frameworks and modules")
  .option("-f, --frameworks", "List only frameworks")
  .option("-m, --modules", "List only modules")
  .action(listCommand);

// Error handling
program.on("command:*", () => {
  logger.error(`Invalid command: ${program.args.join(" ")}`);
  logger.log("Run stackkit --help for a list of available commands.");
  process.exit(1);
});

program.parse();
