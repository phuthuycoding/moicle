import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import type { EditorTarget, FileResult, Scope } from '../../types.js';
import {
  ASSETS_DIR,
  ensureDir,
  copyFile,
  getEditorConfig,
  getEditorDir,
  getFiles,
  mergeAgentsToFile,
} from '../../utils/symlink.js';
import { printSummary } from './print.js';

/**
 * Rules-file editors (Cursor, Windsurf). These do not support discrete
 * agents/commands/skills — agent personas are merged into a single rules file
 * (AGENTS.md / global_rules.md), and architecture docs are copied alongside.
 */

const installArchitectureForEditor = (targetDir: string): FileResult[] => {
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');
  ensureDir(targetArchDir);

  if (!fs.existsSync(archDir)) {
    return [];
  }

  return getFiles(archDir).map((file) =>
    copyFile(file, path.join(targetArchDir, path.basename(file)))
  );
};

export const installForOtherEditor = async (target: EditorTarget, scope: Scope): Promise<FileResult[]> => {
  const config = getEditorConfig(target);
  const targetDir = getEditorDir(target, scope);
  const results: FileResult[] = [];

  console.log('');
  console.log(chalk.cyan(`>>> ${config.name} Installation`));
  console.log(chalk.gray(`    Target: ${targetDir}`));
  console.log('');

  ensureDir(targetDir);

  results.push(...installArchitectureForEditor(targetDir));
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(path.join(targetDir, 'architecture'))}`));

  if (config.rulesFile) {
    const result = mergeAgentsToFile(path.join(targetDir, config.rulesFile), target);
    results.push(result);
    console.log(chalk.green(`  ✓ Agents merged to ${chalk.cyan(config.rulesFile)}`));
  }

  printSummary(results);

  console.log('');
  console.log(chalk.green(`✓ ${config.name} installation complete!`));

  return results;
};
