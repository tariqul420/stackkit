import { execSync } from "child_process";

export async function installDependencies(cwd: string, packageManager: string): Promise<void> {
  const commands: Record<string, string> = {
    npm: "npm install",
    yarn: "yarn install",
    pnpm: "pnpm install",
    bun: "bun install",
  };

  const isAvailable = (cmd: string) => {
    try {
      execSync(`command -v ${cmd}`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  };

  let chosen = packageManager;

  if (!isAvailable(chosen)) {
    const fallbacks = ["pnpm", "npm", "yarn", "bun"];
    const found = fallbacks.find((p) => isAvailable(p));
    if (found) {
      // eslint-disable-next-line no-console
      console.warn(
        `Selected package manager '${chosen}' was not found. Falling back to '${found}'.`,
      );
      chosen = found;
    } else {
      throw new Error(
        `Selected package manager '${packageManager}' was not found and no fallback package manager is available. Please install '${packageManager}' or use a different package manager.`,
      );
    }
  }

  const command = commands[chosen];

  execSync(command, {
    cwd,
    stdio: "pipe",
  });
}
