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

const getCodexManagedNames = (): { architecture: string[]; skills: string[] } => {
  const architecture: string[] = [];
  const skills: string[] = [];

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    fs.readdirSync(archDir).forEach((name) => architecture.push(name));
  }

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir).forEach((name) => skills.push(name));
  }

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
  }

  for (const dirName of ['developers', 'utilities']) {
    const agentsDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (fs.existsSync(agentsDir)) {
      fs.readdirSync(agentsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
    }
  }

  return { architecture, skills };
};

const uninstallCodexScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  const targetDir = getEditorDir('codex', scope);
  const spinner = ora(`Uninstalling Codex assets from ${label.toLowerCase()} scope...`).start();
  const managed = getCodexManagedNames();

  let removed = 0;

  const archDir = path.join(targetDir, 'architecture');
  for (const name of managed.architecture) {
    const result = removeItem(path.join(archDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  const skillsDir = path.join(targetDir, 'skills');
  for (const name of managed.skills) {
    const result = removeItem(path.join(skillsDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  spinner.succeed(`Removed ${removed} Codex items from ${label.toLowerCase()} scope`);
  console.log(chalk.green(`✓ ${label} Codex uninstall complete!`));
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

const showTargetMenu = async (): Promise<EditorTarget> => {
  const installedTargets = getTargets();
  const availableTargets = installedTargets.length > 0 ? installedTargets : (['claude', 'codex'] as EditorTarget[]);

  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Select target editor to uninstall:',
      choices: availableTargets.map((value) => ({
        name: EDITOR_CONFIGS[value].name,
        value,
      })),
    },
  ]);

  return target;
};

const showInteractiveMenu = async (
  target: 'claude' | 'codex'
): Promise<'global' | 'project' | 'all'> => {
  const globalPath = target === 'claude' ? '~/.claude/' : '~/.codex/';
  const projectPath = target === 'claude' ? './.claude/' : './.codex/';

  const { uninstallType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'uninstallType',
      message: 'Where would you like to uninstall from?',
      choices: [
        { name: `Global (${globalPath})`, value: 'global' },
        { name: `Project (${projectPath})`, value: 'project' },
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

  const targets = options.target ? [options.target] : [await showTargetMenu()];

  for (const target of targets) {
    if (target === 'claude' || target === 'codex') {
      let uninstallType: 'global' | 'project' | 'all';

      if (options.global) {
        uninstallType = 'global';
      } else if (options.project) {
        uninstallType = 'project';
      } else if (options.all) {
        uninstallType = 'all';
      } else {
        uninstallType = await showInteractiveMenu(target);
      }

      switch (uninstallType) {
        case 'global':
          if (target === 'claude') {
            await uninstallScope('global');
          } else {
            await uninstallCodexScope('global');
          }
          break;
        case 'project':
          if (target === 'claude') {
            await uninstallScope('project');
          } else {
            await uninstallCodexScope('project');
          }
          break;
        case 'all':
          if (target === 'claude') {
            await uninstallScope('global');
            await uninstallScope('project');
          } else {
            await uninstallCodexScope('global');
            await uninstallCodexScope('project');
          }
          break;
      }

      removeTarget(target);
    } else {
      await uninstallForOtherEditor(target);
    }
  }
};
