import chalk from "chalk";
import { execSync } from "child_process";
import fs from "fs-extra";
import inquirer from "inquirer";
import ora from "ora";
import path from "path";
import validateNpmPackageName from "validate-npm-package-name";

interface ProjectConfig {
  projectName: string;
  framework: "nextjs" | "express" | "react-vite";
  database: "prisma-postgresql" | "prisma-mongodb" | "mongoose-mongodb" | "none";
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
  console.log(chalk.bold.cyan("\n Create StackKit App\n"));

  // Get project configuration through wizard
  const config = await getProjectConfig(projectName);

  // Validate target directory
  const targetDir = path.join(process.cwd(), config.projectName);
  if (await fs.pathExists(targetDir)) {
    console.log(chalk.red(`\n✖ Directory "${config.projectName}" already exists`));
    console.log(chalk.gray("Please choose a different name or remove the existing directory.\n"));
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
      when: (answers: any) => answers.framework !== "react-vite",
      choices: [
        { name: "Prisma + PostgreSQL", value: "prisma-postgresql" },
        { name: "Prisma + MongoDB", value: "prisma-mongodb" },
        { name: "Mongoose + MongoDB", value: "mongoose-mongodb" },
        { name: "None", value: "none" },
      ],
    },
    {
      type: "list",
      name: "auth",
      message: "Select authentication:",
      choices: (answers: any) => {
        if (answers.framework === "react-vite") {
          return [
            { name: "Better Auth", value: "better-auth-react" },
            { name: "Clerk", value: "clerk-react" },
            { name: "None", value: "none" },
          ];
        }

        // Next.js apps
        if (answers.framework === "nextjs") {
          return [
            { name: "Better Auth", value: "better-auth-nextjs" },
            { name: "Clerk", value: "clerk-nextjs" },
            { name: "None", value: "none" },
          ];
        }

        // Express apps
        if (answers.framework === "express") {
          return [
            { name: "Better Auth", value: "better-auth-express" },
            { name: "Clerk", value: "clerk-express" },
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
  ]);

  return {
    projectName: projectName || answers.projectName,
    framework: answers.framework,
    database: answers.framework === "react-vite" ? "none" : answers.database,
    auth: answers.auth,
    language: answers.language,
    packageManager: answers.packageManager,
  };
}

async function generateProject(config: ProjectConfig, targetDir: string): Promise<void> {
  console.log();

  // Copy and compose template
  const copySpinner = ora("Creating project files...").start();
  try {
    await composeTemplate(config, targetDir);
    copySpinner.succeed("Project files created");
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

  // Initialize git
  const gitSpinner = ora("Initializing git repository...").start();
  try {
    await initGit(targetDir);
    gitSpinner.succeed("Git repository initialized");
  } catch (error) {
    gitSpinner.warn("Failed to initialize git repository");
  }
}

async function composeTemplate(config: ProjectConfig, targetDir: string): Promise<void> {
  const templatesDir = path.join(__dirname, "..", "..", "templates");

  await fs.ensureDir(targetDir);

  // 1. Copy base framework template
  await copyBaseFramework(templatesDir, targetDir, config.framework);

  // 2. Merge database configuration
  if (config.database !== "none") {
    await mergeDatabaseConfig(templatesDir, targetDir, config.database, config.framework);
  }

  // 3. Merge auth configuration
  if (config.auth !== "none") {
    await mergeAuthConfig(templatesDir, targetDir, config.framework, config.auth, config.database);
  }

  // 4. Update package.json with project name
  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    packageJson.name = config.projectName;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // 5. Convert to JavaScript if selected
  if (config.language === "javascript") {
    await convertToJavaScript(targetDir, config.framework);
  }
}

async function copyBaseFramework(
  templatesDir: string,
  targetDir: string,
  framework: string,
): Promise<void> {
  const baseDir = path.join(templatesDir, framework);

  if (!(await fs.pathExists(baseDir))) {
    throw new Error(
      `Base template not found for framework: ${framework}\n` + `Expected at: ${baseDir}`,
    );
  }

  await fs.copy(baseDir, targetDir, {
    filter: (src) => {
      const basename = path.basename(src);
      return !["template.json", "config.json", "node_modules", ".git"].includes(basename);
    },
  });
}

async function mergeDatabaseConfig(
  templatesDir: string,
  targetDir: string,
  database: string,
  framework: string,
): Promise<void> {
  // Use modules directory (sibling to templates)
  const modulesDir = path.join(templatesDir, "..", "modules");
  const dbModulePath = path.join(modulesDir, "database", database);

  if (!(await fs.pathExists(dbModulePath))) {
    console.warn(`Database module not found: ${database}`);
    return;
  }

  // Read module.json
  const moduleJsonPath = path.join(dbModulePath, "module.json");
  if (!(await fs.pathExists(moduleJsonPath))) {
    return;
  }

  const moduleData = await fs.readJson(moduleJsonPath);

  // Copy files from module
  const filesDir = path.join(dbModulePath, "files");
  if (await fs.pathExists(filesDir)) {
    // Copy files based on patches in module.json
    for (const patch of moduleData.patches || []) {
      if (patch.type === "create-file") {
        const sourceFile = path.join(filesDir, patch.source);
        let destFile = path.join(targetDir, patch.destination);

        // Simple placeholder replacement for lib
        destFile = destFile.replace("{{lib}}", "lib").replace("{{src}}", "src");

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(path.dirname(destFile));
          await fs.copy(sourceFile, destFile, { overwrite: false });
        }
      }
    }
  }

  // Merge package.json with module dependencies
  await mergePackageJson(targetDir, {
    dependencies: moduleData.dependencies,
    devDependencies: moduleData.devDependencies,
  });

  // Merge .env with module envVars
  const envVars: Record<string, string> = {};
  for (const envVar of moduleData.envVars || []) {
    envVars[envVar.key] = envVar.value;
  }
  await mergeEnvFile(targetDir, envVars);

  // Apply framework-specific patches from database module
  if (moduleData.frameworkPatches) {
    const frameworkKey = framework === "react-vite" ? "react" : framework;
    const patches = moduleData.frameworkPatches[frameworkKey];

    if (patches) {
      await applyFrameworkPatches(targetDir, patches);
    }
  }
}

async function mergeAuthConfig(
  templatesDir: string,
  targetDir: string,
  framework: string,
  auth: string,
  database: string = "none",
): Promise<void> {
  // Use modules directory (sibling to templates)
  const modulesDir = path.join(templatesDir, "..", "modules");

  // Auth modules are now named with framework suffix
  // e.g., better-auth-nextjs, authjs-express, better-auth-react
  // If auth already has framework suffix, use it directly
  // Otherwise, map old names to new ones
  const authMap: Record<string, string> = {
    nextauth: "nextauth",
    "better-auth": framework === "nextjs" ? "better-auth-nextjs" : "better-auth-express",
    clerk:
      framework === "nextjs"
        ? "clerk-nextjs"
        : framework === "react-vite"
          ? "clerk-react"
          : "clerk-express",
  };

  const authKey = auth.includes("-") ? auth : authMap[auth] || auth;
  const authModulePath = path.join(modulesDir, "auth", authKey);

  if (!(await fs.pathExists(authModulePath))) {
    console.warn(`Auth module not found: ${authKey}`);
    return;
  }

  // Read module.json
  const moduleJsonPath = path.join(authModulePath, "module.json");
  if (!(await fs.pathExists(moduleJsonPath))) {
    return;
  }

  const moduleData = await fs.readJson(moduleJsonPath);

  // Copy files from module
  const filesDir = path.join(authModulePath, "files");
  if (await fs.pathExists(filesDir)) {
    // Determine path replacements based on framework
    const getReplacements = () => {
      if (framework === "nextjs") {
        return { lib: "lib", router: "app" };
      } else if (framework === "express") {
        return { lib: "src", router: "src" };
      } else {
        return { lib: "src", router: "src" };
      }
    };

    const replacements = getReplacements();

    // Copy files based on patches in module.json
    for (const patch of moduleData.patches || []) {
      if (patch.type === "create-file") {
        const sourceFile = path.join(filesDir, patch.source);
        let destFile = path.join(targetDir, patch.destination);

        // Replace placeholders
        destFile = destFile
          .replace("{{lib}}", replacements.lib)
          .replace("{{router}}", replacements.router);

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(path.dirname(destFile));
          await fs.copy(sourceFile, destFile, { overwrite: false });
        }
      }
    }
  }

  // Handle database-specific adapters and schemas
  if (database !== "none" && moduleData.databaseAdapters) {
    const adapterConfig = moduleData.databaseAdapters[database];

    if (adapterConfig) {
      // Copy adapter file
      if (adapterConfig.adapter) {
        const adapterSource = path.join(authModulePath, adapterConfig.adapter);
        const adapterFileName = path.basename(adapterConfig.adapter);

        // Determine destination based on framework
        let adapterDest: string;
        if (framework === "nextjs") {
          adapterDest = path.join(targetDir, "lib", "auth.ts");
        } else if (framework === "express") {
          adapterDest = path.join(targetDir, "src", "auth.ts");
        } else {
          adapterDest = path.join(targetDir, "src", "lib", "auth.ts");
        }

        if (await fs.pathExists(adapterSource)) {
          await fs.ensureDir(path.dirname(adapterDest));
          await fs.copy(adapterSource, adapterDest, { overwrite: true });
        }
      }

      // Copy schema file if it exists
      if (adapterConfig.schema && adapterConfig.schemaDestination) {
        const schemaSource = path.join(authModulePath, adapterConfig.schema);
        const schemaDest = path.join(targetDir, adapterConfig.schemaDestination);

        if (await fs.pathExists(schemaSource)) {
          await fs.ensureDir(path.dirname(schemaDest));
          await fs.copy(schemaSource, schemaDest, { overwrite: true });
        }
      }

      // Merge adapter-specific dependencies
      if (adapterConfig.dependencies) {
        await mergePackageJson(targetDir, {
          dependencies: adapterConfig.dependencies,
        });
      }
    }
  }

  // Merge package.json with module dependencies
  await mergePackageJson(targetDir, {
    dependencies: moduleData.dependencies,
    devDependencies: moduleData.devDependencies,
  });

  // Merge .env with module envVars
  const envVars: Record<string, string> = {};
  for (const envVar of moduleData.envVars || []) {
    envVars[envVar.key] = envVar.value;
  }
  await mergeEnvFile(targetDir, envVars);
}

async function mergePackageJson(targetDir: string, config: any): Promise<void> {
  const pkgPath = path.join(targetDir, "package.json");

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

  const envExamplePath = path.join(targetDir, ".env.example");
  const envPath = path.join(targetDir, ".env");

  const envContent =
    Object.entries(envVars)
      .map(([key, value]) => `${key}="${value}"`)
      .join("\n") + "\n";

  // Update .env.example
  if (await fs.pathExists(envExamplePath)) {
    const existing = await fs.readFile(envExamplePath, "utf-8");
    const existingKeys = existing.split("\n").map((line) => line.split("=")[0]);

    const newVars = Object.keys(envVars).filter((key) => !existingKeys.includes(key));
    if (newVars.length > 0) {
      const newContent = newVars.map((key) => `${key}="${envVars[key]}"`).join("\n");
      await fs.appendFile(envExamplePath, "\n" + newContent + "\n");
    }
  } else {
    await fs.writeFile(envExamplePath, envContent);
  }

  // Create .env if doesn't exist
  if (!(await fs.pathExists(envPath))) {
    await fs.writeFile(envPath, envContent);
  }
}

async function convertToJavaScript(targetDir: string, framework: string): Promise<void> {
  // Remove TS config and declaration files
  const tsFiles = [
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "next-env.d.ts",
    "vite-env.d.ts",
  ];
  for (const file of tsFiles) {
    const filePath = path.join(targetDir, file);
    if (await fs.pathExists(filePath)) {
      await fs.remove(filePath);
    }
  }

  const removeDtsFiles = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await removeDtsFiles(fullPath);
      } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
        await fs.remove(fullPath);
      }
    }
  };
  await removeDtsFiles(targetDir);

  // Use Babel to strip types only, preserving exact formatting/comments/blank lines, producing clean production-ready code
  const babel = require("@babel/core");
  const transpileAllTsFiles = async (dir: string) => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && entry.name !== "node_modules") {
        await transpileAllTsFiles(fullPath);
      } else if (entry.isFile()) {
        if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
          const code = await fs.readFile(fullPath, "utf8");
          const isTsx = entry.name.endsWith(".tsx");
          const outFile = fullPath.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
          const presets: any[] = [
            [
              require.resolve("@babel/preset-typescript"),
              {
                onlyRemoveTypeImports: true,
                allowDeclareFields: true,
                allowNamespaces: true,
                optimizeForSpeed: true,
                allExtensions: true,
                isTSX: isTsx,
              },
            ],
            [
              require.resolve("@babel/preset-env"),
              {
                targets: { node: "18" },
                modules: false,
              },
            ],
          ];
          if (isTsx) {
            presets.push([
              require.resolve("@babel/preset-react"),
              {
                runtime: "automatic",
              },
            ]);
          }
          // Use recast + Babel AST transform (same approach as transform.tools)
          try {
            const recast = require("recast");
            const { transformFromAstSync } = require("@babel/core");
            const transformTypescript = require("@babel/plugin-transform-typescript");
            // getBabelOptions may be exported as default or directly
            let getBabelOptions: any = require("recast/parsers/_babel_options");
            if (getBabelOptions && getBabelOptions.default)
              getBabelOptions = getBabelOptions.default;
            const babelParser = require("recast/parsers/babel").parser;

            const ast = recast.parse(code, {
              parser: {
                parse: (source: string, options: any) => {
                  const babelOptions = getBabelOptions(options || {});
                  // ensure typescript and jsx handling
                  if (isTsx) {
                    babelOptions.plugins.push("typescript", "jsx");
                  } else {
                    babelOptions.plugins.push("typescript");
                  }
                  return babelParser.parse(source, babelOptions);
                },
              },
            });

            const opts = {
              cloneInputAst: false,
              code: false,
              ast: true,
              plugins: [transformTypescript],
              configFile: false,
            };

            const { ast: transformedAST } = transformFromAstSync(ast, code, opts);
            const resultCode = recast.print(transformedAST).code;
            await fs.writeFile(outFile, resultCode, "utf8");
            await fs.remove(fullPath);
            continue;
          } catch (e) {
            // fallback to previous Babel pipeline if anything fails
          }

          const result = await babel.transformAsync(code, {
            filename: entry.name,
            presets,
            comments: true,
            retainLines: true,
            compact: false,
            babelrc: false,
            configFile: false,
          });
          await fs.writeFile(outFile, result.code, "utf8");
          await fs.remove(fullPath);
        }
      }
    }
  };
  await transpileAllTsFiles(targetDir);

  const templatesRoot = path.join(__dirname, "..", "..", "templates");
  const templateName = framework;

  let fileReplacements = [];
  let jsScripts = null;
  if (templateName) {
    const templateJsonPath = path.join(templatesRoot, templateName, "template.json");
    if (await fs.pathExists(templateJsonPath)) {
      try {
        const templateJson = await fs.readJson(templateJsonPath);
        if (Array.isArray(templateJson.fileReplacements)) {
          fileReplacements = templateJson.fileReplacements;
        }
        if (templateJson.jsScripts) {
          jsScripts = templateJson.jsScripts;
        }
      } catch {}
    }
  }
  for (const rep of fileReplacements) {
    const filePath = path.join(targetDir, rep.file);
    if (await fs.pathExists(filePath)) {
      let content = await fs.readFile(filePath, "utf8");
      if (rep.from && rep.to) {
        content = content.replace(rep.from, rep.to);
        await fs.writeFile(filePath, content, "utf8");
      }
    }
  }
  if (jsScripts) {
    const packageJsonPath = path.join(targetDir, "package.json");
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      packageJson.scripts = { ...packageJson.scripts, ...jsScripts };
      await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
    }
  }
  const jsconfig = path.join(targetDir, "jsconfig.json");
  if (!(await fs.pathExists(jsconfig))) {
    for (const tmpl of await fs.readdir(templatesRoot, { withFileTypes: true })) {
      if (tmpl.isDirectory()) {
        const templateJsconfig = path.join(templatesRoot, tmpl.name, "jsconfig.json");
        if (await fs.pathExists(templateJsconfig)) {
          await fs.copy(templateJsconfig, jsconfig);
          break;
        }
      }
    }
  }
  const srcDir = path.join(targetDir, "src");
  if (await fs.pathExists(srcDir)) {
    const srcFiles = await fs.readdir(srcDir);
    for (const file of srcFiles) {
      if (
        (file.endsWith(".js") || file.endsWith(".jsx")) &&
        file.replace(/\.(js|jsx)$/, ".ts") &&
        srcFiles.includes(file.replace(/\.(js|jsx)$/, ".ts"))
      ) {
        await fs.remove(path.join(srcDir, file.replace(/\.(js|jsx)$/, ".ts")));
      }
      if (file.endsWith(".jsx") && srcFiles.includes(file.replace(/\.jsx$/, ".tsx"))) {
        await fs.remove(path.join(srcDir, file.replace(/\.jsx$/, ".tsx")));
      }
    }
  }
  const packageJsonPath = path.join(targetDir, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJson(packageJsonPath);
    if (packageJson.devDependencies) {
      delete packageJson.devDependencies["typescript"];
      delete packageJson.devDependencies["@types/node"];
      delete packageJson.devDependencies["@types/react"];
      delete packageJson.devDependencies["@types/react-dom"];
    }
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }
}

