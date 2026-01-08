#!/usr/bin/env node

import { Command } from 'commander';
import { createRequire } from 'module';
import { installCommand } from '../src/commands/install.js';
import { uninstallCommand } from '../src/commands/uninstall.js';
import { listCommand } from '../src/commands/list.js';
import { postinstallCommand } from '../src/commands/postinstall.js';

const require = createRequire(import.meta.url);
const pkg = require('../package.json');

const program = new Command();

program
  .name('claude-kit')
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

program.parse();
