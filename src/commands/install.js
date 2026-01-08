import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import {
  ASSETS_DIR,
  ensureDir,
  createSymlink,
  copyFile,
  copyDir,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getClaudeDir,
  getFiles,
  getDirs,
} from '../utils/symlink.js';

const printHeader = () => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Claude Agents Kit Installer'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const printSummary = (results) => {
  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;

  if (created > 0) console.log(chalk.green(`  Created: ${created}`));
  if (updated > 0) console.log(chalk.yellow(`  Updated: ${updated}`));
  if (exists > 0) console.log(chalk.gray(`  Already exists: ${exists}`));
  if (skipped > 0) console.log(chalk.gray(`  Skipped: ${skipped}`));
  if (errors > 0) console.log(chalk.red(`  Errors: ${errors}`));
};

const installAgents = async (targetDir, useSymlink = true) => {
  const spinner = ora('Installing agents...').start();
  const results = [];

  ensureDir(targetDir);

  // Install from developers/
  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  if (fs.existsSync(developersDir)) {
    const files = getFiles(developersDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  // Install from utilities/
  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  if (fs.existsSync(utilitiesDir)) {
    const files = getFiles(utilitiesDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  spinner.succeed(`Agents installed to ${chalk.cyan(targetDir)}`);
  printSummary(results);

  return results;
};

const installCommands = async (targetDir, useSymlink = true) => {
  const spinner = ora('Installing commands...').start();
  const results = [];

  ensureDir(targetDir);

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    const files = getFiles(commandsDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  spinner.succeed(`Commands installed to ${chalk.cyan(targetDir)}`);
  printSummary(results);

  return results;
};

const installSkills = async (targetDir, useSymlink = true) => {
  const spinner = ora('Installing skills...').start();
  const results = [];

  ensureDir(targetDir);

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    const dirs = getDirs(skillsDir);
    for (const dir of dirs) {
      const target = path.join(targetDir, path.basename(dir));
      if (useSymlink) {
        const result = createSymlink(dir, target);
        results.push(result);
      } else {
        const result = copyDir(dir, target);
        results.push(result);
      }
    }
  }

  spinner.succeed(`Skills installed to ${chalk.cyan(targetDir)}`);
  printSummary(results);

  return results;
};

const installGlobal = async (useSymlink = true) => {
  console.log('');
  console.log(chalk.cyan('>>> Global Installation'));
  console.log(chalk.gray(`    Target: ~/.claude/`));
  console.log('');

  const claudeDir = getClaudeDir('global');
  ensureDir(claudeDir);

  await installAgents(getAgentsDir('global'), useSymlink);
  await installCommands(getCommandsDir('global'), useSymlink);
  await installSkills(getSkillsDir('global'), useSymlink);

  console.log('');
  console.log(chalk.green('✓ Global installation complete!'));
};

const installProject = async (useSymlink = false) => {
  console.log('');
  console.log(chalk.cyan('>>> Project Installation'));
  console.log(chalk.gray(`    Target: ${process.cwd()}/.claude/`));
  console.log('');

  const claudeDir = getClaudeDir('project');
  ensureDir(claudeDir);

  await installAgents(getAgentsDir('project'), useSymlink);
  await installSkills(getSkillsDir('project'), useSymlink);

  // Note: Commands are typically global, not project-specific
  console.log(chalk.gray('    Note: Commands are installed globally only'));

  console.log('');
  console.log(chalk.green('✓ Project installation complete!'));
};

const showInteractiveMenu = async () => {
  const { installType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installType',
      message: 'Where would you like to install?',
      choices: [
        {
          name: 'Global (~/.claude/) - Available for all projects',
          value: 'global',
        },
        {
          name: 'Project (./.claude/) - This project only',
          value: 'project',
        },
        {
          name: 'Both - Global and current project',
          value: 'all',
        },
      ],
    },
  ]);

  return installType;
};

export const installCommand = async (options) => {
  printHeader();

  // Check if assets directory exists
  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(chalk.red('Error: Assets directory not found.'));
    console.log(chalk.gray(`Expected: ${ASSETS_DIR}`));
    process.exit(1);
  }

  let installType;
  const useSymlink = options.symlink !== false;

  if (options.global) {
    installType = 'global';
  } else if (options.project) {
    installType = 'project';
  } else if (options.all) {
    installType = 'all';
  } else {
    installType = await showInteractiveMenu();
  }

  switch (installType) {
    case 'global':
      await installGlobal(useSymlink);
      break;
    case 'project':
      await installProject(false); // Always copy for project
      break;
    case 'all':
      await installGlobal(useSymlink);
      await installProject(false);
      break;
  }

  // Print usage
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Usage'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
  console.log('  Agents:');
  console.log(chalk.gray('    @clean-architect   Clean Architecture expert'));
  console.log(chalk.gray('    @code-reviewer     Code review expert'));
  console.log(chalk.gray('    @test-writer       Test writing expert'));
  console.log('');
  console.log('  Commands:');
  console.log(chalk.gray('    /bootstrap         Create new project'));
  console.log(chalk.gray('    /brainstorm        Brainstorm ideas'));
  console.log('');
  console.log('  Skills (auto-triggered):');
  console.log(chalk.gray('    feature-workflow   Feature development'));
  console.log(chalk.gray('    hotfix-workflow    Bug fix with rollback'));
  console.log('');
};
