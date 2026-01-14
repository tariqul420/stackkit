#!/usr/bin/env node
import chalk from "chalk";
import { Command } from "commander";
import { addCommand } from "./commands/add";
import { listCommand } from "./commands/list";

const program = new Command();

program
  .name("stackkit")
  .description("Production-ready project generator and module CLI")
  .version("0.3.2");

// List command
program
  .command("list")
  .description("List available frameworks and modules")
  .option("-f, --frameworks", "List only frameworks")
  .option("-m, --modules", "List only modules")
  .action(listCommand);

// Add command
program
  .command("add <module>")
  .description("Add a module to your existing project")
  .option("--provider <provider>", "Specific provider/variant to use")
  .option("--force", "Overwrite existing files")
  .option("--dry-run", "Show what would be changed without making changes")
  .option("--no-install", "Skip installing dependencies")
  .action(addCommand);

// Error handling
program.on("command:*", () => {
  // Use logger for error and info
  // logger.error and logger.log are not available here since logger is not imported, so fallback to process.stderr
  process.stderr.write(chalk.red(`\nInvalid command: ${program.args.join(" ")}\n`));
  process.stderr.write(chalk.yellow("Run stackkit --help for a list of available commands.\n"));
  process.exit(1);
});

program.parse();
