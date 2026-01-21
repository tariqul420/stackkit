import { detect } from "detect-package-manager";
import execa, { ExecaError } from "execa";
import { logger } from "../ui/logger";

export type PackageManager = "npm" | "yarn" | "pnpm" | "bun";

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  try {
    const pm = await detect({ cwd });
    return pm as PackageManager;
  } catch {
    return "npm";
  }
}

export async function installDependencies(cwd: string, pm: PackageManager): Promise<void> {
  const args = ["install"];
  const stdio = "pipe" as const;

  await execa(pm, args, { cwd, stdio });
}

export async function addDependencies(
  cwd: string,
  pm: PackageManager,
  packages: string[],
  dev = false,
): Promise<void> {
  if (packages.length === 0) return;

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
    }

    await execa(pm, args, { cwd, stdio });
    spinner.succeed(`Dependencies added successfully`);
  } catch (error) {
    spinner.fail(`Failed to add dependencies`);
    throw new Error(
      `Failed to add dependencies: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
}

export async function initGit(cwd: string): Promise<void> {
  const spinner = logger.startSpinner("Initializing git repository...");

  const run = async (stdio: "pipe" | "inherit") => {
    await execa("git", ["init"], { cwd, stdio });
    await execa("git", ["add", "."], { cwd, stdio });
    await execa("git", ["commit", "-m", "Initial commit from StackKit"], { cwd, stdio });
  };

  try {
    await run("pipe");
    spinner.succeed("Git repository initialized");
    return;
  } catch (error) {
    const err = error as ExecaError;
    spinner.fail(`Git init failed: ${err.message}`);

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
      logger.warn("ENOBUFS detected; skipping git initialization.");
      logger.info("Skipped git initialization due to system resource limits.");
      return;
    }

    try {
      await run("inherit");
      spinner.succeed("Git repository initialized (fallback)");
      return;
    } catch (fallbackErr) {
      const fe = fallbackErr as ExecaError;
      logger.warn(`Git init fallback failed: ${fe.message}`);
      spinner.fail("Git initialization skipped");
      return;
    }
  }
}
