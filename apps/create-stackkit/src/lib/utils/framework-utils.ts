import fs from "fs-extra";
import path from "path";

export interface FrameworkConfig {
  name: string;
  displayName: string;
  paths: {
    lib: string;
    router: string;
    models: string;
    config: string;
    public: string;
    src: string;
  };
  extensions: {
    typescript: string;
    javascript: string;
  };
  fileStructure: {
    hasAppRouter?: boolean;
    hasPagesRouter?: boolean;
    hasSrcDir?: boolean;
    hasPublicDir?: boolean;
    configFiles: string[];
  };
}

export interface ModuleCompatibility {
  frameworks: string[];
  databases?: string[];
  auth?: string[];
  languages?: string[];
  packageManagers?: string[];
}

export interface ModuleConfig {
  name: string;
  displayName: string;
  description: string;
  category: string;
  provider: string;
  compatibility: ModuleCompatibility;
  // Legacy fields for backward compatibility
  supportedFrameworks?: string[];
  databaseAdapters?: Record<string, any>;
  frameworkConfigs?: Record<string, any>;
  dependencies?: Record<string, any>;
  devDependencies?: Record<string, any>;
  envVars?: Record<string, any>;
  frameworkPatches?: Record<string, any>;
  patches?: any[];
  postInstall?: string[];
  variables?: Record<string, any>;
  conditions?: Record<string, any>;
}

/**
 * Load framework configuration from template.json
 */
export async function loadFrameworkConfig(templateDir: string, frameworkName: string): Promise<FrameworkConfig> {
  const templateJsonPath = path.join(templateDir, frameworkName, 'template.json');

  if (!(await fs.pathExists(templateJsonPath))) {
    throw new Error(`Framework config not found: ${templateJsonPath}`);
  }

  const templateConfig = await fs.readJson(templateJsonPath);

  // Create default framework config
  const frameworkConfig: FrameworkConfig = {
    name: frameworkName,
    displayName: templateConfig.displayName || frameworkName,
    paths: {
      lib: 'src/lib',
      router: 'src',
      models: 'src/models',
      config: '.',
      public: 'public',
      src: 'src'
    },
    extensions: {
      typescript: '.ts',
      javascript: '.js'
    },
    fileStructure: {
      configFiles: ['package.json', 'tsconfig.json']
    }
  };

  // Override defaults based on framework
  switch (frameworkName) {
    case 'nextjs':
      frameworkConfig.paths = {
        lib: 'lib',
        router: 'app',
        models: 'lib/models',
        config: '.',
        public: 'public',
        src: '.'
      };
      frameworkConfig.fileStructure.hasAppRouter = true;
      break;

    case 'express':
      frameworkConfig.paths = {
        lib: 'lib',
        router: 'src',
        models: 'lib/models',
        config: '.',
        public: 'public',
        src: 'src'
      };
      break;

    case 'react-vite':
      frameworkConfig.paths = {
        lib: 'src/lib',
        router: 'src',
        models: 'src/models',
        config: '.',
        public: 'public',
        src: 'src'
      };
      break;

    case 'sveltekit':
      frameworkConfig.paths = {
        lib: 'src/lib',
        router: 'src/routes',
        models: 'src/lib/models',
        config: '.',
        public: 'static',
        src: 'src'
      };
      frameworkConfig.extensions.typescript = '.ts';
      frameworkConfig.extensions.javascript = '.js';
      break;
  }

  return frameworkConfig;
}

/**
 * Load module configuration from module.json
 */
export async function loadModuleConfig(modulePath: string): Promise<ModuleConfig> {
  const moduleJsonPath = path.join(modulePath, 'module.json');

  if (!(await fs.pathExists(moduleJsonPath))) {
    throw new Error(`Module config not found: ${moduleJsonPath}`);
  }

  const moduleData = await fs.readJson(moduleJsonPath) as ModuleConfig;

  // Normalize compatibility structure
  if (!moduleData.compatibility) {
    moduleData.compatibility = {
      frameworks: moduleData.supportedFrameworks || [],
      databases: [],
      auth: [],
      languages: ['typescript', 'javascript'],
      packageManagers: ['npm', 'yarn', 'pnpm', 'bun']
    };
  }

  return moduleData;
}

/**
 * Check if a module combination is compatible
 */
export function isCompatible(
  module: ModuleConfig,
  context: {
    framework?: string;
    database?: string;
    auth?: string;
    language?: string;
    packageManager?: string;
  }
): boolean {
  const { compatibility } = module;

  if (context.framework && compatibility.frameworks && !compatibility.frameworks.includes(context.framework)) {
    return false;
  }

  if (context.database && compatibility.databases && compatibility.databases.length > 0 && !compatibility.databases.includes(context.database)) {
    return false;
  }

  if (context.auth && compatibility.auth && compatibility.auth.length > 0 && !compatibility.auth.includes(context.auth)) {
    return false;
  }

  if (context.language && compatibility.languages && !compatibility.languages.includes(context.language)) {
    return false;
  }

  if (context.packageManager && compatibility.packageManagers && !compatibility.packageManagers.includes(context.packageManager)) {
    return false;
  }

  return true;
}

/**
 * Get framework-specific path with fallback
 */
export function getFrameworkPath(frameworkConfig: FrameworkConfig, pathType: keyof FrameworkConfig['paths'], defaultPath: string = ''): string {
  return frameworkConfig.paths[pathType] || defaultPath;
}

