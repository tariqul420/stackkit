import chalk from 'chalk';
import { execSync } from 'child_process';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import validateNpmPackageName from 'validate-npm-package-name';

interface ProjectConfig {
  projectName: string;
  framework: 'nextjs' | 'express' | 'react-vite' | 'astro';
  database:
    | 'prisma-postgresql'
    | 'prisma-mongodb'
    | 'mongoose-mongodb'
    | 'drizzle-postgresql'
    | 'none';
  auth:
    | 'nextauth'
    | 'authjs-nextjs'
    | 'authjs-express'
    | 'better-auth-nextjs'
    | 'better-auth-express'
    | 'better-auth-react'
    | 'clerk'
    | 'none';
  language: 'typescript' | 'javascript';
  packageManager: 'pnpm' | 'npm' | 'yarn';
}

export async function createProject(projectName?: string): Promise<void> {
  console.log(chalk.bold.cyan('\n🚀 Create StackKit App\n'));

  // Get project configuration through wizard
  const config = await getProjectConfig(projectName);

  // Validate target directory
  const targetDir = path.join(process.cwd(), config.projectName);
  if (await fs.pathExists(targetDir)) {
    console.log(chalk.red(`\n✖ Directory "${config.projectName}" already exists`));
    console.log(chalk.gray('Please choose a different name or remove the existing directory.\n'));
    process.exit(1);
  }

  // Create project
  await generateProject(config, targetDir);

  // Show next steps
  showNextSteps(config);
}

async function getProjectConfig(projectName?: string): Promise<ProjectConfig> {
  const answers = await inquirer.prompt([
    {
      type: 'input',
      name: 'projectName',
      message: 'Project name:',
      default: projectName || 'my-app',
      when: !projectName,
      validate: (input: string) => {
        const validation = validateNpmPackageName(input);
        if (!validation.validForNewPackages) {
          return validation.errors?.[0] || 'Invalid package name';
        }
        if (fs.existsSync(path.join(process.cwd(), input))) {
          return 'Directory already exists';
        }
        return true;
      },
    },
    {
      type: 'list',
      name: 'framework',
      message: 'Select framework:',
      choices: [
        { name: 'Next.js', value: 'nextjs' },
        { name: 'Express.js', value: 'express' },
        { name: 'React (Vite)', value: 'react-vite' },
      ],
    },
    {
      type: 'list',
      name: 'database',
      message: 'Select database/ORM:',
      when: (answers: any) => answers.framework !== 'react-vite',
      choices: [
        { name: 'Prisma + PostgreSQL', value: 'prisma-postgresql' },
        { name: 'Prisma + MongoDB', value: 'prisma-mongodb' },
        { name: 'Mongoose + MongoDB', value: 'mongoose-mongodb' },
        { name: 'Drizzle + PostgreSQL', value: 'drizzle-postgresql' },
        { name: 'None', value: 'none' },
      ],
    },
    {
      type: 'list',
      name: 'auth',
      message: 'Select authentication:',
      choices: (answers: any) => {
        // React apps - client-side only
        if (answers.framework === 'react-vite') {
          return [
            { name: 'Better Auth (React)', value: 'better-auth-react' },
            { name: 'None', value: 'none' },
          ];
        }

        // Next.js apps
        if (answers.framework === 'nextjs') {
          return [
            { name: 'Auth.js v5', value: 'authjs-nextjs' },
            { name: 'NextAuth.js', value: 'nextauth' },
            { name: 'Better Auth', value: 'better-auth-nextjs' },
            { name: 'Clerk', value: 'clerk' },
            { name: 'None', value: 'none' },
          ];
        }

        // Express apps
        if (answers.framework === 'express') {
          return [
            { name: 'Auth.js', value: 'authjs-express' },
            { name: 'Better Auth', value: 'better-auth-express' },
            { name: 'None', value: 'none' },
          ];
        }

        // Default - no auth
        return [{ name: 'None', value: 'none' }];
      },
    },
    {
      type: 'list',
      name: 'language',
      message: 'Language:',
      choices: [
        { name: 'TypeScript', value: 'typescript' },
        { name: 'JavaScript', value: 'javascript' },
      ],
      default: 'typescript',
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Package manager:',
      choices: ['pnpm', 'npm', 'yarn'],
      default: 'pnpm',
    },
  ]);

  return {
    projectName: projectName || answers.projectName,
    framework: answers.framework,
    database: answers.framework === 'react-vite' ? 'none' : answers.database,
    auth: answers.auth,
    language: answers.language,
    packageManager: answers.packageManager,
  };
}