async function installDependencies(cwd: string, packageManager: string): Promise<void> {
  const commands: Record<string, string> = {
    npm: "npm install",
    yarn: "yarn install",
    pnpm: "pnpm install",
    bun: "bun install",
  };

  const isAvailable = (cmd: string) => {
    try {
      execSync(`command -v ${cmd}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };

  let chosen = packageManager;

  // If requested package manager is not available, try to fall back to a common one
  if (!isAvailable(chosen)) {
    const fallbacks = ["pnpm", "npm", "yarn", "bun"];
    const found = fallbacks.find((p) => isAvailable(p));
    if (found) {
      console.warn(
        `Selected package manager '${chosen}' was not found. Falling back to '${found}'.`,
      );
      chosen = found;
    } else {
      throw new Error(
        `Selected package manager '${packageManager}' was not found and no fallback package manager is available. Please install '${packageManager}' or use a different package manager.`,
      );
    }
  }

  const command = commands[chosen];

  execSync(command, {
    cwd,
    stdio: "pipe",
  });
}

async function initGit(cwd: string): Promise<void> {
  try {
    execSync("git --version", { stdio: "pipe" });
    execSync("git init", { cwd, stdio: "pipe" });
    execSync("git add -A", { cwd, stdio: "pipe" });
    execSync('git commit -m "Initial commit from create-stackkit-app"', {
      cwd,
      stdio: "pipe",
    });
  } catch (error) {
    throw new Error("Git initialization failed");
  }
}

async function applyFrameworkPatches(
  targetDir: string,
  patches: Record<string, any>,
): Promise<void> {
  for (const [filename, patchConfig] of Object.entries(patches)) {
    const filePath = path.join(targetDir, filename);

    if (await fs.pathExists(filePath)) {
      const fileContent = await fs.readJson(filePath);

      if (patchConfig.merge) {
        // Deep merge configuration
        const merged = deepMerge(fileContent, patchConfig.merge);
        await fs.writeJson(filePath, merged, { spaces: 2 });
      }
    }
  }
}

function deepMerge(target: any, source: any): any {
  const output = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      if (target[key]) {
        output[key] = deepMerge(target[key], source[key]);
      } else {
        output[key] = source[key];
      }
    } else if (Array.isArray(source[key])) {
      // For arrays, merge uniquely
      output[key] = Array.from(new Set([...(target[key] || []), ...source[key]]));
    } else {
      output[key] = source[key];
    }
  }

  return output;
}

function showNextSteps(config: ProjectConfig): void {
  console.log(chalk.green.bold(`\n✓ Created ${config.projectName}\n`));
  console.log(chalk.bold("Next steps:"));
  console.log(chalk.cyan(`  cd ${config.projectName}`));
  // Only `bun` is supported as the package manager in production-ready CLI
  console.log(chalk.cyan("  bun run dev\n"));
}
