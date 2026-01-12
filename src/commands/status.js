import chalk from 'chalk';
import fs from 'fs';
import { isDisabled } from '../utils/config.js';
import {
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Status'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const getItemStatus = (item, type) => {
  const cleanName = item.name.replace('.md', '').replace('.disabled', '');
  const isFileDisabled = item.name.endsWith('.disabled');
  const isConfigDisabled = isDisabled(type, cleanName);
  return isFileDisabled || isConfigDisabled;
};

const printItems = (items, type, label) => {
  if (items.length === 0) {
    console.log(chalk.gray(`  No ${label} installed`));
    return { enabled: 0, disabled: 0 };
  }

  let enabled = 0;
  let disabled = 0;

  for (const item of items) {
    const cleanName = item.name.replace('.md', '').replace('.disabled', '');
    const isItemDisabled = getItemStatus(item, type);

    if (isItemDisabled) {
      disabled++;
      console.log(`  ${chalk.red('✗')} ${chalk.gray(cleanName)} ${chalk.red('(disabled)')}`);
    } else {
      enabled++;
      console.log(`  ${chalk.green('✓')} ${chalk.white(cleanName)} ${chalk.green('(enabled)')}`);
    }
  }

  return { enabled, disabled };
};

const showStatus = (scope = 'global') => {
  const claudeDir = getClaudeDir(scope);
  const label = scope === 'global' ? 'Global (~/.claude/)' : `Project (${process.cwd()}/.claude/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(claudeDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  let totalEnabled = 0;
  let totalDisabled = 0;

  console.log(chalk.yellow('  Agents:'));
  const agentItems = listItems(getAgentsDir(scope));
  const agentStats = printItems(agentItems, 'agents', 'agents');
  totalEnabled += agentStats.enabled;
  totalDisabled += agentStats.disabled;
  console.log('');

  if (scope === 'global') {
    console.log(chalk.yellow('  Commands:'));
    const cmdItems = listItems(getCommandsDir(scope));
    const cmdStats = printItems(cmdItems, 'commands', 'commands');
    totalEnabled += cmdStats.enabled;
    totalDisabled += cmdStats.disabled;
    console.log('');
  }

  console.log(chalk.yellow('  Skills:'));
  const skillItems = listItems(getSkillsDir(scope));
  const skillStats = printItems(skillItems, 'skills', 'skills');
  totalEnabled += skillStats.enabled;
  totalDisabled += skillStats.disabled;
  console.log('');

  console.log(chalk.gray('  ────────────────────────────────────'));
  console.log(`  ${chalk.green('Enabled:')} ${totalEnabled}  ${chalk.red('Disabled:')} ${totalDisabled}`);
  console.log('');
};

export const statusCommand = async (options) => {
  printHeader();

  if (options.global) {
    showStatus('global');
  } else if (options.project) {
    showStatus('project');
  } else {
    showStatus('global');
    showStatus('project');
  }

  console.log(chalk.gray('────────────────────────────────────────'));
  console.log(chalk.gray('Commands:'));
  console.log(chalk.gray('  moicle enable <item>    Enable an item'));
  console.log(chalk.gray('  moicle disable <item>   Disable an item'));
  console.log(chalk.gray('  moicle enable --all     Enable all items'));
  console.log(chalk.gray('  moicle disable --all    Disable all items'));
  console.log('');
};
