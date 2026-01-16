import fs from "fs-extra";
import path from "path";
import { ProjectInfo } from "../../types";

export async function detectProjectInfo(targetDir: string): Promise<ProjectInfo> {
  const packageJsonPath = path.join(targetDir, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error("No package.json found. This does not appear to be a Node.js project.");
  }

  const packageJson = await fs.readJSON(packageJsonPath);

  // Detect framework
  const isNextJs = packageJson.dependencies?.next || packageJson.devDependencies?.next;
  const isExpress = packageJson.dependencies?.express || packageJson.devDependencies?.express;
  const isReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
  const isVite = packageJson.dependencies?.vite || packageJson.devDependencies?.vite;

  let framework: "nextjs" | "express" | "react" | "react-vite" | "unknown";
  if (isNextJs) {
    framework = "nextjs";
  } else if (isExpress) {
    framework = "express";
  } else if (isReact && isVite) {
    framework = "react-vite";
  } else if (isReact) {
    framework = "react";
  } else {
    framework = "unknown";
  }

  if (framework === "unknown") {
    throw new Error("Only Next.js, Express, and React projects are currently supported.");
  }

  // Detect router type (only for Next.js)
  let router: "app" | "pages" | "unknown" = "unknown";

  if (framework === "nextjs") {
    const appDirExists = await fs.pathExists(path.join(targetDir, "app"));
    const pagesDirExists = await fs.pathExists(path.join(targetDir, "pages"));
    const srcAppDirExists = await fs.pathExists(path.join(targetDir, "src", "app"));
    const srcPagesDirExists = await fs.pathExists(path.join(targetDir, "src", "pages"));

    if (appDirExists || srcAppDirExists) {
      router = "app";
    } else if (pagesDirExists || srcPagesDirExists) {
      router = "pages";
    }
  }

  // Detect TypeScript vs JavaScript
  const tsconfigExists = await fs.pathExists(path.join(targetDir, "tsconfig.json"));
  const jsconfigExists = await fs.pathExists(path.join(targetDir, "jsconfig.json"));
  let language: "ts" | "js";
  if (tsconfigExists) {
    language = "ts";
  } else if (jsconfigExists) {
    language = "js";
  } else {
    // Default to TypeScript if neither exists
    language = "ts";
  }

  // Detect package manager
  const yarnLockExists = await fs.pathExists(path.join(targetDir, "yarn.lock"));
  const pnpmLockExists = await fs.pathExists(path.join(targetDir, "pnpm-lock.yaml"));
  const bunLockExists = await fs.pathExists(path.join(targetDir, "bun.lockb"));
  let packageManager: "npm" | "yarn" | "pnpm" | "bun" = "npm";

  if (pnpmLockExists) {
    packageManager = "pnpm";
  } else if (yarnLockExists) {
    packageManager = "yarn";
  } else if (bunLockExists) {
    packageManager = "bun";
  }

  // Check for existing integrations
  const hasAuth = !!(
    packageJson.dependencies?.["next-auth"] ||
    packageJson.dependencies?.["better-auth"] ||
    packageJson.dependencies?.["@auth/core"] ||
    packageJson.dependencies?.["@kinde-oss/kinde-auth-nextjs"] ||
    packageJson.dependencies?.["passport"]
  );

  const hasPrisma = !!(
    packageJson.dependencies?.["@prisma/client"] || packageJson.devDependencies?.["prisma"]
  );

  const hasDatabase =
    hasPrisma ||
    !!(
      packageJson.dependencies?.["mongoose"] ||
      packageJson.dependencies?.["typeorm"] ||
      packageJson.dependencies?.["drizzle-orm"]
    );

  return {
    framework,
    router,
    language,
    packageManager,
    hasAuth,
    hasPrisma,
    hasDatabase,
    rootDir: targetDir,
  };
}

export function getRouterBasePath(projectInfo: ProjectInfo): string {
  const srcExists = fs.existsSync(path.join(projectInfo.rootDir, "src"));

  if (projectInfo.router === "app") {
    return srcExists ? "src/app" : "app";
  } else if (projectInfo.router === "pages") {
    return srcExists ? "src/pages" : "pages";
  }

  throw new Error("Unknown router type");
}

export function getLibPath(projectInfo: ProjectInfo): string {
  if (projectInfo.framework === "express") {
    return "src/lib";
  }

  const srcExists = fs.existsSync(path.join(projectInfo.rootDir, "src"));
  return srcExists ? "src/lib" : "lib";
}