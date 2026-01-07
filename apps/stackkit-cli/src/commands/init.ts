import path from 'path';
import fs from 'fs-extra';
import inquirer from 'inquirer';
import validateNpmPackageName from 'validate-npm-package-name';
import { logger } from '../utils/logger';
import { copyTemplate } from '../utils/files';
import {
  detectPackageManager,
  installDependencies,
  initGit,
  PackageManager,
} from '../utils/package-manager';
import { TemplateMetadata } from '../types';

interface InitOptions {
  template?: string;
  pm?: PackageManager;
  install?: boolean;
  git?: boolean;
  yes?: boolean;
}

export async function initCommand(
  projectName: string | undefined,
  options: InitOptions
): Promise<void> {
  logger.header('StackKit - Project Generator');

  try {
    // Get available templates
    const templatesDir = path.join(__dirname, '..', '..', '..', '..', 'templates');
    const templates = await getAvailableTemplates(templatesDir);

    if (templates.length === 0) {
      logger.error('No templates found');
      process.exit(1);
    }

    // Prompt for project details if not using --yes
    let answers: {
      projectName: string;
      template: string;
      packageManager: PackageManager;
      install: boolean;
      git: boolean;
    };

    if (options.yes) {
      answers = {
        projectName: projectName || 'my-app',
        template: options.template || templates[0].name,
        packageManager: options.pm || 'pnpm',
        install: options.install !== false,
        git: options.git !== false,
      };
    } else {
      const prompted = await inquirer.prompt([
        {
          type: 'input',
          name: 'projectName',
          message: 'Project name:',
          default: projectName || 'my-app',
          when: !projectName,
          validate: (input: string) => {
            const validation = validateNpmPackageName(input);
            if (!validation.validForNewPackages) {
              return validation.errors?.[0] || 'Invalid package name';
            }
            return true;
          },
        },
        {
          type: 'list',
          name: 'template',
          message: 'Select a template:',
          choices: templates.map((t) => ({
            name: `${t.displayName} - ${t.description}`,
            value: t.name,
          })),
          when: !options.template,
        },
        {
          type: 'list',
          name: 'packageManager',
          message: 'Select a package manager:',
          choices: ['pnpm', 'npm', 'yarn'],
          default: 'pnpm',
          when: !options.pm,
        },
        {
          type: 'confirm',
          name: 'install',
          message: 'Install dependencies?',
          default: true,
          when: options.install !== false,
        },
        {
          type: 'confirm',
          name: 'git',
          message: 'Initialize git repository?',
          default: true,
          when: options.git !== false,
        },
      ]);

      answers = {
        projectName: projectName || prompted.projectName,
        template: options.template || prompted.template,
        packageManager: options.pm || prompted.packageManager,
        install: options.install !== false && (prompted.install ?? true),
        git: options.git !== false && (prompted.git ?? true),
      };
    }

    const targetDir = path.join(process.cwd(), answers.projectName);

    // Check if directory exists
    if (await fs.pathExists(targetDir)) {
      logger.error(`Directory ${answers.projectName} already exists`);
      process.exit(1);
    }

    logger.newLine();
    logger.info(`Creating project: ${answers.projectName}`);
    logger.info(`Template: ${answers.template}`);
    logger.info(`Package manager: ${answers.packageManager}`);

    // Copy template
    const templatePath = path.join(templatesDir, answers.template);
    await copyTemplate(templatePath, targetDir, answers.projectName);

    // Install dependencies
    if (answers.install) {
      await installDependencies(targetDir, answers.packageManager);
    }

    // Initialize git
    if (answers.git) {
      await initGit(targetDir);
    }

    logger.newLine();
    logger.success('Project created successfully!');
    logger.newLine();
    logger.info('Next steps:');
    logger.log(`  cd ${answers.projectName}`);
    if (!answers.install) {
      logger.log(`  ${answers.packageManager} install`);
    }
    logger.log(`  ${answers.packageManager} ${answers.packageManager === 'npm' ? 'run ' : ''}dev`);
    logger.footer();
  } catch (error) {
    logger.error(`Failed to create project: ${(error as Error).message}`);
    process.exit(1);
  }
}

async function getAvailableTemplates(templatesDir: string): Promise<TemplateMetadata[]> {
  if (!await fs.pathExists(templatesDir)) {
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
