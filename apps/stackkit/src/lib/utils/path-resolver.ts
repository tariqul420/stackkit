import path from "path";
import { DIRECTORY_NAMES, FILE_NAMES, MODULE_CATEGORIES } from "../constants";
import { getPackageRoot } from "./package-root";

export function getModulesPath(): string {
  return path.join(getPackageRoot(), DIRECTORY_NAMES.MODULES);
}

export function getTemplatesPath(): string {
  return path.join(getPackageRoot(), DIRECTORY_NAMES.TEMPLATES);
}

export function getModulePath(category: string, moduleName: string): string {
  return path.join(getModulesPath(), category, moduleName);
}

export function getModuleJsonPath(category: string, moduleName: string): string {
  return path.join(getModulePath(category, moduleName), FILE_NAMES.MODULE_JSON);
}

export function getGeneratorJsonPath(category: string, moduleName: string): string {
  return path.join(getModulePath(category, moduleName), FILE_NAMES.GENERATOR_JSON);
}

export function getModuleFilesPath(category: string, moduleName: string): string {
  return path.join(getModulePath(category, moduleName), DIRECTORY_NAMES.FILES);
}

export function getTemplateJsonPath(frameworkName: string): string {
  return path.join(getTemplatesPath(), frameworkName, FILE_NAMES.TEMPLATE_JSON);
}

export function getDatabaseModulesPath(): string {
  return path.join(getModulesPath(), MODULE_CATEGORIES.DATABASE);
}

export function getAuthModulesPath(): string {
  return path.join(getModulesPath(), MODULE_CATEGORIES.AUTH);
}
