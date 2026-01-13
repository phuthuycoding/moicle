import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import type { CommandOptions, EditorTarget, Scope } from '../types.js';
import {
  ASSETS_DIR,
  EDITOR_CONFIGS,
  removeItem,
  listItems,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getEditorDir,
  getEditorConfig,
} from '../utils/symlink.js';
import { getTargets, removeTarget } from '../utils/config.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Uninstaller'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const getKitFiles = (): Set<string> => {
  const files = new Set<string>();

  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  const commandsDir = path.join(ASSETS_DIR, 'commands');
  const skillsDir = path.join(ASSETS_DIR, 'skills');

  const addFilesFromDir = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((f) => files.add(f));
    }
  };

  addFilesFromDir(developersDir);
  addFilesFromDir(utilitiesDir);
  addFilesFromDir(commandsDir);
  addFilesFromDir(skillsDir);

  return files;
};

const uninstallDir = async (dir: string, label: string): Promise<void> => {
  const spinner = ora(`Uninstalling ${label}...`).start();

  const kitFiles = getKitFiles();
  const items = listItems(dir);
  let removed = 0;

  for (const item of items) {
    if (kitFiles.has(item.name) || item.isSymlink) {
      const result = removeItem(item.path);
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  if (removed > 0) {
    spinner.succeed(`Removed ${removed} ${label}`);
  } else {
    spinner.info(`No ${label} to remove`);
  }
};

const uninstallScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  console.log('');
  console.log(chalk.cyan(`>>> ${label} Uninstall`));
  if (scope === 'project') {
    console.log(chalk.gray(`    Target: ${process.cwd()}/.claude/`));
  }
  console.log('');

  await uninstallDir(getAgentsDir(scope), 'agents');
  if (scope === 'global') {
    await uninstallDir(getCommandsDir(scope), 'commands');
  }
  await uninstallDir(getSkillsDir(scope), 'skills');

  console.log('');
  console.log(chalk.green(`✓ ${label} uninstall complete!`));
};

const uninstallForOtherEditor = async (target: EditorTarget): Promise<void> => {
  const config = getEditorConfig(target);
  const spinner = ora(`Uninstalling from ${config.name}...`).start();

  const targetDir = getEditorDir(target, 'global');

  if (config.rulesFile) {
    const rulesFilePath = path.join(targetDir, config.rulesFile);
    if (fs.existsSync(rulesFilePath)) {
      const result = removeItem(rulesFilePath);
      if (result.status === 'removed') {
        spinner.succeed(`Removed ${config.rulesFile} from ${config.name}`);
      } else {
        spinner.info(`No files to remove from ${config.name}`);
      }
    } else {
      spinner.info(`No files to remove from ${config.name}`);
    }
  }

  removeTarget(target);
};

const showTargetMenu = async (): Promise<EditorTarget[]> => {
  const installedTargets = getTargets();

  if (installedTargets.length === 0) {
    return ['claude'];
  }

  const { targets } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'targets',
      message: 'Select target editor(s) to uninstall:',
      choices: installedTargets.map((t) => ({
        name: EDITOR_CONFIGS[t].name,
        value: t,
        checked: true,
      })),
    },
  ]);

  return targets;
};

const showInteractiveMenu = async (): Promise<'global' | 'project' | 'all'> => {
  const { uninstallType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'uninstallType',
      message: 'Where would you like to uninstall from?',
      choices: [
        { name: 'Global (~/.claude/)', value: 'global' },
        { name: 'Project (./.claude/)', value: 'project' },
        { name: 'Both', value: 'all' },
      ],
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to uninstall?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Uninstall cancelled.'));
    process.exit(0);
  }

  return uninstallType;
};

export const uninstallCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  const targets = await showTargetMenu();

  for (const target of targets) {
    if (target === 'claude') {
      let uninstallType: 'global' | 'project' | 'all';

      if (options.global) {
        uninstallType = 'global';
      } else if (options.project) {
        uninstallType = 'project';
      } else if (options.all) {
        uninstallType = 'all';
      } else {
        uninstallType = await showInteractiveMenu();
      }

      switch (uninstallType) {
        case 'global':
          await uninstallScope('global');
          break;
        case 'project':
          await uninstallScope('project');
          break;
        case 'all':
          await uninstallScope('global');
          await uninstallScope('project');
          break;
      }

      removeTarget('claude');
    } else {
      await uninstallForOtherEditor(target);
    }
  }
};
