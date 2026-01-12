import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import {
  ASSETS_DIR,
  removeItem,
  listItems,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
} from '../utils/symlink.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Uninstaller'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const getKitFiles = () => {
  const files = new Set();

  // Get all agent names from assets
  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  const commandsDir = path.join(ASSETS_DIR, 'commands');
  const skillsDir = path.join(ASSETS_DIR, 'skills');

  const addFilesFromDir = (dir) => {
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

const uninstallDir = async (dir, label) => {
  const spinner = ora(`Uninstalling ${label}...`).start();
  const results = [];

  const kitFiles = getKitFiles();
  const items = listItems(dir);

  for (const item of items) {
    // Only remove items that came from this kit
    if (kitFiles.has(item.name) || item.isSymlink) {
      const result = removeItem(item.path);
      results.push(result);
    }
  }

  const removed = results.filter((r) => r.status === 'removed').length;

  if (removed > 0) {
    spinner.succeed(`Removed ${removed} ${label}`);
  } else {
    spinner.info(`No ${label} to remove`);
  }

  return results;
};

const uninstallGlobal = async () => {
  console.log('');
  console.log(chalk.cyan('>>> Global Uninstall'));
  console.log('');

  await uninstallDir(getAgentsDir('global'), 'agents');
  await uninstallDir(getCommandsDir('global'), 'commands');
  await uninstallDir(getSkillsDir('global'), 'skills');

  console.log('');
  console.log(chalk.green('✓ Global uninstall complete!'));
};

const uninstallProject = async () => {
  console.log('');
  console.log(chalk.cyan('>>> Project Uninstall'));
  console.log(chalk.gray(`    Target: ${process.cwd()}/.claude/`));
  console.log('');

  await uninstallDir(getAgentsDir('project'), 'agents');
  await uninstallDir(getSkillsDir('project'), 'skills');

  console.log('');
  console.log(chalk.green('✓ Project uninstall complete!'));
};

const showInteractiveMenu = async () => {
  const { uninstallType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'uninstallType',
      message: 'Where would you like to uninstall from?',
      choices: [
        {
          name: 'Global (~/.claude/)',
          value: 'global',
        },
        {
          name: 'Project (./.claude/)',
          value: 'project',
        },
        {
          name: 'Both',
          value: 'all',
        },
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

export const uninstallCommand = async (options) => {
  printHeader();

  let uninstallType;

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
      await uninstallGlobal();
      break;
    case 'project':
      await uninstallProject();
      break;
    case 'all':
      await uninstallGlobal();
      await uninstallProject();
      break;
  }
};
