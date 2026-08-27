#!/usr/bin/env node
const fs = require("fs-extra");
const path = require("path");

const MODULE_CATEGORIES = new Set(["auth", "database", "ui", "storage", "components"]);
const FRAMEWORKS = new Set(["express", "nextjs", "react"]);
const PACKAGE_MANAGERS = new Set(["npm", "yarn", "pnpm", "bun"]);
const OPERATION_TYPES = new Set([
  "create-file",
  "patch-file",
  "add-dependency",
  "add-script",
  "add-env",
  "run-command",
]);
const PATCH_OPERATION_TYPES = new Set([
  "add-import",
  "add-code",
  "replace-code",
  "add-to-top",
  "add-to-bottom",
]);

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isStringArray(value) {
  return Array.isArray(value) && value.every((item) => isNonEmptyString(item));
}

function relativeToRepo(repoRoot, filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/");
}

function hasUnsafePath(pathLike) {
  if (!isNonEmptyString(pathLike)) return false;
  if (pathLike.includes("{{")) return false;
  const normalized = pathLike.replaceAll("\\", "/");
  if (normalized.startsWith("/")) return true;
  return normalized.split("/").includes("..");
}

function stripWildcardSuffix(input) {
  if (input.endsWith("/**")) return input.slice(0, -3);
  if (input.endsWith("/*")) return input.slice(0, -2);
  return input;
}

async function discoverModuleMetadataFiles(modulesRoot) {
  const moduleFiles = [];
  const generatorFiles = [];
  const categories = await fs.readdir(modulesRoot);

  for (const category of categories) {
    const categoryPath = path.join(modulesRoot, category);
    const categoryStat = await fs.stat(categoryPath).catch(() => null);
    if (!categoryStat?.isDirectory()) continue;

    const rootModuleJson = path.join(categoryPath, "module.json");
    const rootGeneratorJson = path.join(categoryPath, "generator.json");

    if (await fs.pathExists(rootModuleJson)) {
      moduleFiles.push({
        path: rootModuleJson,
        category,
        moduleName: category,
        filesRoot: path.join(categoryPath, "files"),
      });
    }

    if (await fs.pathExists(rootGeneratorJson)) {
      generatorFiles.push({
        path: rootGeneratorJson,
        category,
        moduleName: category,
        filesRoot: path.join(categoryPath, "files"),
      });
    }

    const entries = await fs.readdir(categoryPath);
    for (const entry of entries) {
      const modulePath = path.join(categoryPath, entry);
      const stat = await fs.stat(modulePath).catch(() => null);
      if (!stat?.isDirectory()) continue;

      const moduleJson = path.join(modulePath, "module.json");
      const generatorJson = path.join(modulePath, "generator.json");

      if (await fs.pathExists(moduleJson)) {
        moduleFiles.push({
          path: moduleJson,
          category,
          moduleName: entry,
          filesRoot: path.join(modulePath, "files"),
        });
      }
      if (await fs.pathExists(generatorJson)) {
        generatorFiles.push({
          path: generatorJson,
          category,
          moduleName: entry,
          filesRoot: path.join(modulePath, "files"),
        });
      }
    }
  }

  return { moduleFiles, generatorFiles };
}

async function discoverTemplateMetadataFiles(templatesRoot) {
  const templateFiles = [];
  const entries = await fs.readdir(templatesRoot);
  for (const entry of entries) {
    const templateDir = path.join(templatesRoot, entry);
    const stat = await fs.stat(templateDir).catch(() => null);
    if (!stat?.isDirectory()) continue;

    const templateJson = path.join(templateDir, "template.json");
    if (await fs.pathExists(templateJson)) {
      templateFiles.push({ path: templateJson, templateDir, folderName: entry });
    }
  }
  return templateFiles;
}

