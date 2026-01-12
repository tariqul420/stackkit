import fs from "fs-extra";
import path, { join } from "path";
import { applyFrameworkPatches } from "./config-utils";
import { mergeEnvFile, mergePackageJson } from "./file-utils";

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
      variables.prismaClientInit = `import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = \`\${env.db.url}\`;

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });`;
    } else if (dbProvider === "mongodb") {
      variables.connectionString = "mongodb://localhost:27017/mydb";
      variables.prismaClientInit = `const prisma = new PrismaClient({
  datasourceUrl: env.db.url,
});`;
    } else if (dbProvider === "mysql") {
      variables.connectionString = "mysql://user:password@localhost:3306/mydb";
      variables.prismaClientInit = `const prisma = new PrismaClient({
  datasourceUrl: env.db.url,
});`;
    } else if (dbProvider === "sqlite") {
      variables.connectionString = "file:./dev.db";
      variables.prismaClientInit = `const prisma = new PrismaClient({
  datasourceUrl: env.db.url,
});`;
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
): Promise<void> {
  const modulesDir = join(templatesDir, "..", "modules");

  const authMap: Record<string, string> = {
    nextauth: "nextauth",
    "better-auth": framework === "nextjs" ? "better-auth-nextjs" : "better-auth-express",
    clerk:
      framework === "nextjs"
        ? "clerk-nextjs"
        : framework === "react-vite"
          ? "clerk-react"
          : "clerk-express",
  };

  const authKey = auth.includes("-") ? auth : authMap[auth] || auth;
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

    for (const patch of moduleData.patches || []) {
      if (patch.type === "create-file") {
        const sourceFile = join(filesDir, patch.source);
        let destFile = join(targetDir, patch.destination);

        destFile = destFile
          .replace("{{lib}}", replacements.lib)
          .replace("{{router}}", replacements.router);

        if (await fs.pathExists(sourceFile)) {
          await fs.ensureDir(path.dirname(destFile));
          await fs.copy(sourceFile, destFile, { overwrite: false });
        }
      }
    }
  }

  if (database !== "none" && moduleData.databaseAdapters) {
    const adapterConfig = moduleData.databaseAdapters[database];

    if (adapterConfig) {
      if (adapterConfig.adapter) {
        const adapterSource = join(authModulePath, adapterConfig.adapter);

        let adapterDest: string;
        if (framework === "nextjs") {
          adapterDest = join(targetDir, "lib", "auth.ts");
        } else if (framework === "express") {
          adapterDest = join(targetDir, "src", "auth.ts");
        } else {
          adapterDest = join(targetDir, "src", "lib", "auth.ts");
        }

        if (await fs.pathExists(adapterSource)) {
          await fs.ensureDir(path.dirname(adapterDest));
          await fs.copy(adapterSource, adapterDest, { overwrite: true });
        }
      }

      if (adapterConfig.schema && adapterConfig.schemaDestination) {
        const schemaSource = join(authModulePath, adapterConfig.schema);
        const schemaDest = join(targetDir, adapterConfig.schemaDestination);

        if (await fs.pathExists(schemaSource)) {
          await fs.ensureDir(path.dirname(schemaDest));
          await fs.copy(schemaSource, schemaDest, { overwrite: true });
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
    dependencies: moduleData.dependencies,
    devDependencies: moduleData.devDependencies,
  });

  const envVars: Record<string, string> = {};
  for (const envVar of moduleData.envVars || []) {
    envVars[envVar.key] = envVar.value;
  }
  await mergeEnvFile(targetDir, envVars);
}
