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
      if (patchConfig && typeof patchConfig === "object" && "merge" in patchConfig) {
        const fileContent = await fs.readJson(filePath);
        const merged = deepMerge(
          fileContent as Record<string, unknown>,
          (patchConfig as { merge: unknown }).merge as Record<string, unknown>,
        );
        await fs.writeJson(filePath, merged, { spaces: 2 });
      } else if (patchConfig && typeof patchConfig === "object" && "replace" in patchConfig) {
        let fileContent = await fs.readFile(filePath, "utf-8");
        const replaceConfig = patchConfig as { replace: Record<string, string> };
        for (const [oldStr, newStr] of Object.entries(replaceConfig.replace)) {
          fileContent = fileContent.replace(
            new RegExp(oldStr.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
            newStr,
          );
        }
        await fs.writeFile(filePath, fileContent);
      } else if (
        patchConfig &&
        typeof patchConfig === "object" &&
        ("operations" in patchConfig ||
          ("type" in patchConfig && typeof (patchConfig as Record<string, unknown>).type === "string" && (patchConfig as Record<string, unknown>).type === "patch-file"))
      ) {
        let fileContent = await fs.readFile(filePath, "utf-8");
        const operations = (patchConfig as { operations: unknown[] }).operations;

        for (const operation of operations) {
          if (operation && typeof operation === "object" && "type" in operation) {
            const op = operation as Record<string, unknown>;
            if (op.type === "add-import" && "imports" in op && Array.isArray(op.imports)) {
              const imports = op.imports as string[];
              // Add imports at the top after existing imports
              const importLines = imports.join("\n");
              // Find the last import statement
              const lines = fileContent.split("\n");
              let lastImportIndex = -1;
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith("import")) {
                  lastImportIndex = i;
                } else if (lines[i].trim() !== "" && !lines[i].trim().startsWith("//")) {
                  break;
                }
              }
              if (lastImportIndex >= 0) {
                lines.splice(lastImportIndex + 1, 0, "", importLines);
                fileContent = lines.join("\n");
              }
            } else if (op.type === "add-code" && "after" in op && "code" in op) {
              const after = op.after as string;
              const code = op.code as string;
              const afterIndex = fileContent.indexOf(after);
              if (afterIndex >= 0) {
                const insertPos = afterIndex + after.length;
                fileContent = fileContent.slice(0, insertPos) + code + fileContent.slice(insertPos);
              }
            } else if (op.type === "replace" && "oldString" in op && "newString" in op) {
              const oldString = op.oldString as string;
              const newString = op.newString as string;
              fileContent = fileContent.replace(oldString, newString);
            }
          }
        }

        await fs.writeFile(filePath, fileContent);
      }
    }
  }
}
