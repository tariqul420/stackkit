import fs from "fs-extra";
import path from "path";

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

  // Update .env (create if doesn't exist, or append new vars if it does)
  if (await fs.pathExists(envPath)) {
    const existing = await fs.readFile(envPath, "utf-8");
    const existingKeys = existing.split("\n").map((line) => line.split("=")[0]);

    const newVars = Object.keys(envVars).filter((key) => !existingKeys.includes(key));
    if (newVars.length > 0) {
      const newContent = newVars.map((key) => `${key}="${envVars[key]}"`).join("\n");
      await fs.appendFile(envPath, "\n" + newContent + "\n");
    }
  } else {
    await fs.writeFile(envPath, envContent);
  }
}
