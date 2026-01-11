import fs from "fs-extra";

export async function modifyJson(
  filePath: string,
  modifier: (_json: Record<string, unknown>) => Record<string, unknown>,
  options: { create?: boolean; force?: boolean } = {},
): Promise<void> {
  const exists = await fs.pathExists(filePath);

  if (!exists && !options.create) {
    throw new Error(`File not found: ${filePath}`);
  }

  const modified = modifier(exists ? await fs.readJSON(filePath) : {});
  await fs.writeJSON(filePath, modified, { spaces: 2 });
}

export async function addToPackageJson(
  filePath: string,
  section: "dependencies" | "devDependencies" | "scripts",
  additions: Record<string, string>,
): Promise<void> {
  await modifyJson(filePath, (_json) => {
    _json[section] = (_json[section] as Record<string, unknown>) || {};
    Object.assign(_json[section] as Record<string, unknown>, additions);
    return _json;
  });
}

export async function setJsonValue(
  filePath: string,
  path: string,
  value: unknown,
  options: { merge?: boolean } = {},
): Promise<void> {
  await modifyJson(filePath, (_json) => {
    const keys = path.split(".");
    let current = _json;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!(current[key] as Record<string, unknown>)) {
        current[key] = {};
      }
      current = current[key] as Record<string, unknown>;
    }

    const lastKey = keys[keys.length - 1];

    if (options.merge && typeof current[lastKey] === "object" && typeof value === "object") {
      current[lastKey] = { ...current[lastKey], ...value };
    } else {
      current[lastKey] = value;
    }

    return _json;
  });
}
