import fs from "fs-extra";
import path from "path";
import { applyFrameworkPatches } from "./config-utils";
import { mergeEnvFile, mergePackageJson } from "./file-utils";
import { logger } from "./logger";
import {
  loadFrameworkConfig,
  loadModuleConfig,
  isCompatible,
  generateDynamicVariables,
  shouldApplyPatch,
  type FrameworkConfig,
  type ModuleConfig
} from "./framework-utils";

export interface ProcessingContext {
  framework: string;
  database?: string;
  dbProvider?: string;
  auth?: string;
  language?: string;
  packageManager?: string;
  projectName?: string;
  targetDir: string;
  modulesDir: string;
  templatesDir: string;
}

export interface ProcessingResult {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
  envVars: Record<string, string>;
  postInstallCommands: string[];
}

/**
 * Generic module processor that can handle any module type
 */
export class ModuleProcessor {
  private frameworkConfig: FrameworkConfig | null = null;
  private context: ProcessingContext;
  private variables: Record<string, string>;

  constructor(context: ProcessingContext) {
    this.context = context;
    this.variables = {};
  }

  /**
   * Initialize the processor with framework config and variables
   */
  async initialize(): Promise<void> {
    this.frameworkConfig = await loadFrameworkConfig(this.context.templatesDir, this.context.framework);
    this.variables = generateDynamicVariables(this.context, this.frameworkConfig, []);
  }

  /**
   * Process a module of any category
   */
  async processModule(modulePath: string, category: string): Promise<ProcessingResult> {
    const result: ProcessingResult = {
      dependencies: {},
      devDependencies: {},
      envVars: {},
      postInstallCommands: []
    };

    try {
      const moduleConfig = await loadModuleConfig(modulePath);

      // Check compatibility
      if (!isCompatible(moduleConfig, this.context)) {
        logger.warn(`${category} ${moduleConfig.name} is not compatible with current configuration`);
        return result;
      }

      // Update variables with module-specific ones
      if (moduleConfig.variables) {
        Object.assign(this.variables, moduleConfig.variables);
      }

      // Process dependencies
      this.processDependencies(moduleConfig, result);

      // Process environment variables
      this.processEnvVars(moduleConfig, result);

      // Process patches
      await this.processPatches(moduleConfig, modulePath);

      // Process framework-specific patches
      await this.processFrameworkPatches(moduleConfig);

      // Add post-install commands
      if (moduleConfig.postInstall) {
        result.postInstallCommands.push(...moduleConfig.postInstall);
      }

      logger.success(`Processed ${category}: ${moduleConfig.displayName}`);

    } catch (error) {
      logger.error(`Failed to process ${category} module: ${(error as Error).message}`);
      throw error;
    }

    return result;
  }

  /**
   * Process dependencies from module config
   */
  private processDependencies(moduleConfig: ModuleConfig, result: ProcessingResult): void {
    // Common dependencies
    if (moduleConfig.dependencies?.common) {
      Object.assign(result.dependencies, moduleConfig.dependencies.common);
    }

    // Provider-specific dependencies
    if (this.context.dbProvider && moduleConfig.dependencies?.providers?.[this.context.dbProvider]) {
      Object.assign(result.dependencies, moduleConfig.dependencies.providers[this.context.dbProvider]);
    }

    // Framework-specific dependencies
    if (moduleConfig.dependencies?.[this.context.framework]) {
      Object.assign(result.dependencies, moduleConfig.dependencies[this.context.framework]);
    }

    // Dev dependencies
    if (moduleConfig.devDependencies?.common) {
      Object.assign(result.devDependencies, moduleConfig.devDependencies.common);
    }

    if (this.context.dbProvider && moduleConfig.devDependencies?.providers?.[this.context.dbProvider]) {
      Object.assign(result.devDependencies, moduleConfig.devDependencies.providers[this.context.dbProvider]);
    }

    if (moduleConfig.devDependencies?.[this.context.framework]) {
      Object.assign(result.devDependencies, moduleConfig.devDependencies[this.context.framework]);
    }
  }

  /**
   * Process environment variables from module config
   */
  private processEnvVars(moduleConfig: ModuleConfig, result: ProcessingResult): void {
    const processEnvVarList = (envVarList: any[]) => {
      for (const envVar of envVarList) {
        let value = envVar.value;
        // Replace variables in env var values
        for (const [key, val] of Object.entries(this.variables)) {
          value = value.replace(new RegExp(`{{${key}}}`, "g"), val);
        }
        result.envVars[envVar.key] = value;
      }
    };

    // Common env vars
    if (moduleConfig.envVars?.common) {
      processEnvVarList(moduleConfig.envVars.common);
    }

    // Provider-specific env vars
    if (this.context.dbProvider && moduleConfig.envVars?.providers?.[this.context.dbProvider]) {
      processEnvVarList(moduleConfig.envVars.providers[this.context.dbProvider]);
    }

    // Framework-specific env vars
    if (moduleConfig.envVars?.[this.context.framework]) {
      processEnvVarList(moduleConfig.envVars[this.context.framework]);
    }
  }

  /**
   * Process patches from module config
   */
  private async processPatches(moduleConfig: ModuleConfig, modulePath: string): Promise<void> {
    if (!moduleConfig.patches) return;

    const filesDir = path.join(modulePath, 'files');

    for (const patch of moduleConfig.patches) {
      // Check if patch should be applied based on conditions
      if (!shouldApplyPatch(patch, this.context)) {
        continue;
      }

      try {
        if (patch.type === 'create-file') {
          await this.processCreateFilePatch(patch, filesDir);
        } else if (patch.type === 'patch-file') {
          await this.processPatchFilePatch(patch);
        }
      } catch (error) {
        logger.error(`Failed to process patch ${patch.description}: ${(error as Error).message}`);
      }
    }
  }

