import fs from "fs-extra";
import path from "path";
import { logger } from "../ui/logger";

export interface PackageJsonConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
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
