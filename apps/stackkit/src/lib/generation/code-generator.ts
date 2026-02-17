import * as fs from "fs-extra";
import * as path from "path";
import { getPrismaProvidersFromGenerator } from "../discovery/shared";
import { FrameworkConfig } from "../framework/framework-utils";
import { getPackageRoot } from "../utils/package-root";
import { locateOperationSource, mergeModuleIntoGeneratorConfig } from "./generator-utils";

export interface GenerationContext {
  framework: string;
  database?: string;
  auth?: string;
  features?: string[];
  combo?: string;
  prismaProvider?: string;
  [key: string]: unknown;
}

export interface TemplateCondition {
  framework?: string | string[];
  database?: string | string[];
  auth?: string | string[];
  features?: string[];
}

export interface Operation {
  type: "create-file" | "patch-file" | "add-dependency" | "add-script" | "add-env" | "run-command";
  description?: string;
  condition?: TemplateCondition;
  priority?: number;

  // create-file | patch-file
  source?: string;
  destination?: string;
  content?: string;

  // patch-file
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
  type: "add-import" | "add-code" | "replace-code" | "add-to-top" | "add-to-bottom";
  condition?: TemplateCondition;

  // add-import
  imports?: string[];

  // add-code, replace-code
  code?: string | string[];
  after?: string;
  before?: string;
  replace?: string;

  // add-to-top, add-to-bottom
  content?: string;
  source?: string;
}

export interface GeneratorConfig {
  name: string;
  type: "framework" | "database" | "auth";
  priority: number;
  operations?: Operation[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  envVars?: Record<string, string>;
  postInstall?: string[];
}

export class AdvancedCodeGenerator {
  private generators: Map<string, GeneratorConfig> = new Map();
  private frameworkConfig: FrameworkConfig;
  private postInstallCommands: string[] = [];
  private createdFiles: string[] = [];

  constructor(frameworkConfig: FrameworkConfig) {
    this.frameworkConfig = frameworkConfig;
  }

  async loadGenerators(modulesPath: string): Promise<void> {
    const moduleTypes = ["auth", "database"];

    for (const type of moduleTypes) {
      const typePath = path.join(modulesPath, type);
      if (await fs.pathExists(typePath)) {
        const modules = await fs.readdir(typePath);
        for (const moduleName of modules) {
          const generatorPath = path.join(typePath, moduleName, "generator.json");
          if (await fs.pathExists(generatorPath)) {
            try {
              const config: GeneratorConfig = await fs.readJson(generatorPath);

              const modulePath = path.join(typePath, moduleName);
              await mergeModuleIntoGeneratorConfig(config, modulePath);

              this.generators.set(`${type}:${moduleName}`, config);
            } catch {
              // ignore invalid generator files
            }
          }
        }
      }
    }
  }

