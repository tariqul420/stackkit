import fs from "fs-extra";
import path, { join } from "path";
import { applyFrameworkPatches } from "./config-utils";
import { mergeEnvFile, mergePackageJson } from "./files";
import { logger } from "./logger";

interface PatchOperation {
  type: string;
  imports?: string[];
  after?: string;
  code?: string;
}

interface Patch {
  type: string;
  description: string;
  source?: string;
  destination?: string;
  file?: string;
  operations?: PatchOperation[];
}

interface FrameworkConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  envVars?: Array<{ key: string; value: string; description?: string; required?: boolean }>;
  patches?: Patch[];
}

interface ModuleData {
  name: string;
  displayName: string;
  description: string;
  category: string;
  provider: string;
  supportedFrameworks?: string[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  dependencies?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  devDependencies?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  envVars?: any;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  frameworkPatches?: Record<string, any>;
  patches?: Array<{ type: string; description: string; source: string; destination: string }>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  databaseAdapters?: Record<string, any>;
  frameworkConfigs?: Record<string, FrameworkConfig>;
  postInstall?: string[];
}

interface FrameworkPaths {
  lib: string;
  router: string;
  models: string;
}

interface ModuleVariables {
  [key: string]: string;
}

/**
 * Process environment variables with variable replacement
 */
function processEnvVars(
  envVarList: Array<{ key: string; value: string; description?: string; required?: boolean }>,
  variables: ModuleVariables,
): Record<string, string> {
  const envVars: Record<string, string> = {};
  for (const envVar of envVarList) {
    let value = envVar.value;
    for (const [key, val] of Object.entries(variables)) {
      value = value.replace(new RegExp(`{{${key}}}`, "g"), val);
    }
    envVars[envVar.key] = value;
  }
  return envVars;
}

/**
 * Get framework-specific paths for file placement
 */
function getFrameworkPaths(framework: string): FrameworkPaths {
  switch (framework) {
    case "nextjs":
      return { lib: "lib", router: "app", models: "lib/models" };
    case "express":
      return { lib: "lib", router: "src", models: "lib/models" };
    case "react-vite":
      return { lib: "src/lib", router: "src", models: "src/models" };
    default:
      return { lib: "src/lib", router: "src", models: "src/models" };
  }
}

/**
 * Generate variables based on database, framework, and provider
 */
function generateVariables(
  database: string,
  framework: string,
  dbProvider?: string,
  auth?: string,
): ModuleVariables {
  const variables: ModuleVariables = {};

  // Database-specific variables
  variables.dbFile = database === "prisma" ? "prisma.ts" : "db.ts";
  variables.dbDescription =
    database === "prisma"
      ? "Create Prisma client singleton"
      : "Create MongoDB connection with Mongoose";

  // Auth-specific variables
  if (auth) {
    variables.authFile = "auth.ts";
    variables.authDescription = `Create ${auth} authentication configuration`;

    // Dynamic dbImport for auth modules
    const libPath = framework === "nextjs" ? "@/lib" : ".";
    const adapterImport = 'import { prismaAdapter } from "better-auth/adapters/prisma";';

    if (database === "prisma") {
      variables.dbImport = `import { prisma } from "${libPath}/prisma";
${adapterImport}`;
    } else if (database === "mongoose") {
      variables.dbImport = `import { mongoClient: client, db } from "${libPath}/db";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
`;
    } else {
      variables.dbImport =
        database === "prisma"
          ? `import { prisma } from "${libPath}/prisma";`
          : `import { client } from "${libPath}/db";`;
    }
  } else {
    const libPath = framework === "nextjs" ? "@/lib" : ".";
    variables.dbImport = database === "prisma" ? `${libPath}/prisma` : `${libPath}/db`;
  }

  // Provider-specific variables
  if (dbProvider) {
    variables.provider = dbProvider;

    switch (dbProvider) {
      case "postgresql":
        variables.connectionString = "postgresql://user:password@localhost:5432/mydb?schema=public";
        variables.prismaClientInit = `import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  adapter,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
        break;
      case "mongodb":
        variables.connectionString = "mongodb+srv://username:password@cluster.mongodb.net/mydb";
        variables.prismaClientInit = `
const prisma = new PrismaClient()
`;
        break;
      case "mysql":
        variables.connectionString = "mysql://user:password@localhost:3306/mydb";
        variables.prismaClientInit = `import { PrismaMariaDb } from '@prisma/adapter-mariadb';

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});
const prisma = new PrismaClient({ adapter });
`;
        break;
      case "sqlite":
        variables.connectionString = "file:./dev.db";
        variables.prismaClientInit = `import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });
`;
        break;
    }
  }

  return variables;
}

/**
 * Process a single patch with variable replacement
 */
async function processPatch(
  patch: Patch,
  filesDir: string,
  targetDir: string,
  variables: ModuleVariables,
  frameworkPaths: FrameworkPaths,
): Promise<void> {
  if (patch.type === "create-file") {
    if (!patch.source || !patch.destination) return;

    try {
      // Replace variables in source and destination
      const sourcePath = patch.source.replace(
        /\{\{(\w+)\}\}/g,
        (match: string, key: string) => variables[key] || match,
      );
      const sourceFile = join(filesDir, sourcePath);

      let destFile = join(
        targetDir,
        patch.destination.replace(
          /\{\{(\w+)\}\}/g,
          (match: string, key: string) => variables[key] || match,
        ),
      );

      // Apply framework-specific path replacements
      destFile = destFile
        .replace("{{lib}}", frameworkPaths.lib)
        .replace("{{router}}", frameworkPaths.router)
        .replace("{{models}}", frameworkPaths.models);

      if (!(await fs.pathExists(sourceFile))) {
        logger.warn(`Source file not found: ${sourceFile}`);
        return;
      }

      await fs.ensureDir(path.dirname(destFile));

      const ext = path.extname(sourceFile);
      if ([".ts", ".js", ".tsx", ".prisma", ".json"].includes(ext)) {
        let content = await fs.readFile(sourceFile, "utf-8");
        for (const [key, value] of Object.entries(variables)) {
          content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
        }
        await fs.writeFile(destFile, content);
      } else {
        await fs.copy(sourceFile, destFile, { overwrite: false });
      }
    } catch (error) {
      logger.error(`Failed to process patch ${patch.description}: ${(error as Error).message}`);
      throw error;
    }
  } else if (patch.type === "patch-file") {
    if (!patch.file) return;

    try {
      const filePath = join(targetDir, patch.file);
      if (!(await fs.pathExists(filePath))) {
        logger.warn(`File to patch not found: ${filePath}`);
        return;
      }

      let content = await fs.readFile(filePath, "utf-8");

      for (const operation of patch.operations || []) {
        if (operation.type === "add-import" && operation.imports) {
          // Add imports at the top of the file, after existing imports
          const imports = operation.imports.join("\n");
          // Find the last import statement
          const importRegex = /^import\s+.*$/gm;
          const matches = [...content.matchAll(importRegex)];
          if (matches.length > 0) {
            const lastImport = matches[matches.length - 1];
            const insertIndex = (lastImport.index ?? 0) + lastImport[0].length;
            content = content.slice(0, insertIndex) + "\n" + imports + content.slice(insertIndex);
          } else {
            // No imports found, add at the beginning
            content = imports + "\n\n" + content;
          }
        } else if (operation.type === "add-code") {
          if (operation.after && operation.code) {
            const insertIndex = content.indexOf(operation.after);
            if (insertIndex !== -1) {
              const afterIndex = insertIndex + operation.after.length;
              content = content.slice(0, afterIndex) + operation.code + content.slice(afterIndex);
            }
          }
        }
      }

      await fs.writeFile(filePath, content);
    } catch (error) {
      logger.error(`Failed to process patch-file ${patch.description}: ${(error as Error).message}`);
      throw error;
    }
  }
}

/**
 * Validate and extract module data
 */
async function loadModuleData(modulePath: string): Promise<ModuleData> {
  const moduleJsonPath = join(modulePath, "module.json");
  if (!(await fs.pathExists(moduleJsonPath))) {
    throw new Error(`Module configuration not found: ${moduleJsonPath}`);
  }

  const moduleData = await fs.readJson(moduleJsonPath);
  if (!moduleData) {
    throw new Error(`Invalid module configuration: ${moduleJsonPath}`);
  }

  return moduleData as ModuleData;
}

export async function mergeDatabaseConfig(
  templatesDir: string,
  targetDir: string,
  database: string,
  framework: string,
  dbProvider?: string,
): Promise<string[]> {
  try {
    const modulesDir = join(templatesDir, "..", "modules");
    const dbModulePath = join(modulesDir, "database", database);

    if (!(await fs.pathExists(dbModulePath))) {
      logger.warn(`Database module not found: ${database}`);
      return [];
    }

    const moduleData = await loadModuleData(dbModulePath);
    const variables = generateVariables(database, framework, dbProvider);
    const frameworkPaths = getFrameworkPaths(framework);

    const filesDir = join(dbModulePath, "files");
    if (await fs.pathExists(filesDir)) {
      for (const patch of moduleData.patches || []) {
        await processPatch(patch, filesDir, targetDir, variables, frameworkPaths);
      }
    }

    // Merge dependencies
    let dependencies: Record<string, string> = {};
    let devDependencies: Record<string, string> = {};

    if (moduleData.dependencies) {
      if (moduleData.dependencies.common || moduleData.dependencies.providers) {
        // Structured dependencies (common + providers)
        dependencies = {
          ...moduleData.dependencies.common,
          ...(dbProvider ? moduleData.dependencies.providers?.[dbProvider] : {}),
        };
      } else {
        // Flat dependencies structure
        dependencies = { ...moduleData.dependencies };
      }
    }

    if (moduleData.devDependencies) {
      if (moduleData.devDependencies.common || moduleData.devDependencies.providers) {
        // Structured devDependencies
        devDependencies = {
          ...moduleData.devDependencies.common,
          ...(dbProvider ? moduleData.devDependencies.providers?.[dbProvider] : {}),
        };
      } else {
        // Flat devDependencies structure
        devDependencies = { ...moduleData.devDependencies };
      }
    }

    await mergePackageJson(targetDir, { dependencies, devDependencies });

    // Process environment variables
    const envVars: Record<string, string> = {};
    const commonEnvVars = Array.isArray(moduleData.envVars)
      ? moduleData.envVars
      : moduleData.envVars?.common || [];
    const providerEnvVars =
      dbProvider && moduleData.envVars?.providers?.[dbProvider]
        ? moduleData.envVars.providers[dbProvider]
        : [];
    const allEnvVars = [...commonEnvVars, ...providerEnvVars];

    Object.assign(envVars, processEnvVars(allEnvVars, variables));
    await mergeEnvFile(targetDir, envVars);

    // Apply framework-specific patches
    if (moduleData.frameworkPatches) {
      const frameworkKey = framework === "react-vite" ? "react" : framework;
      const patches = moduleData.frameworkPatches[frameworkKey];

      if (patches) {
        await applyFrameworkPatches(targetDir, patches);
      }
    }

    return moduleData.postInstall || [];
  } catch (error) {
    logger.error(`Failed to merge database config for ${database}: ${(error as Error).message}`);
    throw error;
  }
}

export async function mergeAuthConfig(
  templatesDir: string,
  targetDir: string,
  framework: string,
  auth: string,
  database: string = "none",
  dbProvider?: string,
): Promise<void> {
  try {
    const modulesDir = join(templatesDir, "..", "modules");
    const authModulePath = join(modulesDir, "auth", auth);

    if (!(await fs.pathExists(authModulePath))) {
      logger.warn(`Auth module not found: ${auth}`);
      return;
    }

    const moduleData = await loadModuleData(authModulePath);

    if (moduleData.supportedFrameworks && !moduleData.supportedFrameworks.includes(framework)) {
      logger.warn(`Auth ${auth} does not support framework ${framework}`);
      return;
    }

    let frameworkConfig: FrameworkConfig | null = null;
    if (moduleData.frameworkConfigs) {
      frameworkConfig = moduleData.frameworkConfigs[framework];
      if (!frameworkConfig) {
        logger.warn(`No config for framework ${framework} in ${auth}`);
        return;
      }
      const shared = moduleData.frameworkConfigs.shared;
      if (shared) {
        frameworkConfig = {
          ...shared,
          ...frameworkConfig,
        };
      }
    }

    const variables = generateVariables(database, framework, dbProvider, auth);
    const frameworkPaths = getFrameworkPaths(framework);

    // Handle database adapters first to set variables
    if (database !== "none" && moduleData.databaseAdapters) {
      let adapterKey = database;
      if (database === "prisma" && dbProvider) {
        adapterKey = `prisma-${dbProvider}`;
      }
      const adapterConfig = moduleData.databaseAdapters[adapterKey];

      if (adapterConfig) {
        // Generate adapter code based on database type
        if (database === "prisma" && dbProvider) {
          variables.databaseAdapter = `database: prismaAdapter(prisma, {\n    provider: "${dbProvider}",\n  }),`;
        } else if (database === "mongoose") {
          variables.databaseAdapter = `database: mongodbAdapter(db, {\n    client\n  }),`;
        }

        if (adapterConfig.schema && adapterConfig.schemaDestination) {
          const schemaSource = join(authModulePath, adapterConfig.schema);
          const schemaDest = join(targetDir, adapterConfig.schemaDestination);

          if (await fs.pathExists(schemaSource)) {
            await fs.ensureDir(path.dirname(schemaDest));
            let content = await fs.readFile(schemaSource, "utf-8");

            // Set schema variables for Prisma
            if (dbProvider === "postgresql") {
              variables.provider = "postgresql";
              variables.idDefault = "@default(cuid())";
              variables.userIdType = "";
            } else if (dbProvider === "mongodb") {
              variables.provider = "mongodb";
              variables.idDefault = '@default(auto()) @map("_id") @db.ObjectId';
              variables.userIdType = "@db.ObjectId";
            } else if (dbProvider === "mysql") {
              variables.provider = "mysql";
              variables.idDefault = "@default(cuid())";
              variables.userIdType = "";
            } else if (dbProvider === "sqlite") {
              variables.provider = "sqlite";
              variables.idDefault = "@default(cuid())";
              variables.userIdType = "";
            }

            for (const [key, value] of Object.entries(variables)) {
              content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
            }
            await fs.writeFile(schemaDest, content, { flag: "a" }); // append
          }
        }

        if (adapterConfig.dependencies) {
          const commonDeps = moduleData.databaseAdapters.common?.dependencies || {};
          const commonDevDeps = moduleData.databaseAdapters.common?.devDependencies || {};
          const specificDeps = adapterConfig.dependencies;
          const specificDevDeps = adapterConfig.devDependencies || {};
          await mergePackageJson(targetDir, {
            dependencies: { ...commonDeps, ...specificDeps },
            devDependencies: { ...commonDevDeps, ...specificDevDeps },
          });
        }
      }
    }

    const filesDir = join(authModulePath, "files");
    if (await fs.pathExists(filesDir)) {
      const patches = frameworkConfig?.patches || moduleData.patches || [];
      for (const patch of patches) {
        await processPatch(patch, filesDir, targetDir, variables, frameworkPaths);
      }
    }

    // Add framework-specific patches
    if (framework === "nextjs") {
      const apiSource = join(filesDir, "api/auth/[...all]/route.ts");
      const apiDest = join(targetDir, "app/api/auth/[...all]/route.ts");
      if (await fs.pathExists(apiSource)) {
        await fs.ensureDir(path.dirname(apiDest));
        await fs.copy(apiSource, apiDest, { overwrite: false });
      }
    }

    // Merge package.json
    await mergePackageJson(targetDir, {
      dependencies: frameworkConfig?.dependencies || moduleData.dependencies,
      devDependencies: frameworkConfig?.devDependencies || moduleData.devDependencies,
    });

    // Process environment variables
    const envVars: Record<string, string> = {};
    const envVarList = frameworkConfig?.envVars || moduleData.envVars || [];
    Object.assign(envVars, processEnvVars(envVarList, variables));
    await mergeEnvFile(targetDir, envVars);

    // Apply framework-specific patches
    if (moduleData.frameworkPatches) {
      const frameworkKey = framework === "react-vite" ? "react" : framework;
      const patches = moduleData.frameworkPatches[frameworkKey];

      if (patches) {
        await applyFrameworkPatches(targetDir, patches);
      }
    }
  } catch (error) {
    logger.error(`Failed to merge auth config for ${auth}: ${(error as Error).message}`);
    throw error;
  }
}
