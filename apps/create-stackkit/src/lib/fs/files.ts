import fs from "fs-extra";
import path from "path";
import { logger } from "../ui/logger";

export interface PackageJsonConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
}

export async function copyBaseFramework(
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

export async function mergePackageJson(
  targetDir: string,
  config: PackageJsonConfig,
): Promise<void> {
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

export async function mergeEnvFile(
  targetDir: string,
  envVars: Record<string, string>,
): Promise<void> {
  const envPath = path.join(targetDir, ".env");

  let existingEnv = "";
  if (await fs.pathExists(envPath)) {
    existingEnv = await fs.readFile(envPath, "utf-8");
  }

  const envLines = existingEnv.split("\n").filter((line) => line.trim() !== "");

  // Add new variables
  for (const [key, value] of Object.entries(envVars)) {
    const existingIndex = envLines.findIndex((line) => line.startsWith(`${key}=`));
    if (existingIndex !== -1) {
      envLines[existingIndex] = `${key}=${value}`;
    } else {
      envLines.push(`${key}=${value}`);
    }
  }

  await fs.writeFile(envPath, envLines.join("\n") + "\n", "utf-8");
}

export async function copyTemplate(
  templatePath: string,
  targetPath: string,
  projectName: string,
): Promise<void> {
  if (!(await fs.pathExists(templatePath))) {
    throw new Error(`Template not found: ${templatePath}`);
  }

  // Create target directory
  await fs.ensureDir(targetPath);

  // Copy all files
  await fs.copy(templatePath, targetPath, {
    filter: (src) => {
      const basename = path.basename(src);
      // Skip template.json metadata file and node_modules
      return basename !== "template.json" && basename !== "node_modules";
    },
  });

  // Update package.json with project name
  const packageJsonPath = path.join(targetPath, "package.json");
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = await fs.readJSON(packageJsonPath);
    packageJson.name = projectName;
    await fs.writeJSON(packageJsonPath, packageJson, { spaces: 2 });
  }

  logger.success(`Template copied to ${targetPath}`);
}

export async function createFile(
  targetPath: string,
  content: string,
  options: { force?: boolean } = {},
): Promise<void> {
  const exists = await fs.pathExists(targetPath);

  if (exists && !options.force) {
    logger.warn(`File already exists: ${targetPath} (use --force to overwrite)`);
    return;
  }

  await fs.ensureDir(path.dirname(targetPath));
  await fs.writeFile(targetPath, content, "utf-8");
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function fileExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}