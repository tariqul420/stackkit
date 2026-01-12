import fs from "fs-extra";
import { join } from "path";

export function deepMerge(
  target: Record<string, unknown>,
  source: Record<string, unknown>,
): Record<string, unknown> {
  const result = { ...target };

  for (const key in source) {
    if (source[key] && typeof source[key] === "object" && !Array.isArray(source[key])) {
      result[key] = deepMerge(
        (result[key] as Record<string, unknown>) || {},
        source[key] as Record<string, unknown>,
      );
    } else {
      result[key] = source[key];
    }
  }

  return result;
}

export async function applyFrameworkPatches(
  targetDir: string,
  patches: Record<string, unknown>,
): Promise<void> {
  for (const [filename, patchConfig] of Object.entries(patches)) {
    const filePath = join(targetDir, filename);

    if (await fs.pathExists(filePath)) {
      const fileContent = await fs.readJson(filePath);

      if (patchConfig && typeof patchConfig === "object" && "merge" in patchConfig) {
        const merged = deepMerge(
          fileContent as Record<string, unknown>,
          (patchConfig as { merge: unknown }).merge as Record<string, unknown>,
        );
        await fs.writeJson(filePath, merged, { spaces: 2 });
      }
    }
  }
}
