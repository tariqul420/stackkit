import fs from 'fs-extra';
import path from 'path';

interface TemplateConfig {
  name: string;
  displayName: string;
  framework?: string;
  database?: string;
  auth?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  env?: Record<string, string>;
  files?: string[];
  compatibleWith?: {
    frameworks?: string[];
    databases?: string[];
  };
}

export class TemplateComposer {
  private templatesDir: string;

  constructor(templatesDir: string) {
    this.templatesDir = templatesDir;
  }

  /**
   * Compose a project from base + database + auth selections
   */
  async compose(
    targetDir: string,
    framework: string,
    database: string,
    auth: string
  ): Promise<void> {
    const configs: TemplateConfig[] = [];
    const filesToCopy: Array<{ source: string; dest: string }> = [];

    // 1. Load base framework template
    const baseConfig = await this.loadConfig(
      path.join(this.templatesDir, framework)
    );
    configs.push(baseConfig);

    // Copy base files
    const baseFiles = await this.getBaseFiles(framework);
    filesToCopy.push(...baseFiles);

    // 2. Load database configuration if not "none"
    if (database !== 'none') {
      const dbConfig = await this.loadConfig(path.join(this.templatesDir, 'databases', database));

      // Check compatibility
      if (
        dbConfig.compatibleWith?.frameworks &&
        !dbConfig.compatibleWith.frameworks.includes(framework)
      ) {
        throw new Error(`${dbConfig.displayName} is not compatible with ${framework}`);
      }

      configs.push(dbConfig);

      // Copy database files
      const dbDir = path.join(this.templatesDir, 'databases', database);
      const dbFiles = await this.collectFiles(dbDir);
      filesToCopy.push(
        ...dbFiles.map((f) => ({
          source: f,
          dest: path.join(targetDir, f.replace(dbDir + path.sep, '')),
        }))
      );
    }

    // 3. Load auth configuration if not "none"
    if (auth !== 'none') {
      const authKey = this.getAuthKey(framework, auth);
      const authDir = path.join(this.templatesDir, 'auth', authKey);

      if (await fs.pathExists(authDir)) {
        const authConfig = await this.loadConfig(authDir);

        // Check compatibility
        if (
          authConfig.compatibleWith?.frameworks &&
          !authConfig.compatibleWith.frameworks.includes(framework)
        ) {
          throw new Error(`${authConfig.displayName} is not compatible with ${framework}`);
        }

        if (
          authConfig.compatibleWith?.databases &&
          !authConfig.compatibleWith.databases.includes(database)
        ) {
          throw new Error(`${authConfig.displayName} is not compatible with ${database}`);
        }

        configs.push(authConfig);

        // Copy auth files
        const authFiles = await this.collectFiles(authDir);
        filesToCopy.push(
          ...authFiles.map((f) => ({
            source: f,
            dest: path.join(targetDir, f.replace(authDir + path.sep, '')),
          }))
        );
      }
    }

    // 4. Merge all configurations
    const mergedConfig = this.mergeConfigs(configs);

    // 5. Copy all files
    await this.copyFiles(filesToCopy);

    // 6. Create/update package.json
    await this.writePackageJson(targetDir, mergedConfig);

    // 7. Create/update .env
    await this.writeEnvFile(targetDir, mergedConfig);
  }

  private async loadConfig(dir: string): Promise<TemplateConfig> {
    const configPath = path.join(dir, 'config.json');
    const templatePath = path.join(dir, 'template.json');

    if (await fs.pathExists(configPath)) {
      return await fs.readJson(configPath);
    } else if (await fs.pathExists(templatePath)) {
      return await fs.readJson(templatePath);
    }

    throw new Error(`No configuration found in ${dir}`);
  }

  private async getBaseFiles(framework: string): Promise<Array<{ source: string; dest: string }>> {
    // For now, use existing complete template
    // In future, this will use minimal base templates
    const baseDir = path.join(this.templatesDir, 'next-prisma-postgres-shadcn');
    const files = await this.collectFiles(baseDir);

    return files.map((source) => ({
      source,
      dest: source.replace(baseDir, ''),
    }));
  }

  private async collectFiles(
    dir: string,
    exclude: string[] = ['config.json', 'template.json', 'node_modules']
  ): Promise<string[]> {
    const files: string[] = [];

    if (!(await fs.pathExists(dir))) {
      return files;
    }

    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (exclude.includes(entry.name)) continue;

      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const subFiles = await this.collectFiles(fullPath, exclude);
        files.push(...subFiles);
      } else {
        files.push(fullPath);
      }
    }

    return files;
  }

  private async copyFiles(files: Array<{ source: string; dest: string }>): Promise<void> {
    for (const { source, dest } of files) {
      await fs.ensureDir(path.dirname(dest));
      await fs.copy(source, dest, { overwrite: true });
    }
  }

  private mergeConfigs(configs: TemplateConfig[]): TemplateConfig {
    return configs.reduce((merged, config) => {
      return {
        ...merged,
        dependencies: {
          ...merged.dependencies,
          ...config.dependencies,
        },
        devDependencies: {
          ...merged.devDependencies,
          ...config.devDependencies,
        },
        scripts: {
          ...merged.scripts,
          ...config.scripts,
        },
        env: {
          ...merged.env,
          ...config.env,
        },
      };
    }, {} as TemplateConfig);
  }

  private async writePackageJson(targetDir: string, config: TemplateConfig): Promise<void> {
    const pkgPath = path.join(targetDir, 'package.json');
    let pkg: any = {};

    if (await fs.pathExists(pkgPath)) {
      pkg = await fs.readJson(pkgPath);
    }

    // Merge dependencies and scripts
    if (config.dependencies) {
      pkg.dependencies = { ...pkg.dependencies, ...config.dependencies };
    }

    if (config.devDependencies) {
      pkg.devDependencies = { ...pkg.devDependencies, ...config.devDependencies };
    }

    if (config.scripts) {
      pkg.scripts = { ...pkg.scripts, ...config.scripts };
    }

    await fs.writeJson(pkgPath, pkg, { spaces: 2 });
  }

  private async writeEnvFile(targetDir: string, config: TemplateConfig): Promise<void> {
    if (!config.env || Object.keys(config.env).length === 0) {
      return;
    }

    const envPath = path.join(targetDir, '.env');
    const envExamplePath = path.join(targetDir, '.env.example');

    const envContent =
      Object.entries(config.env)
        .map(([key, value]) => `${key}="${value}"`)
        .join('\n') + '\n';

    // Append or create .env.example
    if (await fs.pathExists(envExamplePath)) {
      const existing = await fs.readFile(envExamplePath, 'utf-8');
      if (!existing.includes(envContent)) {
        await fs.appendFile(envExamplePath, '\n' + envContent);
      }
    } else {
      await fs.writeFile(envExamplePath, envContent);
    }

    // Don't overwrite existing .env, but create if missing
    if (!(await fs.pathExists(envPath))) {
      await fs.writeFile(envPath, envContent);
    }
  }

  private getAuthKey(framework: string, auth: string): string {
    // Map framework + auth to specific implementation
    const mapping: Record<string, string> = {
      'nextjs-nextauth': 'nextauth',
      'nextjs-better-auth': 'better-auth-nextjs',
      'express-better-auth': 'better-auth-express',
    };

    return mapping[`${framework}-${auth}`] || auth;
  }
}
