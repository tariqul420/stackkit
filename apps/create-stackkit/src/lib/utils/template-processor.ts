import fs from "fs-extra";
import path from "path";
import { logger } from "./logger";

export interface TemplateProcessorOptions {
  templateDir: string;
  targetDir: string;
  variables: Record<string, string>;
  language?: string;
  fileReplacements?: Array<{
    file: string;
    replacements: Array<{
      from: string;
      to: string;
    }>;
  }>;
  conditionalFiles?: Array<{
    condition: (vars: Record<string, string>) => boolean;
    files: string[];
  }>;
}

/**
 * Advanced template processor with conditional file inclusion and variable replacement
 */
export class TemplateProcessor {
  private options: TemplateProcessorOptions;

  constructor(options: TemplateProcessorOptions) {
    this.options = options;
  }

  /**
   * Process the entire template
   */
  async process(): Promise<void> {
    const { templateDir, targetDir, variables } = this.options;

    if (!(await fs.pathExists(templateDir))) {
      throw new Error(`Template directory not found: ${templateDir}`);
    }

    await fs.ensureDir(targetDir);

    // Copy base template files
    await this.copyTemplateFiles(templateDir, targetDir);

    // Apply variable replacements
    await this.applyVariableReplacements(targetDir, variables);

    // Apply file replacements (for JS/TS conversion)
    if (this.options.fileReplacements) {
      await this.applyFileReplacements(targetDir);
    }

    // Process conditional files
    if (this.options.conditionalFiles) {
      await this.processConditionalFiles(targetDir);
    }

    // Update package.json scripts based on language
    await this.updatePackageScripts(targetDir);
  }

  /**
   * Copy template files with filtering
   */
  private async copyTemplateFiles(templateDir: string, targetDir: string): Promise<void> {
    await fs.copy(templateDir, targetDir, {
      filter: (src, dest) => {
        const basename = path.basename(src);
        // Skip template.json and other config files
        return !['template.json', 'config.json', 'node_modules', '.git'].includes(basename);
      },
    });
  }

  /**
   * Apply variable replacements in all files
   */
  private async applyVariableReplacements(targetDir: string, variables: Record<string, string>): Promise<void> {
    const processFile = async (filePath: string): Promise<void> => {
      const ext = path.extname(filePath);
      const shouldProcess = ['.ts', '.js', '.tsx', '.jsx', '.json', '.md', '.prisma', '.env'].includes(ext) ||
                           path.basename(filePath).includes('config') ||
                           path.basename(filePath).includes('package');

      if (!shouldProcess) return;

      try {
        let content = await fs.readFile(filePath, 'utf-8');
        let hasReplacements = false;

        // Replace variables
        for (const [key, value] of Object.entries(variables)) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          if (regex.test(content)) {
            content = content.replace(regex, value);
            hasReplacements = true;
          }
        }

        if (hasReplacements) {
          await fs.writeFile(filePath, content);
        }
      } catch (error) {
        // Skip binary files or files that can't be read as text
        logger.warn(`Skipping file processing for ${filePath}: ${(error as Error).message}`);
      }
    };

    const processDirectory = async (dir: string): Promise<void> => {
      const items = await fs.readdir(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);

        if (stat.isDirectory()) {
          await processDirectory(fullPath);
        } else {
          await processFile(fullPath);
        }
      }
    };

    await processDirectory(targetDir);
  }

  /**
   * Apply file-specific replacements (mainly for JS/TS conversion)
   */
  private async applyFileReplacements(targetDir: string): Promise<void> {
    for (const replacement of this.options.fileReplacements || []) {
      const filePath = path.join(targetDir, replacement.file);

      if (await fs.pathExists(filePath)) {
        let content = await fs.readFile(filePath, 'utf-8');

        for (const { from, to } of replacement.replacements) {
          const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          content = content.replace(new RegExp(escapedFrom, 'g'), to);
        }

        await fs.writeFile(filePath, content);
      }
    }
  }

  /**
   * Process conditional files based on variables
   */
  private async processConditionalFiles(targetDir: string): Promise<void> {
    for (const conditional of this.options.conditionalFiles || []) {
      if (conditional.condition(this.options.variables)) {
        for (const file of conditional.files) {
          const sourcePath = path.join(this.options.templateDir, file);
          const targetPath = path.join(targetDir, file);

          if (await fs.pathExists(sourcePath)) {
            await fs.ensureDir(path.dirname(targetPath));
            await fs.copy(sourcePath, targetPath, { overwrite: false });
          }
        }
      }
    }
  }

  /**
   * Update package.json scripts based on language
   */
  private async updatePackageScripts(targetDir: string): Promise<void> {
    const packageJsonPath = path.join(targetDir, 'package.json');

    if (!(await fs.pathExists(packageJsonPath))) {
      return;
    }

    const packageJson = await fs.readJson(packageJsonPath);

    if (this.options.language === 'javascript' && packageJson.jsScripts) {
      // Replace TypeScript scripts with JavaScript equivalents
      packageJson.scripts = { ...packageJson.scripts, ...packageJson.jsScripts };
    }

    // Apply variable replacements in scripts
    if (packageJson.scripts) {
      for (const [key, script] of Object.entries(packageJson.scripts)) {
        if (typeof script === 'string') {
          let processedScript = script as string;
          for (const [varKey, varValue] of Object.entries(this.options.variables)) {
            processedScript = processedScript.replace(new RegExp(`{{${varKey}}}`, 'g'), varValue);
          }
          packageJson.scripts[key] = processedScript;
        }
      }
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  /**
   * Escape regex special characters
   */
  private escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * Process a framework template with advanced options
 */
export async function processFrameworkTemplate(
  framework: string,
  templatesDir: string,
  targetDir: string,
  variables: Record<string, string>,
  language: string = 'typescript'
): Promise<void> {
  const templateDir = path.join(templatesDir, framework);
  const templateJsonPath = path.join(templateDir, 'template.json');

  let fileReplacements: TemplateProcessorOptions['fileReplacements'] = [];
  const conditionalFiles: TemplateProcessorOptions['conditionalFiles'] = [];

  // Load template configuration
  if (await fs.pathExists(templateJsonPath)) {
    const templateConfig = await fs.readJson(templateJsonPath);

    // Extract file replacements from template config
    if (templateConfig.fileReplacements) {
      fileReplacements = templateConfig.fileReplacements.map((replacement: {
        file: string;
        from: string;
        to: string;
      }) => ({
        file: replacement.file,
        replacements: [{
          from: replacement.from,
          to: replacement.to
        }]
      }));
    }

    // Add conditional files based on language
    if (language === 'javascript') {
      conditionalFiles.push({
        condition: () => true,
        files: templateConfig.files || []
      });
    }
  }

  const processor = new TemplateProcessor({
    templateDir,
    targetDir,
    variables,
    language,
    fileReplacements,
    conditionalFiles
  });

  await processor.process();
}