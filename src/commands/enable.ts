import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import type { CommandOptions, EditorTarget, ItemType, Scope, SelectableItem } from '../types.js';
import { enableItem, getDisabledItems } from '../utils/config.js';
import { DISABLED_SUFFIX } from '../utils/editor-constants.js';
import {
  cleanItemDisplayName,
  getAgentDisabledPath,
  getCommandDisabledPath,
  getItemDir,
  inferItemType,
  listCursorRuleItems,
  resolveEditorTarget,
} from '../utils/editor-items.js';
import { listItems } from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Enable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToEnabled = (filePath: string): boolean => {
  if (filePath.endsWith(DISABLED_SUFFIX)) {
    const newPath = filePath.slice(0, -DISABLED_SUFFIX.length);
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

const enableItemByName = (
  type: ItemType,
  name: string,
  scope: Scope,
  target: EditorTarget
): boolean => {
  const dir = getItemDir(type, target, scope);
  const cleanName = cleanItemDisplayName(name.replace('@', '').replace('/', ''));

  if (type === 'agents') {
    const disabledPath = getAgentDisabledPath(target, dir, cleanName);
    if (fs.existsSync(disabledPath)) {
      renameToEnabled(disabledPath);
    }
  } else if (type === 'commands') {
    const disabledPath = getCommandDisabledPath(dir, cleanName);
    if (fs.existsSync(disabledPath)) {
      renameToEnabled(disabledPath);
    }
  } else {
    const skillDisabledPath = path.join(dir, `${cleanName}${DISABLED_SUFFIX}`);
    const skillEnabledPath = path.join(dir, cleanName);
    if (fs.existsSync(skillDisabledPath)) {
      try {
        fs.renameSync(skillDisabledPath, skillEnabledPath);
      } catch {
        // ignore
      }
    }
  }

  enableItem(type, cleanName);
  return true;
};

const getDisabledItemsByType = (
  type: ItemType,
  scope: Scope,
  target: EditorTarget
): SelectableItem[] => {
  const items: SelectableItem[] = [];
  const disabledConfig = getDisabledItems(type);
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
    const cleanName = cleanItemDisplayName(file.name);
    const isFileDisabled = file.name.endsWith(DISABLED_SUFFIX);
    const isConfigDisabled = disabledConfig.includes(cleanName);

    if (isFileDisabled || isConfigDisabled) {
      items.push({
        type,
        name: cleanName,
        display: `${prefix}${cleanName}`,
        disabled: true,
      });
    }
  }

  return items;
};

const getAllDisabledItems = (
  scope: Scope,
  target: EditorTarget
): Map<ItemType, SelectableItem[]> => {
  const itemsByType = new Map<ItemType, SelectableItem[]>();

  itemsByType.set('agents', getDisabledItemsByType('agents', scope, target));
  if (scope === 'global' || target === 'cursor') {
    itemsByType.set('commands', getDisabledItemsByType('commands', scope, target));
  }
  itemsByType.set('skills', getDisabledItemsByType('skills', scope, target));

  return itemsByType;
};

const formatTypeLabel = (type: ItemType): string => {
  return type.charAt(0).toUpperCase() + type.slice(1);
};

export const enableCommand = async (
  itemName: string | undefined,
  options: CommandOptions
): Promise<void> => {
  printHeader();

  const scope: Scope = options.project ? 'project' : 'global';
  const target = resolveEditorTarget(options);

  if (options.all) {
    const itemsByType = getAllDisabledItems(scope, target);
    let totalEnabled = 0;

    for (const [type, items] of itemsByType) {
      for (const item of items) {
        enableItemByName(type, item.name, scope, target);
        console.log(chalk.green(`  ✓ Enabled ${item.display}`));
        totalEnabled++;
      }
    }

    if (totalEnabled === 0) {
      console.log(chalk.yellow('  No disabled items found.'));
    } else {
      console.log('');
      console.log(chalk.green(`✓ Enabled ${totalEnabled} items`));
    }
    return;
  }

  if (itemName) {
    const type = inferItemType(itemName, target, scope);
    enableItemByName(type, itemName, scope, target);
    console.log(chalk.green(`  ✓ Enabled ${itemName}`));
    return;
  }

  const itemsByType = getAllDisabledItems(scope, target);
  const allItems: SelectableItem[] = [];
  for (const items of itemsByType.values()) {
    allItems.push(...items);
  }

  if (allItems.length === 0) {
    console.log(chalk.yellow('  No disabled items to enable.'));
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
      message: 'Select items to enable:',
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
    enableItemByName(item.type, item.name, scope, target);
    console.log(chalk.green(`  ✓ Enabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.green(`✓ Enabled ${selected.length} items`));
};
