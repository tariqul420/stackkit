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