function validateCompatibilityShape(compatibility, errors, where) {
  if (compatibility === undefined) return;
  if (!isRecord(compatibility)) {
    errors.push(`${where}: "compatibility" must be an object`);
    return;
  }

  if (compatibility.frameworks !== undefined) {
    if (!isStringArray(compatibility.frameworks)) {
      errors.push(`${where}: "compatibility.frameworks" must be a string array`);
    } else {
      for (const framework of compatibility.frameworks) {
        if (!FRAMEWORKS.has(framework)) {
          errors.push(`${where}: unsupported framework "${framework}" in compatibility.frameworks`);
        }
      }
    }
  }

  if (compatibility.languages !== undefined && !isStringArray(compatibility.languages)) {
    errors.push(`${where}: "compatibility.languages" must be a string array`);
  }

  if (compatibility.databases !== undefined && !isStringArray(compatibility.databases)) {
    errors.push(`${where}: "compatibility.databases" must be a string array`);
  }

  if (compatibility.auth !== undefined && !isStringArray(compatibility.auth)) {
    errors.push(`${where}: "compatibility.auth" must be a string array`);
  }

  if (compatibility.packageManagers !== undefined) {
    if (!isStringArray(compatibility.packageManagers)) {
      errors.push(`${where}: "compatibility.packageManagers" must be a string array`);
    } else {
      for (const pm of compatibility.packageManagers) {
        if (!PACKAGE_MANAGERS.has(pm)) {
          errors.push(`${where}: unsupported package manager "${pm}" in compatibility.packageManagers`);
        }
      }
    }
  }
}

function validateConditionShape(condition, errors, where) {
  if (condition === undefined) return;
  if (!isRecord(condition)) {
    errors.push(`${where}: "condition" must be an object`);
    return;
  }

  for (const [key, value] of Object.entries(condition)) {
    const valid = isNonEmptyString(value) || isStringArray(value);
    if (!valid) {
      errors.push(`${where}: condition "${key}" must be a string or string array`);
    }
  }
}

function validateStringMap(value, errors, where) {
  if (!isRecord(value)) {
    errors.push(`${where} must be an object`);
    return;
  }
  for (const [key, val] of Object.entries(value)) {
    if (!isNonEmptyString(key)) {
      errors.push(`${where} has an empty key`);
    }
    if (!isNonEmptyString(val)) {
      errors.push(`${where}.${key} must be a non-empty string`);
    }
  }
}

async function validateSourceReference(op, filesRoot, errors, where) {
  if (!isNonEmptyString(op.source)) {
    errors.push(`${where}: "source" must be a non-empty string`);
    return;
  }

  if (hasUnsafePath(op.source)) {
    errors.push(`${where}: "source" cannot contain absolute or parent traversal path segments`);
    return;
  }

  if (op.source.includes("{{")) return;

  const normalized = stripWildcardSuffix(op.source);
  const sourcePath = path.join(filesRoot, normalized);

  if (!(await fs.pathExists(sourcePath))) {
    errors.push(`${where}: source path does not exist -> ${path.relative(filesRoot, sourcePath)}`);
    return;
  }

  if ((op.source.endsWith("/*") || op.source.endsWith("/**")) && !(await fs.stat(sourcePath)).isDirectory()) {
    errors.push(`${where}: wildcard source requires a directory -> ${path.relative(filesRoot, sourcePath)}`);
  }
}

