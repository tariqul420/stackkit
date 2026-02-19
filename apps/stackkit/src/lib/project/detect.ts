import fs from "fs-extra";
import path from "path";
import { ProjectInfo } from "../../types";
import { ERROR_MESSAGES, FILE_NAMES, LOCK_FILES, ROUTER_TYPES } from "../constants";
import { detectAuthModules, detectDatabaseModules } from "../discovery/installed-detection";
import { getPackageRoot } from "../utils/package-root";

export async function detectProjectInfo(targetDir: string): Promise<ProjectInfo> {
  const packageJsonPath = path.join(targetDir, FILE_NAMES.PACKAGE_JSON);

  if (!(await fs.pathExists(packageJsonPath))) {
    throw new Error(ERROR_MESSAGES.NO_PACKAGE_JSON);
  }

  const packageJson = await fs.readJSON(packageJsonPath);

  let framework: string = "unknown";
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
          continue;
        }
      }

      if (bestMatch && bestMatch.score > 0) {
        framework = bestMatch.name;
      }
    }
  } catch {
    framework = "unknown";
  }

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

  let router: "app" | "pages" | "unknown" = "unknown";

  if (framework === "nextjs") {
    const appDirExists = await fs.pathExists(path.join(targetDir, "app"));
    const pagesDirExists = await fs.pathExists(path.join(targetDir, "pages"));
    const srcAppDirExists = await fs.pathExists(path.join(targetDir, "src", "app"));
    const srcPagesDirExists = await fs.pathExists(path.join(targetDir, "src", "pages"));

    if (appDirExists || srcAppDirExists) {
      router = ROUTER_TYPES.APP;
    } else if (pagesDirExists || srcPagesDirExists) {
      router = ROUTER_TYPES.PAGES;
    }
  }

  const tsconfigExists = await fs.pathExists(path.join(targetDir, FILE_NAMES.TSCONFIG_JSON));
  const jsconfigExists = await fs.pathExists(path.join(targetDir, "jsconfig.json"));
  let language: "ts" | "js";
  if (tsconfigExists) {
    language = "ts";
  } else if (jsconfigExists) {
    language = "js";
  } else {
    language = "ts";
  }

  const yarnLockExists = await fs.pathExists(path.join(targetDir, LOCK_FILES.yarn));
  const pnpmLockExists = await fs.pathExists(path.join(targetDir, LOCK_FILES.pnpm));
  const bunLockExists = await fs.pathExists(path.join(targetDir, LOCK_FILES.bun));
  let packageManager: "npm" | "yarn" | "pnpm" | "bun" = "pnpm";

  if (pnpmLockExists) {
    packageManager = "pnpm";
  } else if (yarnLockExists) {
    packageManager = "yarn";
  } else if (bunLockExists) {
    packageManager = "bun";
  }

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
