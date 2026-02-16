import fs from "fs-extra";
import path from "path";
import { ENV_FILES } from "../constants";

type CopyFilterFunction = Parameters<typeof fs.copy>[2];

export async function pathExists(filePath: string): Promise<boolean> {
  return fs.pathExists(filePath);
}

export async function ensureDir(dirPath: string): Promise<void> {
  await fs.ensureDir(dirPath);
}

export async function readFile(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}

export async function writeFile(filePath: string, content: string): Promise<void> {
  await fs.ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, content, "utf-8");
}

export async function copyDir(
  source: string,
  destination: string,
  options?: CopyFilterFunction,
): Promise<void> {
  await fs.copy(source, destination, options);
}

export async function readDir(dirPath: string): Promise<string[]> {
  return fs.readdir(dirPath);
}

export async function isDirectory(dirPath: string): Promise<boolean> {
  try {
    const stat = await fs.stat(dirPath);
    return stat.isDirectory();
  } catch {
    return false;
  }
}

export async function findFilesInDir(
  dirPath: string,
  predicate: (fileName: string) => boolean,
): Promise<string[]> {
  const exists = await pathExists(dirPath);
  if (!exists) return [];

  const files = await readDir(dirPath);
  return files.filter((file) => predicate(file));
}

export async function getEnvFilePath(projectRoot: string): Promise<string | null> {
  for (const envFile of ENV_FILES) {
    const fullPath = path.join(projectRoot, envFile);
    if (await pathExists(fullPath)) {
      return fullPath;
    }
  }

  return null;
}
