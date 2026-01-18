import * as fs from "fs-extra";
import * as path from "path";
import type { GeneratorConfig } from "./code-generator";
import type { ModuleMetadata } from "../../types";
import { getPackageRoot } from "../utils/package-root";

export async function mergeModuleIntoGeneratorConfig(
  config: GeneratorConfig,
  modulePath: string,
): Promise<GeneratorConfig> {
  const modulePathJson = path.join(modulePath, "module.json");
  if (await fs.pathExists(modulePathJson)) {
    try {
      const moduleConfig = await fs.readJson(modulePathJson);
      if (moduleConfig.postInstall && Array.isArray(moduleConfig.postInstall)) {
        config.postInstall = moduleConfig.postInstall;
      }

      if (moduleConfig.dependencies && typeof moduleConfig.dependencies === "object") {
        config.dependencies = { ...(config.dependencies || {}), ...moduleConfig.dependencies };
      }
      if (moduleConfig.devDependencies && typeof moduleConfig.devDependencies === "object") {
        config.devDependencies = {
          ...(config.devDependencies || {}),
          ...moduleConfig.devDependencies,
        };
      }
      if (moduleConfig.scripts && typeof moduleConfig.scripts === "object") {
        config.scripts = { ...(config.scripts || {}), ...moduleConfig.scripts };
      }
      if (moduleConfig.envVars && typeof moduleConfig.envVars === "object") {
        config.envVars = { ...(config.envVars || {}), ...moduleConfig.envVars };
      }
    } catch {
      // ignore invalid module.json
    }
  }

  return config;
}

export async function mergeGeneratorIntoModuleMetadata(
  metadata: ModuleMetadata,
  modulePath: string,
): Promise<ModuleMetadata> {
  const generatorPath = path.join(modulePath, "generator.json");
  if (await fs.pathExists(generatorPath)) {
    try {
      const generator = await fs.readJson(generatorPath);
      
      // Process add-env operations to extract envVars
      if (generator.operations && Array.isArray(generator.operations)) {
        for (const operation of generator.operations) {
          if (operation.type === "add-env" && operation.envVars) {
            metadata.envVars = metadata.envVars || [];
            for (const [key, value] of Object.entries(operation.envVars)) {
              metadata.envVars.push({
                key,
                value: value as string,
                description: `Environment variable for ${key}`,
                required: true,
              });
            }
          }
        }
      }
      
      if (generator.dependencies) {
        metadata.dependencies = { ...metadata.dependencies, ...generator.dependencies };
      }
      if (generator.devDependencies) {
        metadata.devDependencies = { ...metadata.devDependencies, ...generator.devDependencies };
      }
      if (generator.postInstall && Array.isArray(generator.postInstall)) {
        metadata.postInstall = metadata.postInstall || [];
        metadata.postInstall.push(...generator.postInstall);
      }
    } catch {
      // ignore invalid generator.json
    }
  }

  return metadata;
}

export function locateOperationSource(
  generatorType: string,
  generatorName: string,
  sourceRel: string,
): string | null {
  const packageRoot = getPackageRoot();
  const modulesPath = path.join(packageRoot, "modules");
  const templatesPath = path.join(packageRoot, "templates");

  const moduleBasePath =
    generatorType === "framework"
      ? path.join(templatesPath, generatorName)
      : path.join(modulesPath, generatorType, generatorName);

  const sourcePath = path.join(moduleBasePath, "files", sourceRel);

  try {
    return sourcePath;
  } catch {
    return null;
  }
}

export default {
  mergeModuleIntoGeneratorConfig,
  mergeGeneratorIntoModuleMetadata,
  locateOperationSource,
};