function validateModuleMetadata(raw, context, errors) {
  const where = context.relPath;
  if (!isRecord(raw)) {
    errors.push(`${where}: JSON root must be an object`);
    return;
  }

  if (!isNonEmptyString(raw.name)) {
    errors.push(`${where}: "name" is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(raw.displayName)) {
    errors.push(`${where}: "displayName" is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(raw.category)) {
    errors.push(`${where}: "category" is required and must be a non-empty string`);
  } else if (!MODULE_CATEGORIES.has(raw.category)) {
    errors.push(`${where}: unsupported category "${raw.category}"`);
  } else if (raw.category !== context.category) {
    errors.push(`${where}: category "${raw.category}" does not match folder category "${context.category}"`);
  }

  if (!isStringArray(raw.supportedFrameworks)) {
    errors.push(`${where}: "supportedFrameworks" must be a non-empty string array`);
  } else {
    for (const framework of raw.supportedFrameworks) {
      if (!FRAMEWORKS.has(framework)) {
        errors.push(`${where}: unsupported framework "${framework}" in supportedFrameworks`);
      }
    }
  }

  const providerRequired = new Set(["auth", "database", "storage", "ui"]);
  if (providerRequired.has(context.category) && !isNonEmptyString(raw.provider)) {
    errors.push(`${where}: "provider" is required for category "${context.category}"`);
  }

  if (raw.postInstall !== undefined && !isStringArray(raw.postInstall)) {
    errors.push(`${where}: "postInstall" must be a string array`);
  }

  validateCompatibilityShape(raw.compatibility, errors, where);

  if (
    isRecord(raw.compatibility) &&
    isStringArray(raw.supportedFrameworks) &&
    isStringArray(raw.compatibility.frameworks)
  ) {
    for (const framework of raw.supportedFrameworks) {
      if (!raw.compatibility.frameworks.includes(framework)) {
        errors.push(
          `${where}: supportedFrameworks contains "${framework}" but compatibility.frameworks does not`,
        );
      }
    }
  }
}

async function validateGeneratorMetadata(raw, context, errors) {
  const where = context.relPath;
  if (!isRecord(raw)) {
    errors.push(`${where}: JSON root must be an object`);
    return;
  }

  if (!isNonEmptyString(raw.name)) {
    errors.push(`${where}: "name" is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(raw.type)) {
    errors.push(`${where}: "type" is required and must be a non-empty string`);
  } else if (!MODULE_CATEGORIES.has(raw.type)) {
    errors.push(`${where}: unsupported generator type "${raw.type}"`);
  } else if (raw.type !== context.category) {
    errors.push(`${where}: type "${raw.type}" does not match folder category "${context.category}"`);
  }

  if (typeof raw.priority !== "number" || !Number.isFinite(raw.priority)) {
    errors.push(`${where}: "priority" must be a finite number`);
  }

  if (raw.dependencies !== undefined) {
    validateStringMap(raw.dependencies, errors, `${where}: dependencies`);
  }
  if (raw.devDependencies !== undefined) {
    validateStringMap(raw.devDependencies, errors, `${where}: devDependencies`);
  }
  if (raw.scripts !== undefined) {
    validateStringMap(raw.scripts, errors, `${where}: scripts`);
  }
  if (raw.envVars !== undefined) {
    validateStringMap(raw.envVars, errors, `${where}: envVars`);
  }
  if (raw.postInstall !== undefined && !isStringArray(raw.postInstall)) {
    errors.push(`${where}: "postInstall" must be a string array`);
  }

  if (raw.operations === undefined) return;
  if (!Array.isArray(raw.operations)) {
    errors.push(`${where}: "operations" must be an array`);
    return;
  }

  for (let index = 0; index < raw.operations.length; index += 1) {
    const op = raw.operations[index];
    const opWhere = `${where}: operations[${index}]`;

    if (!isRecord(op)) {
      errors.push(`${opWhere} must be an object`);
      continue;
    }

    if (!isNonEmptyString(op.type) || !OPERATION_TYPES.has(op.type)) {
      errors.push(`${opWhere}: unsupported operation type`);
      continue;
    }

    validateConditionShape(op.condition, errors, opWhere);

    if (op.priority !== undefined && (typeof op.priority !== "number" || !Number.isFinite(op.priority))) {
      errors.push(`${opWhere}: "priority" must be a finite number when provided`);
    }

    if (op.type === "create-file") {
      await validateSourceReference(op, context.filesRoot, errors, opWhere);

      if (!isNonEmptyString(op.destination)) {
        errors.push(`${opWhere}: "destination" must be a non-empty string`);
      } else if (hasUnsafePath(op.destination)) {
        errors.push(`${opWhere}: "destination" cannot contain absolute or parent traversal path segments`);
      }
    }

    if (op.type === "patch-file") {
      if (!isNonEmptyString(op.destination)) {
        errors.push(`${opWhere}: "destination" must be a non-empty string`);
      } else if (hasUnsafePath(op.destination)) {
        errors.push(`${opWhere}: "destination" cannot contain absolute or parent traversal path segments`);
      }

      if (!Array.isArray(op.operations) || op.operations.length === 0) {
        errors.push(`${opWhere}: patch-file operation requires a non-empty "operations" array`);
      } else {
        for (let patchIndex = 0; patchIndex < op.operations.length; patchIndex += 1) {
          const patchOp = op.operations[patchIndex];
          const patchWhere = `${opWhere}.operations[${patchIndex}]`;

          if (!isRecord(patchOp)) {
            errors.push(`${patchWhere} must be an object`);
            continue;
          }
          if (!isNonEmptyString(patchOp.type) || !PATCH_OPERATION_TYPES.has(patchOp.type)) {
            errors.push(`${patchWhere}: unsupported patch operation type`);
            continue;
          }
          validateConditionShape(patchOp.condition, errors, patchWhere);

          if (patchOp.type === "add-import") {
            if (!isStringArray(patchOp.imports)) {
              errors.push(`${patchWhere}: add-import requires "imports" string array`);
            }
          }

          if (patchOp.type === "add-code") {
            const validCode = isNonEmptyString(patchOp.code) || isStringArray(patchOp.code);
            if (!validCode) {
              errors.push(`${patchWhere}: add-code requires non-empty "code"`);
            }
            if (!isNonEmptyString(patchOp.after) && !isNonEmptyString(patchOp.before)) {
              errors.push(`${patchWhere}: add-code requires at least one of "after" or "before"`);
            }
          }

          if (patchOp.type === "replace-code") {
            const validCode = isNonEmptyString(patchOp.code) || isStringArray(patchOp.code);
            if (!validCode || !isNonEmptyString(patchOp.replace)) {
              errors.push(`${patchWhere}: replace-code requires "code" and "replace"`);
            }
          }

          if (patchOp.type === "add-to-top" || patchOp.type === "add-to-bottom") {
            if (!isNonEmptyString(patchOp.content) && !isNonEmptyString(patchOp.source)) {
              errors.push(`${patchWhere}: ${patchOp.type} requires "content" or "source"`);
            }
            if (isNonEmptyString(patchOp.source)) {
              await validateSourceReference(
                { source: patchOp.source },
                context.filesRoot,
                errors,
                `${patchWhere}.source`,
              );
            }
          }
        }
      }
    }

    if (op.type === "add-dependency") {
      const hasDeps = isRecord(op.dependencies) && Object.keys(op.dependencies).length > 0;
      const hasDevDeps = isRecord(op.devDependencies) && Object.keys(op.devDependencies).length > 0;
      if (!hasDeps && !hasDevDeps) {
        errors.push(`${opWhere}: add-dependency requires dependencies and/or devDependencies`);
      }
      if (op.dependencies !== undefined) {
        validateStringMap(op.dependencies, errors, `${opWhere}: dependencies`);
      }
      if (op.devDependencies !== undefined) {
        validateStringMap(op.devDependencies, errors, `${opWhere}: devDependencies`);
      }
    }

    if (op.type === "add-script") {
      if (!isRecord(op.scripts) || Object.keys(op.scripts).length === 0) {
        errors.push(`${opWhere}: add-script requires non-empty "scripts" object`);
      } else {
        validateStringMap(op.scripts, errors, `${opWhere}: scripts`);
      }
    }

    if (op.type === "add-env") {
      if (!isRecord(op.envVars) || Object.keys(op.envVars).length === 0) {
        errors.push(`${opWhere}: add-env requires non-empty "envVars" object`);
      } else {
        validateStringMap(op.envVars, errors, `${opWhere}: envVars`);
      }
    }

    if (op.type === "run-command") {
      if (!isNonEmptyString(op.command)) {
        errors.push(`${opWhere}: run-command requires non-empty "command"`);
      }
    }
  }
}

async function validateTemplateMetadata(raw, context, errors) {
  const where = context.relPath;
  if (!isRecord(raw)) {
    errors.push(`${where}: JSON root must be an object`);
    return;
  }

  if (!isNonEmptyString(raw.name)) {
    errors.push(`${where}: "name" is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(raw.displayName)) {
    errors.push(`${where}: "displayName" is required and must be a non-empty string`);
  }
  if (!isNonEmptyString(raw.framework)) {
    errors.push(`${where}: "framework" is required and must be a non-empty string`);
  } else if (!FRAMEWORKS.has(raw.framework)) {
    errors.push(`${where}: unsupported framework "${raw.framework}"`);
  }
  if (!isNonEmptyString(raw.description)) {
    errors.push(`${where}: "description" is required and must be a non-empty string`);
  }

  if (raw.framework && raw.framework !== context.folderName) {
    errors.push(`${where}: framework "${raw.framework}" does not match template folder "${context.folderName}"`);
  }
  if (raw.name && raw.name !== context.folderName) {
    errors.push(`${where}: name "${raw.name}" does not match template folder "${context.folderName}"`);
  }

  if (!Array.isArray(raw.files) || raw.files.length === 0) {
    errors.push(`${where}: "files" must be a non-empty array`);
  } else {
    for (const fileEntry of raw.files) {
      if (!isNonEmptyString(fileEntry)) {
        errors.push(`${where}: files must contain only non-empty strings`);
        continue;
      }
      if (hasUnsafePath(fileEntry)) {
        errors.push(`${where}: files entry "${fileEntry}" cannot contain absolute or parent traversal paths`);
        continue;
      }

      const normalizedEntry = fileEntry.replace(/\/$/, "");
      const filePath = path.join(context.templateDir, normalizedEntry);
      if (!(await fs.pathExists(filePath))) {
        errors.push(`${where}: referenced file path does not exist -> ${normalizedEntry}`);
      }
    }
  }

  if (!isRecord(raw.scripts) || Object.keys(raw.scripts).length === 0) {
    errors.push(`${where}: "scripts" must be a non-empty object`);
  } else {
    validateStringMap(raw.scripts, errors, `${where}: scripts`);
  }

  if (raw.jsScripts !== undefined) {
    if (!isRecord(raw.jsScripts) || Object.keys(raw.jsScripts).length === 0) {
      errors.push(`${where}: "jsScripts" must be a non-empty object when provided`);
    } else {
      validateStringMap(raw.jsScripts, errors, `${where}: jsScripts`);
    }
  }

  validateCompatibilityShape(raw.compatibility, errors, where);
}

async function main() {
  const repoRoot = path.join(__dirname, "..", "..", "..");
  const modulesRoot = path.join(repoRoot, "modules");
  const templatesRoot = path.join(repoRoot, "templates");
  const errors = [];

  if (!(await fs.pathExists(modulesRoot))) {
    errors.push(`Missing modules directory: ${modulesRoot}`);
  }
  if (!(await fs.pathExists(templatesRoot))) {
    errors.push(`Missing templates directory: ${templatesRoot}`);
  }

  if (errors.length > 0) {
    for (const error of errors) console.error(`❌ ${error}`);
    process.exit(1);
  }

  const { moduleFiles, generatorFiles } = await discoverModuleMetadataFiles(modulesRoot);
  const templateFiles = await discoverTemplateMetadataFiles(templatesRoot);

  if (moduleFiles.length === 0) {
    errors.push("No module.json files found under modules/");
  }
  if (generatorFiles.length === 0) {
    errors.push("No generator.json files found under modules/");
  }
  if (templateFiles.length === 0) {
    errors.push("No template.json files found under templates/");
  }

  for (const file of moduleFiles) {
    const relPath = relativeToRepo(repoRoot, file.path);
    const raw = await fs.readJson(file.path).catch(() => null);
    validateModuleMetadata(raw, { ...file, relPath }, errors);
  }

  for (const file of generatorFiles) {
    const relPath = relativeToRepo(repoRoot, file.path);
    const raw = await fs.readJson(file.path).catch(() => null);
    await validateGeneratorMetadata(raw, { ...file, relPath }, errors);
  }

  for (const file of templateFiles) {
    const relPath = relativeToRepo(repoRoot, file.path);
    const raw = await fs.readJson(file.path).catch(() => null);
    await validateTemplateMetadata(raw, { ...file, relPath }, errors);
  }

  if (errors.length > 0) {
    console.error(`\n❌ Metadata validation failed with ${errors.length} issue(s):`);
    for (const error of errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `✅ Metadata validation passed (${moduleFiles.length} module, ${generatorFiles.length} generator, ${templateFiles.length} template files)`,
  );
}

main().catch((error) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`❌ Metadata validation failed: ${message}`);
  process.exit(1);
});
