import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';
import type { EditorConfig, EditorTarget, FileResult, ListItem, Scope } from '../types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');
export const ASSETS_DIR = path.join(PACKAGE_ROOT, 'assets');

export const isSymlinkSupported = (): boolean => process.platform !== 'win32';

export const EDITOR_CONFIGS: Record<EditorTarget, EditorConfig> = {
  claude: {
    name: 'Claude Code',
    globalDir: path.join(os.homedir(), '.claude'),
    agentsDir: 'agents',
    commandsDir: 'commands',
    skillsDir: 'skills',
    supportsAgents: true,
    supportsCommands: true,
    supportsSkills: true,
  },
  cursor: {
    name: 'Cursor',
    globalDir: path.join(os.homedir(), '.cursor'),
    agentsDir: 'rules',
    commandsDir: 'rules',
    skillsDir: 'rules',
    rulesFile: 'AGENTS.md',
    supportsAgents: true,
    supportsCommands: false,
    supportsSkills: false,
  },
  windsurf: {
    name: 'Windsurf',
    globalDir: path.join(os.homedir(), '.codeium', 'windsurf', 'memories'),
    agentsDir: '.',
    commandsDir: '.',
    skillsDir: '.',
    rulesFile: 'global_rules.md',
    supportsAgents: true,
    supportsCommands: false,
    supportsSkills: false,
  },
  antigravity: {
    name: 'Antigravity',
    globalDir: path.join(os.homedir(), '.gemini'),
    agentsDir: '.',
    commandsDir: '.',
    skillsDir: '.',
    rulesFile: 'GEMINI.md',
    supportsAgents: true,
    supportsCommands: false,
    supportsSkills: false,
  },
};

export const getEditorConfig = (target: EditorTarget): EditorConfig => {
  return EDITOR_CONFIGS[target];
};

export const getEditorDir = (target: EditorTarget, scope: Scope = 'global'): string => {
  const config = EDITOR_CONFIGS[target];
  if (scope === 'global') {
    return config.globalDir;
  }
  if (target === 'claude') {
    return path.join(process.cwd(), '.claude');
  }
  if (target === 'cursor') {
    return path.join(process.cwd(), '.cursor');
  }
  if (target === 'windsurf') {
    return path.join(process.cwd(), '.windsurf', 'rules');
  }
  return path.join(process.cwd(), '.gemini');
};

export const getEditorAgentsDir = (target: EditorTarget, scope: Scope = 'global'): string => {
  const baseDir = getEditorDir(target, scope);
  const config = EDITOR_CONFIGS[target];
  return path.join(baseDir, config.agentsDir);
};

export const getEditorCommandsDir = (target: EditorTarget, scope: Scope = 'global'): string => {
  const baseDir = getEditorDir(target, scope);
  const config = EDITOR_CONFIGS[target];
  return path.join(baseDir, config.commandsDir);
};

export const getEditorSkillsDir = (target: EditorTarget, scope: Scope = 'global'): string => {
  const baseDir = getEditorDir(target, scope);
  const config = EDITOR_CONFIGS[target];
  return path.join(baseDir, config.skillsDir);
};

export const getClaudeDir = (scope: Scope = 'global'): string => {
  return getEditorDir('claude', scope);
};

export const getAgentsDir = (scope: Scope = 'global'): string =>
  path.join(getClaudeDir(scope), 'agents');

export const getCommandsDir = (scope: Scope = 'global'): string =>
  path.join(getClaudeDir(scope), 'commands');

export const getSkillsDir = (scope: Scope = 'global'): string =>
  path.join(getClaudeDir(scope), 'skills');

export const getArchitectureDir = (scope: Scope = 'global'): string =>
  path.join(getClaudeDir(scope), 'architecture');

export const ensureDir = (dir: string): boolean => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
};

export const createSymlink = (source: string, target: string): FileResult => {
  const name = path.basename(source);

  try {
    if (fs.lstatSync(target).isSymbolicLink()) {
      const currentSource = fs.readlinkSync(target);
      if (currentSource === source) {
        return { status: 'exists', name };
      }
      fs.unlinkSync(target);
      fs.symlinkSync(source, target);
      return { status: 'updated', name };
    }
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code !== 'ENOENT') {
      if (fs.existsSync(target)) {
        return { status: 'skipped', name, reason: 'file exists' };
      }
    }
  }

  try {
    fs.symlinkSync(source, target);
    return { status: 'created', name };
  } catch (err) {
    const error = err as Error;
    return { status: 'error', name, reason: error.message };
  }
};

