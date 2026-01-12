import { execSync } from "child_process";

export async function initGit(cwd: string): Promise<void> {
  execSync("git init", { cwd, stdio: "pipe" });
  execSync("git add .", { cwd, stdio: "pipe" });
  execSync('git commit -m "Initial commit"', { cwd, stdio: "pipe" });
}
