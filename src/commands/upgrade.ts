import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import { execSync, spawnSync } from 'child_process';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const pkg = require('../../package.json');

const PACKAGE_NAME = 'moicle';

interface UpgradeOptions {
  yes?: boolean;
  reinstall?: boolean;
}

type PackageManager = 'npm' | 'bun' | 'pnpm' | 'yarn';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Upgrade'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const parseSemver = (version: string): [number, number, number] => {
  const clean = version.trim().replace(/^v/, '').split('-')[0];
  const parts = clean.split('.').map((n) => Number.parseInt(n, 10));
  const [major = 0, minor = 0, patch = 0] = parts;
  return [major, minor, patch];
};

const compareVersions = (a: string, b: string): number => {
  const [aMaj, aMin, aPatch] = parseSemver(a);
  const [bMaj, bMin, bPatch] = parseSemver(b);
  if (aMaj !== bMaj) return aMaj - bMaj;
  if (aMin !== bMin) return aMin - bMin;
  return aPatch - bPatch;
};

const fetchLatestVersion = (): string => {
  const result = spawnSync('npm', ['view', PACKAGE_NAME, 'version'], {
    encoding: 'utf-8',
  });

  if (result.status !== 0) {
    const stderr = result.stderr?.toString().trim() || 'unknown error';
    throw new Error(`Failed to fetch latest version from npm registry: ${stderr}`);
  }

  const version = result.stdout.toString().trim();
  if (!version) {
    throw new Error('npm returned empty version string');
  }

  return version;
};

const detectPackageManager = (): PackageManager => {
  const userAgent = process.env.npm_config_user_agent || '';
  if (userAgent.startsWith('bun')) return 'bun';
  if (userAgent.startsWith('pnpm')) return 'pnpm';
  if (userAgent.startsWith('yarn')) return 'yarn';

  const hasBin = (bin: string): boolean => {
    const result = spawnSync('which', [bin], { encoding: 'utf-8' });
    return result.status === 0;
  };

  if (hasBin('bun')) return 'bun';
  return 'npm';
};

const buildUpgradeCommand = (pm: PackageManager): [string, string[]] => {
  const target = `${PACKAGE_NAME}@latest`;
  switch (pm) {
    case 'bun':
      return ['bun', ['add', '-g', target]];
    case 'pnpm':
      return ['pnpm', ['add', '-g', target]];
    case 'yarn':
      return ['yarn', ['global', 'add', target]];
    case 'npm':
    default:
      return ['npm', ['install', '-g', target]];
  }
};

const runUpgrade = (pm: PackageManager): void => {
  const [cmd, args] = buildUpgradeCommand(pm);
  console.log(chalk.gray(`  Running: ${cmd} ${args.join(' ')}`));
  console.log('');

  const result = spawnSync(cmd, args, { stdio: 'inherit' });

  if (result.status !== 0) {
    throw new Error(
      `Upgrade command failed with exit code ${result.status}. Try running manually: ${cmd} ${args.join(' ')}`
    );
  }
};

const confirmUpgrade = async (current: string, latest: string): Promise<boolean> => {
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: `Upgrade from ${chalk.yellow(current)} to ${chalk.green(latest)}?`,
      default: true,
    },
  ]);
  return proceed;
};

const confirmReinstall = async (): Promise<boolean> => {
  const { proceed } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'proceed',
      message: 'Re-run "moicle install" to refresh assets?',
      default: true,
    },
  ]);
  return proceed;
};

const runReinstall = (): void => {
  console.log('');
  console.log(chalk.cyan('>>> Refreshing assets'));
  console.log('');
  execSync(`${PACKAGE_NAME} install`, { stdio: 'inherit' });
};

export const upgradeCommand = async (options: UpgradeOptions = {}): Promise<void> => {
  printHeader();

  const current = pkg.version as string;
  console.log(chalk.gray(`  Current version: ${chalk.white(current)}`));

  const spinner = ora('Checking latest version on npm...').start();
  let latest: string;
  try {
    latest = fetchLatestVersion();
    spinner.succeed(`Latest version: ${chalk.green(latest)}`);
  } catch (err) {
    spinner.fail('Failed to check latest version');
    throw err;
  }

  const diff = compareVersions(latest, current);

  if (diff === 0) {
    console.log('');
    console.log(chalk.green(`✓ Already up to date (${current})`));
    console.log('');
    return;
  }

  if (diff < 0) {
    console.log('');
    console.log(
      chalk.yellow(
        `  Installed version (${current}) is newer than npm registry (${latest}). Nothing to upgrade.`
      )
    );
    console.log('');
    return;
  }

  console.log('');
  console.log(
    `  ${chalk.yellow(current)} ${chalk.gray('→')} ${chalk.green(latest)} ${chalk.gray('available')}`
  );
  console.log('');

  const proceed = options.yes ?? (await confirmUpgrade(current, latest));
  if (!proceed) {
    console.log(chalk.gray('  Upgrade cancelled.'));
    console.log('');
    return;
  }

  const pm = detectPackageManager();
  console.log(chalk.gray(`  Package manager: ${pm}`));
  console.log('');

  runUpgrade(pm);

  console.log('');
  console.log(chalk.green(`✓ Upgraded to ${latest}`));
  console.log('');

  const shouldReinstall = options.reinstall ?? (await confirmReinstall());
  if (shouldReinstall) {
    runReinstall();
  } else {
    console.log(chalk.gray('  Skipped asset refresh.'));
    console.log(chalk.gray('  Run "moicle install" later to pick up new agents/skills/commands.'));
    console.log('');
  }
};
