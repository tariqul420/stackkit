import fs from "fs-extra";
import path, { join } from "path";
import { applyFrameworkPatches } from "./config-utils";
import { mergeEnvFile, mergePackageJson } from "./file-utils";

interface FrameworkConfig {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  envVars?: Array<{ key: string; value: string; description?: string; required?: boolean }>;
  patches?: Array<{ type: string; description: string; source: string; destination: string }>;
}

export async function mergeDatabaseConfig(
  templatesDir: string,
  targetDir: string,
  database: string,
  framework: string,
  dbProvider?: string,
): Promise<string[]> {
  const modulesDir = join(templatesDir, "..", "modules");
  const dbModulePath = join(modulesDir, "database", database);

  if (!(await fs.pathExists(dbModulePath))) {
    // eslint-disable-next-line no-console
    console.warn(`Database module not found: ${database}`);
    return [];
  }

  // Read module.json
  const moduleJsonPath = join(dbModulePath, "module.json");
  if (!(await fs.pathExists(moduleJsonPath))) {
    return [];
  }

  const moduleData = await fs.readJson(moduleJsonPath);

  const variables: Record<string, string> = {};
  if (dbProvider) {
    variables.provider = dbProvider;
    if (dbProvider === "postgresql") {
      variables.connectionString = "postgresql://user:password@localhost:5432/mydb?schema=public";
      variables.prismaClientInit = `
import { PrismaPg } from "@prisma/adapter-pg";

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
    } else if (dbProvider === "mongodb") {
      variables.connectionString = "mongodb://localhost:27017/mydb";
      variables.prismaClientInit = `
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
    } else if (dbProvider === "mysql") {
      variables.connectionString = "mysql://user:password@localhost:3306/mydb";
      variables.prismaClientInit = `
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
    } else if (dbProvider === "sqlite") {
      variables.connectionString = "file:./dev.db";
      variables.prismaClientInit = `
const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
`;
    }
  }

  const filesDir = join(dbModulePath, "files");
  if (await fs.pathExists(filesDir)) {
    const libDir = framework === "nextjs" ? "lib" : "src";
    for (const patch of moduleData.patches || []) {
      if (patch.type === "create-file") {
        const sourceFile = join(filesDir, patch.source);
        let destFile = join(targetDir, patch.destination);

        destFile = destFile
          .replace("{{lib}}", libDir)
          .replace("{{src}}", "src")
          .replace("{{models}}", framework === "nextjs" ? "models" : "src/models");

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(join(destFile, ".."));
          // Check if text file
          const ext = path.extname(sourceFile);
          if ([".ts", ".js", ".prisma", ".json"].includes(ext)) {
            let content = await fs.readFile(sourceFile, "utf-8");
            for (const [key, value] of Object.entries(variables)) {
              content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
            }
            await fs.writeFile(destFile, content);
          } else {
            await fs.copy(sourceFile, destFile, { overwrite: false });
          }
        }
      }
    }
  }

  const dependencies = {
    ...moduleData.dependencies.common,
    ...(dbProvider ? moduleData.dependencies.providers[dbProvider] : {}),
  };
  const devDependencies = {
    ...moduleData.devDependencies.common,
    ...(dbProvider ? moduleData.devDependencies.providers[dbProvider] : {}),
  };

  await mergePackageJson(targetDir, {
    dependencies,
    devDependencies,
  });

  const envVars: Record<string, string> = {};
  for (const envVar of moduleData.envVars || []) {
    let value = envVar.value;
    for (const [key, val] of Object.entries(variables)) {
      value = value.replace(new RegExp(`{{${key}}}`, "g"), val);
    }
    envVars[envVar.key] = value;
  }
  await mergeEnvFile(targetDir, envVars);

  if (moduleData.frameworkPatches) {
    const frameworkKey = framework === "react-vite" ? "react" : framework;
    const patches = moduleData.frameworkPatches[frameworkKey];

    if (patches) {
      await applyFrameworkPatches(targetDir, patches);
    }
  }

  return moduleData.postInstall || [];
}

export async function mergeAuthConfig(
  templatesDir: string,
  targetDir: string,
  framework: string,
  auth: string,
  database: string = "none",
  dbProvider?: string,
): Promise<void> {
  const modulesDir = join(templatesDir, "..", "modules");

  const authMap: Record<string, string> = {
    "better-auth": "better-auth",
    clerk: "clerk",
    "clerk-nextjs": "clerk",
    "clerk-express": "clerk",
    "clerk-react": "clerk",
  };

  const authKey = authMap[auth] || auth;
  const authModulePath = join(modulesDir, "auth", authKey);

  if (!(await fs.pathExists(authModulePath))) {
    // eslint-disable-next-line no-console
    console.warn(`Auth module not found: ${authKey}`);
    return;
  }

  // Read module.json
  const moduleJsonPath = join(authModulePath, "module.json");
  if (!(await fs.pathExists(moduleJsonPath))) {
    return;
  }

  const moduleData = await fs.readJson(moduleJsonPath);

  if (moduleData.supportedFrameworks && !moduleData.supportedFrameworks.includes(framework)) {
    // eslint-disable-next-line no-console
    console.warn(`Auth ${authKey} does not support framework ${framework}`);
    return;
  }

  let frameworkConfig: FrameworkConfig | null = null;
  if (moduleData.frameworkConfigs) {
    frameworkConfig = moduleData.frameworkConfigs[framework];
    if (!frameworkConfig) {
      // eslint-disable-next-line no-console
      console.warn(`No config for framework ${framework} in ${authKey}`);
      return;
    }
  }

  const variables: Record<string, string> = {};
  if (framework === "nextjs") {
    variables.dbImport = "@/lib/db";
  } else if (framework === "express") {
    variables.dbImport = "../db";
  } else {
    variables.dbImport = "../db";
  }

  const filesDir = join(authModulePath, "files");
  if (await fs.pathExists(filesDir)) {
    const getReplacements = () => {
      if (framework === "nextjs") {
        return { lib: "lib", router: "app" };
      } else if (framework === "express") {
        return { lib: "src", router: "src" };
      } else {
        return { lib: "src", router: "src" };
      }
    };

    const replacements = getReplacements();

    const patches = frameworkConfig?.patches || moduleData.patches || [];
    for (const patch of patches) {
      if (patch.type === "create-file") {
        const sourceFile = join(filesDir, patch.source);
        let destFile = join(targetDir, patch.destination);

        destFile = destFile
          .replace("{{lib}}", replacements.lib)
          .replace("{{router}}", replacements.router);

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(path.dirname(destFile));
          // Check if text file
          const ext = path.extname(sourceFile);
          if ([".ts", ".js", ".json"].includes(ext)) {
            let content = await fs.readFile(sourceFile, "utf-8");
            for (const [key, value] of Object.entries(variables)) {
              content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
            }
            await fs.writeFile(destFile, content);
          } else {
            await fs.copy(sourceFile, destFile, { overwrite: false });
          }
        }
      }
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

  if (database !== "none" && moduleData.databaseAdapters) {
    let adapterKey = database;
    if (database === "prisma" && dbProvider) {
      adapterKey = `prisma-${dbProvider}`;
    }
    const adapterConfig = moduleData.databaseAdapters[adapterKey];

    if (adapterConfig) {
      variables.databaseAdapter = adapterConfig.adapterCode;

      if (adapterConfig.schema && adapterConfig.schemaDestination) {
        const schemaSource = join(authModulePath, adapterConfig.schema);
        const schemaDest = join(targetDir, adapterConfig.schemaDestination);

        if (await fs.pathExists(schemaSource)) {
          await fs.ensureDir(path.dirname(schemaDest));
          let content = await fs.readFile(schemaSource, "utf-8");

          // Set schema variables
          if (dbProvider === "postgresql") {
            variables.provider = "postgresql";
            variables.idDefault = "@default(cuid())";
            variables.userIdType = "";
          } else if (dbProvider === "mongodb") {
            variables.provider = "mongodb";
            variables.idDefault = '@default(auto()) @map("_id") @db.ObjectId';
            variables.userIdType = "@db.ObjectId";
          }

          for (const [key, value] of Object.entries(variables)) {
            content = content.replace(new RegExp(`{{${key}}}`, "g"), value);
          }
          await fs.writeFile(schemaDest, content, { flag: "a" }); // append
        }
      }

      if (adapterConfig.dependencies) {
        await mergePackageJson(targetDir, {
          dependencies: adapterConfig.dependencies,
        });
      }
    }
  }

  await mergePackageJson(targetDir, {
    dependencies: frameworkConfig?.dependencies || moduleData.dependencies,
    devDependencies: frameworkConfig?.devDependencies || moduleData.devDependencies,
  });

  const envVars: Record<string, string> = {};
  const envVarList = frameworkConfig?.envVars || moduleData.envVars || [];
  for (const envVar of envVarList) {
    envVars[envVar.key] = envVar.value;
  }
  await mergeEnvFile(targetDir, envVars);
}
