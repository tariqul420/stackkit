#!/usr/bin/env node
import { createProject } from "./lib/create-project";
import { logger } from "./lib/utils/logger";

interface CliOptions {
  framework?: string;
  f?: string;
  database?: string;
  d?: string;
  auth?: string;
  a?: string;
  language?: string;
  l?: string;
  packageManager?: string;
  p?: string;
  install?: boolean;
  'skip-install'?: boolean;
  git?: boolean;
  'no-git'?: boolean;
  yes?: boolean;
  y?: boolean;
  [key: string]: string | boolean | undefined;
}

function parseArgs(args: string[]): { projectName: string | undefined; options: CliOptions } {
  const options: CliOptions = {};
  let projectName: string | undefined;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--help' || arg === '-h') {
      showHelp();
      process.exit(0);
    }
    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      if (args[i + 1] && !args[i + 1].startsWith('--')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else if (arg.startsWith('-') && arg.length === 2) {
      const key = arg.slice(1);
      if (args[i + 1] && !args[i + 1].startsWith('-')) {
        options[key] = args[i + 1];
        i++;
      } else {
        options[key] = true;
      }
    } else if (!projectName) {
      projectName = arg;
    }
  }

  return { projectName, options };
}

function showHelp() {
  logger.log(`
Create StackKit App

Usage:
  create-stackkit-app [project-name] [options]

Options:
  -f, --framework <framework>    Framework: nextjs, express, react-vite
  -d, --database <database>      Database: prisma-postgresql, prisma-mongodb, prisma-mysql, prisma-sqlite, mongoose-mongodb, none
  -a, --auth <auth>              Auth: better-auth, authjs, none
  -l, --language <language>      Language: typescript, javascript
  -p, --package-manager <pm>     Package manager: pnpm, npm, yarn, bun
  --skip-install                 Skip dependency installation
  --no-git                       Skip git initialization
  -y, --yes                      Use default options
  -h, --help                     Show this help

Examples:
  create-stackkit-app my-app --framework nextjs --database prisma-postgresql --auth better-auth
  create-stackkit-app --help
`);
}

async function main() {
  const args = process.argv.slice(2);
  const { projectName, options } = parseArgs(args);

  try {
    await createProject(projectName, options);
  } catch (error) {
    logger.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
}

main();
