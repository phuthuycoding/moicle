import chalk from 'chalk';
import fs from 'fs';
import type { CommandOptions, ItemType, Scope } from '../types.js';
import { getTargets, isDisabled } from '../utils/config.js';
import {
  EDITOR_CONFIGS,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
  getEditorDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Status'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

interface ItemStats {
  enabled: number;
  disabled: number;
}

const getItemStatus = (item: ReturnType<typeof listItems>[0], type: ItemType): boolean => {
  const cleanName = item.name.replace('.md', '').replace('.disabled', '');
  const isFileDisabled = item.name.endsWith('.disabled');
  const isConfigDisabled = isDisabled(type, cleanName);
  return isFileDisabled || isConfigDisabled;
};

const printItems = (
  items: ReturnType<typeof listItems>,
  type: ItemType,
  label: string
): ItemStats => {
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

const showStatus = (scope: Scope = 'global'): void => {
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

const showTargetsStatus = (): void => {
  const targets = getTargets();

  console.log(chalk.cyan('>>> Installed Targets'));
  console.log('');

  if (targets.length === 0) {
    console.log(chalk.gray('  No targets configured'));
    console.log('');
    return;
  }

  for (const target of targets) {
    const config = EDITOR_CONFIGS[target];
    const dir = getEditorDir(target, 'global');
    const exists = fs.existsSync(dir);

    if (exists) {
      console.log(`  ${chalk.green('✓')} ${chalk.white(config.name)} ${chalk.gray(`(${dir})`)}`);
    } else {
      console.log(`  ${chalk.red('✗')} ${chalk.gray(config.name)} ${chalk.red('(not found)')}`);
    }
  }
  console.log('');
};

export const statusCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  showTargetsStatus();

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
  console.log(chalk.gray('  moicle enable      Enable items (interactive)'));
  console.log(chalk.gray('  moicle disable     Disable items (interactive)'));
  console.log(chalk.gray('  moicle enable -a   Enable all items'));
  console.log(chalk.gray('  moicle disable -a  Disable all items'));
  console.log('');
};