export const copyFile = (source: string, target: string): FileResult => {
  const name = path.basename(source);

  try {
    if (fs.existsSync(target)) {
      const sourceContent = fs.readFileSync(source);
      const targetContent = fs.readFileSync(target);
      if (sourceContent.equals(targetContent)) {
        return { status: 'exists', name };
      }
      fs.copyFileSync(source, target);
      return { status: 'updated', name };
    }

    fs.copyFileSync(source, target);
    return { status: 'created', name };
  } catch (err) {
    const error = err as Error;
    return { status: 'error', name, reason: error.message };
  }
};

export const copyDir = (source: string, target: string): FileResult => {
  const name = path.basename(source);

  try {
    ensureDir(target);
    const items = fs.readdirSync(source);

    for (const item of items) {
      const srcPath = path.join(source, item);
      const destPath = path.join(target, item);
      const stat = fs.statSync(srcPath);

      if (stat.isDirectory()) {
        copyDir(srcPath, destPath);
      } else {
        fs.copyFileSync(srcPath, destPath);
      }
    }

    return { status: 'created', name };
  } catch (err) {
    const error = err as Error;
    return { status: 'error', name, reason: error.message };
  }
};

export const removeItem = (target: string): FileResult => {
  const name = path.basename(target);

  try {
    if (fs.lstatSync(target).isSymbolicLink()) {
      fs.unlinkSync(target);
      return { status: 'removed', name };
    }
    if (fs.existsSync(target)) {
      fs.rmSync(target, { recursive: true });
      return { status: 'removed', name };
    }
    return { status: 'not_found', name };
  } catch (err) {
    const error = err as NodeJS.ErrnoException;
    if (error.code === 'ENOENT') {
      return { status: 'not_found', name };
    }
    return { status: 'error', name, reason: error.message };
  }
};

export const listItems = (dir: string): ListItem[] => {
  try {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const items = fs.readdirSync(dir);
    return items.map((name) => {
      const fullPath = path.join(dir, name);
      let isSymlink = false;
      let target: string | null = null;

      try {
        isSymlink = fs.lstatSync(fullPath).isSymbolicLink();
        if (isSymlink) {
          target = fs.readlinkSync(fullPath);
        }
      } catch {
        // Ignore errors
      }

      return { name, path: fullPath, isSymlink, target };
    });
  } catch {
    return [];
  }
};

export const getFiles = (dir: string, depth = 1): string[] => {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isFile()) {
      files.push(fullPath);
    } else if (stat.isDirectory() && depth > 0) {
      files.push(...getFiles(fullPath, depth - 1));
    }
  }

  return files;
};

export const getDirs = (dir: string): string[] => {
  const dirs: string[] = [];

  if (!fs.existsSync(dir)) {
    return dirs;
  }

  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      dirs.push(fullPath);
    }
  }

  return dirs;
};

const getEditorPaths = (target: EditorTarget): { globalPath: string; projectPath: string } => {
  switch (target) {
    case 'cursor':
      return { globalPath: '~/.cursor', projectPath: '.cursor' };
    case 'windsurf':
      return { globalPath: '~/.codeium/windsurf/memories', projectPath: '.windsurf/rules' };
    case 'antigravity':
      return { globalPath: '~/.gemini', projectPath: '.gemini' };
    default:
      return { globalPath: '~/.claude', projectPath: '.claude' };
  }
};

export const mergeAgentsToFile = (targetFile: string, target: EditorTarget): FileResult => {
  const name = path.basename(targetFile);

  try {
    const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
    const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
    const editorPaths = getEditorPaths(target);

    let content = '# MoiCle Agents\n\n';
    content += 'This file contains all available agents from MoiCle.\n\n';

    const processAgentFile = (filePath: string): string => {
      let fileContent = fs.readFileSync(filePath, 'utf-8');

      fileContent = fileContent.replace(/~\/\.claude\//g, `${editorPaths.globalPath}/`);
      fileContent = fileContent.replace(/\.claude\//g, `${editorPaths.projectPath}/`);

      const agentName = path.basename(filePath, '.md');
      return `## @${agentName}\n\n${fileContent}\n\n---\n\n`;
    };

    if (fs.existsSync(developersDir)) {
      content += '# Developer Agents\n\n';
      const files = getFiles(developersDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          content += processAgentFile(file);
        }
      }
    }

    if (fs.existsSync(utilitiesDir)) {
      content += '# Utility Agents\n\n';
      const files = getFiles(utilitiesDir);
      for (const file of files) {
        if (file.endsWith('.md')) {
          content += processAgentFile(file);
        }
      }
    }

    ensureDir(path.dirname(targetFile));

    if (fs.existsSync(targetFile)) {
      fs.writeFileSync(targetFile, content);
      return { status: 'updated', name };
    }

    fs.writeFileSync(targetFile, content);
    return { status: 'created', name };
  } catch (err) {
    const error = err as Error;
    return { status: 'error', name, reason: error.message };
  }
};
