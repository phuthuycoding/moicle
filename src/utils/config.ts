import fs from 'fs';
import path from 'path';
import os from 'os';
import type { EditorTarget, ItemType, MoicleConfig, Scope } from '../types.js';
import { getEditorDir } from './symlink.js';

// The targets registry is user-level metadata — one fixed global location.
const GLOBAL_CONFIG_FILE = path.join(os.homedir(), '.claude', 'moicle-config.json');

// Disabled state lives inside each target's own moicle root per scope, so a
// project-scope disable never leaks into the user's global config (and vice
// versa).
const getConfigFile = (scope: Scope, target: EditorTarget): string =>
  path.join(getEditorDir(target, scope), 'moicle-config.json');

const defaultConfig: MoicleConfig = {
  targets: [],
  disabled: {
    agents: [],
    commands: [],
    skills: [],
  },
};

const readConfigFile = (file: string): MoicleConfig => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(content) };
    }
  } catch {
    // ignore
  }
  return { ...defaultConfig };
};

const writeConfigFile = (file: string, config: MoicleConfig): boolean => {
  try {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(file, JSON.stringify(config, null, 2));
    return true;
  } catch {
    return false;
  }
};

export const loadConfig = (scope: Scope = 'global', target: EditorTarget = 'claude'): MoicleConfig =>
  readConfigFile(getConfigFile(scope, target));

export const saveConfig = (
  config: MoicleConfig,
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): boolean => writeConfigFile(getConfigFile(scope, target), config);

export const isDisabled = (
  type: ItemType,
  name: string,
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): boolean => {
  const config = loadConfig(scope, target);
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  return config.disabled[type]?.includes(cleanName) || false;
};

export const disableItem = (
  type: ItemType,
  name: string,
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): boolean => {
  const config = loadConfig(scope, target);
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  if (!config.disabled[type]) {
    config.disabled[type] = [];
  }
  if (!config.disabled[type].includes(cleanName)) {
    config.disabled[type].push(cleanName);
  }
  return saveConfig(config, scope, target);
};

export const enableItem = (
  type: ItemType,
  name: string,
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): boolean => {
  const config = loadConfig(scope, target);
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  if (config.disabled[type]) {
    config.disabled[type] = config.disabled[type].filter((n) => n !== cleanName);
  }
  return saveConfig(config, scope, target);
};

export const getDisabledItems = (
  type: ItemType,
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): string[] => loadConfig(scope, target).disabled[type] || [];

export const getAllDisabled = (
  scope: Scope = 'global',
  target: EditorTarget = 'claude'
): MoicleConfig['disabled'] => loadConfig(scope, target).disabled;

export const getTargets = (): EditorTarget[] => readConfigFile(GLOBAL_CONFIG_FILE).targets || [];

export const addTarget = (target: EditorTarget): boolean => {
  const config = readConfigFile(GLOBAL_CONFIG_FILE);
  if (!config.targets) {
    config.targets = [];
  }
  if (!config.targets.includes(target)) {
    config.targets.push(target);
  }
  return writeConfigFile(GLOBAL_CONFIG_FILE, config);
};

export const removeTarget = (target: EditorTarget): boolean => {
  const config = readConfigFile(GLOBAL_CONFIG_FILE);
  if (config.targets) {
    config.targets = config.targets.filter((t) => t !== target);
  }
  return writeConfigFile(GLOBAL_CONFIG_FILE, config);
};

export const hasTarget = (target: EditorTarget): boolean =>
  readConfigFile(GLOBAL_CONFIG_FILE).targets?.includes(target) || false;

/**
 * Drop a scoped config file on uninstall. Skips the global registry — that file
 * also tracks the installed-targets list, which must survive scope uninstalls.
 */
export const removeScopedConfig = (scope: Scope, target: EditorTarget): void => {
  const file = getConfigFile(scope, target);
  if (file === GLOBAL_CONFIG_FILE) {
    return;
  }
  try {
    fs.rmSync(file, { force: true });
  } catch {
    // best-effort cleanup only
  }
};
