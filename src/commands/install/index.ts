import chalk from 'chalk';
import fs from 'fs';
import type { CommandOptions, EditorTarget, Scope } from '../../types.js';
import { ASSETS_DIR, isSymlinkSupported } from '../../utils/symlink.js';
import { addTarget } from '../../utils/config.js';
import { printHeader } from './print.js';
import { installScope } from './native.js';
import { installSkillEditorScope } from './skill-editor.js';
import { installForOtherEditor } from './generic-editor.js';
import { showTargetMenu, showInteractiveMenu } from './prompts.js';
import { printUsage } from './usage.js';

/** Editors that branch into a global/project/all scope flow. */
type ScopedTarget = 'claude' | 'codex' | 'antigravity';
const isScopedTarget = (target: EditorTarget): target is ScopedTarget =>
  target === 'claude' || target === 'codex' || target === 'antigravity';

const resolveStrategy = (options: CommandOptions): boolean => {
  if (options.symlink === true) return true;
  if (options.symlink === false) return false;
  return isSymlinkSupported();
};

const resolveInstallType = async (
  options: CommandOptions,
  target: ScopedTarget
): Promise<'global' | 'project' | 'all'> => {
  if (options.global) return 'global';
  if (options.project) return 'project';
  if (options.all) return 'all';
  return showInteractiveMenu(target);
};

/** Install a scoped target (claude/codex/antigravity) into one scope. */
const installScopedTarget = async (
  target: ScopedTarget,
  scope: Scope,
  useSymlink: boolean
): Promise<void> => {
  if (target === 'claude') {
    // Symlinks only make sense for the global, shared install.
    await installScope(scope, scope === 'global' ? useSymlink : false);
  } else {
    await installSkillEditorScope(scope, target);
  }
};

export const installCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(chalk.red('Error: Assets directory not found.'));
    console.log(chalk.gray(`Expected: ${ASSETS_DIR}`));
    process.exit(1);
  }

  const useSymlink = resolveStrategy(options);
  const strategyLabel = useSymlink ? 'symlinks' : 'file copy';
  if (options.symlink === undefined) {
    console.log(chalk.gray(`  Auto-detected file strategy: ${strategyLabel} (${process.platform})`));
  } else {
    console.log(chalk.gray(`  File strategy: ${strategyLabel} (user override)`));
  }
  console.log('');

  const targets: EditorTarget[] = options.target ? [options.target] : [await showTargetMenu()];

  for (const target of targets) {
    addTarget(target);

    if (!isScopedTarget(target)) {
      await installForOtherEditor(target, 'global');
      continue;
    }

    const installType = await resolveInstallType(options, target);
    if (installType === 'global' || installType === 'all') {
      await installScopedTarget(target, 'global', useSymlink);
    }
    if (installType === 'project' || installType === 'all') {
      await installScopedTarget(target, 'project', useSymlink);
    }
  }

  printUsage(targets);
};
