import fs from 'fs';
import path from 'path';
import os from 'os';
import type { EditorTarget, ItemType, MoicleConfig } from '../types.js';

const CONFIG_FILE = path.join(os.homedir(), '.claude', 'moicle-config.json');

const defaultConfig: MoicleConfig = {
  targets: [],
  disabled: {
    agents: [],
    commands: [],
    skills: [],
  },
};

export const loadConfig = (): MoicleConfig => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(content) };
    }
  } catch {
    // ignore
  }
  return { ...defaultConfig };
};

export const saveConfig = (config: MoicleConfig): boolean => {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch {
    return false;
  }
};

export const isDisabled = (type: ItemType, name: string): boolean => {
  const config = loadConfig();
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  return config.disabled[type]?.includes(cleanName) || false;
};

export const disableItem = (type: ItemType, name: string): boolean => {
  const config = loadConfig();
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  if (!config.disabled[type]) {
    config.disabled[type] = [];
  }
  if (!config.disabled[type].includes(cleanName)) {
    config.disabled[type].push(cleanName);
  }
  return saveConfig(config);
};

export const enableItem = (type: ItemType, name: string): boolean => {
  const config = loadConfig();
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  if (config.disabled[type]) {
    config.disabled[type] = config.disabled[type].filter((n) => n !== cleanName);
  }
  return saveConfig(config);
};

export const getDisabledItems = (type: ItemType): string[] => {
  const config = loadConfig();
  return config.disabled[type] || [];
};

export const getAllDisabled = (): MoicleConfig['disabled'] => {
  const config = loadConfig();
  return config.disabled;
};

export const getTargets = (): EditorTarget[] => {
  const config = loadConfig();
  return config.targets || [];
};

export const addTarget = (target: EditorTarget): boolean => {
  const config = loadConfig();
  if (!config.targets) {
    config.targets = [];
  }
  if (!config.targets.includes(target)) {
    config.targets.push(target);
  }
  return saveConfig(config);
};

export const removeTarget = (target: EditorTarget): boolean => {
  const config = loadConfig();
  if (config.targets) {
    config.targets = config.targets.filter((t) => t !== target);
  }
  return saveConfig(config);
};

export const hasTarget = (target: EditorTarget): boolean => {
  const config = loadConfig();
  return config.targets?.includes(target) || false;
};
