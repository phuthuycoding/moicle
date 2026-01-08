#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import { installCommand } from '../src/commands/install.js';
import { uninstallCommand } from '../src/commands/uninstall.js';
import { listCommand } from '../src/commands/list.js';
import { postinstallCommand } from '../src/commands/postinstall.js';
import { enableCommand } from '../src/commands/enable.js';
import { disableCommand } from '../src/commands/disable.js';
import { statusCommand } from '../src/commands/status.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('moiclau')
  .description('CLI for managing Claude Code agents, commands, and skills')
  .version(pkg.version);

program
  .command('install')
  .description('Install agents, commands, and skills')
  .option('-g, --global', 'Install globally to ~/.claude/')
  .option('-p, --project', 'Install to current project ./.claude/')
  .option('-a, --all', 'Install both globally and to project')
  .option('--no-symlink', 'Copy files instead of creating symlinks')
  .action(installCommand);

program
  .command('uninstall')
  .description('Remove installed agents, commands, and skills')
  .option('-g, --global', 'Uninstall from ~/.claude/')
  .option('-p, --project', 'Uninstall from current project ./.claude/')
  .option('-a, --all', 'Uninstall from both locations')
  .action(uninstallCommand);

program
  .command('list')
  .description('List installed agents, commands, and skills')
  .option('-g, --global', 'List global installations')
  .option('-p, --project', 'List project installations')
  .action(listCommand);

program
  .command('postinstall', { hidden: true })
  .description('Run after npm install')
  .action(postinstallCommand);

program
  .command('enable [item]')
  .description('Enable agents, commands, or skills')
  .option('-g, --global', 'Enable in global ~/.claude/')
  .option('-p, --project', 'Enable in current project ./.claude/')
  .option('-a, --all', 'Enable all disabled items')
  .action(enableCommand);

program
  .command('disable [item]')
  .description('Disable agents, commands, or skills')
  .option('-g, --global', 'Disable in global ~/.claude/')
  .option('-p, --project', 'Disable in current project ./.claude/')
  .option('-a, --all', 'Disable all enabled items')
  .action(disableCommand);

program
  .command('status')
  .description('Show enabled/disabled status of all items')
  .option('-g, --global', 'Show global status')
  .option('-p, --project', 'Show project status')
  .action(statusCommand);

program.parse();
