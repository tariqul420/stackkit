import { detect } from "detect-package-manager";
import execa, { ExecaError } from "execa";
import * as fs from "fs-extra";
import * as path from "path";
import { LOCK_FILES_ARRAY, PACKAGE_MANAGERS, TIMEOUTS } from "../constants";
import { logger } from "../ui/logger";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  try {
    for (const { file, pm } of LOCK_FILES_ARRAY) {
      if (await fs.pathExists(path.join(cwd, file))) {
        logger.debug(`Detected ${pm} from ${file}`);
        return pm;
      }
    }

    const pm = await detect({ cwd });
    logger.debug(`Detected ${pm} using detect-package-manager`);
    return pm as PackageManager;
  } catch (error) {
    logger.debug(`Package manager detection failed, defaulting to npm: ${error}`);
    return PACKAGE_MANAGERS.NPM;
  }
}

export async function installDependencies(
  cwd: string,
  pm: PackageManager,
  maxRetries: number = 2,
): Promise<void> {
  const args = ["install"];
  const stdio = "pipe" as const;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      if (attempt > 0) {
        logger.debug(`Retry attempt ${attempt} for installing dependencies`);
        await new Promise((resolve) => setTimeout(resolve, TIMEOUTS.RETRY_DELAY_BASE * attempt));
      }

      await execa(pm, args, { cwd, stdio, timeout: TIMEOUTS.PACKAGE_INSTALL });
      return;
    } catch (error) {
      lastError = error as Error;
      logger.debug(`Installation attempt ${attempt + 1} failed: ${lastError.message}`);

      const err = error as { message?: string };
      const errorMsg = err.message || "";

      if (
        errorMsg.includes("ECONNRESET") ||
        errorMsg.includes("ETIMEDOUT") ||
        errorMsg.includes("ENOTFOUND")
      ) {
        continue;
      }
      throw error;
    }
  }

  throw new Error(
    `Failed to install dependencies after ${maxRetries + 1} attempts: ${lastError?.message || "Unknown error"}`,
  );
}

export async function addDependencies(
  cwd: string,
  pm: PackageManager,
  packages: string[],
  dev = false,
): Promise<void> {
  if (packages.length === 0) {
    logger.debug("No packages to add, skipping");
    return;
  }

  const invalidPackages = packages.filter((pkg) => !isValidPackageName(pkg));
  if (invalidPackages.length > 0) {
    throw new Error(`Invalid package names: ${invalidPackages.join(", ")}`);
  }

  const spinner = logger.startSpinner(
    `Adding ${dev ? "dev " : ""}dependencies: ${packages.join(", ")}...`,
  );

  try {
    const stdio = "pipe" as const;

    let args: string[] = [];
    switch (pm) {
      case "npm":
        args = ["install", ...(dev ? ["--save-dev"] : []), ...packages];
        break;
      case "yarn":
        args = ["add", ...(dev ? ["--dev"] : []), ...packages];
        break;
      case "pnpm":
        args = ["add", ...(dev ? ["-D"] : []), ...packages];
        break;
      case "bun":
        args = ["add", ...(dev ? ["-d"] : []), ...packages];
        break;
      default:
        throw new Error(`Unsupported package manager: ${pm}`);
    }

    logger.debug(`Running: ${pm} ${args.join(" ")}`);
    await execa(pm, args, { cwd, stdio, timeout: TIMEOUTS.PACKAGE_INSTALL });
    spinner.succeed(`Dependencies added successfully`);
  } catch (error) {
    spinner.fail(`Failed to add dependencies`);

    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.debug(`Full error: ${errorMessage}`);

    if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("ETIMEDOUT")) {
      throw new Error(
        `Network error while adding dependencies. Please check your internet connection and try again.`,
      );
    } else if (errorMessage.includes("404")) {
      throw new Error(
        `One or more packages not found. Please verify package names: ${packages.join(", ")}`,
      );
    } else {
      throw new Error(`Failed to add dependencies: ${errorMessage}`);
    }
  }
}

function isValidPackageName(packageName: string): boolean {
  const nameOnly = packageName.split("@").filter(Boolean)[0] || packageName;
  const validPattern = /^(@[a-z0-9-~][a-z0-9-._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/i;
  return validPattern.test(nameOnly);
}

export async function initGit(cwd: string): Promise<void> {
  const spinner = logger.startSpinner("Initializing git repository...");

  try {
    await execa("git", ["--version"], { cwd, stdio: "pipe" });
  } catch {
    spinner.fail("Git is not installed");
    logger.warn("Skipping git initialization. Please install git to enable version control.");
    return;
  }

  try {
    if (await fs.pathExists(path.join(cwd, ".git"))) {
      spinner.succeed("Git repository already exists");
      return;
    }
  } catch {
    return;
  }

  const run = async (stdio: "pipe" | "inherit") => {
    await execa("git", ["init"], { cwd, stdio });
    await execa("git", ["add", "."], { cwd, stdio });
    
    try {
      await execa("git", ["config", "user.name"], { cwd, stdio: "pipe" });
      await execa("git", ["config", "user.email"], { cwd, stdio: "pipe" });
      await execa("git", ["commit", "-m", "Initial commit from StackKit"], { cwd, stdio });
    } catch {
      logger.debug("Git config not found, skipping initial commit");
    }
  };

  try {
    await run("pipe");
    spinner.succeed("Git repository initialized");
    return;
  } catch (error) {
    const err = error as ExecaError;
    logger.debug(`Git init error: ${err.message}`);

    const isENOBUFS = (e: unknown): boolean => {
      if (!e || typeof e !== "object") return false;
      const obj = e as Record<string, unknown>;
      return (
        obj.code === "ENOBUFS" ||
        obj.errno === "ENOBUFS" ||
        String(obj.message ?? "").includes("ENOBUFS")
      );
    };

    if (isENOBUFS(err)) {
      spinner.warn("Skipped git initialization due to system resource limits");
      logger.info("You can manually initialize git later with: git init");
      return;
    }

    try {
      await run("inherit");
      spinner.succeed("Git repository initialized");
      return;
    } catch (fallbackErr) {
      const fe = fallbackErr as ExecaError;
      logger.debug(`Git init fallback error: ${fe.message}`);
      spinner.warn("Git initialization skipped");
      logger.info("You can manually initialize git later with: git init");
      return;
    }
  }
}
