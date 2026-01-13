import chalk from 'chalk';
import fs from 'fs';
import type { CommandOptions, ItemType, Scope } from '../types.js';
import { isDisabled } from '../utils/config.js';
import {
  listItems,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
} from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Installed Items'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const printItems = (
  items: ReturnType<typeof listItems>,
  label: string,
  type: ItemType
): void => {
  if (items.length === 0) {
    console.log(chalk.gray(`  No ${label} installed`));
    return;
  }

  for (const item of items) {
    const icon = item.isSymlink ? chalk.blue('→') : chalk.green('●');
    const cleanName = item.name.replace('.md', '').replace('.disabled', '');
    const isFileDisabled = item.name.endsWith('.disabled');
    const isConfigDisabled = isDisabled(type, cleanName);
    const itemDisabled = isFileDisabled || isConfigDisabled;

    const statusIcon = itemDisabled ? chalk.red('✗') : chalk.green('✓');
    const nameDisplay = itemDisabled ? chalk.gray(cleanName) : chalk.white(cleanName);

    if (item.isSymlink) {
      console.log(`  ${statusIcon} ${icon} ${nameDisplay} ${chalk.gray(`(${item.target})`)}`);
    } else {
      console.log(`  ${statusIcon} ${icon} ${nameDisplay}`);
    }
  }
};

const listScope = (scope: Scope): void => {
  const claudeDir = getClaudeDir(scope);
  const label =
    scope === 'global' ? 'Global (~/.claude/)' : `Project (${process.cwd()}/.claude/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(claudeDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  console.log(chalk.yellow('  Agents:'));
  printItems(listItems(getAgentsDir(scope)), 'agents', 'agents');
  console.log('');

  if (scope === 'global') {
    console.log(chalk.yellow('  Commands:'));
    printItems(listItems(getCommandsDir(scope)), 'commands', 'commands');
    console.log('');
  }

  console.log(chalk.yellow('  Skills:'));
  printItems(listItems(getSkillsDir(scope)), 'skills', 'skills');
  console.log('');
};

export const listCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  if (options.global) {
    listScope('global');
  } else if (options.project) {
    listScope('project');
  } else {
    listScope('global');
    listScope('project');
  }

  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(chalk.gray('Legend:'));
  console.log(chalk.green('  ✓') + chalk.gray(' Enabled'));
  console.log(chalk.red('  ✗') + chalk.gray(' Disabled'));
  console.log(chalk.blue('  →') + chalk.gray(' Symlink'));
  console.log(chalk.green('  ●') + chalk.gray(' Copied file'));
  console.log('');
};
