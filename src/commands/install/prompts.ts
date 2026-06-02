import inquirer from 'inquirer';
import type { EditorTarget } from '../../types.js';

export const showTargetMenu = async (): Promise<EditorTarget> => {
  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Which editor would you like to configure?',
      choices: [
        { name: 'Claude Code', value: 'claude' },
        { name: 'Codex CLI', value: 'codex' },
        { name: 'Antigravity', value: 'antigravity' },
        { name: 'Cursor', value: 'cursor' },
        { name: 'Windsurf', value: 'windsurf' },
      ],
    },
  ]);

  return target;
};

const SCOPE_PATHS: Record<'claude' | 'codex' | 'cursor' | 'antigravity', { global: string; project: string }> = {
  claude: { global: '~/.claude/', project: './.claude/' },
  codex: { global: '~/.codex/', project: './.codex/' },
  cursor: { global: '~/.cursor/', project: './.cursor/' },
  antigravity: { global: '~/.gemini/', project: './.gemini/' },
};

export const showInteractiveMenu = async (
  target: 'claude' | 'codex' | 'cursor' | 'antigravity'
): Promise<'global' | 'project' | 'all'> => {
  const { global: globalPath, project: projectPath } = SCOPE_PATHS[target];

  const { installType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'installType',
      message: 'Where would you like to install?',
      choices: [
        { name: `Global (${globalPath}) - Available for all projects`, value: 'global' },
        { name: `Project (${projectPath}) - This project only`, value: 'project' },
        { name: 'Both - Global and current project', value: 'all' },
      ],
    },
  ]);

  return installType;
};
