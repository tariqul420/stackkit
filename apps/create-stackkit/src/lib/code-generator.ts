import * as fs from 'fs-extra';
import * as path from 'path';
import { FrameworkConfig } from './framework-utils';

export interface GenerationContext {
  framework: string;
  database?: string;
  auth?: string;
  features?: string[];
  [key: string]: unknown;
}

export interface TemplateCondition {
  framework?: string | string[];
  database?: string | string[];
  auth?: string | string[];
  features?: string[];
}

export interface Operation {
  type: 'create-file' | 'patch-file' | 'add-dependency' | 'add-script' | 'add-env' | 'run-command';
  description?: string;
  condition?: TemplateCondition;
  priority?: number;

  // create-file
  source?: string;
  destination?: string;
  content?: string;

  // patch-file
  file?: string;
  operations?: PatchOperation[];

  // add-dependency
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;

  // add-script
  scripts?: Record<string, string>;

  // add-env
  envVars?: Record<string, string>;

  // run-command
  command?: string;
}

export interface PatchOperation {
  type: 'add-import' | 'add-code' | 'replace-code' | 'add-to-top' | 'add-to-bottom';
  condition?: TemplateCondition;

  // add-import
  imports?: string[];

  // add-code, replace-code
  code?: string;
  after?: string;
  before?: string;
  replace?: string;

  // add-to-top, add-to-bottom
  content?: string;
}

export interface GeneratorConfig {
  name: string;
  type: 'framework' | 'database' | 'auth';
  priority: number;
  operations?: Operation[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  envVars?: Record<string, string>;
}

export class AdvancedCodeGenerator {
  private generators: Map<string, GeneratorConfig> = new Map();
  private frameworkConfig: FrameworkConfig;
  private postInstallCommands: string[] = [];

  constructor(frameworkConfig: FrameworkConfig) {
    this.frameworkConfig = frameworkConfig;
  }

  async loadGenerators(modulesPath: string): Promise<void> {
    const moduleTypes = ['auth', 'database'];

    // Load module generators
    for (const type of moduleTypes) {
      const typePath = path.join(modulesPath, type);
      if (await fs.pathExists(typePath)) {
        const modules = await fs.readdir(typePath);
        for (const moduleName of modules) {
          const generatorPath = path.join(typePath, moduleName, 'generator.json');
          if (await fs.pathExists(generatorPath)) {
            try {
              const config: GeneratorConfig = await fs.readJson(generatorPath);
              this.generators.set(`${type}:${moduleName}`, config);
            } catch {
              // Silently skip invalid generator files
            }
          }
        }
      }
    }
  }