async function generateProject(config: ProjectConfig, targetDir: string): Promise<void> {
  console.log();

  // Copy and compose template
  const copySpinner = ora('Creating project files...').start();
  try {
    await composeTemplate(config, targetDir);
    copySpinner.succeed('Project files created');
  } catch (error) {
    copySpinner.fail('Failed to create project files');
    throw error;
  }

  // Install dependencies
  const installSpinner = ora('Installing dependencies...').start();
  try {
    await installDependencies(targetDir, config.packageManager);
    installSpinner.succeed('Dependencies installed');
  } catch (error) {
    installSpinner.fail('Failed to install dependencies');
    throw error;
  }

  // Initialize git
  const gitSpinner = ora('Initializing git repository...').start();
  try {
    await initGit(targetDir);
    gitSpinner.succeed('Git repository initialized');
  } catch (error) {
    gitSpinner.warn('Failed to initialize git repository');
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<void> {
  const templatesDir = path.join(__dirname, '..', '..', 'templates');

  await fs.ensureDir(targetDir);

  // 1. Copy base framework template
  await copyBaseFramework(templatesDir, targetDir, config.framework);

  // 2. Merge database configuration
  if (config.database !== 'none') {
    await mergeDatabaseConfig(templatesDir, targetDir, config.database);
  }

  // 3. Merge auth configuration
  if (config.auth !== 'none') {
    await mergeAuthConfig(templatesDir, targetDir, config.framework, config.auth);
  }

  // 4. Update package.json with project name
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // 5. Convert to JavaScript if selected
  if (config.language === 'javascript') {
    await convertToJavaScript(targetDir);
  }
}

async function copyBaseFramework(
  templatesDir: string,
  targetDir: string,
  framework: string
): Promise<void> {
  const baseDir = path.join(templatesDir, 'bases', `${framework}-base`);

  if (!(await fs.pathExists(baseDir))) {
    throw new Error(
      `Base template not found for framework: ${framework}\n` + `Expected at: ${baseDir}`
    );
  }

  await fs.copy(baseDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);
      return !['template.json', 'config.json', 'node_modules', '.git'].includes(basename);
    },
  });
}

async function mergeDatabaseConfig(
  templatesDir: string,
  targetDir: string,
  database: string
): Promise<void> {
  const dbDir = path.join(templatesDir, 'databases', database);

  if (!(await fs.pathExists(dbDir))) {
    console.warn(`Database template not found: ${database}`);
    return;
  }

  // Read config
  const configPath = path.join(dbDir, 'config.json');
  if (!(await fs.pathExists(configPath))) {
    return;
  }

  const config = await fs.readJson(configPath);

  // Copy database files
  const entries = await fs.readdir(dbDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'config.json') continue;

    const sourcePath = path.join(dbDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.copy(sourcePath, destPath, { overwrite: false });
    } else {
      await fs.copy(sourcePath, destPath, { overwrite: false });
    }
  }

  // Merge package.json
  await mergePackageJson(targetDir, config);

  // Merge .env
  await mergeEnvFile(targetDir, config.env || {});
}

async function mergeAuthConfig(
  templatesDir: string,
  targetDir: string,
  framework: string,
  auth: string
): Promise<void> {
  // Auth modules are now named with framework suffix
  // e.g., better-auth-nextjs, authjs-express, better-auth-react
  // If auth already has framework suffix, use it directly
  // Otherwise, map old names to new ones
  const authMap: Record<string, string> = {
    nextauth: 'nextauth',
    'better-auth': framework === 'nextjs' ? 'better-auth-nextjs' : 'better-auth-express',
    clerk: 'clerk',
  };

  const authKey = auth.includes('-') ? auth : authMap[auth] || auth;
  const authDir = path.join(templatesDir, 'auth', authKey);

  if (!(await fs.pathExists(authDir))) {
    console.warn(`Auth template not found: ${authKey}`);
    return;
  }

  // Read config
  const configPath = path.join(authDir, 'config.json');
  if (!(await fs.pathExists(configPath))) {
    return;
  }

  const config = await fs.readJson(configPath);

  // Copy auth files
  const entries = await fs.readdir(authDir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.name === 'config.json') continue;

    const sourcePath = path.join(authDir, entry.name);
    const destPath = path.join(targetDir, entry.name);

    if (entry.isDirectory()) {
      await fs.copy(sourcePath, destPath, { overwrite: false });
    } else {
      await fs.copy(sourcePath, destPath, { overwrite: false });
    }
  }

  // Merge package.json
  await mergePackageJson(targetDir, config);

  // Merge .env
  await mergeEnvFile(targetDir, config.env || {});
}

