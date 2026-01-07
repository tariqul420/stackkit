import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { logger } from '../utils/logger';
import { detectProjectInfo, getRouterBasePath, getLibPath } from '../utils/detect';
import { addDependencies } from '../utils/package-manager';
import { addToPackageJson } from '../utils/json-editor';
import { addEnvVariables } from '../utils/env-editor';
import { createFile, fileExists } from '../utils/files';
import { ModuleMetadata, CreateFilePatch } from '../types';

interface AddOptions {
  provider?: string;
  force?: boolean;
  dryRun?: boolean;
  install?: boolean;
}

export async function addCommand(module: string, options: AddOptions): Promise<void> {
  logger.header(`StackKit - Add Module: ${module}`);

  try {
    const projectRoot = process.cwd();

    // Detect project info
    logger.info('Detecting project configuration...');
    const projectInfo = await detectProjectInfo(projectRoot);

    logger.success(
      `Detected: ${projectInfo.framework} (${projectInfo.router} router, ${projectInfo.language})`
    );

    // Load module metadata
    const modulesDir = path.join(__dirname, '..', '..', '..', '..', 'modules');
    const moduleMetadata = await loadModuleMetadata(modulesDir, module, options.provider);

    if (!moduleMetadata) {
      logger.error(`Module "${module}" not found`);
      process.exit(1);
    }

    // Check if framework is supported
    if (!moduleMetadata.supportedFrameworks.includes(projectInfo.framework)) {
      logger.error(
        `Module "${module}" does not support ${projectInfo.framework}. Supported: ${moduleMetadata.supportedFrameworks.join(', ')}`
      );
      process.exit(1);
    }

    // Check for conflicts
    if (module === 'auth' && projectInfo.hasAuth && !options.force) {
      logger.warn('Auth library already detected in this project');
      const { proceed } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'proceed',
          message: 'Continue anyway? (use --force to skip this prompt)',
          default: false,
        },
      ]);

      if (!proceed) {
        logger.info('Cancelled');
        process.exit(0);
      }
    }

    logger.newLine();
    logger.info(`Adding ${moduleMetadata.displayName}...`);

    if (options.dryRun) {
      logger.warn('DRY RUN MODE - No changes will be made');
      logger.newLine();
    }

    // Apply module patches
    await applyModulePatches(
      projectRoot,
      projectInfo,
      moduleMetadata,
      modulesDir,
      module,
      options
    );

    // Add dependencies
    if (Object.keys(moduleMetadata.dependencies).length > 0 && options.install !== false) {
      const deps = Object.entries(moduleMetadata.dependencies).map(
        ([name, version]) => `${name}@${version}`
      );

      if (!options.dryRun) {
        await addDependencies(projectRoot, projectInfo.packageManager, deps, false);
      } else {
        logger.info(`Would add dependencies: ${deps.join(', ')}`);
      }
    }

    // Add dev dependencies
    if (moduleMetadata.devDependencies && Object.keys(moduleMetadata.devDependencies).length > 0 && options.install !== false) {
      const devDeps = Object.entries(moduleMetadata.devDependencies).map(
        ([name, version]) => `${name}@${version}`
      );

      if (!options.dryRun) {
        await addDependencies(projectRoot, projectInfo.packageManager, devDeps, true);
      } else {
        logger.info(`Would add dev dependencies: ${devDeps.join(', ')}`);
      }
    }

    // Add environment variables
    if (moduleMetadata.envVars.length > 0) {
      if (!options.dryRun) {
        await addEnvVariables(projectRoot, moduleMetadata.envVars, { force: options.force });
      } else {
        logger.info('Would add environment variables:');
        moduleMetadata.envVars.forEach((v) => {
          logger.log(`  ${v.key}=${v.value || ''} # ${v.description}`);
        });
      }
    }

    logger.newLine();
    logger.success(`${moduleMetadata.displayName} added successfully!`);
    logger.newLine();

    // Print next steps
    logger.info('Next steps:');
    if (moduleMetadata.envVars.some((v) => v.required)) {
      logger.log('  1. Fill in required environment variables in .env');
    }
    logger.log(`  2. Run ${projectInfo.packageManager} ${projectInfo.packageManager === 'npm' ? 'run ' : ''}dev`);
    logger.log(`  3. Visit the authentication routes in your browser`);
    logger.footer();
  } catch (error) {
    logger.error(`Failed to add module: ${(error as Error).message}`);
    if (error instanceof Error && error.stack) {
      logger.log(chalk.gray(error.stack));
    }
    process.exit(1);
  }
}

async function loadModuleMetadata(
  modulesDir: string,
  moduleName: string,
  provider?: string
): Promise<ModuleMetadata | null> {
  if (!await fs.pathExists(modulesDir)) {
    return null;
  }

  // Try to find module in any category
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (!stat.isDirectory()) continue;

    // Check if module exists in this category
    const modulePath = path.join(categoryPath, provider || moduleName);
    const metadataPath = path.join(modulePath, 'module.json');

    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJSON(metadataPath);
      return metadata;
    }
  }

  return null;
}

async function applyModulePatches(
  projectRoot: string,
  projectInfo: any,
  moduleMetadata: ModuleMetadata,
  modulesDir: string,
  moduleName: string,
  options: AddOptions
): Promise<void> {
  const moduleBasePath = await findModulePath(modulesDir, moduleName, options.provider);

  if (!moduleBasePath) {
    throw new Error('Module files not found');
  }

  for (const patch of moduleMetadata.patches) {
    if (patch.type === 'create-file') {
      const filePatch = patch as CreateFilePatch;

      // Check conditions
      if (filePatch.condition) {
        if (filePatch.condition.router && filePatch.condition.router !== projectInfo.router) {
          continue; // Skip this patch
        }
        if (
          filePatch.condition.language &&
          filePatch.condition.language !== projectInfo.language
        ) {
          continue; // Skip this patch
        }
      }

      const sourceFile = path.join(moduleBasePath, 'files', filePatch.source);
      let destFile = path.join(projectRoot, filePatch.destination);

      // Replace placeholders in destination
      destFile = destFile
        .replace('{{router}}', getRouterBasePath(projectInfo))
        .replace('{{lib}}', getLibPath(projectInfo));

      if (!options.dryRun) {
        if (await fileExists(sourceFile)) {
          const content = await fs.readFile(sourceFile, 'utf-8');
          await createFile(destFile, content, { force: options.force });
          logger.success(`Created: ${path.relative(projectRoot, destFile)}`);
        } else {
          logger.warn(`Source file not found: ${filePatch.source}`);
        }
      } else {
        logger.info(`Would create: ${path.relative(projectRoot, destFile)}`);
      }
    }
  }
}

async function findModulePath(
  modulesDir: string,
  moduleName: string,
  provider?: string
): Promise<string | null> {
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);
    
    if (!stat.isDirectory()) continue;

    const modulePath = path.join(categoryPath, provider || moduleName);
    
    if (await fs.pathExists(modulePath)) {
      return modulePath;
    }
  }

  return null;
}
