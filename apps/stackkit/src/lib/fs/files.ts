import fs from "fs-extra";
import path from "path";
import { EXCLUDE_FROM_COPY, FILE_NAMES } from "../constants";
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
    filter: (src) => !EXCLUDE_FROM_COPY.includes(path.basename(src) as any),
  });
}

export async function mergePackageJson(
  targetDir: string,
  config: PackageJsonConfig,
): Promise<void> {
  const pkgPath = path.join(targetDir, FILE_NAMES.PACKAGE_JSON);
  if (!(await fs.pathExists(pkgPath))) return;

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
  const envPath = path.join(targetDir, FILE_NAMES.ENV);
  let content = "";

  if (await fs.pathExists(envPath)) {
    content = await fs.readFile(envPath, "utf-8");
  }

  const lines = content.split("\n").filter((line) => line.trim() !== "");

  for (const [key, value] of Object.entries(envVars)) {
    const existingIndex = lines.findIndex((line) => line.startsWith(`${key}=`));
    if (existingIndex !== -1) {
      lines[existingIndex] = `${key}=${value}`;
    } else {
      lines.push(`${key}=${value}`);
    }
  }

  await fs.writeFile(envPath, lines.join("\n") + "\n", "utf-8");
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