  /**
   * Process create-file patch
   */
  private async processCreateFilePatch(patch: any, filesDir: string): Promise<void> {
    if (!patch.source || !patch.destination) return;

    const sourcePath = patch.source.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => this.variables[key] || match);
    const sourceFile = path.join(filesDir, sourcePath);

    let destFile = patch.destination.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => this.variables[key] || match);

    // Apply framework-specific path replacements
    if (this.frameworkConfig) {
      destFile = destFile
        .replace('{{lib}}', this.frameworkConfig.paths.lib)
        .replace('{{router}}', this.frameworkConfig.paths.router)
        .replace('{{models}}', this.frameworkConfig.paths.models)
        .replace('{{config}}', this.frameworkConfig.paths.config)
        .replace('{{public}}', this.frameworkConfig.paths.public)
        .replace('{{src}}', this.frameworkConfig.paths.src);
    }

    if (!(await fs.pathExists(sourceFile))) {
      logger.warn(`Source file not found: ${sourceFile}`);
      return;
    }

    await fs.ensureDir(path.dirname(path.join(this.context.targetDir, destFile)));

    const ext = path.extname(sourceFile);
    if (['.ts', '.js', '.tsx', '.prisma', '.json'].includes(ext)) {
      let content = await fs.readFile(sourceFile, "utf-8");
      // Replace variables in content
      for (const [key, value] of Object.entries(this.variables)) {
        content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
      }
      await fs.writeFile(path.join(this.context.targetDir, destFile), content);
    } else {
      await fs.copy(sourceFile, path.join(this.context.targetDir, destFile), { overwrite: false });
    }
  }

  /**
   * Process patch-file patch
   */
  private async processPatchFilePatch(patch: Record<string, unknown>): Promise<void> {
    if (!patch.file || typeof patch.file !== 'string') return;

    const filePath = path.join(this.context.targetDir, patch.file);
    if (!(await fs.pathExists(filePath))) {
      logger.warn(`File to patch not found: ${filePath}`);
      return;
    }

    let content = await fs.readFile(filePath, "utf-8");

    const operations = Array.isArray(patch.operations) ? patch.operations : [];
    for (const operation of operations) {
      if (operation.type === 'add-import' && operation.imports) {
        const imports = operation.imports.join('\n');
        const importRegex = /^import\s+.*$/gm;
        const matches = [...content.matchAll(importRegex)];
        if (matches.length > 0) {
          const lastImport = matches[matches.length - 1];
          const insertIndex = (lastImport.index ?? 0) + lastImport[0].length;
          content = content.slice(0, insertIndex) + '\n' + imports + content.slice(insertIndex);
        } else {
          content = imports + '\n\n' + content;
        }
      } else if (operation.type === 'add-code' && operation.after && operation.code) {
        const insertIndex = content.indexOf(operation.after);
        if (insertIndex !== -1) {
          const afterIndex = insertIndex + operation.after.length;
          content = content.slice(0, afterIndex) + operation.code + content.slice(afterIndex);
        }
      } else if (operation.type === 'replace' && operation.oldString && operation.newString) {
        content = content.replace(operation.oldString, operation.newString);
      }
    }

    await fs.writeFile(filePath, content);
  }

  /**
   * Process framework-specific patches
   */
  private async processFrameworkPatches(moduleConfig: ModuleConfig): Promise<void> {
    if (!moduleConfig.frameworkPatches) return;

    const frameworkKey = this.context.framework;
    const patches = moduleConfig.frameworkPatches[frameworkKey];

    if (patches) {
      await applyFrameworkPatches(this.context.targetDir, patches);
    }
  }

  /**
   * Apply all processed results to the target directory
   */
  async applyResults(results: ProcessingResult[]): Promise<void> {
    // Merge all dependencies
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    const allEnvVars: Record<string, string> = {};
    const allPostInstall: string[] = [];

    for (const result of results) {
      Object.assign(allDeps, result.dependencies);
      Object.assign(allDevDeps, result.devDependencies);
      Object.assign(allEnvVars, result.envVars);
      allPostInstall.push(...result.postInstallCommands);
    }

    // Apply to target directory
    await mergePackageJson(this.context.targetDir, { dependencies: allDeps, devDependencies: allDevDeps });
    await mergeEnvFile(this.context.targetDir, allEnvVars);

    // Return post-install commands for execution
    if (allPostInstall.length > 0) {
      logger.info(`Post-install commands to run: ${allPostInstall.join(', ')}`);
    }
  }
}

/**
 * Process all modules for a given context
 */
export async function processAllModules(context: ProcessingContext): Promise<string[]> {
  const processor = new ModuleProcessor(context);
  await processor.initialize();

  const results: ProcessingResult[] = [];
  const postInstallCommands: string[] = [];

  // Process database module
  if (context.database && context.database !== 'none') {
    const dbModulePath = path.join(context.modulesDir, 'database', context.database);
    if (await fs.pathExists(dbModulePath)) {
      const result = await processor.processModule(dbModulePath, 'database');
      results.push(result);
      postInstallCommands.push(...result.postInstallCommands);
    }
  }

  // Process auth module
  if (context.auth && context.auth !== 'none') {
    const authModulePath = path.join(context.modulesDir, 'auth', context.auth);
    if (await fs.pathExists(authModulePath)) {
      const result = await processor.processModule(authModulePath, 'auth');
      results.push(result);
      postInstallCommands.push(...result.postInstallCommands);
    }
  }

  // Apply all results
  await processor.applyResults(results);

  return postInstallCommands;
}