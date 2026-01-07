import chalk from 'chalk';
import fs from 'fs-extra';
import path from 'path';
import { ModuleMetadata, TemplateMetadata } from '../types';
import { logger } from '../utils/logger';

interface ListOptions {
  templates?: boolean;
  modules?: boolean;
}

export async function listCommand(options: ListOptions): Promise<void> {
  const showTemplates = !options.modules || options.templates;
  const showModules = !options.templates || options.modules;

  try {
    // List templates
    if (showTemplates) {
      const templatesDir = path.join(__dirname, '..', '..', 'templates');
      const templates = await getAvailableTemplates(templatesDir);

      logger.log(chalk.bold('📦 Templates'));
      logger.newLine();

      if (templates.length === 0) {
        logger.warn('  No templates found');
      } else {
        for (const template of templates) {
          logger.log(`  ${chalk.cyan('▸')} ${template.displayName}`);
        }
        logger.newLine();
      }
    }

    // List modules
    if (showModules) {
      const modulesDir = path.join(__dirname, '..', '..', 'modules');
      const modules = await getAvailableModules(modulesDir);

      logger.log(chalk.bold('🔧 Modules'));
      logger.newLine();

      if (modules.length === 0) {
        logger.warn('  No modules found');
      } else {
        // Group by category
        const grouped = modules.reduce(
          (acc, mod) => {
            if (!acc[mod.category]) {
              acc[mod.category] = [];
            }
            acc[mod.category].push(mod);
            return acc;
          },
          {} as Record<string, ModuleMetadata[]>
        );

        for (const [category, mods] of Object.entries(grouped)) {
          logger.log(chalk.yellow(`  ${category.toUpperCase()}`));
          for (const mod of mods) {
            logger.log(`  ${chalk.cyan('▸')} ${mod.displayName}`);
          }
        }
        logger.newLine();
      }
    }
  } catch (error) {
    logger.error(`Failed to list resources: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function getAvailableTemplates(templatesDir: string): Promise<TemplateMetadata[]> {
  if (!(await fs.pathExists(templatesDir))) {
    return [];
  }

  const templateDirs = await fs.readdir(templatesDir);
  const templates: TemplateMetadata[] = [];

  for (const dir of templateDirs) {
    const metadataPath = path.join(templatesDir, dir, 'template.json');
    if (await fs.pathExists(metadataPath)) {
      const metadata = await fs.readJSON(metadataPath);
      templates.push(metadata);
    }
  }

  return templates;
}

async function getAvailableModules(modulesDir: string): Promise<ModuleMetadata[]> {
  if (!(await fs.pathExists(modulesDir))) {
    return [];
  }

  const modules: ModuleMetadata[] = [];
  const categories = await fs.readdir(modulesDir);

  for (const category of categories) {
    const categoryPath = path.join(modulesDir, category);
    const stat = await fs.stat(categoryPath);

    if (!stat.isDirectory()) continue;

    const moduleDirs = await fs.readdir(categoryPath);

    for (const moduleDir of moduleDirs) {
      const metadataPath = path.join(categoryPath, moduleDir, 'module.json');
      if (await fs.pathExists(metadataPath)) {
        const metadata = await fs.readJSON(metadataPath);
        modules.push(metadata);
      }
    }
  }

  return modules;
}
