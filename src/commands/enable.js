import chalk from 'chalk';
import inquirer from 'inquirer';
import fs from 'fs';
import path from 'path';
import { enableItem, getDisabledItems } from '../utils/config.js';
import {
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  listItems,
} from '../utils/symlink.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle - Enable'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const renameToEnabled = (filePath) => {
  if (filePath.endsWith('.disabled')) {
    const newPath = filePath.replace('.disabled', '');
    try {
      fs.renameSync(filePath, newPath);
      return true;
    } catch (err) {
      return false;
    }
  }
  return true;
};

const enableItemByName = (type, name, scope = 'global') => {
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
  const disabledPath = path.join(dir, `${cleanName}.md.disabled`);
  const enabledPath = path.join(dir, `${cleanName}.md`);
  const skillDisabledPath = path.join(dir, cleanName + '.disabled');
  const skillEnabledPath = path.join(dir, cleanName);

  if (fs.existsSync(disabledPath)) {
    renameToEnabled(disabledPath);
  } else if (fs.existsSync(skillDisabledPath)) {
    try {
      fs.renameSync(skillDisabledPath, skillEnabledPath);
    } catch (err) {
      // ignore
    }
  }

  enableItem(type, cleanName);
  return true;
};

const getDisabledItemsList = (scope = 'global') => {
  const items = [];
  const disabledAgents = getDisabledItems('agents');
  const disabledCommands = getDisabledItems('commands');
  const disabledSkills = getDisabledItems('skills');

  const agentsDir = getAgentsDir(scope);
  const commandsDir = getCommandsDir(scope);
  const skillsDir = getSkillsDir(scope);

  const agentFiles = listItems(agentsDir);
  const commandFiles = listItems(commandsDir);
  const skillFiles = listItems(skillsDir);

  for (const agent of agentFiles) {
    const cleanName = agent.name.replace('.md', '').replace('.disabled', '');
    if (disabledAgents.includes(cleanName) || agent.name.endsWith('.disabled')) {
      items.push({ type: 'agents', name: cleanName, display: `@${cleanName}` });
    }
  }

  for (const cmd of commandFiles) {
    const cleanName = cmd.name.replace('.md', '').replace('.disabled', '');
    if (disabledCommands.includes(cleanName) || cmd.name.endsWith('.disabled')) {
      items.push({ type: 'commands', name: cleanName, display: `/${cleanName}` });
    }
  }

  for (const skill of skillFiles) {
    const cleanName = skill.name.replace('.disabled', '');
    if (disabledSkills.includes(cleanName) || skill.name.endsWith('.disabled')) {
      items.push({ type: 'skills', name: cleanName, display: cleanName });
    }
  }

  return items;
};

export const enableCommand = async (itemName, options) => {
  printHeader();

  const scope = options.project ? 'project' : 'global';

  if (options.all) {
    const disabledItems = getDisabledItemsList(scope);
    if (disabledItems.length === 0) {
      console.log(chalk.yellow('  No disabled items found.'));
      return;
    }

    for (const item of disabledItems) {
      enableItemByName(item.type, item.name, scope);
      console.log(chalk.green(`  ✓ Enabled ${item.display}`));
    }
    console.log('');
    console.log(chalk.green(`✓ Enabled ${disabledItems.length} items`));
    return;
  }

  if (itemName) {
    const cleanName = itemName.replace('@', '').replace('/', '');
    let type = 'agents';
    if (itemName.startsWith('/')) {
      type = 'commands';
    } else if (!itemName.startsWith('@')) {
      const skillsDir = getSkillsDir(scope);
      if (fs.existsSync(path.join(skillsDir, cleanName)) ||
          fs.existsSync(path.join(skillsDir, cleanName + '.disabled'))) {
        type = 'skills';
      }
    }

    enableItemByName(type, cleanName, scope);
    console.log(chalk.green(`  ✓ Enabled ${itemName}`));
    return;
  }

  const disabledItems = getDisabledItemsList(scope);
  if (disabledItems.length === 0) {
    console.log(chalk.yellow('  No disabled items to enable.'));
    return;
  }

  const { selected } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'selected',
      message: 'Select items to enable:',
      choices: disabledItems.map((item) => ({
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
    enableItemByName(item.type, item.name, scope);
    console.log(chalk.green(`  ✓ Enabled ${item.display}`));
  }

  console.log('');
  console.log(chalk.green(`✓ Enabled ${selected.length} items`));
};