async function mergePackageJson(targetDir: string, config: any): Promise<void> {
  const pkgPath = path.join(targetDir, 'package.json');

  if (!(await fs.pathExists(pkgPath))) {
    return;
  }

  const pkg = await fs.readJson(pkgPath);

  if (config.dependencies) {
    pkg.dependencies = { ...pkg.dependencies, ...config.dependencies };
  }

  if (config.devDependencies) {
    pkg.devDependencies = { ...pkg.devDependencies, ...config.devDependencies };
  }

  if (config.scripts) {
    pkg.scripts = { ...pkg.scripts, ...config.scripts };
  }

  await fs.writeJson(pkgPath, pkg, { spaces: 2 });
}

async function mergeEnvFile(targetDir: string, envVars: Record<string, string>): Promise<void> {
  if (Object.keys(envVars).length === 0) {
    return;
  }

  const envExamplePath = path.join(targetDir, '.env.example');
  const envPath = path.join(targetDir, '.env');

  const envContent =
    Object.entries(envVars)
      .map(([key, value]) => `${key}="${value}"`)
      .join('\n') + '\n';

  // Update .env.example
  if (await fs.pathExists(envExamplePath)) {
    const existing = await fs.readFile(envExamplePath, 'utf-8');
    const existingKeys = existing.split('\n').map((line) => line.split('=')[0]);

    const newVars = Object.keys(envVars).filter((key) => !existingKeys.includes(key));
    if (newVars.length > 0) {
      const newContent = newVars.map((key) => `${key}="${envVars[key]}"`).join('\n');
      await fs.appendFile(envExamplePath, '\n' + newContent + '\n');
    }
  } else {
    await fs.writeFile(envExamplePath, envContent);
  }

  // Create .env if doesn't exist
  if (!(await fs.pathExists(envPath))) {
    await fs.writeFile(envPath, envContent);
  }
}

async function convertToJavaScript(targetDir: string): Promise<void> {
  // Remove TypeScript config files
  const tsFiles = ['tsconfig.json', 'next-env.d.ts'];
  for (const file of tsFiles) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  // Rename .ts(x) files to .js(x)
  const renameExtensions = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== 'node_modules') {
        await renameExtensions(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith('.ts')) {
          await fs.rename(fullPath, fullPath.replace(/\.ts$/, '.js'));
        } else if (entry.name.endsWith('.tsx')) {
          await fs.rename(fullPath, fullPath.replace(/\.tsx$/, '.jsx'));
        }
      }
    }
  };

  await renameExtensions(targetDir);

  // Update package.json to remove TypeScript dependencies
  const packageJsonPath = path.join(targetDir, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies['typescript'];
      delete packageJson.devDependencies['@types/node'];
      delete packageJson.devDependencies['@types/react'];
      delete packageJson.devDependencies['@types/react-dom'];
    }
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function installDependencies(cwd: string, packageManager: string): Promise<void> {
  const commands: Record<string, string> = {
    npm: 'npm install',
    yarn: 'yarn install',
    pnpm: 'pnpm install',
  };

  const command = commands[packageManager];
  if (!command) {
    throw new Error(`Unsupported package manager: ${packageManager}`);
  }

  execSync(command, {
    cwd,
    stdio: 'pipe',
  });
}

async function initGit(cwd: string): Promise<void> {
  try {
    execSync('git --version', { stdio: 'pipe' });
    execSync('git init', { cwd, stdio: 'pipe' });
    execSync('git add -A', { cwd, stdio: 'pipe' });
    execSync('git commit -m "Initial commit from create-stackkit-app"', {
      cwd,
      stdio: 'pipe',
    });
  } catch (error) {
    throw new Error('Git initialization failed');
  }
}

function showNextSteps(config: ProjectConfig): void {
  console.log(chalk.green.bold(`\n✓ Created ${config.projectName}\n`));
  console.log(chalk.bold('Next steps:'));
  console.log(chalk.cyan(`  cd ${config.projectName}`));
  console.log(
    chalk.cyan(`  ${config.packageManager}${config.packageManager === 'npm' ? ' run' : ''} dev\n`)
  );
}
