import chalk from 'chalk';
import fs from 'fs';
import {
  listItems,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
} from '../utils/symlink.js';
import { isDisabled } from '../utils/config.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Installed Items'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const printItems = (items, label, type) => {
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

const listGlobal = () => {
  const claudeDir = getClaudeDir('global');

  console.log(chalk.cyan('>>> Global (~/.claude/)'));
  console.log('');

  if (!fs.existsSync(claudeDir)) {
    console.log(chalk.gray('  Not installed'));
    return;
  }

  console.log(chalk.yellow('  Agents:'));
  printItems(listItems(getAgentsDir('global')), 'agents', 'agents');
  console.log('');

  console.log(chalk.yellow('  Commands:'));
  printItems(listItems(getCommandsDir('global')), 'commands', 'commands');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printItems(listItems(getSkillsDir('global')), 'skills', 'skills');
  console.log('');
};

const listProject = () => {
  const claudeDir = getClaudeDir('project');

  console.log(chalk.cyan(`>>> Project (${process.cwd()}/.claude/)`));
  console.log('');

  if (!fs.existsSync(claudeDir)) {
    console.log(chalk.gray('  Not installed'));
    return;
  }

  console.log(chalk.yellow('  Agents:'));
  printItems(listItems(getAgentsDir('project')), 'agents', 'agents');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printItems(listItems(getSkillsDir('project')), 'skills', 'skills');
  console.log('');
};

export const listCommand = async (options) => {
  printHeader();

  if (options.global) {
    listGlobal();
  } else if (options.project) {
    listProject();
  } else {
    listGlobal();
    listProject();
  }

  // Print legend
  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(chalk.gray('Legend:'));
  console.log(chalk.green('  ✓') + chalk.gray(' Enabled'));
  console.log(chalk.red('  ✗') + chalk.gray(' Disabled'));
  console.log(chalk.blue('  →') + chalk.gray(' Symlink'));
  console.log(chalk.green('  ●') + chalk.gray(' Copied file'));
  console.log('');
};
