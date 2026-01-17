import { execSync } from "child_process";

export async function initGit(cwd: string): Promise<void> {
  try {
    execSync("git --version", { stdio: "pipe" });
  } catch {
    throw new Error("Git is not installed or not available in PATH");
  }

  try {
    execSync("git status", { cwd, stdio: "pipe" });
    return;
  } catch {
    // Not a git repo, proceed with initialization
  }

  execSync("git init", { cwd, stdio: "pipe" });
  execSync("git add .", { cwd, stdio: "pipe" });

  try {
    execSync("git diff --cached --quiet", { cwd, stdio: "pipe" });
    return;
  } catch {
    // Files are staged, proceed with commit
  }

  execSync('git commit -m "Initial commit"', { cwd, stdio: "pipe" });
}