/**
 * Generate dynamic variables based on context
 */
export function generateDynamicVariables(
  context: {
    framework: string;
    database?: string;
    dbProvider?: string;
    auth?: string;
    language?: string;
    packageManager?: string;
    projectName?: string;
  },
  frameworkConfig: FrameworkConfig,
  moduleConfigs: ModuleConfig[]
): Record<string, string> {
  const variables: Record<string, string> = {
    // Framework variables
    framework: context.framework,
    lib: getFrameworkPath(frameworkConfig, 'lib', 'src/lib'),
    router: getFrameworkPath(frameworkConfig, 'router', 'src'),
    models: getFrameworkPath(frameworkConfig, 'models', 'src/models'),
    config: getFrameworkPath(frameworkConfig, 'config', '.'),
    public: getFrameworkPath(frameworkConfig, 'public', 'public'),
    src: getFrameworkPath(frameworkConfig, 'src', 'src'),

    // Language variables
    ext: context.language === 'typescript' ? frameworkConfig.extensions.typescript : frameworkConfig.extensions.javascript,
    lang: context.language || 'typescript',

    // Project variables
    projectName: context.projectName || 'my-app',
  };

  // Database variables
  if (context.database) {
    variables.database = context.database;
    variables.dbFile = context.database === 'prisma' ? 'prisma' : 'db';
    variables.dbDescription = context.database === 'prisma'
      ? 'Create Prisma client singleton'
      : 'Create MongoDB connection with Mongoose';

    if (context.dbProvider) {
      variables.provider = context.dbProvider;

      // Provider-specific connection strings and configurations
      const providerConfigs: Record<string, any> = {
        postgresql: {
          connectionString: 'postgresql://user:password@localhost:5432/mydb?schema=public',
          adapter: 'PrismaPg',
          adapterImport: 'import { PrismaPg } from "@prisma/adapter-pg";',
          clientInit: `const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });`
        },
        mongodb: {
          connectionString: 'mongodb+srv://username:password@cluster.mongodb.net/mydb',
          adapter: 'PrismaClient',
          clientInit: 'const prisma = new PrismaClient();'
        },
        mysql: {
          connectionString: 'mysql://user:password@localhost:3306/mydb',
          adapter: 'PrismaMariaDb',
          adapterImport: 'import { PrismaMariaDb } from "@prisma/adapter-mariadb";',
          clientInit: `const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
  connectionLimit: 5
});
const prisma = new PrismaClient({ adapter });`
        },
        sqlite: {
          connectionString: 'file:./dev.db',
          adapter: 'PrismaBetterSqlite3',
          adapterImport: 'import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";',
          clientInit: `const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });`
        }
      };

      if (providerConfigs[context.dbProvider]) {
        Object.assign(variables, providerConfigs[context.dbProvider]);
      }
    }
  }

  // Auth variables
  if (context.auth) {
    variables.auth = context.auth;
    variables.authFile = 'auth';
    variables.authDescription = `Create ${context.auth} authentication configuration`;

    // Generate database adapter imports based on auth + database combination
    const libPath = context.framework === 'nextjs' ? '@/lib' : '.';

    if (context.database === 'prisma') {
      variables.dbImport = `import { prisma } from "${libPath}/prisma";
import { prismaAdapter } from "${context.auth}/adapters/prisma";`;
      variables.databaseAdapter = 'database: prismaAdapter(prisma)';
    } else if (context.database === 'mongoose') {
      variables.dbImport = `import { mongoClient: client, db } from "${libPath}/db";
import { mongodbAdapter } from "${context.auth}/adapters/mongodb";`;
      variables.databaseAdapter = 'database: mongodbAdapter(db)';
    }
  }

  // Package manager variables
  if (context.packageManager) {
    variables.packageManager = context.packageManager;
    variables.installCmd = context.packageManager === 'npm' ? 'npm install' :
                          context.packageManager === 'yarn' ? 'yarn add' :
                          context.packageManager === 'pnpm' ? 'pnpm add' : 'bun add';
    variables.runCmd = context.packageManager === 'npm' ? 'npm run' :
                       context.packageManager === 'yarn' ? 'yarn' :
                       context.packageManager === 'pnpm' ? 'pnpm' : 'bun run';
  }

  // Add custom variables from modules
  for (const module of moduleConfigs) {
    if (module.variables) {
      Object.assign(variables, module.variables);
    }
  }

  return variables;
}

/**
 * Process conditional patches based on context
 */
export function shouldApplyPatch(
  patch: any,
  context: {
    framework?: string;
    database?: string;
    auth?: string;
    language?: string;
  }
): boolean {
  if (!patch.condition) return true;

  const condition = patch.condition;

  if (condition.framework && condition.framework !== context.framework) return false;
  if (condition.database && condition.database !== context.database) return false;
  if (condition.auth && condition.auth !== context.auth) return false;
  if (condition.language && condition.language !== context.language) return false;

  // Check combination conditions
  if (condition.combination) {
    const combo = condition.combination;
    if (combo.framework && combo.database && (combo.framework !== context.framework || combo.database !== context.database)) return false;
    if (combo.framework && combo.auth && (combo.framework !== context.framework || combo.auth !== context.auth)) return false;
    if (combo.database && combo.auth && (combo.database !== context.database || combo.auth !== context.auth)) return false;
  }

  return true;
}