import { detect } from 'detect-package-manager';
import execa from 'execa';
import { logger } from './logger';

export type PackageManager = 'npm' | 'yarn' | 'pnpm' | 'bun';

export async function detectPackageManager(cwd: string): Promise<PackageManager> {
  try {
    const pm = await detect({ cwd });
    return pm as PackageManager;
  } catch {
    return 'npm';
  }
}

export async function installDependencies(
  cwd: string,
  pm: PackageManager,
  dev = false
): Promise<void> {
  const spinner = logger.startSpinner(`Installing dependencies with ${pm}...`);

  try {
    const args: string[] = [];

    if (pm === 'npm') {
      args.push('install');
    } else if (pm === 'yarn') {
      args.push('install');
    } else if (pm === 'pnpm') {
      args.push('install');
    } else if (pm === 'bun') {
      args.push('install');
    }

    await execa(pm, args, { cwd, stdio: 'pipe' });
    spinner.succeed(`Dependencies installed successfully`);
  } catch (error) {
    spinner.fail(`Failed to install dependencies`);
    throw error;
  }
}

export async function addDependencies(
  cwd: string,
  pm: PackageManager,
  packages: string[],
  dev = false
): Promise<void> {
  if (packages.length === 0) return;

  const spinner = logger.startSpinner(
    `Adding ${dev ? 'dev ' : ''}dependencies: ${packages.join(', ')}...`
  );

  try {
    const args: string[] = [];

    if (pm === 'npm') {
      args.push('install', dev ? '--save-dev' : '--save', ...packages);
    } else if (pm === 'yarn') {
      args.push('add', dev ? '--dev' : '', ...packages);
    } else if (pm === 'pnpm') {
      args.push('add', dev ? '-D' : '', ...packages);
    } else if (pm === 'bun') {
      // bun uses `bun add` and `-d` for dev dependencies
      args.push('add', ...(dev ? ['-d'] : []), ...packages);
    }

    await execa(pm, args.filter(Boolean), { cwd, stdio: 'pipe' });
    spinner.succeed(`Dependencies added successfully`);
  } catch (error) {
    spinner.fail(`Failed to add dependencies`);
    throw error;
  }
}

export async function initGit(cwd: string): Promise<void> {
  const spinner = logger.startSpinner('Initializing git repository...');

  try {
    await execa('git', ['init'], { cwd });
    await execa('git', ['add', '.'], { cwd });
    await execa('git', ['commit', '-m', 'Initial commit from StackKit'], { cwd });
    spinner.succeed('Git repository initialized');
  } catch (error) {
    spinner.fail('Failed to initialize git repository');
    // Don't throw - git init is optional
  }
}
