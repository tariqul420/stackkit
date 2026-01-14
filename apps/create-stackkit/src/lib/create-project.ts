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
  database: "prisma" | "mongoose" | "none";
  dbProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth: "better-auth" | "authjs" | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

interface Answers {
  projectName?: string;
  framework: "nextjs" | "express" | "react-vite";
  database?: "prisma" | "mongoose" | "none";
  dbProvider?: "postgresql" | "mongodb" | "mysql" | "sqlite";
  auth?: "better-auth" | "authjs" | "none";
  language: "typescript" | "javascript";
  packageManager: "pnpm" | "npm" | "yarn" | "bun";
}

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
}

export async function createProject(projectName?: string, options?: CliOptions): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(chalk.bold.cyan("\n Create StackKit App\n"));

  const config = await getProjectConfig(projectName, options);

  const targetDir = path.join(process.cwd(), config.projectName);
  if (await fs.pathExists(targetDir)) {
    // eslint-disable-next-line no-console
    console.log(chalk.red(`\n✖ Directory "${config.projectName}" already exists`));
    // eslint-disable-next-line no-console
    console.log(chalk.gray("Please choose a different name or remove the existing directory.\n"));
    process.exit(1);
  }

  await generateProject(config, targetDir, options);

  showNextSteps(config);
}

async function getProjectConfig(projectName?: string, options?: CliOptions): Promise<ProjectConfig> {
  if (options && Object.keys(options).length > 0) {
    if (options.yes || options.y) {
      return {
        projectName: projectName || "my-app",
        framework: "nextjs",
        database: "prisma",
        dbProvider: "postgresql",
        auth: "better-auth",
        language: "typescript",
        packageManager: "pnpm",
      };
    }
    // Validate options
    const validFrameworks = ['nextjs', 'express', 'react-vite'];
    const framework = options.framework || options.f;
    if (framework && !validFrameworks.includes(framework)) {
      throw new Error(`Invalid framework: ${framework}. Valid options: ${validFrameworks.join(', ')}`);
    }

    const validDatabases = ['prisma-postgresql', 'prisma-mongodb', 'prisma-mysql', 'prisma-sqlite', 'mongoose-mongodb', 'none'];
    const db = options.database || options.d;
    if (db && !validDatabases.includes(db)) {
      throw new Error(`Invalid database: ${db}. Valid options: ${validDatabases.join(', ')}`);
    }

    const validAuth = ['better-auth', 'authjs', 'none'];
    const authOpt = options.auth || options.a;
    if (authOpt && !validAuth.includes(authOpt)) {
      throw new Error(`Invalid auth: ${authOpt}. Valid options: ${validAuth.join(', ')}`);
    }

    const validLanguages = ['typescript', 'javascript'];
    const language = options.language || options.l;
    if (language && !validLanguages.includes(language)) {
      throw new Error(`Invalid language: ${language}. Valid options: ${validLanguages.join(', ')}`);
    }

    const validPackageManagers = ['pnpm', 'npm', 'yarn', 'bun'];
    const pm = options.packageManager || options.p;
    if (pm && !validPackageManagers.includes(pm)) {
      throw new Error(`Invalid package manager: ${pm}. Valid options: ${validPackageManagers.join(', ')}`);
    }

    let database: "prisma" | "mongoose" | "none" = "none";
    let dbProvider: "postgresql" | "mongodb" | "mysql" | "sqlite" | undefined;

    if (db && db !== "none") {
      if (db.startsWith("prisma-")) {
        database = "prisma";
        const provider = db.split("-")[1];
        if (!["postgresql", "mongodb", "mysql", "sqlite"].includes(provider)) {
          throw new Error(`Invalid Prisma provider: ${provider}`);
        }
        dbProvider = provider as "postgresql" | "mongodb" | "mysql" | "sqlite";
      } else if (db === "mongoose-mongodb") {
        database = "mongoose";
      } else {
        throw new Error(`Unsupported database: ${db}`);
      }
    }

    let auth: "better-auth" | "authjs" | "none" = "none";
    if (authOpt && authOpt !== "none") {
      auth = authOpt as "better-auth" | "authjs";
    }

    const finalFramework = (framework || "nextjs") as "nextjs" | "express" | "react-vite";
    if (finalFramework === "react-vite") {
      database = "none";
      dbProvider = undefined;
    }

    // Validate auth compatibility
    if (auth === "authjs" && (database !== "prisma" || finalFramework !== "nextjs")) {
      throw new Error("Auth.js is only supported with Next.js and Prisma database");
    }
    if (auth === "better-auth" && database === "none" && finalFramework !== "react-vite") {
      throw new Error("Better Auth requires a database for server frameworks");
    }

    return {
      projectName: projectName || "my-app",
      framework: finalFramework,
      database,
      dbProvider,
      auth,
      language: (language || "typescript") as "typescript" | "javascript",
      packageManager: (pm || "pnpm") as "pnpm" | "npm" | "yarn" | "bun",
    };
  }
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
        { name: "Mongoose (MongoDB)", value: "mongoose" },
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
      when: (answers: Answers) => (answers.database !== "none" || answers.framework === "react-vite") && answers.database !== "mongoose",
      choices: (answers: Answers) => {
        if (answers.framework === "react-vite") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "None", value: "none" },
          ];
        }
        if (answers.database === "mongoose") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "None", value: "none" },
          ];
        }
        if (answers.framework === "nextjs" && answers.database === "prisma") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "Auth.js", value: "authjs" },
            { name: "None", value: "none" },
          ];
        }
        if (answers.framework === "express" && answers.database === "prisma") {
          return [
            { name: "Better Auth", value: "better-auth" },
            { name: "None", value: "none" },
          ];
        }
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
    auth: answers.database === "mongoose" ? "better-auth" : (answers.auth || "none"),
    language: answers.language,
    packageManager: answers.packageManager,
  };
}

async function generateProject(config: ProjectConfig, targetDir: string, options?: CliOptions): Promise<void> {
  const copySpinner = ora("Creating project files...").start();
  let postInstallCommands: string[] = [];
  try {
    postInstallCommands = await composeTemplate(config, targetDir);
    copySpinner.succeed("Project files created");
  } catch (error) {
    copySpinner.fail("Failed to create project files");
    throw error;
  }

  // Install dependencies
  if (options?.install !== false && !options?.['skip-install']) {
    const installSpinner = ora("Installing dependencies...").start();
    try {
      await installDependencies(targetDir, config.packageManager);
      installSpinner.succeed("Dependencies installed");
    } catch (error) {
      installSpinner.fail("Failed to install dependencies");
      throw error;
    }
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
  if (options?.git !== false && !options?.['no-git']) {
    const gitSpinner = ora("Initializing git repository...").start();
    try {
      await initGit(targetDir);
      gitSpinner.succeed("Git repository initialized");
    } catch {
      gitSpinner.warn("Failed to initialize git repository");
    }
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<string[]> {
  const templatesDir = path.join(__dirname, "..", "..", "templates");

  await fs.ensureDir(targetDir);

  await copyBaseFramework(templatesDir, targetDir, config.framework);

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
