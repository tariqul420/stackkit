import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import validateNpmPackageName from "validate-npm-package-name";
import { copyBaseFramework } from "./utils/file-utils";
import { initGit } from "./utils/git-utils";
import { convertToJavaScript } from "./utils/js-conversion";
import { mergeAuthConfig, mergeDatabaseConfig } from "./utils/module-utils";
import { installDependencies } from "./utils/package-utils";

interface ProjectConfig {
  projectName: string;
  framework: "nextjs" | "express" | "react-vite";
  database: "prisma" | "mongoose-mongodb" | "none";
  dbProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth:
    | "better-auth-nextjs"
    | "better-auth-express"
    | "better-auth-react"
    | "clerk-nextjs"
    | "clerk-express"
    | "clerk-react"
    | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

interface Answers {
  projectName?: string;
  framework: "nextjs" | "express" | "react-vite";
  database?: "prisma" | "mongoose-mongodb" | "none";
  dbProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth:
    | "better-auth-nextjs"
    | "better-auth-express"
    | "better-auth-react"
    | "clerk-nextjs"
    | "clerk-express"
    | "clerk-react"
    | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

export async function createProject(projectName?: string): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(chalk.bold.cyan("\n Create StackKit App\n"));

  const config = await getProjectConfig(projectName);

