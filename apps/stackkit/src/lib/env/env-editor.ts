import fs from "fs-extra";
import path from "path";
import { ENV_PATTERNS, FILE_NAMES } from "../constants";
import { logger } from "../ui/logger";

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
  validateEnvVariables(variables);

  const envExamplePath = path.join(projectRoot, FILE_NAMES.ENV_EXAMPLE);
  const envPath = path.join(projectRoot, FILE_NAMES.ENV);

  await appendToEnvFile(envExamplePath, variables, options);

  if ((await fs.pathExists(envPath)) || options.force) {
    await appendToEnvFile(envPath, variables, options);
  }

  logger.success("Environment variables added");
}

export async function removeEnvVariables(projectRoot: string, keys: string[]): Promise<void> {
  const envExamplePath = path.join(projectRoot, FILE_NAMES.ENV_EXAMPLE);
  const envPath = path.join(projectRoot, FILE_NAMES.ENV);

  await removeFromEnvFile(envExamplePath, keys);
  if (await fs.pathExists(envPath)) {
    await removeFromEnvFile(envPath, keys);
  }
}

function validateEnvVariables(variables: EnvVariable[]): void {
  for (const variable of variables) {
    if (!ENV_PATTERNS.KEY.test(variable.key)) {
      throw new Error(
        `Invalid environment variable key: ${variable.key}. ` +
          `Must match pattern: ${ENV_PATTERNS.KEY}`,
      );
    }
  }
}

async function appendToEnvFile(
  filePath: string,
  variables: EnvVariable[],
  options: { force?: boolean } = {},
): Promise<void> {
  let content = "";
  if (await fs.pathExists(filePath)) {
    content = await fs.readFile(filePath, "utf-8");
  }

  if (options.force) {
    const keysToRemove = variables.map((v) => v.key);
    await removeFromEnvFile(filePath, keysToRemove);
    content = (await fs.pathExists(filePath)) ? await fs.readFile(filePath, "utf-8") : "";
  }

  const existingKeys = extractExistingKeys(content);
  const newVariables = variables.filter((v) => !existingKeys.has(v.key));

  if (newVariables.length === 0) return;

  if (content && !content.endsWith("\n")) {
    content += "\n";
  }

  for (const variable of newVariables) {
    content += `${variable.key}=${variable.value || ""}\n`;
  }

  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

async function removeFromEnvFile(filePath: string, keys: string[]): Promise<void> {
  if (!(await fs.pathExists(filePath))) return;

  try {
    const content = await fs.readFile(filePath, "utf-8");
    const lines = content.split("\n");
    const newLines: string[] = [];

    for (const line of lines) {
      const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
      if (!match || !keys.includes(match[1])) {
        newLines.push(line);
      }
    }

    while (newLines.length > 0 && newLines[newLines.length - 1].trim() === "") {
      newLines.pop();
    }

    await fs.writeFile(filePath, newLines.join("\n") + (newLines.length > 0 ? "\n" : ""), "utf-8");
  } catch (error) {
    logger.error(`Failed to remove env variables from ${filePath}`);
    throw error;
  }
}

function extractExistingKeys(content: string): Set<string> {
  const existingKeys = new Set<string>();
  const lines = content.split("\n");

  for (const line of lines) {
    const match = line.match(/^([A-Z_][A-Z0-9_]*)=/);
    if (match) {
      existingKeys.add(match[1]);
    }
  }

  return existingKeys;
}
