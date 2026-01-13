import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import type { CommandOptions, ItemType, Scope, SelectableItem } from '../types.js';
import { disableItem, isDisabled } from '../utils/config.js';
import {
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Disable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToDisabled = (filePath: string): boolean => {
  if (!filePath.endsWith('.disabled')) {
    const newPath = filePath + '.disabled';
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

const disableItemByName = (type: ItemType, name: string, scope: Scope = 'global'): boolean => {
  let dir: string;
  switch (type) {
    case 'agents':
      dir = getAgentsDir(scope);
      break;
    case 'commands':
      dir = getCommandsDir(scope);
      break;
    case 'skills':
      dir = getSkillsDir(scope);
      break;
    default:
      return false;
  }

  const cleanName = name.replace('@', '').replace('.md', '').replace('.disabled', '');
  const enabledPath = path.join(dir, `${cleanName}.md`);
  const skillPath = path.join(dir, cleanName);

  if (fs.existsSync(enabledPath)) {
    renameToDisabled(enabledPath);
  } else if (fs.existsSync(skillPath) && fs.statSync(skillPath).isDirectory()) {
    try {
      fs.renameSync(skillPath, skillPath + '.disabled');
    } catch {
      // ignore
    }
  }

  disableItem(type, cleanName);
  return true;
};

const getEnabledItemsByType = (
  type: ItemType,
  scope: Scope
): SelectableItem[] => {
  const items: SelectableItem[] = [];

  let dir: string;
  let prefix = '';
  switch (type) {
    case 'agents':
      dir = getAgentsDir(scope);
      prefix = '@';
      break;
    case 'commands':
      dir = getCommandsDir(scope);
      prefix = '/';
      break;
    case 'skills':
      dir = getSkillsDir(scope);
      break;
    default:
      return items;
  }

  const files = listItems(dir);

  for (const file of files) {
    if (!file.name.endsWith('.disabled')) {
      const cleanName = file.name.replace('.md', '');
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

const getAllEnabledItems = (scope: Scope): Map<ItemType, SelectableItem[]> => {
  const itemsByType = new Map<ItemType, SelectableItem[]>();

  itemsByType.set('agents', getEnabledItemsByType('agents', scope));
  if (scope === 'global') {
    itemsByType.set('commands', getEnabledItemsByType('commands', scope));
  }
  itemsByType.set('skills', getEnabledItemsByType('skills', scope));

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

  if (options.all) {
    const itemsByType = getAllEnabledItems(scope);
    let totalDisabled = 0;

    for (const [type, items] of itemsByType) {
      for (const item of items) {
        disableItemByName(type, item.name, scope);
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
    const cleanName = itemName.replace('@', '').replace('/', '');
    let type: ItemType = 'agents';
    if (itemName.startsWith('/')) {
      type = 'commands';
    } else if (!itemName.startsWith('@')) {
      const skillsDir = getSkillsDir(scope);
      if (fs.existsSync(path.join(skillsDir, cleanName))) {
        type = 'skills';
      }
    }

    disableItemByName(type, cleanName, scope);
    console.log(chalk.yellow(`  ✗ Disabled ${itemName}`));
    return;
  }

  const itemsByType = getAllEnabledItems(scope);
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
    disableItemByName(item.type, item.name, scope);
    console.log(chalk.red(`  ✗ Disabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.yellow(`✓ Disabled ${selected.length} items`));
};
