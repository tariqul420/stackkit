import fs from "fs-extra";
import path from "path";
import { ProjectInfo } from "../../types";
import { detectAuthModules, detectDatabaseModules } from "../discovery/installed-detection";
import { getPackageRoot } from "../utils/package-root";

export async function detectProjectInfo(targetDir: string): Promise<ProjectInfo> {
  const packageJsonPath = path.join(targetDir, "package.json");

  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error("No package.json found. This does not appear to be a Node.js project.");
  }

  const packageJson = await fs.readJSON(packageJsonPath);

  // Detect framework by matching available templates' characteristic files
  let framework: "nextjs" | "express" | "react" | "unknown" = "unknown";
  try {
    const templatesDir = path.join(getPackageRoot(), "templates");
    if (await fs.pathExists(templatesDir)) {
      const dirs = await fs.readdir(templatesDir);
      let bestMatch: { name: string; score: number } | null = null;
      for (const d of dirs) {
        const tplPath = path.join(templatesDir, d, "template.json");
        if (!(await fs.pathExists(tplPath))) continue;
        try {
          const tpl = await fs.readJSON(tplPath);
          const files: string[] = Array.isArray(tpl.files) ? tpl.files : [];
          let score = 0;
          for (const f of files) {
            const candidate = path.join(targetDir, f.replace(/\\/g, "/"));
            if (await fs.pathExists(candidate)) score++;
          }
          if (!bestMatch || score > bestMatch.score) bestMatch = { name: d, score };
        } catch {
          // ignore
        }
      }

      if (bestMatch && bestMatch.score > 0) {
        const name = bestMatch.name;
        if (name === "nextjs" || name === "express" || name === "react") {
          framework = name as "nextjs" | "express" | "react";
        }
      }
    }
  } catch {
    // fall back to dependency heuristics below
  }

  // Fallback: simple dependency-based detection
  if (framework === "unknown") {
    const isNextJs = packageJson.dependencies?.next || packageJson.devDependencies?.next;
    const isExpress = packageJson.dependencies?.express || packageJson.devDependencies?.express;
    const isReact = packageJson.dependencies?.react || packageJson.devDependencies?.react;
    const isVite = packageJson.dependencies?.vite || packageJson.devDependencies?.vite;

    if (isNextJs) framework = "nextjs";
    else if (isExpress) framework = "express";
    else if (isReact && isVite) framework = "react";
    else if (isReact) framework = "react";
  }

  if (framework === "unknown") {
    throw new Error("Unsupported project type or unable to detect framework from templates.");
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
    language = "ts";
  }

  // Detect package manager
  const yarnLockExists = await fs.pathExists(path.join(targetDir, "yarn.lock"));
  const pnpmLockExists = await fs.pathExists(path.join(targetDir, "pnpm-lock.yaml"));
  const bunLockExists = await fs.pathExists(path.join(targetDir, "bun.lockb"));
  let packageManager: "npm" | "yarn" | "pnpm" | "bun" = "pnpm";

  if (pnpmLockExists) {
    packageManager = "pnpm";
  } else if (yarnLockExists) {
    packageManager = "yarn";
  } else if (bunLockExists) {
    packageManager = "bun";
  }

  // Detect installed modules by comparing project dependencies against
  // declared dependencies in `modules/*/generator.json` and `module.json`.
  const detectedAuth = await detectAuthModules(packageJson);
  const detectedDbs = await detectDatabaseModules(packageJson);

  const hasAuth = detectedAuth.length > 0;
  const hasPrisma = detectedDbs.includes("prisma");
  const hasDatabase = hasPrisma || detectedDbs.length > 0;

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
