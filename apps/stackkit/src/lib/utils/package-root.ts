import * as fs from "fs";
import * as path from "path";
import { FILE_NAMES, RETRY_CONFIG } from "../constants";

export function getPackageRoot(): string {
  try {
    const packageJsonPath = require.resolve("stackkit/package.json");
    const root = path.dirname(packageJsonPath);
    if (fs.existsSync(root) && fs.existsSync(path.join(root, FILE_NAMES.PACKAGE_JSON))) {
      return root;
    }
  } catch {
    /* expected: first-probe strategy may fail */
  }

  try {
    let current = __dirname;
    let attempts = 0;
    const maxAttempts = RETRY_CONFIG.PACKAGE_ROOT_MAX_ATTEMPTS;

    while (attempts < maxAttempts) {
      const packageJsonPath = path.join(current, FILE_NAMES.PACKAGE_JSON);

      if (fs.existsSync(packageJsonPath)) {
        try {
          const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
          if (packageJson.name === "stackkit") {
            return current;
          }
        } catch {
          /* expected: unparseable package.json walking up */
        }
      }

      const parent = path.dirname(current);
      if (parent === current) {
        break;
      }
      current = parent;
      attempts++;
    }
  } catch {
    /* expected: directory walk may fail */
  }

  try {
    const fallbackRoot = path.resolve(__dirname, "..", "..", "..");
    const packageJsonPath = path.join(fallbackRoot, FILE_NAMES.PACKAGE_JSON);

    if (fs.existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
        if (packageJson.name === "stackkit") {
          return fallbackRoot;
        }
      } catch {
        /* expected: unparseable fallback package.json */
      }
    }
  } catch {
    /* expected: fallback block failed */
  }

  const lastResortPath = path.resolve(__dirname, "..", "..", "..");

  if (!fs.existsSync(lastResortPath)) {
    throw new Error(
      "Unable to determine stackkit package root. " +
        "Please ensure stackkit is properly installed and run from a valid location. " +
        `Attempted path: ${lastResortPath}`,
    );
  }

  return lastResortPath;
}

export function isPackageRoot(dir: string): boolean {
  try {
    const packageJsonPath = path.join(dir, FILE_NAMES.PACKAGE_JSON);
    if (!fs.existsSync(packageJsonPath)) {
      return false;
    }

    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));
    return packageJson.name === "stackkit";
  } catch {
    return false;
  }
}
