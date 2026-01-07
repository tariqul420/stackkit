import fs from 'fs-extra';
import { logger } from './logger';

export async function modifyJson(
  filePath: string,
  modifier: (json: any) => any,
  options: { create?: boolean; force?: boolean } = {}
): Promise<void> {
  const exists = await fs.pathExists(filePath);

  if (!exists && !options.create) {
    throw new Error(`File not found: ${filePath}`);
  }

  let json = {};
  if (exists) {
    json = await fs.readJSON(filePath);
  }

  const modified = modifier(json);
  await fs.writeJSON(filePath, modified, { spaces: 2 });
}

export async function addToPackageJson(
  filePath: string,
  section: 'dependencies' | 'devDependencies' | 'scripts',
  additions: Record<string, string>
): Promise<void> {
  await modifyJson(filePath, (json) => {
    json[section] = json[section] || {};
    Object.assign(json[section], additions);
    return json;
  });
}

export async function setJsonValue(
  filePath: string,
  path: string,
  value: any,
  options: { merge?: boolean } = {}
): Promise<void> {
  await modifyJson(filePath, (json) => {
    const keys = path.split('.');
    let current = json;

    for (let i = 0; i < keys.length - 1; i++) {
      const key = keys[i];
      if (!current[key]) {
        current[key] = {};
      }
      current = current[key];
    }

    const lastKey = keys[keys.length - 1];

    if (options.merge && typeof current[lastKey] === 'object' && typeof value === 'object') {
      current[lastKey] = { ...current[lastKey], ...value };
    } else {
      current[lastKey] = value;
    }

    return json;
  });
}