  const targetDir = path.join(process.cwd(), config.projectName);
  if (await fs.pathExists(targetDir)) {
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n✖ Directory "${config.projectName}" already exists`));
    // eslint-disable-next-line no-console
    console.log(chalk.gray("Please choose a different name or remove the existing directory.\n"));
    process.exit(1);
  }

  await generateProject(config, targetDir);

  showNextSteps(config);
}

async function getProjectConfig(projectName?: string): Promise<ProjectConfig> {
  const answers = (await inquirer.prompt([
    {
      type: "input",
      name: "projectName",
      message: "Project name:",
      default: projectName || "my-app",
      when: !projectName,
      validate: (input: string) => {
        const validation = validateNpmPackageName(input);
        if (!validation.validForNewPackages) {
          return validation.errors?.[0] || "Invalid package name";
        }
        if (fs.existsSync(path.join(process.cwd(), input))) {
          return "Directory already exists";
        }
        return true;
      },
    },
    {
      type: "list",
      name: "framework",
      message: "Select framework:",
      choices: [
        { name: "Next.js", value: "nextjs" },
        { name: "Express.js", value: "express" },
        { name: "React (Vite)", value: "react-vite" },
      ],
    },
    {
      type: "list",
      name: "database",
      message: "Select database/ORM:",
      when: (answers: Answers) => answers.framework !== "react-vite",
      choices: [
        { name: "Prisma", value: "prisma" },
        { name: "Mongoose + MongoDB", value: "mongoose-mongodb" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "dbProvider",
      message: "Select database provider for Prisma:",
      when: (answers: Answers) => answers.database === "prisma",
      choices: [
        { name: "PostgreSQL", value: "postgresql" },
        { name: "MongoDB", value: "mongodb" },
        { name: "MySQL", value: "mysql" },
        { name: "SQLite", value: "sqlite" },
      ],
    },
    {
      type: "list",
      name: "auth",
      message: "Select authentication:",
      choices: (answers: Answers) => {
        if (answers.framework === "react-vite") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "Clerk", value: "clerk" },
            { name: "None", value: "none" },
          ];
        }

        // Next.js apps
        if (answers.framework === "nextjs") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "Clerk", value: "clerk" },
            { name: "None", value: "none" },
          ];
        }

        // Express apps
        if (answers.framework === "express") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "Clerk", value: "clerk" },
            { name: "None", value: "none" },
          ];
        }

        // Default - no auth
        return [{ name: "None", value: "none" }];
      },
    },
    {
      type: "list",
      name: "language",
      message: "Language:",
      choices: [
        { name: "TypeScript", value: "typescript" },
        { name: "JavaScript", value: "javascript" },
      ],
      default: "typescript",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Package manager:",
      choices: [
        { name: "pnpm (recommended)", value: "pnpm" },
        { name: "npm", value: "npm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: "pnpm",
    },
  ])) as Answers;

  return {
    projectName: (projectName || answers.projectName) as string,
    framework: answers.framework,
    database: (answers.framework === "react-vite"
      ? "none"
      : answers.database) as ProjectConfig["database"],
    dbProvider: answers.dbProvider,
    auth: answers.auth,
    language: answers.language,
    packageManager: answers.packageManager,
  };
}

async function generateProject(config: ProjectConfig, targetDir: string): Promise<void> {
  const copySpinner = ora("Creating project files...").start();
  let postInstallCommands: string[] = [];
  try {
    postInstallCommands = await composeTemplate(config, targetDir);
    copySpinner.succeed("Project files created");

    // Ensure .env exists: if .env.example was copied from the template, create .env from it
    try {
      const envExamplePath = path.join(targetDir, ".env.example");
      const envPath = path.join(targetDir, ".env");
      if ((await fs.pathExists(envExamplePath)) && !(await fs.pathExists(envPath))) {
        const envContent = await fs.readFile(envExamplePath, "utf-8");
        await fs.writeFile(envPath, envContent);
      }
    } catch {
      // non-fatal
    }

    // Also ensure .env is created next to any .env.example found anywhere in project
    try {
      const walk = async (dir: string) => {
        const entries = await fs.readdir(dir, { withFileTypes: true });
        for (const entry of entries) {
          const full = path.join(dir, entry.name);
          if (entry.isDirectory()) {
            await walk(full);
          } else if (entry.isFile() && entry.name === ".env.example") {
            const targetEnv = path.join(dir, ".env");
            if (!(await fs.pathExists(targetEnv))) {
              const content = await fs.readFile(full, "utf-8");
              await fs.writeFile(targetEnv, content);
            }
          }
        }
      };
      await walk(targetDir);
    } catch {
      // non-fatal
    }
  } catch (error) {
    copySpinner.fail("Failed to create project files");
    throw error;
  }

  // Install dependencies
  const installSpinner = ora("Installing dependencies...").start();
  try {
    await installDependencies(targetDir, config.packageManager);
    installSpinner.succeed("Dependencies installed");
  } catch (error) {
    installSpinner.fail("Failed to install dependencies");
    throw error;
  }

  // Run post-install commands
  if (postInstallCommands.length > 0) {
    const postInstallSpinner = ora("Running post-install commands...").start();
    try {
      for (const command of postInstallCommands) {
        execSync(command, { cwd: targetDir, stdio: "pipe" });
      }
      postInstallSpinner.succeed("Post-install commands completed");
    } catch (error) {
      postInstallSpinner.fail("Failed to run post-install commands");
      throw error;
    }
  }

  // Initialize git
  const gitSpinner = ora("Initializing git repository...").start();
  try {
    await initGit(targetDir);
    gitSpinner.succeed("Git repository initialized");
  } catch {
    gitSpinner.warn("Failed to initialize git repository");
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<string[]> {
  const templatesDir = path.join(__dirname, "..", "..", "templates");

  await fs.ensureDir(targetDir);

  await copyBaseFramework(templatesDir, targetDir, config.framework);

  const postInstallCommands: string[] = [];

  if (config.database !== "none") {
    const dbPostInstall = await mergeDatabaseConfig(
      templatesDir,
      targetDir,
      config.database,
      config.framework,
      config.dbProvider,
    );
    postInstallCommands.push(...dbPostInstall);
  }

  if (config.auth !== "none") {
    await mergeAuthConfig(
      templatesDir,
      targetDir,
      config.framework,
      config.auth,
      config.database,
      config.dbProvider,
    );
  }

  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  if (config.language === "javascript") {
    await convertToJavaScript(targetDir, config.framework);
  }

  return postInstallCommands;
}

function showNextSteps(config: ProjectConfig): void {
  // eslint-disable-next-line no-console
  console.log(chalk.green.bold(`\n✓ Created ${config.projectName}\n`));
  // eslint-disable-next-line no-console
  console.log(chalk.bold("Next steps:"));
  // eslint-disable-next-line no-console
  console.log(chalk.cyan(`  cd ${config.projectName}`));
  // eslint-disable-next-line no-console
  console.log(chalk.cyan(`  ${config.packageManager} run dev\n`));
}
