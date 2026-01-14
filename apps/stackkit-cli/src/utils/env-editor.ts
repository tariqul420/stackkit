import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";

const ENV_MARKER_START = "# StackKit:";
const ENV_MARKER_END = "# End StackKit";

export interface EnvVariable {
  key: string;
  value?: string;
  required: boolean;
}

export async function addEnvVariables(
  projectRoot: string,
  variables: EnvVariable[],
  options: { force?: boolean } = {},
): Promise<void> {
  const envExamplePath = path.join(projectRoot, ".env.example");
  const envPath = path.join(projectRoot, ".env");

  await appendToEnvFile(envExamplePath, variables, "example", options);

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
  // Validate environment variable keys
  for (const variable of variables) {
    if (!/^[A-Z_][A-Z0-9_]*$/.test(variable.key)) {
      throw new Error(`Invalid environment variable key: ${variable.key}`);
    }
  }

  let content = "";

  if (await fs.pathExists(filePath)) {
    content = await fs.readFile(filePath, "utf-8");
  }

  // If force, remove existing keys first to avoid duplicates
  if (options.force) {
    const keysToRemove = variables.map((v) => v.key);
    await removeFromEnvFile(filePath, keysToRemove);
    if (await fs.pathExists(filePath)) {
      content = await fs.readFile(filePath, "utf-8");
    } else {
      content = "";
    }
  }

  // Check if variables already exist (after potential removal)
  const existingKeys = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      existingKeys.add(match[1]);
    }
  }

  const newVariables = variables.filter((v) => !existingKeys.has(v.key));

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
    const value = fileType === "example" ? (variable.value || "") : (variable.value || "");
    content += `${variable.key}=${value}\n`;
  }

  content += `${ENV_MARKER_END}\n`;

  await fs.ensureDir(path.dirname(filePath));
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

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const newLines: string[] = [];
    let inStackKitBlock = false;

    for (const line of lines) {
      if (line.includes(ENV_MARKER_START)) {
        inStackKitBlock = true;
        continue;
      }
      if (line.includes(ENV_MARKER_END)) {
        inStackKitBlock = false;
        continue;
      }

      const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (match && keys.includes(match[1])) {
        continue;
      }

      if (!inStackKitBlock || !line.startsWith("#")) {
        newLines.push(line);
      }
    }

    while (newLines.length > 0 && newLines[newLines.length - 1].trim() === "") {
      newLines.pop();
    }

    await fs.writeFile(filePath, newLines.join("\n"), "utf-8");
  } catch (error) {
    logger.error(`Failed to remove env variables from ${filePath}: ${error}`);
    throw error;
  }
}
