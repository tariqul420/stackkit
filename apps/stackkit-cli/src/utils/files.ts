import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";

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
