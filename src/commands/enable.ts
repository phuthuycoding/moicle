import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import type { CommandOptions, ItemType, Scope, SelectableItem } from '../types.js';
import { enableItem, getDisabledItems } from '../utils/config.js';
import {
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Enable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToEnabled = (filePath: string): boolean => {
  if (filePath.endsWith('.disabled')) {
    const newPath = filePath.replace('.disabled', '');
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch {
      return false;
    }
  }
  return true;
};

const enableItemByName = (type: ItemType, name: string, scope: Scope = 'global'): boolean => {
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
  const disabledPath = path.join(dir, `${cleanName}.md.disabled`);
  const skillDisabledPath = path.join(dir, cleanName + '.disabled');
  const skillEnabledPath = path.join(dir, cleanName);

  if (fs.existsSync(disabledPath)) {
    renameToEnabled(disabledPath);
  } else if (fs.existsSync(skillDisabledPath)) {
    try {
      fs.renameSync(skillDisabledPath, skillEnabledPath);
    } catch {
      // ignore
    }
  }

  enableItem(type, cleanName);
  return true;
};

const getDisabledItemsByType = (
  type: ItemType,
  scope: Scope
): SelectableItem[] => {
  const items: SelectableItem[] = [];
  const disabledConfig = getDisabledItems(type);

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
    const cleanName = file.name.replace('.md', '').replace('.disabled', '');
    const isFileDisabled = file.name.endsWith('.disabled');
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

const getAllDisabledItems = (scope: Scope): Map<ItemType, SelectableItem[]> => {
  const itemsByType = new Map<ItemType, SelectableItem[]>();

  itemsByType.set('agents', getDisabledItemsByType('agents', scope));
  if (scope === 'global') {
    itemsByType.set('commands', getDisabledItemsByType('commands', scope));
  }
  itemsByType.set('skills', getDisabledItemsByType('skills', scope));

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

  if (options.all) {
    const itemsByType = getAllDisabledItems(scope);
    let totalEnabled = 0;

    for (const [type, items] of itemsByType) {
      for (const item of items) {
        enableItemByName(type, item.name, scope);
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
    const cleanName = itemName.replace('@', '').replace('/', '');
    let type: ItemType = 'agents';
    if (itemName.startsWith('/')) {
      type = 'commands';
    } else if (!itemName.startsWith('@')) {
      const skillsDir = getSkillsDir(scope);
      if (
        fs.existsSync(path.join(skillsDir, cleanName)) ||
        fs.existsSync(path.join(skillsDir, cleanName + '.disabled'))
      ) {
        type = 'skills';
      }
    }

    enableItemByName(type, cleanName, scope);
    console.log(chalk.green(`  ✓ Enabled ${itemName}`));
    return;
  }

  const itemsByType = getAllDisabledItems(scope);
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
    enableItemByName(item.type, item.name, scope);
    console.log(chalk.green(`  ✓ Enabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.green(`✓ Enabled ${selected.length} items`));
};
