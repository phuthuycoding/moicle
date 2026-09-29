import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import type { EditorTarget, FileResult, Scope } from '../../types.js';
import {
  ASSETS_DIR,
  ensureDir,
  getEditorConfig,
  getEditorDir,
  getFiles,
  mergeAgentsToFile,
  rewriteEditorPaths,
  writeInstallManifest,
} from '../../utils/symlink.js';
import { printSummary } from './print.js';

/**
 * Rules-file editors (Cursor, Windsurf). These do not support discrete
 * agents/commands/skills — agent personas are merged into a single rules file
 * (AGENTS.md / global_rules.md), and architecture docs are copied alongside.
 */

const installArchitectureForEditor = (targetDir: string, target: EditorTarget): FileResult[] => {
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');
  ensureDir(targetArchDir);

  if (!fs.existsSync(archDir)) {
    return [];
  }

  return getFiles(archDir).map((file) => {
    const targetFile = path.join(targetArchDir, path.relative(archDir, file));
    ensureDir(path.dirname(targetFile));
    const content = rewriteEditorPaths(fs.readFileSync(file, 'utf-8'), target)
      .replace(/CLAUDE\.md/g, 'AGENTS.md');
    const existed = fs.existsSync(targetFile);
    fs.writeFileSync(targetFile, content);
    return {
      status: existed ? 'updated' : 'created',
      name: path.relative(archDir, file),
    };
  });
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

  results.push(...installArchitectureForEditor(targetDir, target));
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(path.join(targetDir, 'architecture'))}`));

  if (config.rulesFile) {
    const result = mergeAgentsToFile(path.join(targetDir, config.rulesFile), target);
    results.push(result);
    console.log(chalk.green(`  ✓ Agents merged to ${chalk.cyan(config.rulesFile)}`));
  }

  const archAssetDir = path.join(ASSETS_DIR, 'architecture');
  writeInstallManifest(targetDir, [
    ...(fs.existsSync(archAssetDir)
      ? fs.readdirSync(archAssetDir).map((n) => `architecture/${n}`)
      : []),
  ]);

  printSummary(results);

  console.log('');
  console.log(chalk.green(`✓ ${config.name} installation complete!`));

  return results;
};
