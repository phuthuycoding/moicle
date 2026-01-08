import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { disableItem, isDisabled } from '../utils/config.js';
import {
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Moi Clau - Disable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToDisabled = (filePath) => {
  if (!filePath.endsWith('.disabled')) {
    const newPath = filePath + '.disabled';
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch (err) {
      return false;
    }
  }
  return true;
};

const disableItemByName = (type, name, scope = 'global') => {
  let dir;
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
    } catch (err) {
      // ignore
    }
  }

  disableItem(type, cleanName);
  return true;
};

const getEnabledItemsList = (scope = 'global') => {
  const items = [];

  const agentsDir = getAgentsDir(scope);
  const commandsDir = getCommandsDir(scope);
  const skillsDir = getSkillsDir(scope);

  const agentFiles = listItems(agentsDir);
  const commandFiles = listItems(commandsDir);
  const skillFiles = listItems(skillsDir);

  for (const agent of agentFiles) {
    if (!agent.name.endsWith('.disabled')) {
      const cleanName = agent.name.replace('.md', '');
      if (!isDisabled('agents', cleanName)) {
        items.push({ type: 'agents', name: cleanName, display: `@${cleanName}` });
      }
    }
  }

  for (const cmd of commandFiles) {
    if (!cmd.name.endsWith('.disabled')) {
      const cleanName = cmd.name.replace('.md', '');
      if (!isDisabled('commands', cleanName)) {
        items.push({ type: 'commands', name: cleanName, display: `/${cleanName}` });
      }
    }
  }

  for (const skill of skillFiles) {
    if (!skill.name.endsWith('.disabled')) {
      const cleanName = skill.name;
      if (!isDisabled('skills', cleanName)) {
        items.push({ type: 'skills', name: cleanName, display: cleanName });
      }
    }
  }

  return items;
};

export const disableCommand = async (itemName, options) => {
  printHeader();

  const scope = options.project ? 'project' : 'global';

  if (options.all) {
    const enabledItems = getEnabledItemsList(scope);
    if (enabledItems.length === 0) {
      console.log(chalk.yellow('  No enabled items found.'));
      return;
    }

    for (const item of enabledItems) {
      disableItemByName(item.type, item.name, scope);
      console.log(chalk.red(`  ✗ Disabled ${item.display}`));
    }
    console.log('');
    console.log(chalk.yellow(`✓ Disabled ${enabledItems.length} items`));
    return;
  }

  if (itemName) {
    const cleanName = itemName.replace('@', '').replace('/', '');
    let type = 'agents';
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

  const enabledItems = getEnabledItemsList(scope);
  if (enabledItems.length === 0) {
    console.log(chalk.yellow('  No enabled items to disable.'));
    return;
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select items to disable:',
      choices: enabledItems.map((item) => ({
        name: `${item.display} (${item.type})`,
        value: item,
      })),
    },
  ]);

  if (selected.length === 0) {
    console.log(chalk.yellow('  No items selected.'));
    return;
  }

  for (const item of selected) {
    disableItemByName(item.type, item.name, scope);
    console.log(chalk.red(`  ✗ Disabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.yellow(`✓ Disabled ${selected.length} items`));
};
