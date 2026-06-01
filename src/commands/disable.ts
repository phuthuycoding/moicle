import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import type { CommandOptions, EditorTarget, ItemType, Scope, SelectableItem } from '../types.js';
import { disableItem, isDisabled } from '../utils/config.js';
import { DISABLED_SUFFIX } from '../utils/editor-constants.js';
import {
  cleanItemDisplayName,
  getAgentEnabledPath,
  getCommandEnabledPath,
  getItemDir,
  inferItemType,
  listCursorRuleItems,
  resolveEditorTarget,
} from '../utils/editor-items.js';
import { listItems } from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Disable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToDisabled = (filePath: string): boolean => {
  if (!filePath.endsWith(DISABLED_SUFFIX)) {
    const newPath = `${filePath}${DISABLED_SUFFIX}`;
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

const disableItemByName = (
  type: ItemType,
  name: string,
  scope: Scope,
  target: EditorTarget
): boolean => {
  const dir = getItemDir(type, target, scope);
  const cleanName = cleanItemDisplayName(name.replace('@', '').replace('/', ''));

  if (type === 'agents') {
    const enabledPath = getAgentEnabledPath(target, dir, cleanName);
    if (fs.existsSync(enabledPath)) {
      renameToDisabled(enabledPath);
    }
  } else if (type === 'commands') {
    const enabledPath = getCommandEnabledPath(dir, cleanName);
    if (fs.existsSync(enabledPath)) {
      renameToDisabled(enabledPath);
    }
  } else {
    const skillPath = path.join(dir, cleanName);
    if (fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory()) {
      try {
        fs.renameSync(skillPath, `${skillPath}${DISABLED_SUFFIX}`);
      } catch {
        // ignore
      }
    }
  }

  disableItem(type, cleanName);
  return true;
};

const getEnabledItemsByType = (
  type: ItemType,
  scope: Scope,
  target: EditorTarget
): SelectableItem[] => {
  const items: SelectableItem[] = [];
  const dir = getItemDir(type, target, scope);
  let prefix = '';

  switch (type) {
    case 'agents':
      prefix = '@';
      break;
    case 'commands':
      prefix = '/';
      break;
    case 'skills':
      break;
  }

  const files = type === 'agents' && target === 'cursor' ? listCursorRuleItems(dir) : listItems(dir);

  for (const file of files) {
    if (!file.name.endsWith(DISABLED_SUFFIX)) {
      const cleanName = cleanItemDisplayName(file.name);
      if (!isDisabled(type, cleanName)) {
        items.push({
          type,
          name: cleanName,
          display: `${prefix}${cleanName}`,
          disabled: false,
        });
      }
    }
  }

  return items;
};

const getAllEnabledItems = (
  scope: Scope,
  target: EditorTarget
): Map<ItemType, SelectableItem[]> => {
  const itemsByType = new Map<ItemType, SelectableItem[]>();

  itemsByType.set('agents', getEnabledItemsByType('agents', scope, target));
  if (scope === 'global' || target === 'cursor') {
    itemsByType.set('commands', getEnabledItemsByType('commands', scope, target));
  }
  itemsByType.set('skills', getEnabledItemsByType('skills', scope, target));

  return itemsByType;
};

const formatTypeLabel = (type: ItemType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const disableCommand = async (
  itemName: string | undefined,
  options: CommandOptions
): Promise<void> => {
  printHeader();

  const scope: Scope = options.project ? 'project' : 'global';
  const target = resolveEditorTarget(options);

  if (options.all) {
    const itemsByType = getAllEnabledItems(scope, target);
    let totalDisabled = 0;

    for (const [type, items] of itemsByType) {
      for (const item of items) {
        disableItemByName(type, item.name, scope, target);
        console.log(chalk.red(`  ✗ Disabled ${item.display}`));
        totalDisabled++;
      }
    }

    if (totalDisabled === 0) {
      console.log(chalk.yellow('  No enabled items found.'));
    } else {
      console.log('');
      console.log(chalk.yellow(`✓ Disabled ${totalDisabled} items`));
    }
    return;
  }

  if (itemName) {
    const type = inferItemType(itemName, target, scope);
    disableItemByName(type, itemName, scope, target);
    console.log(chalk.yellow(`  ✗ Disabled ${itemName}`));
    return;
  }

  const itemsByType = getAllEnabledItems(scope, target);
  const allItems: SelectableItem[] = [];
  for (const items of itemsByType.values()) {
    allItems.push(...items);
  }

  if (allItems.length === 0) {
    console.log(chalk.yellow('  No enabled items to disable.'));
    return;
  }

  const choices: Array<{ name: string; value: SelectableItem } | typeof inquirer.Separator.prototype> = [];

  for (const [type, items] of itemsByType) {
    if (items.length > 0) {
      choices.push(new inquirer.Separator(chalk.yellow(`── ${formatTypeLabel(type)} ──`)));
      for (const item of items) {
        choices.push({
          name: `  ${item.display}`,
          value: item,
        });
      }
    }
  }

  console.log(chalk.gray('  Use SPACE to select, ENTER to confirm'));
  console.log('');

  const { selected } = await inquirer.prompt<{ selected: SelectableItem[] }>([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select items to disable:',
      choices,
      pageSize: 20,
    },
  ]);

  if (selected.length === 0) {
    console.log(chalk.yellow('  No items selected.'));
    return;
  }

  console.log('');
  for (const item of selected) {
    disableItemByName(item.type, item.name, scope, target);
    console.log(chalk.red(`  ✗ Disabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.yellow(`✓ Disabled ${selected.length} items`));
};