  private evaluateCondition(
    condition: TemplateCondition | undefined,
    context: GenerationContext,
  ): boolean {
    if (!condition) return true;

    for (const [key, value] of Object.entries(condition)) {
      if (key === "features") {
        const requiredFeatures = value as string[];
        const contextFeatures = context.features || [];
        if (!requiredFeatures.every((feature) => contextFeatures.includes(feature))) {
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
    content = this.processTemplateRecursive(content, templateContext);

    // Remove leading newlines that might be left from {{#var}} removal
    content = content.replace(/^\n+/, "");

    // Reduce multiple consecutive newlines to maximum 2
    content = content.replace(/\n{3,}/g, "\n\n");

    return content;
  }

  private renderHeadingFromExpr(expr: string, context: GenerationContext): string {
    const depthVar = expr.substring(8).trim();
    const depthVal = context[depthVar];
    const n = parseInt(String(depthVal || "1"), 10) || 1;
    const level = Math.max(1, Math.min(n, 6));
    return "#".repeat(level);
  }

  private processVariableDefinitions(content: string, context: GenerationContext): string {
    let result = content;
    let index = 0;

    while (true) {
      const varStart = result.indexOf("{{#var ", index);
      if (varStart === -1) break;

      const equalsIndex = result.indexOf("=", varStart);
      if (equalsIndex === -1) break;

      const varNameMatch = result.substring(varStart + 7, equalsIndex).trim();
      if (!varNameMatch) break;

      // Find the closing }} for the variable definition, accounting for nested {{#var}}...{{/var}}
      let braceCount = 1;
      const valueStart = equalsIndex + 1;
      let valueEnd = valueStart;

      for (let i = valueStart; i < result.length; i++) {
        if (result[i] === "{" && result[i + 1] === "{") {
          braceCount++;
          i++; // Skip next character
        } else if (result[i] === "}" && result[i + 1] === "}") {
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
      result = result.replace(fullMatch, "");
      index = varStart;
    }

    return result;
  }

  private processTemplateRecursive(content: string, context: GenerationContext): string {
    content = content.replace(
      /\{\{#if\s+([^}\s]+)\s+([^}\s]+)\s+([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (
        match: string,
        varName: string,
        operator: string,
        expectedValue: string,
        blockContent: string,
        elseContent?: string,
      ) => {
        const actualVal = context[varName.trim()];
        const cleanExpectedVal = expectedValue.trim().replace(/['"]/g, "");

        let conditionMet = false;
        switch (operator) {
          case "==":
          case "===":
            conditionMet = actualVal === cleanExpectedVal;
            break;
          case "!=":
          case "!==":
            conditionMet = actualVal !== cleanExpectedVal;
            break;
          case "includes":
            conditionMet = Array.isArray(actualVal) && actualVal.includes(cleanExpectedVal);
            break;
          case "startsWith":
            conditionMet = typeof actualVal === "string" && actualVal.startsWith(cleanExpectedVal);
            break;
          case "endsWith":
            conditionMet = typeof actualVal === "string" && actualVal.endsWith(cleanExpectedVal);
            break;
        }

        const contentToProcess = conditionMet ? blockContent : elseContent || "";
        return this.processTemplateRecursive(contentToProcess, context)
          .replace(/^\n+/, "")
          .replace(/\n+$/, "");
      },
    );

    // Handle simple conditional blocks {{#if condition}}...{{/if}} (backward compatibility)
    content = content.replace(
      /\{\{#if\s+([^}]+)\}\}([\s\S]*?)(?:\{\{else\}\}([\s\S]*?))?\{\{\/if\}\}/g,
      (match: string, condition: string, blockContent: string, elseContent?: string) => {
        const conditionParts = condition.split("==");
        if (conditionParts.length === 2) {
          const [varName, expectedValue] = conditionParts.map((s: string) =>
            s.trim().replace(/['"]/g, ""),
          );
          const contentToProcess =
            context[varName] === expectedValue ? blockContent : elseContent || "";
          return this.processTemplateRecursive(contentToProcess, context)
            .replace(/^\n+/, "")
            .replace(/\n+$/, "");
        }

        const conditionFunc = condition.split(".");
        if (conditionFunc.length === 2 && conditionFunc[1] === "includes") {
          const [arrayName, item] = conditionFunc[0].split("(");
          const itemValue = item.replace(")", "").replace(/['"]/g, "");
          const array = context[arrayName] || [];
          const contentToProcess =
            Array.isArray(array) && array.includes(itemValue) ? blockContent : elseContent || "";
          return this.processTemplateRecursive(contentToProcess, context)
            .replace(/^\n+/, "")
            .replace(/\n+$/, "");
        }

        return "";
      },
    );

    // Handle switch statements {{#switch variable}}...{{/switch}}
    content = content.replace(
      /\{\{#switch\s+([^}]+)\}\}([\s\S]*?)\{\{\/switch\}\}/g,
      (match: string, varName: string, switchContent: string) => {
        const actualVal = context[varName.trim()];

        // Parse cases
        const caseRegex =
          /\{\{#case\s+([^}]+)\}\}([\s\S]*?)(?=\{\{#case|\{\{\/case\}|\{\{\/switch\})/g;
        let result = "";
        let defaultCase = "";

        let caseMatch;
        while ((caseMatch = caseRegex.exec(switchContent)) !== null) {
          const [, caseValue, caseContent] = caseMatch;
          const cleanCaseValue = caseValue.trim().replace(/['"]/g, "");

          if (cleanCaseValue === "default") {
            defaultCase = caseContent.trim();
          } else if (actualVal === cleanCaseValue) {
            result = caseContent.trim();
            break;
          }
        }

        const chosen = (result || defaultCase || "").trim();
        return this.processTemplateRecursive(chosen, context);
      },
    );

    // Handle variable replacement with advanced expressions
    content = content.replace(/\{\{([^}]+)\}\}/g, (match: string, varExpr: string) => {
      const trimmedExpr = varExpr.trim();

      // Handle ternary expressions like framework=='nextjs' ? '@/lib' : '.'
      const ternaryMatch = trimmedExpr.match(/^(.+?)\s*\?\s*(.+?)\s*:\s*(.+?)$/);
      if (ternaryMatch) {
        const [, condition, trueVal, falseVal] = ternaryMatch;
        const conditionMatch = condition.match(/^(.+?)==(.+)$/);
        if (conditionMatch) {
          const [, varName, expectedVal] = conditionMatch;
          const cleanVarName = varName.trim();
          const cleanExpectedVal = expectedVal.trim().replace(/['"]/g, "");
          const actualVal = context[cleanVarName];
          const result = actualVal === cleanExpectedVal ? trueVal.trim() : falseVal.trim();
          return result.replace(/['"]/g, ""); // Remove quotes from result
        }
      }

      // Handle switch expressions {{switch variable case1: value1, case2: value2, default: defaultValue}}
      const switchMatch = trimmedExpr.match(/^switch\s+([^}\s]+)\s+(.+)$/);
      if (switchMatch) {
        const [, varName, casesStr] = switchMatch;
        const actualVal = context[varName.trim()];

        const cases = casesStr.split(",").map((c: string) => c.trim());
        for (const caseStr of cases) {
          const [caseVal, result] = caseStr.split(":").map((s: string) => s.trim());
          const cleanCaseVal = caseVal.replace(/['"]/g, "");
          if (cleanCaseVal === actualVal || cleanCaseVal === "default") {
            return this.processTemplateRecursive(result.replace(/['"]/g, ""), context);
          }
        }
        return "";
      }

      // Handle heading helper {{heading:depthVar}} -> '#', '##', ... up to '######'
      if (trimmedExpr.startsWith("heading:")) {
        return this.renderHeadingFromExpr(trimmedExpr, context);
      }

      // Handle feature flags {{feature:name}}
      if (trimmedExpr.startsWith("feature:")) {
        const featureName = trimmedExpr.substring(8).trim();
        const features = Array.isArray(context.features) ? context.features : [];
        return features.includes(featureName) ? "true" : "false";
      }

      // Handle conditional expressions {{if condition then:value else:value}}
      const conditionalMatch = trimmedExpr.match(/^if\s+(.+?)\s+then:([^,]+),\s*else:(.+)$/);
      if (conditionalMatch) {
        const [, condition, thenVal, elseVal] = conditionalMatch;
        const conditionMatch2 = condition.match(/^(.+?)==(.+)$/);
        if (conditionMatch2) {
          const [, varName, expectedVal] = conditionMatch2;
          const cleanVarName = varName.trim();
          const cleanExpectedVal = expectedVal.trim().replace(/['"]/g, "");
          const actualVal = context[cleanVarName];
          const result = actualVal === cleanExpectedVal ? thenVal.trim() : elseVal.trim();
          return result.replace(/['"]/g, "");
        }
      }

      // Simple variable replacement
      const value = context[trimmedExpr];
      return value !== undefined ? String(value) : match;
    });

    return content;
  }

  async generate(
    selectedModules: {
      framework: string;
      database?: string;
      auth?: string;
      prismaProvider?: string;
    },
    features: string[],
    outputPath: string,
  ): Promise<string[]> {
    // First, copy the base template
    await this.copyTemplate(selectedModules.framework, outputPath);

    const context: GenerationContext = {
      ...selectedModules,
      features,
    };

    // Derived combined key to simplify template conditionals (e.g. "prisma:express")
    context.combo = `${context.database || ""}:${context.framework || ""}`;

    // Set default prismaProvider if database is prisma but no provider specified
    if (selectedModules.database === "prisma" && !context.prismaProvider) {
      const providers = getPrismaProvidersFromGenerator(getPackageRoot());
      if (providers && providers.length > 0) {
        context.prismaProvider = providers[0];
      }
    }

    // Collect all applicable operations
    const applicableOperations: Array<Operation & { generator: string; generatorType: string }> =
      [];

    for (const [key, generator] of this.generators) {
      const [genType, name] = key.split(":");

      // Check if this generator is selected
      if (genType === "framework" && name === selectedModules.framework) {
        // Framework is always included
      } else if (genType === "database" && name === selectedModules.database) {
        // Database is selected
      } else if (genType === "auth" && name === selectedModules.auth) {
        // Auth is selected
      } else {
        continue; // Skip unselected generators
      }

      // Collect postInstall commands from selected generators
      if (generator.postInstall && Array.isArray(generator.postInstall)) {
        this.postInstallCommands.push(...generator.postInstall);
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

  getCreatedFiles(): string[] {
    return this.createdFiles.slice();
  }

  private async executeOperation(
    operation: Operation & { generator: string; generatorType: string },
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    // Process templates in operation content
    const processedOperation = this.processOperationTemplates(operation, context);

    switch (processedOperation.type) {
      case "create-file":
        await this.executeCreateFile(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
          outputPath,
        );
        break;
      case "patch-file":
        await this.executePatchFile(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
          outputPath,
        );
        break;
      case "add-dependency":
        await this.executeAddDependency(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
          outputPath,
        );
        break;
      case "add-script":
        await this.executeAddScript(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
          outputPath,
        );
        break;
      case "add-env":
        await this.executeAddEnv(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
          outputPath,
        );
        break;
      case "run-command":
        this.executeRunCommand(
          processedOperation as Operation & { generator: string; generatorType: string },
          context,
        );
        break;
      default:
      // Unknown operation type - skip silently
    }
  }
  private async copyTemplate(frameworkName: string, outputPath: string): Promise<void> {
    const packageRoot = getPackageRoot();
    const templatePath = path.join(packageRoot, "templates", frameworkName);

    if (await fs.pathExists(templatePath)) {
      await fs.copy(templatePath, outputPath, {
        filter: (src) => {
          const relativePath = path.relative(templatePath, src);
          return (
            relativePath !== "template.json" &&
            relativePath !== "node_modules" &&
            !relativePath.startsWith("node_modules/")
          );
        },
      });
      try {
        const gitCandidates = [".gitignore", "gitignore", "_gitignore"];
        for (const g of gitCandidates) {
          const src = path.join(templatePath, g);
          if (await fs.pathExists(src)) {
            const dest = path.join(outputPath, ".gitignore");
            if (!(await fs.pathExists(dest))) {
              await fs.copy(src, dest);
            }
            break;
          }
        }
      } catch {
        // ignore
      }
      try {
        const templateJsonPath = path.join(templatePath, "template.json");
        if (await fs.pathExists(templateJsonPath)) {
          const tpl = await fs.readJson(templateJsonPath);
          if (tpl && Array.isArray(tpl.files)) {
            for (const f of tpl.files) {
              if (typeof f === "string" && f.startsWith(".")) {
                const targetDest = path.join(outputPath, f);
                if (await fs.pathExists(targetDest)) continue; // already present

                // Special-case: allow creating .gitignore from non-dot fallbacks
                if (f === ".gitignore") {
                  const nameWithoutDot = f.slice(1);
                  const candidates = [f, nameWithoutDot, `_${nameWithoutDot}`];
                  for (const cand of candidates) {
                    const src = path.join(templatePath, cand);
                    if (await fs.pathExists(src)) {
                      await fs.copy(src, targetDest);
                      break;
                    }
                  }
                  continue;
                }

                // For other dotfiles, only copy if the exact dotfile exists in the template to avoid unintended fallbacks
                const srcDot = path.join(templatePath, f);
                if (await fs.pathExists(srcDot)) {
                  await fs.copy(srcDot, targetDest);
                }
              }
            }
          }
        }
      } catch {
        // ignore
      }

      try {
        const templateJsonPath2 = path.join(templatePath, "template.json");
        if (await fs.pathExists(templateJsonPath2)) {
          const tpl = await fs.readJson(templateJsonPath2);
          if (tpl && Array.isArray(tpl.files)) {
            for (const f of tpl.files) {
              if (typeof f === "string" && f.startsWith(".")) {
                const dotDest = path.join(outputPath, f);
                const nameWithoutDot = f.slice(1);
                const nonDot = path.join(outputPath, nameWithoutDot);
                const underscore = path.join(outputPath, `_${nameWithoutDot}`);

                // If dot already exists, remove non-dot fallbacks
                if (await fs.pathExists(dotDest)) {
                  if (await fs.pathExists(nonDot)) {
                    await fs.remove(nonDot);
                  }
                  if (await fs.pathExists(underscore)) {
                    await fs.remove(underscore);
                  }
                  continue;
                }

                // If dot doesn't exist but a non-dot fallback was copied, rename it
                if (await fs.pathExists(nonDot)) {
                  await fs.move(nonDot, dotDest, { overwrite: true });
                } else if (await fs.pathExists(underscore)) {
                  await fs.move(underscore, dotDest, { overwrite: true });
                }
              }
            }
          }
        }
      } catch {
        // ignore
      }

      // Handle .env.example -> .env copying if .env doesn't already exist
      try {
        const envExampleDest = path.join(outputPath, ".env.example");
        const envDest = path.join(outputPath, ".env");
        if ((await fs.pathExists(envExampleDest)) && !(await fs.pathExists(envDest))) {
          await fs.copy(envExampleDest, envDest);
        }
      } catch {
        // ignore (not critical)
      }
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

    // Process templates in patch operations
    if (processed.operations) {
      processed.operations = processed.operations.map((op) => {
        const processedOp = { ...op };

        if (processedOp.imports) {
          processedOp.imports = processedOp.imports.map((imp) =>
            this.processTemplate(imp, context),
          );
        }
        if (processedOp.code) {
          if (Array.isArray(processedOp.code)) {
            processedOp.code = processedOp.code
              .map((c) => this.processTemplate(c, context))
              .join("\n");
          } else {
            processedOp.code = this.processTemplate(processedOp.code, context);
          }
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
        if (processedOp.source) {
          processedOp.source = this.processTemplate(processedOp.source, context);
        }

        return processedOp;
      });
    }

    return processed;
  }

  private async executeCreateFile(
    operation: Operation & { generator: string; generatorType: string },
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    if (!operation.destination) return;

    const processedDestination = this.processTemplate(operation.destination, context);
    const { basePath: destinationBasePath, mode: destinationMode } =
      this.parsePathPattern(processedDestination);

    if (operation.content) {
      const destinationPath = path.join(outputPath, processedDestination);
      await fs.ensureDir(path.dirname(destinationPath));
      const content = this.processTemplate(operation.content, context);
      await fs.writeFile(destinationPath, content, "utf-8");
      try {
        const rel = path.relative(outputPath, destinationPath);
        if (rel && !this.createdFiles.includes(rel)) this.createdFiles.push(rel);
      } catch {
        // ignore logging failures
      }
      return;
    }

    if (!operation.source) {
      throw new Error(`Create file operation must have either 'content' or 'source' field`);
    }

    const processedSource = this.processTemplate(operation.source, context);
    const { basePath: sourceBasePathRel, mode: sourceMode } =
      this.parsePathPattern(processedSource);
    const sourcePath = locateOperationSource(
      operation.generatorType,
      operation.generator,
      sourceBasePathRel,
    );

    if (!sourcePath || !(await fs.pathExists(sourcePath))) {
      throw new Error(`Source file not found: ${sourcePath}`);
    }

    const sourceStat = await fs.stat(sourcePath);
    const shouldCreateMultipleFiles = sourceStat.isDirectory() || sourceMode !== "single";

    if (shouldCreateMultipleFiles) {
      if (!sourceStat.isDirectory()) {
        throw new Error(`Source path must be a directory for wildcard copy: ${processedSource}`);
      }

      let sourceFiles: string[] = [];
      if (sourceMode === "flat") {
        const entries = await fs.readdir(sourcePath);
        for (const entry of entries) {
          const candidatePath = path.join(sourcePath, entry);
          const candidateStat = await fs.stat(candidatePath);
          if (candidateStat.isFile()) {
            sourceFiles.push(candidatePath);
          }
        }
      } else {
        sourceFiles = await this.collectFilesRecursively(sourcePath);
      }

      for (const sourceFilePath of sourceFiles) {
        let relativeDestinationPath: string;

        if (destinationMode === "recursive") {
          relativeDestinationPath = path.relative(sourcePath, sourceFilePath);
        } else if (destinationMode === "flat") {
          relativeDestinationPath = path.basename(sourceFilePath);
        } else {
          relativeDestinationPath =
            sourceMode === "flat"
              ? path.basename(sourceFilePath)
              : path.relative(sourcePath, sourceFilePath);
        }

        const destinationPath = path.join(outputPath, destinationBasePath, relativeDestinationPath);

        await fs.ensureDir(path.dirname(destinationPath));
        let content = await fs.readFile(sourceFilePath, "utf-8");
        content = this.processTemplate(content, context);
        await fs.writeFile(destinationPath, content, "utf-8");

        try {
          const rel = path.relative(outputPath, destinationPath);
          if (rel && !this.createdFiles.includes(rel)) this.createdFiles.push(rel);
        } catch {
          // ignore logging failures
        }
      }

      return;
    }

    const destinationPath =
      destinationMode === "single"
        ? path.join(outputPath, processedDestination)
        : path.join(outputPath, destinationBasePath, path.basename(sourcePath));

    await fs.ensureDir(path.dirname(destinationPath));
    let content = await fs.readFile(sourcePath, "utf-8");
    content = this.processTemplate(content, context);
    await fs.writeFile(destinationPath, content, "utf-8");

    try {
      const rel = path.relative(outputPath, destinationPath);
      if (rel && !this.createdFiles.includes(rel)) this.createdFiles.push(rel);
    } catch {
      // ignore logging failures
    }
  }

  private parsePathPattern(inputPath: string): {
    basePath: string;
    mode: "single" | "flat" | "recursive";
  } {
    const normalizedPath = inputPath.replace(/\\/g, "/");
    if (normalizedPath.endsWith("/**")) {
      return { basePath: normalizedPath.slice(0, -3), mode: "recursive" };
    }
    if (normalizedPath.endsWith("/*")) {
      return { basePath: normalizedPath.slice(0, -2), mode: "flat" };
    }
    return { basePath: normalizedPath, mode: "single" };
  }

  private async collectFilesRecursively(rootDirPath: string): Promise<string[]> {
    const files: string[] = [];
    const entries = await fs.readdir(rootDirPath);

    for (const entry of entries) {
      const fullPath = path.join(rootDirPath, entry);
      const stat = await fs.stat(fullPath);

      if (stat.isDirectory()) {
        files.push(...(await this.collectFilesRecursively(fullPath)));
      } else if (stat.isFile()) {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async executePatchFile(
    operation: Operation & { generator: string; generatorType: string },
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    if (!operation.destination) return;

    const filePath = path.join(outputPath, this.processTemplate(operation.destination, context));

    // Read existing file
    let content = await fs.readFile(filePath, "utf-8");

    if (operation.content) {
      content += this.processTemplate(operation.content, context).trim();
    } else if (operation.operations) {
      // Execute patch operations
      for (const patchOp of operation.operations) {
        if (!this.evaluateCondition(patchOp.condition, context)) continue;

        switch (patchOp.type) {
          case "add-import":
            if (patchOp.imports) {
              const imports = patchOp.imports
                .map((imp) => this.processTemplate(imp, context))
                .join("\n")
                .replace(/^\n+/, "")
                .replace(/\n+$/, "");

              // Split content into lines for easier manipulation
              const lines = content.split("\n");
              // Find the last import line index
              let lastImportIndex = -1;
              for (let i = 0; i < lines.length; i++) {
                if (lines[i].trim().startsWith("import")) lastImportIndex = i;
              }

              // Determine where to insert new imports: after the last existing import, or at the top if no imports exist
              const insertIndex = lastImportIndex === -1 ? 0 : lastImportIndex + 1;

              // Only add imports that don't already exist in the file
              const importLines = imports
                .split("\n")
                .map((l) => l.trim())
                .filter(Boolean);

              const newImportLines = importLines.filter(
                (imp) => !lines.some((ln) => ln.trim() === imp),
              );

              if (newImportLines.length > 0) {
                // Insert imports
                if (insertIndex < lines.length && lines[insertIndex].trim() === "") {
                  lines.splice(insertIndex, 1, ...newImportLines);
                } else {
                  lines.splice(insertIndex, 0, ...newImportLines);
                }

                // After adding imports, ensure there is exactly one blank line after the last import statement (if there are any imports)
                let lastIdx = -1;
                for (let i = 0; i < lines.length; i++) {
                  if (lines[i].trim().startsWith("import")) lastIdx = i;
                }
                const nextIdx = lastIdx + 1;
                if (lastIdx !== -1) {
                  let j = nextIdx;
                  while (j < lines.length && lines[j].trim() === "") {
                    j++;
                  }
                  // Ensure exactly one blank line after imports unless imports end at EOF
                  if (nextIdx < lines.length) {
                    lines.splice(nextIdx, j - nextIdx, "");
                  }
                }
              }
              content = lines.join("\n");
            }
            break;

          case "add-code":
            if (patchOp.code) {
              let codeValue: string | string[] = patchOp.code;
              if (Array.isArray(codeValue)) codeValue = codeValue.join("\n");
              const processedCode = this.processTemplate(codeValue as string, context);

              // Skip insertion if the exact code already exists in the file
              const codeTrimmed = processedCode.trim();
              if (codeTrimmed && content.includes(codeTrimmed)) {
                break;
              }

              // Insert after pattern if provided
              if (patchOp.after) {
                const afterPattern = this.processTemplate(patchOp.after, context);
                const index = content.indexOf(afterPattern);
                if (index !== -1) {
                  const left = content.slice(0, index + afterPattern.length);
                  const right = content.slice(index + afterPattern.length);

                  // Normalize code: trim surrounding newlines and ensure single trailing newline
                  let codeNormalized = processedCode.replace(/^\n+|\n+$/g, "") + "\n";

                  // If right already starts with a newline, avoid double-blank by
                  const rightStartsWithNewline = right.startsWith("\n");
                  if (rightStartsWithNewline && codeNormalized.endsWith("\n")) {
                    codeNormalized = codeNormalized.replace(/\n+$/, "");
                  }

                  const leftNeedsNewline = !left.endsWith("\n");
                  content = left + (leftNeedsNewline ? "\n" : "") + codeNormalized + right;
                }
              }

              // Insert before pattern if provided
              if (patchOp.before) {
                const beforePattern = this.processTemplate(patchOp.before, context);
                const index = content.indexOf(beforePattern);
                if (index !== -1) {
                  const left = content.slice(0, index);
                  const right = content.slice(index);

                  // Normalize code: trim surrounding newlines and ensure single trailing newline
                  let codeNormalized = processedCode.replace(/^\n+|\n+$/g, "") + "\n";

                  // If right already starts with a newline, avoid double-blank by
                  const rightStartsWithNewline = right.startsWith("\n");
                  if (rightStartsWithNewline && codeNormalized.endsWith("\n")) {
                    codeNormalized = codeNormalized.replace(/\n+$/, "");
                  }

                  const leftNeedsNewline = !left.endsWith("\n");
                  content = left + (leftNeedsNewline ? "\n" : "") + codeNormalized + right;
                }
              }
            }
            break;

          case "replace-code":
            if (patchOp.code && patchOp.replace) {
              let codeValue2: string | string[] = patchOp.code;
              if (Array.isArray(codeValue2)) codeValue2 = codeValue2.join("\n");
              const processedCode = this.processTemplate(codeValue2 as string, context);
              const replacePattern = this.processTemplate(patchOp.replace, context);
              content = content.replace(replacePattern, processedCode);
            }
            break;

          case "add-to-top": {
            let processedContentTop: string = "";
            if (patchOp.content) {
              processedContentTop = this.processTemplate(patchOp.content, context).trim();
            } else if (patchOp.source) {
              const modulesPath = path.join(getPackageRoot(), "modules");
              const sourcePath = path.join(
                modulesPath,
                operation.generatorType,
                operation.generator,
                "files",
                patchOp.source,
              );
              if (await fs.pathExists(sourcePath)) {
                processedContentTop = await fs.readFile(sourcePath, "utf-8");
                processedContentTop = this.processTemplate(processedContentTop, context).trim();
              }
            }
            if (processedContentTop) {
              content = processedContentTop + "\n" + content;
            }
            break;
          }

          case "add-to-bottom": {
            let processedContentBottom: string = "";
            if (patchOp.content) {
              processedContentBottom = this.processTemplate(patchOp.content, context).trim();
            } else if (patchOp.source) {
              const modulesPath = path.join(getPackageRoot(), "modules");
              const sourcePath = path.join(
                modulesPath,
                operation.generatorType,
                operation.generator,
                "files",
                patchOp.source,
              );
              if (await fs.pathExists(sourcePath)) {
                processedContentBottom = await fs.readFile(sourcePath, "utf-8");
                processedContentBottom = this.processTemplate(
                  processedContentBottom,
                  context,
                ).trim();
              }
            }
            if (processedContentBottom) {
              content = content + "\n" + processedContentBottom;
            }
            break;
          }
        }
      }
    }

    // Normalize excessive blank lines introduced during patching
    content = content.replace(/\n{3,}/g, "\n\n");

    // Write back the modified content
    await fs.writeFile(filePath, content, "utf-8");
  }

  private async executeAddDependency(
    operation: Operation,
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    const packageJsonPath = path.join(outputPath, "package.json");
    let packageJson: Record<string, unknown> = {};

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    if (operation.dependencies) {
      packageJson.dependencies = {
        ...((packageJson.dependencies as Record<string, string>) || {}),
        ...operation.dependencies,
      };
    }

    if (operation.devDependencies) {
      packageJson.devDependencies = {
        ...((packageJson.devDependencies as Record<string, string>) || {}),
        ...operation.devDependencies,
      };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async executeAddScript(
    operation: Operation,
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    const packageJsonPath = path.join(outputPath, "package.json");
    let packageJson: Record<string, unknown> = {};

    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    if (operation.scripts) {
      packageJson.scripts = {
        ...((packageJson.scripts as Record<string, string>) || {}),
        ...operation.scripts,
      };
    }

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  private async executeAddEnv(
    operation: Operation,
    context: GenerationContext,
    outputPath: string,
  ): Promise<void> {
    const envPath = path.join(outputPath, ".env");
    let envContent = "";

    if (await fs.pathExists(envPath)) {
      envContent = await fs.readFile(envPath, "utf-8");
    }

    if (operation.envVars) {
      const envLines = Object.entries(operation.envVars).map(([key, value]) => {
        const processedValue = this.processTemplate(value, context);
        return `${key}=${processedValue}`;
      });
      envContent += "\n" + envLines.join("\n");
    }

    await fs.writeFile(envPath, envContent.trim(), "utf-8");
  }

  private executeRunCommand(
    operation: Operation & { generator: string; generatorType: string },
    context: GenerationContext,
  ): void {
    if (operation.command) {
      // Process template variables in the command
      const processedCommand = this.processTemplate(operation.command, context);
      this.postInstallCommands.push(processedCommand);
    }
  }

  private async generatePackageJson(
    selectedModules: {
      framework: string;
      database?: string;
      auth?: string;
      prismaProvider?: string;
    },
    features: string[],
    outputPath: string,
  ): Promise<void> {
    const packageJsonPath = path.join(outputPath, "package.json");

    let packageJson: Record<string, unknown> = {};
    if (await fs.pathExists(packageJsonPath)) {
      packageJson = await fs.readJson(packageJsonPath);
    }

    // Collect dependencies from selected generators
    const allDeps: Record<string, string> = {};
    const allDevDeps: Record<string, string> = {};
    const allScripts: Record<string, string> = {};

    for (const [key, generator] of this.generators) {
      const [type, name] = key.split(":");

      if (
        (type === "framework" && name === selectedModules.framework) ||
        (type === "database" && name === selectedModules.database) ||
        (type === "auth" && name === selectedModules.auth)
      ) {
        // Merge dependencies, devDependencies, and scripts from the generator into the cumulative objects
        Object.assign(allScripts, generator.scripts);
      }
    }

    // Update package.json
    packageJson.dependencies = {
      ...((packageJson.dependencies as Record<string, string>) || {}),
      ...allDeps,
    };
    packageJson.devDependencies = {
      ...((packageJson.devDependencies as Record<string, string>) || {}),
      ...allDevDeps,
    };
    packageJson.scripts = {
      ...((packageJson.scripts as Record<string, string>) || {}),
      ...allScripts,
    };

    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Public method to apply generators to an existing project (used for "Add to existing project" flow)
  async applyToProject(
    selectedModules: {
      framework: string;
      database?: string;
      auth?: string;
      prismaProvider?: string;
    },
    features: string[],
    projectPath: string,
  ): Promise<string[]> {
    const context: GenerationContext = {
      ...selectedModules,
      features,
    };
    // Derived combined key to simplify template conditionals (e.g. "prisma:express")
    context.combo = `${context.database || ""}:${context.framework || ""}`;

    if (selectedModules.database === "prisma" && !context.prismaProvider) {
      const providers = getPrismaProvidersFromGenerator(getPackageRoot());
      if (providers && providers.length > 0) {
        context.prismaProvider = providers[0];
      }
    }

    const applicableOperations: Array<Operation & { generator: string; generatorType: string }> =
      [];

    for (const [key, generator] of this.generators) {
      const [genType, name] = key.split(":");

      if (genType === "framework" && name === selectedModules.framework) {
        // framework
      } else if (genType === "database" && name === selectedModules.database) {
        // database
      } else if (genType === "auth" && name === selectedModules.auth) {
        // auth
      } else {
        continue;
      }

      if (generator.postInstall && Array.isArray(generator.postInstall)) {
        this.postInstallCommands.push(...generator.postInstall);
      }

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

    applicableOperations.sort((a, b) => (a.priority || 0) - (b.priority || 0));

    for (const operation of applicableOperations) {
      await this.executeOperation(operation, context, projectPath);
    }

    await this.generatePackageJson(selectedModules, features, projectPath);

    return this.postInstallCommands;
  }

  getAvailableGenerators(): { frameworks: string[]; databases: string[]; auths: string[] } {
    const frameworks: string[] = [];
    const databases: string[] = [];
    const auths: string[] = [];

    for (const [key] of this.generators) {
      const [type, name] = key.split(":");
      switch (type) {
        case "framework":
          frameworks.push(name);
          break;
        case "database":
          databases.push(name);
          break;
        case "auth":
          auths.push(name);
          break;
      }
    }

    return { frameworks, databases, auths };
  }

  // Method to register a generator configuration
  registerGenerator(
    type: "framework" | "database" | "auth",
    name: string,
    config: GeneratorConfig,
  ): void {
    this.generators.set(`${type}:${name}`, config);
  }
}
