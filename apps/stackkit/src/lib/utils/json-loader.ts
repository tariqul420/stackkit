import { readFileSync } from "fs";
import fs from "fs-extra";

export async function loadJsonAsync<T = unknown>(filePath: string): Promise<T | null> {
  try {
    return await fs.readJSON(filePath);
  } catch {
    return null;
  }
}

export function loadJsonSync<T = unknown>(filePath: string): T | null {
  try {
    return JSON.parse(readFileSync(filePath, "utf-8"));
  } catch {
    return null;
  }
}

export async function saveJson<T = unknown>(
  filePath: string,
  data: T,
  options?: { spaces?: number },
): Promise<void> {
  await fs.writeJSON(filePath, data, { spaces: options?.spaces ?? 2 });
}

export async function loadJsonWithDefault<T>(filePath: string, defaultValue: T): Promise<T> {
  const data = await loadJsonAsync<T>(filePath);
  return data ?? defaultValue;
}
