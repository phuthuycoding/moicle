import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import type { CommandOptions, EditorTarget, FileResult, Scope } from '../types.js';
import {
  ASSETS_DIR,
  EDITOR_CONFIGS,
  ensureDir,
  createSymlink,
  copyFile,
  copyDir,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getArchitectureDir,
  getClaudeDir,
  getEditorDir,
  getEditorAgentsDir,
  getEditorConfig,
  getFiles,
  getDirs,
  mergeAgentsToFile,
} from '../utils/symlink.js';
import { addTarget } from '../utils/config.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Installer'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const printSummary = (results: FileResult[]): void => {
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

const installAgents = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  if (fs.existsSync(developersDir)) {
    const files = getFiles(developersDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  if (fs.existsSync(utilitiesDir)) {
    const files = getFiles(utilitiesDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  console.log(chalk.green(`  ✓ Agents installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installCommands = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

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

  console.log(chalk.green(`  ✓ Commands installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installSkills = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

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

  console.log(chalk.green(`  ✓ Skills installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installArchitecture = async (
  targetDir: string,
  useSymlink = true
): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    const files = getFiles(archDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installScope = async (scope: Scope, useSymlink: boolean): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const targetPath = isGlobal ? '~/.claude/' : `${process.cwd()}/.claude/`;

  console.log('');
  console.log(chalk.cyan(`>>> ${label} Installation`));
  console.log(chalk.gray(`    Target: ${targetPath}`));
  console.log('');

  const claudeDir = getClaudeDir(scope);
  ensureDir(claudeDir);

  await installAgents(getAgentsDir(scope), useSymlink);
  if (isGlobal) {
    await installCommands(getCommandsDir(scope), useSymlink);
  }
  await installSkills(getSkillsDir(scope), useSymlink);
  await installArchitecture(getArchitectureDir(scope), useSymlink);

  if (!isGlobal) {
    console.log(chalk.gray('    Note: Commands are installed globally only'));
  }

  console.log('');
  console.log(chalk.green(`✓ ${label} installation complete!`));
};

// Temporarily hidden for open-source release - only Claude Code support
// const showTargetMenu = async (): Promise<EditorTarget[]> => {
//   const { targets } = await inquirer.prompt([
//     {
//       type: 'checkbox',
//       name: 'targets',
//       message: 'Select target editor(s):',
//       choices: [
//         { name: 'Claude Code (~/.claude/)', value: 'claude', checked: true },
//         { name: 'Cursor (~/.cursor/)', value: 'cursor' },
//         { name: 'Windsurf (~/.codeium/windsurf/)', value: 'windsurf' },
//         { name: 'Antigravity (~/.gemini/)', value: 'antigravity' },
//       ],
//       validate: (answer: string[]) => {
//         if (answer.length < 1) {
//           return 'Please select at least one editor.';
//         }
//         return true;
//       },
//     },
//   ]);
//
//   return targets;
// };

const showInteractiveMenu = async (): Promise<'global' | 'project' | 'all'> => {
  const { installType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installType',
      message: 'Where would you like to install?',
      choices: [
        { name: 'Global (~/.claude/) - Available for all projects', value: 'global' },
        { name: 'Project (./.claude/) - This project only', value: 'project' },
        { name: 'Both - Global and current project', value: 'all' },
      ],
    },
  ]);

  return installType;
};

const installArchitectureForEditor = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');

  ensureDir(targetArchDir);

  if (fs.existsSync(archDir)) {
    const files = getFiles(archDir);
    for (const file of files) {
      const target = path.join(targetArchDir, path.basename(file));
      const result = copyFile(file, target);
      results.push(result);
    }
  }

  return results;
};

const installForOtherEditor = async (
  target: EditorTarget,
  scope: Scope
): Promise<FileResult[]> => {
  const config = getEditorConfig(target);
  const results: FileResult[] = [];

  console.log('');
  console.log(chalk.cyan(`>>> ${config.name} Installation`));
  console.log(chalk.gray(`    Target: ${getEditorDir(target, scope)}`));
  console.log('');

  const targetDir = getEditorDir(target, scope);
  ensureDir(targetDir);

  const archResults = installArchitectureForEditor(targetDir);
  results.push(...archResults);
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(targetDir + '/architecture')}`));

  if (config.rulesFile) {
    const rulesFilePath = path.join(targetDir, config.rulesFile);
    const result = mergeAgentsToFile(rulesFilePath, target);
    results.push(result);
    console.log(chalk.green(`  ✓ Agents merged to ${chalk.cyan(config.rulesFile)}`));
  }

  printSummary(results);

  console.log('');
  console.log(chalk.green(`✓ ${config.name} installation complete!`));

  return results;
};

export const installCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(chalk.red('Error: Assets directory not found.'));
    console.log(chalk.gray(`Expected: ${ASSETS_DIR}`));
    process.exit(1);
  }

  let targets: EditorTarget[] = [];
  const useSymlink = options.symlink !== false;

  if (options.target) {
    targets = [options.target];
  } else {
    // Temporarily hardcoded to Claude Code only for open-source release
    targets = ['claude'];
    // targets = await showTargetMenu();
  }

  for (const target of targets) {
    addTarget(target);

    if (target === 'claude') {
      let installType: 'global' | 'project' | 'all';

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
          await installScope('global', useSymlink);
          break;
        case 'project':
          await installScope('project', false);
          break;
        case 'all':
          await installScope('global', useSymlink);
          await installScope('project', false);
          break;
      }
    } else {
      await installForOtherEditor(target, 'global');
    }
  }

  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Usage'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');

  if (targets.includes('claude')) {
    console.log(chalk.bold('  Claude Code:'));
    console.log('  Agents:');
    console.log(chalk.gray('    @clean-architect   Clean Architecture expert'));
    console.log(chalk.gray('    @code-reviewer     Code review expert'));
    console.log(chalk.gray('    @test-writer       Test writing expert'));
    console.log('');
    console.log('  Commands:');
    console.log(chalk.gray('    /bootstrap         Create new project'));
    console.log(chalk.gray('    /brainstorm        Brainstorm ideas'));
    console.log(chalk.gray('    /doc               Generate documentation'));
    console.log('');
    console.log('  Skills (auto-triggered):');
    console.log(chalk.gray('    new-feature        Feature development'));
    console.log(chalk.gray('    hotfix             Bug fix with rollback'));
    console.log('');
  }

  const otherTargets = targets.filter((t) => t !== 'claude');
  if (otherTargets.length > 0) {
    console.log(chalk.bold('  Other Editors:'));
    for (const target of otherTargets) {
      const config = EDITOR_CONFIGS[target];
      console.log(chalk.gray(`    ${config.name}: Agents merged into ${config.rulesFile}`));
    }
    console.log('');
  }
};
