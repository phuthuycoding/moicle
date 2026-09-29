import chalk from 'chalk';
import fs from 'fs';
import path from 'path';
import type { CommandOptions, EditorTarget, ItemType, Scope } from '../types.js';
import { isDisabled } from '../utils/config.js';
import { cleanItemDisplayName, listCursorRuleItems } from '../utils/editor-items.js';
import { DISABLED_SUFFIX } from '../utils/editor-constants.js';
import {
  listItems,
  listSkillsNested,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
  getCodexDir,
  getAntigravityDir,
  getCursorDir,
  getEditorDir,
  getEditorAgentsDir,
  getEditorCommandsDir,
  getEditorSkillsDir,
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
  type: ItemType,
  scope: Scope,
  target: EditorTarget
): void => {
  if (items.length === 0) {
    console.log(chalk.gray(`  No ${label} installed`));
    return;
  }

  for (const item of items) {
    const icon = item.isSymlink ? chalk.blue('→') : chalk.green('●');
    const cleanName = cleanItemDisplayName(item.name);
    const isFileDisabled = item.name.endsWith(DISABLED_SUFFIX);
    const isConfigDisabled = isDisabled(type, cleanName, scope, target);
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
  printItems(listItems(getAgentsDir(scope)), 'agents', 'agents', scope, 'claude');
  console.log('');

  if (scope === 'global') {
    console.log(chalk.yellow('  Commands:'));
    printItems(listItems(getCommandsDir(scope)), 'commands', 'commands', scope, 'claude');
    console.log('');
  }

  console.log(chalk.yellow('  Skills:'));
  printItems(listSkillsNested(getSkillsDir(scope)), 'skills', 'skills', scope, 'claude');
  console.log('');
};

const printPlainItems = (items: ReturnType<typeof listItems>, label: string): void => {
  if (items.length === 0) {
    console.log(chalk.gray(`  No ${label} installed`));
    return;
  }

  for (const item of items) {
    console.log(`  ${chalk.green('●')} ${chalk.white(item.name.replace('.md', '').replace('.disabled', ''))}`);
  }
};

const listCodexScope = (scope: Scope): void => {
  const codexDir = getCodexDir(scope);
  const label =
    scope === 'global' ? 'Global (~/.codex/)' : `Project (${process.cwd()}/.codex/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(codexDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  console.log(chalk.yellow('  Architecture:'));
  printPlainItems(listItems(path.join(codexDir, 'architecture')), 'architecture docs');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printPlainItems(listItems(path.join(codexDir, 'skills')), 'skills');
  console.log('');
};

const listAntigravityScope = (scope: Scope): void => {
  const antigravityDir = getAntigravityDir(scope);
  const label =
    scope === 'global' ? 'Global (~/.gemini/)' : `Project (${process.cwd()}/.gemini/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(antigravityDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  console.log(chalk.yellow('  Architecture:'));
  printPlainItems(listItems(path.join(antigravityDir, 'architecture')), 'architecture docs');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printPlainItems(listItems(path.join(antigravityDir, 'skills')), 'skills');
  console.log('');
};

const listDevinScope = (scope: Scope): void => {
  const devinDir = getEditorDir('devin', scope);
  const label =
    scope === 'global' ? 'Global (~/.config/devin/)' : `Project (${process.cwd()}/.devin/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(devinDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  console.log(chalk.yellow('  Agents:'));
  printPlainItems(listItems(path.join(devinDir, 'agents')), 'agents');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printPlainItems(listItems(path.join(devinDir, 'skills')), 'skills');
  console.log('');

  console.log(chalk.yellow('  Architecture:'));
  printPlainItems(listItems(path.join(devinDir, 'architecture')), 'architecture docs');
  console.log('');
};

const listCursorScope = (scope: Scope): void => {
  const cursorDir = getCursorDir(scope);
  const label =
    scope === 'global' ? 'Global (~/.cursor/)' : `Project (${process.cwd()}/.cursor/)`;

  console.log(chalk.cyan(`>>> ${label}`));
  console.log('');

  if (!fs.existsSync(cursorDir)) {
    console.log(chalk.gray('  Not installed'));
    console.log('');
    return;
  }

  console.log(chalk.yellow('  Rules (agents):'));
  printItems(listCursorRuleItems(getEditorAgentsDir('cursor', scope)), 'agents', 'agents', scope, 'cursor');
  console.log('');

  console.log(chalk.yellow('  Commands:'));
  printItems(listItems(getEditorCommandsDir('cursor', scope)), 'commands', 'commands', scope, 'cursor');
  console.log('');

  console.log(chalk.yellow('  Skills:'));
  printItems(listSkillsNested(getEditorSkillsDir('cursor', scope)), 'skills', 'skills', scope, 'cursor');
  console.log('');

  console.log(chalk.yellow('  Architecture:'));
  printPlainItems(listItems(path.join(cursorDir, 'architecture')), 'architecture docs');
  console.log('');
};

export const listCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  if (options.target === 'codex') {
    if (options.global) {
      listCodexScope('global');
    } else if (options.project) {
      listCodexScope('project');
    } else {
      listCodexScope('global');
      listCodexScope('project');
    }
    return;
  }

  if (options.target === 'antigravity') {
    if (options.global) {
      listAntigravityScope('global');
    } else if (options.project) {
      listAntigravityScope('project');
    } else {
      listAntigravityScope('global');
      listAntigravityScope('project');
    }
    return;
  }

  if (options.target === 'cursor') {
    if (options.global) {
      listCursorScope('global');
    } else if (options.project) {
      listCursorScope('project');
    } else {
      listCursorScope('global');
      listCursorScope('project');
    }
    return;
  }

  if (options.target === 'devin') {
    if (options.global) {
      listDevinScope('global');
    } else if (options.project) {
      listDevinScope('project');
    } else {
      listDevinScope('global');
      listDevinScope('project');
    }
    return;
  }

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
