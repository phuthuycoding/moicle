import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import type { FileResult, Scope } from '../../types.js';
import {
  ASSETS_DIR,
  ensureDir,
  createSymlink,
  copyFile,
  copyDir,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getArchitectureDir,
  getClaudeDir,
  getFiles,
  getDirs,
} from '../../utils/symlink.js';
import { printInstalled } from './print.js';

/**
 * Claude native install: assets are symlinked (or copied) verbatim into
 * ~/.claude/{agents,commands,skills,architecture}. This is the only target
 * that supports symlinks and the full agents/commands/skills layout.
 */

/** Symlink or copy every file from a source dir into the target dir. */
const linkFiles = (sourceDir: string, targetDir: string, useSymlink: boolean): FileResult[] => {
  if (!fs.existsSync(sourceDir)) {
    return [];
  }
  return getFiles(sourceDir).map((file) => {
    const target = path.join(targetDir, path.basename(file));
    return useSymlink ? createSymlink(file, target) : copyFile(file, target);
  });
};

const installAgents = (targetDir: string, useSymlink: boolean): FileResult[] => {
  ensureDir(targetDir);
  const results = [
    ...linkFiles(path.join(ASSETS_DIR, 'agents', 'developers'), targetDir, useSymlink),
    ...linkFiles(path.join(ASSETS_DIR, 'agents', 'utilities'), targetDir, useSymlink),
  ];
  printInstalled('Agents', targetDir, results);
  return results;
};

const installCommands = (targetDir: string, useSymlink: boolean): FileResult[] => {
  ensureDir(targetDir);
  const results = linkFiles(path.join(ASSETS_DIR, 'commands'), targetDir, useSymlink);
  printInstalled('Commands', targetDir, results);
  return results;
};

const installSkills = (targetDir: string, useSymlink: boolean): FileResult[] => {
  ensureDir(targetDir);
  const skillsDir = path.join(ASSETS_DIR, 'skills');
  const results = fs.existsSync(skillsDir)
    ? getDirs(skillsDir).map((dir) => {
        const target = path.join(targetDir, path.basename(dir));
        return useSymlink ? createSymlink(dir, target) : copyDir(dir, target);
      })
    : [];
  printInstalled('Skills', targetDir, results);
  return results;
};

const installArchitecture = (targetDir: string, useSymlink: boolean): FileResult[] => {
  ensureDir(targetDir);
  const results = linkFiles(path.join(ASSETS_DIR, 'architecture'), targetDir, useSymlink);
  printInstalled('Architecture', targetDir, results);
  return results;
};

export const installScope = async (scope: Scope, useSymlink: boolean): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const targetPath = isGlobal ? '~/.claude/' : `${process.cwd()}/.claude/`;

  console.log('');
  console.log(chalk.cyan(`>>> ${label} Installation`));
  console.log(chalk.gray(`    Target: ${targetPath}`));
  console.log('');

  ensureDir(getClaudeDir(scope));

  installAgents(getAgentsDir(scope), useSymlink);
  if (isGlobal) {
    installCommands(getCommandsDir(scope), useSymlink);
  }
  installSkills(getSkillsDir(scope), useSymlink);
  installArchitecture(getArchitectureDir(scope), useSymlink);

  if (!isGlobal) {
    console.log(chalk.gray('    Note: Commands are installed globally only'));
  }

  console.log('');
  console.log(chalk.green(`✓ ${label} installation complete!`));
};