  private evaluateCondition(condition: TemplateCondition | undefined, context: GenerationContext): boolean {
    if (!condition) return true;

    for (const [key, value] of Object.entries(condition)) {
      if (key === 'features') {
        const requiredFeatures = value as string[];
        const contextFeatures = context.features || [];
        if (!requiredFeatures.every(feature => contextFeatures.includes(feature))) {
          return false;
        }
      } else {
        if (Array.isArray(value)) {
          if (!value.includes(context[key])) {
            return false;
          }
        } else {
          if (context[key] !== value) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private processTemplate(content: string, context: GenerationContext): string {
    // Create a copy of context for template variables
    const templateContext = { ...context };

    // Handle variable definitions {{#var name = value}} at the top of the file
    content = this.processVariableDefinitions(content, templateContext);

    // Process the rest of the template with the extended context
    return this.processTemplateRecursive(content, templateContext);
  }

  private processVariableDefinitions(content: string, context: GenerationContext): string {
    let result = content;
    let index = 0;

    while (true) {
      const varStart = result.indexOf('{{#var ', index);
      if (varStart === -1) break;

      const equalsIndex = result.indexOf('=', varStart);
      if (equalsIndex === -1) break;

      const varNameMatch = result.substring(varStart + 7, equalsIndex).trim();
      if (!varNameMatch) break;

      // Find the end of the variable value by counting braces
      // Start with braceCount = 1 because {{#var is already open
      let braceCount = 1;
      const valueStart = equalsIndex + 1;
      let valueEnd = valueStart;

      for (let i = valueStart; i < result.length; i++) {
        if (result[i] === '{' && result[i + 1] === '{') {
          braceCount++;
          i++; // Skip next character
        } else if (result[i] === '}' && result[i + 1] === '}') {
          braceCount--;
          if (braceCount === 0) {
            valueEnd = i;
            break;
          }
          i++; // Skip next character
        }
      }

      if (valueEnd === valueStart) break;

      const varValue = result.substring(valueStart, valueEnd).trim();
      const fullMatch = result.substring(varStart, valueEnd + 2);

      // Process the variable value with current context (allowing nested variables/conditionals)
      const processedValue = this.processTemplateRecursive(varValue, context);
      context[varNameMatch] = processedValue;

      // Remove the variable definition
      result = result.replace(fullMatch, '');
      index = varStart;
    }

    return result;
  }

  private processTemplateRecursive(content: string, context: GenerationContext): string {
    content = content.replace(/\{\{#if\s+([^}\s]+)\s+([^}\s]+)\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, varName, operator, expectedValue, blockContent) => {
      const actualVal = context[varName.trim()];
      const cleanExpectedVal = expectedValue.trim().replace(/['"]/g, '');

      let conditionMet = false;
      switch (operator) {
        case '==':
        case '===':
          conditionMet = actualVal === cleanExpectedVal;
          break;
        case '!=':
        case '!==':
          conditionMet = actualVal !== cleanExpectedVal;
          break;
        case 'includes':
          conditionMet = Array.isArray(actualVal) && actualVal.includes(cleanExpectedVal);
          break;
        case 'startsWith':
          conditionMet = typeof actualVal === 'string' && actualVal.startsWith(cleanExpectedVal);
          break;
        case 'endsWith':
          conditionMet = typeof actualVal === 'string' && actualVal.endsWith(cleanExpectedVal);
          break;
      }

      return conditionMet ? this.processTemplateRecursive(blockContent, context) : '';
    });

    // Handle simple conditional blocks {{#if condition}}...{{/if}} (backward compatibility)
    content = content.replace(/\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g, (match, condition, blockContent) => {
      const conditionParts = condition.split('==');
      if (conditionParts.length === 2) {
        const [varName, expectedValue] = conditionParts.map((s: string) => s.trim().replace(/['"]/g, ''));
        if (context[varName] === expectedValue) {
          return this.processTemplateRecursive(blockContent, context);
        }
        return '';
      }

      const conditionFunc = condition.split('.');
      if (conditionFunc.length === 2 && conditionFunc[1] === 'includes') {
        const [arrayName, item] = conditionFunc[0].split('(');
        const itemValue = item.replace(')', '').replace(/['"]/g, '');
        const array = context[arrayName] || [];
        if (Array.isArray(array) && array.includes(itemValue)) {
          return this.processTemplateRecursive(blockContent, context);
        }
        return '';
      }

      return '';
    });

    // Handle switch statements {{#switch variable}}...{{/switch}}
    content = content.replace(/\{\{#switch\s+([^}]+)\}\}([\s\S]*?)\{\{\/switch\}\}/g, (match, varName, switchContent) => {
      const actualVal = context[varName.trim()];

      // Parse cases
      const caseRegex = /\{\{#case\s+([^}]+)\}\}([\s\S]*?)(?=\{\{#case|\{\{\/switch\})/g;
      let result = '';
      let defaultCase = '';

      let caseMatch;
      while ((caseMatch = caseRegex.exec(switchContent)) !== null) {
        const [, caseValue, caseContent] = caseMatch;
        const cleanCaseValue = caseValue.trim().replace(/['"]/g, '');

        if (cleanCaseValue === 'default') {
          defaultCase = caseContent;
        } else if (actualVal === cleanCaseValue) {
          result = caseContent;
          break;
        }
      }

      return result || defaultCase || '';
    });

    // Handle variable replacement with advanced expressions
    content = content.replace(/\{\{([^}]+)\}\}/g, (match, varExpr) => {
      const trimmedExpr = varExpr.trim();

      // Handle ternary expressions like framework=='nextjs' ? '@/lib' : '.'
      const ternaryMatch = trimmedExpr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+?)$/);
      if (ternaryMatch) {
        const [, condition, trueVal, falseVal] = ternaryMatch;
        const conditionMatch = condition.match(/^(.+?)==(.+)$/);
        if (conditionMatch) {
          const [, varName, expectedVal] = conditionMatch;
          const cleanVarName = varName.trim();
          const cleanExpectedVal = expectedVal.trim().replace(/['"]/g, '');
          const actualVal = context[cleanVarName];
          const result = actualVal === cleanExpectedVal ? trueVal.trim() : falseVal.trim();
          return result.replace(/['"]/g, ''); // Remove quotes from result
        }
      }

      // Handle switch expressions {{switch variable case1: value1, case2: value2, default: defaultValue}}
      const switchMatch = trimmedExpr.match(/^switch\s+([^}\s]+)\s+(.+)$/);
      if (switchMatch) {
        const [, varName, casesStr] = switchMatch;
        const actualVal = context[varName.trim()];

        const cases = casesStr.split(',').map((c: string) => c.trim());
        for (const caseStr of cases) {
          const [caseVal, result] = caseStr.split(':').map((s: string) => s.trim());
          const cleanCaseVal = caseVal.replace(/['"]/g, '');
          if (cleanCaseVal === actualVal || cleanCaseVal === 'default') {
            return result.replace(/['"]/g, '');
          }
        }
        return '';
      }

      // Handle feature flags {{feature:name}}
      if (trimmedExpr.startsWith('feature:')) {
        const featureName = trimmedExpr.substring(8);
        const features = context.features || [];
        return features.includes(featureName) ? 'true' : 'false';
      }

      // Handle conditional expressions {{if condition then:value else:value}}
      const conditionalMatch = trimmedExpr.match(/^if\s+(.+?)\s+then:([^,]+),\s*else:(.+)$/);
      if (conditionalMatch) {
        const [, condition, thenVal, elseVal] = conditionalMatch;
        const conditionMatch2 = condition.match(/^(.+?)==(.+)$/);
        if (conditionMatch2) {
          const [, varName, expectedVal] = conditionMatch2;
          const cleanVarName = varName.trim();
          const cleanExpectedVal = expectedVal.trim().replace(/['"]/g, '');
          const actualVal = context[cleanVarName];
          const result = actualVal === cleanExpectedVal ? thenVal.trim() : elseVal.trim();
          return result.replace(/['"]/g, '');
        }
      }

      // Simple variable replacement
      const value = context[trimmedExpr];
      return value !== undefined ? String(value) : match;
    });

    return content;
  }

  async generate(
    selectedModules: { framework: string; database?: string; auth?: string; prismaProvider?: string },
    features: string[],
    outputPath: string
  ): Promise<string[]> {
    // First, copy the base template
    await this.copyTemplate(selectedModules.framework, outputPath);

    const context: GenerationContext = {
      ...selectedModules,
      features,
    };

    // Set default prismaProvider if database is prisma but no provider specified
    if (selectedModules.database === 'prisma' && !context.prismaProvider) {
      context.prismaProvider = 'postgresql';
    }

    // Collect all applicable operations
    const applicableOperations: Array<Operation & { generator: string; generatorType: string }> = [];

    for (const [key, generator] of this.generators) {
      const [genType, name] = key.split(':');

      // Check if this generator is selected
      if (genType === 'framework' && name === selectedModules.framework) {
        // Framework is always included
      } else if (genType === 'database' && name === selectedModules.database) {
        // Database is selected
      } else if (genType === 'auth' && name === selectedModules.auth) {
        // Auth is selected
      } else {
        continue; // Skip unselected generators
      }

      // Handle operations
      const items = generator.operations || [];
      for (const item of items) {
        if (this.evaluateCondition(item.condition, context)) {
          applicableOperations.push({
            ...(item as Operation),
            generator: name,
            generatorType: genType,
            priority: generator.priority,
          });
        }
      }
    }

    // Sort operations by priority
    applicableOperations.sort((a, b) => {
      const priorityA = a.priority || 0;
      const priorityB = b.priority || 0;
      return priorityA - priorityB;
    });

    // Execute operations
    for (const operation of applicableOperations) {
      await this.executeOperation(operation, context, outputPath);
    }

    // Generate package.json updates
    await this.generatePackageJson(selectedModules, features, outputPath);

    return this.postInstallCommands;
  }

  private async executeOperation(operation: Operation & { generator: string; generatorType: string }, context: GenerationContext, outputPath: string): Promise<void> {
    // Process templates in operation content
    const processedOperation = this.processOperationTemplates(operation, context);

    switch (processedOperation.type) {
      case 'create-file':
        await this.executeCreateFile(processedOperation as Operation & { generator: string; generatorType: string }, context, outputPath);
        break;
      case 'patch-file':
        await this.executePatchFile(processedOperation as Operation & { generator: string; generatorType: string }, context, outputPath);
        break;
      case 'add-dependency':
        await this.executeAddDependency(processedOperation as Operation & { generator: string; generatorType: string }, context, outputPath);
        break;
      case 'add-script':
        await this.executeAddScript(processedOperation as Operation & { generator: string; generatorType: string }, context, outputPath);
        break;
      case 'add-env':
        await this.executeAddEnv(processedOperation as Operation & { generator: string; generatorType: string }, context, outputPath);
        break;
      case 'run-command':
        this.executeRunCommand(processedOperation as Operation & { generator: string; generatorType: string }, context);
        break;
      default:
        // Unknown operation type - skip silently
    }
  }

  private async copyTemplate(frameworkName: string, outputPath: string): Promise<void> {
    const templatesPath = path.resolve(__dirname, '..', '..', 'templates');
    const templatePath = path.join(templatesPath, frameworkName);

    if (await fs.pathExists(templatePath)) {
      // Copy all files except template.json and node_modules
      await fs.copy(templatePath, outputPath, {
        filter: (src) => {
          const relativePath = path.relative(templatePath, src);
          return relativePath !== 'template.json' &&
                 relativePath !== 'node_modules' &&
                 !relativePath.startsWith('node_modules/');
        }
      });
    }
  }

  private processOperationTemplates(operation: Operation, context: GenerationContext): Operation {
    const processed = { ...operation };

    // Process templates in string fields
    if (processed.source) {
      processed.source = this.processTemplate(processed.source, context);
    }
    if (processed.destination) {
      processed.destination = this.processTemplate(processed.destination, context);
    }
    if (processed.content) {
      processed.content = this.processTemplate(processed.content, context);
    }
    if (processed.file) {
      processed.file = this.processTemplate(processed.file, context);
    }

    // Process templates in patch operations
    if (processed.operations) {
      processed.operations = processed.operations.map(op => {
        const processedOp = { ...op };

        if (processedOp.imports) {
          processedOp.imports = processedOp.imports.map(imp => this.processTemplate(imp, context));
        }
        if (processedOp.code) {
          processedOp.code = this.processTemplate(processedOp.code, context);
        }
        if (processedOp.after) {
          processedOp.after = this.processTemplate(processedOp.after, context);
        }
        if (processedOp.before) {
          processedOp.before = this.processTemplate(processedOp.before, context);
        }
        if (processedOp.replace) {
          processedOp.replace = this.processTemplate(processedOp.replace, context);
        }
        if (processedOp.content) {
          processedOp.content = this.processTemplate(processedOp.content, context);
        }

        return processedOp;
      });
    }

    return processed;
  }

  private async executeCreateFile(operation: Operation & { generator: string; generatorType: string }, context: GenerationContext, outputPath: string): Promise<void> {
    if (!operation.destination) return;

    const destinationPath = path.join(outputPath, this.processTemplate(operation.destination, context));

    // Ensure directory exists
    await fs.ensureDir(path.dirname(destinationPath));

    let content: string;

    if (operation.content) {
      // Use content directly
      content = this.processTemplate(operation.content, context);
    } else if (operation.source) {
      // Find the source file path relative to the module/template directory
      const modulesPath = path.join(__dirname, '..', '..', 'modules');
      const templatesPath = path.join(__dirname, '..', '..', 'templates');

      const moduleBasePath = operation.generatorType === 'framework'
        ? path.join(templatesPath, operation.generator)
        : path.join(modulesPath, operation.generatorType, operation.generator);

      const sourcePath = path.join(moduleBasePath, 'files', operation.source);

      // Check if source file exists
      if (await fs.pathExists(sourcePath)) {
        // Read source file
        content = await fs.readFile(sourcePath, 'utf-8');

        // Process template content
        content = this.processTemplate(content, context);
      } else {
        throw new Error(`Source file not found: ${sourcePath}`);
      }
    } else {
      throw new Error(`Create file operation must have either 'content' or 'source' field`);
    }

    // Write destination file
    await fs.writeFile(destinationPath, content, 'utf-8');
  }

  private async executePatchFile(operation: Operation, context: GenerationContext, outputPath: string): Promise<void> {
    if (!operation.file || !operation.operations) return;

    const filePath = path.join(outputPath, this.processTemplate(operation.file, context));

    // Read existing file
    let content = await fs.readFile(filePath, 'utf-8');

    // Execute patch operations
    for (const patchOp of operation.operations) {
      if (!this.evaluateCondition(patchOp.condition, context)) continue;

      switch (patchOp.type) {
        case 'add-import':
          if (patchOp.imports) {
            const imports = patchOp.imports.map(imp => this.processTemplate(imp, context)).join('\n');
            // Add imports at the top, after existing imports
            const lines = content.split('\n');
            let insertIndex = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].trim().startsWith('import') || lines[i].trim() === '') {
                insertIndex = i + 1;
              } else {
                break;
              }
            }
            lines.splice(insertIndex, 0, imports);
            content = lines.join('\n');
          }
          break;

        case 'add-code':
          if (patchOp.code && patchOp.after) {
            const processedCode = this.processTemplate(patchOp.code, context);
            const afterPattern = this.processTemplate(patchOp.after, context);
            const index = content.indexOf(afterPattern);
            if (index !== -1) {
              content = content.slice(0, index + afterPattern.length) + processedCode + content.slice(index + afterPattern.length);
            }
          }
          break;

        case 'replace-code':
          if (patchOp.code && patchOp.replace) {
            const processedCode = this.processTemplate(patchOp.code, context);
            const replacePattern = this.processTemplate(patchOp.replace, context);
            content = content.replace(replacePattern, processedCode);
          }
          break;

        case 'add-to-top':
          if (patchOp.content) {
            const processedContent = this.processTemplate(patchOp.content, context);
            content = processedContent + '\n' + content;
          }
          break;

        case 'add-to-bottom':
          if (patchOp.content) {
            const processedContent = this.processTemplate(patchOp.content, context);
            content = content + '\n' + processedContent;
          }
          break;
      }
    }

    // Write back the modified content
    await fs.writeFile(filePath, content, 'utf-8');
  }

  private async executeAddDependency(operation: Operation, context: GenerationContext, outputPath: string): Promise<void> {
    const packageJsonPath = path.join(outputPath, 'package.json');
    let packageJson: Record<string, unknown> = {};

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    if (operation.dependencies) {
      packageJson.dependencies = { ...(packageJson.dependencies as Record<string, string> || {}), ...operation.dependencies };
    }

    if (operation.devDependencies) {
      packageJson.devDependencies = { ...(packageJson.devDependencies as Record<string, string> || {}), ...operation.devDependencies };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async executeAddScript(operation: Operation, context: GenerationContext, outputPath: string): Promise<void> {
    const packageJsonPath = path.join(outputPath, 'package.json');
    let packageJson: Record<string, unknown> = {};

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    if (operation.scripts) {
      packageJson.scripts = { ...(packageJson.scripts as Record<string, string> || {}), ...operation.scripts };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async executeAddEnv(operation: Operation, context: GenerationContext, outputPath: string): Promise<void> {
    const envPath = path.join(outputPath, '.env');
    let envContent = '';

    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, 'utf-8');
    }

    if (operation.envVars) {
      const envLines = Object.entries(operation.envVars).map(([key, value]) => `${key}=${value}`);
      envContent += '\n' + envLines.join('\n');
    }

    await fs.writeFile(envPath, envContent.trim(), 'utf-8');
  }

  private executeRunCommand(operation: Operation & { generator: string; generatorType: string }, context: GenerationContext): void {
    if (operation.command) {
      // Process template variables in the command
      const processedCommand = this.processTemplate(operation.command, context);
      this.postInstallCommands.push(processedCommand);
    }
  }

  private async generatePackageJson(
    selectedModules: { framework: string; database?: string; auth?: string; prismaProvider?: string },
    features: string[],
    outputPath: string
  ): Promise<void> {
    const packageJsonPath = path.join(outputPath, 'package.json');

    let packageJson: Record<string, unknown> = {};
    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    // Collect dependencies from selected generators
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    const allScripts: Record<string, string> = {};

    for (const [key, generator] of this.generators) {
      const [type, name] = key.split(':');

      if ((type === 'framework' && name === selectedModules.framework) ||
          (type === 'database' && name === selectedModules.database) ||
          (type === 'auth' && name === selectedModules.auth)) {

        Object.assign(allDeps, generator.dependencies);
        Object.assign(allDevDeps, generator.devDependencies);
        Object.assign(allScripts, generator.scripts);
      }
    }

    // Update package.json
    packageJson.dependencies = { ...(packageJson.dependencies as Record<string, string> || {}), ...allDeps };
    packageJson.devDependencies = { ...(packageJson.devDependencies as Record<string, string> || {}), ...allDevDeps };
    packageJson.scripts = { ...(packageJson.scripts as Record<string, string> || {}), ...allScripts };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  getAvailableGenerators(): { frameworks: string[]; databases: string[]; auths: string[] } {
    const frameworks: string[] = [];
    const databases: string[] = [];
    const auths: string[] = [];

    for (const [key] of this.generators) {
      const [type, name] = key.split(':');
      switch (type) {
        case 'framework':
          frameworks.push(name);
          break;
        case 'database':
          databases.push(name);
          break;
        case 'auth':
          auths.push(name);
          break;
      }
    }

    return { frameworks, databases, auths };
  }
}