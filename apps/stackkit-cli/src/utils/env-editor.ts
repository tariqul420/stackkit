import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";

const ENV_MARKER_START = "# StackKit:";
const ENV_MARKER_END = "# End StackKit";

export interface EnvVariable {
  key: string;
  value?: string;
  description: string;
  required: boolean;
}

export async function addEnvVariables(
  projectRoot: string,
  variables: EnvVariable[],
  options: { force?: boolean } = {},
): Promise<void> {
  const envExamplePath = path.join(projectRoot, ".env.example");
  const envPath = path.join(projectRoot, ".env");

  // Add to .env.example
  await appendToEnvFile(envExamplePath, variables, "example", options);

  // Add to .env if it exists or create it
  const envExists = await fs.pathExists(envPath);
  if (envExists || options.force) {
    await appendToEnvFile(envPath, variables, "local", options);
  }

  logger.success("Environment variables added");
}

async function appendToEnvFile(
  filePath: string,
  variables: EnvVariable[],
  fileType: "example" | "local",
  options: { force?: boolean } = {},
): Promise<void> {
  let content = "";

  if (await fs.pathExists(filePath)) {
    content = await fs.readFile(filePath, "utf-8");
  }

  // Check if variables already exist
  const existingKeys = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      existingKeys.add(match[1]);
    }
  }

  const newVariables = variables.filter((v) => {
    if (existingKeys.has(v.key)) {
      if (!options.force) {
        logger.warn(`Variable ${v.key} already exists in ${filePath}`);
        return false;
      }
    }
    return true;
  });

  if (newVariables.length === 0) {
    return;
  }

  // Ensure file ends with newline
  if (content && !content.endsWith("\n")) {
    content += "\n";
  }

  // Add marker and variables
  content += "\n";
  content += `${ENV_MARKER_START} Added by StackKit\n`;

  for (const variable of newVariables) {
    if (variable.description) {
      content += `# ${variable.description}\n`;
    }

    const value = fileType === "example" ? variable.value || "" : variable.value || "";
    content += `${variable.key}=${value}\n`;
  }

  content += `${ENV_MARKER_END}\n`;

  await fs.writeFile(filePath, content, "utf-8");
}

export async function removeEnvVariables(projectRoot: string, keys: string[]): Promise<void> {
  const envExamplePath = path.join(projectRoot, ".env.example");
  const envPath = path.join(projectRoot, ".env");

  await removeFromEnvFile(envExamplePath, keys);

  if (await fs.pathExists(envPath)) {
    await removeFromEnvFile(envPath, keys);
  }
}

async function removeFromEnvFile(filePath: string, keys: string[]): Promise<void> {
  if (!(await fs.pathExists(filePath))) {
    return;
  }

  const content = await fs.readFile(filePath, "utf-8");
  const lines = content.split("\n");
  const newLines: string[] = [];

  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match && keys.includes(match[1])) {
      continue; // Skip this line
    }
    newLines.push(line);
  }

  await fs.writeFile(filePath, newLines.join("\n"), "utf-8");
}
