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
    void 0;
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
          void 0;
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
    void 0;
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
        void 0;
      }
    }
  } catch {
    void 0;
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
