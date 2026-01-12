import fs from 'fs';
import path from 'path';
import os from 'os';

const CONFIG_FILE = path.join(os.homedir(), '.claude', 'moicle-config.json');

const defaultConfig = {
  disabled: {
    agents: [],
    commands: [],
    skills: [],
  },
};

export const loadConfig = () => {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const content = fs.readFileSync(CONFIG_FILE, 'utf-8');
      return { ...defaultConfig, ...JSON.parse(content) };
    }
  } catch (err) {
    // ignore
  }
  return { ...defaultConfig };
};

export const saveConfig = (config) => {
  try {
    const dir = path.dirname(CONFIG_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
    return true;
  } catch (err) {
    return false;
  }
};

export const isDisabled = (type, name) => {
  const config = loadConfig();
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  return config.disabled[type]?.includes(cleanName) || false;
};

export const disableItem = (type, name) => {
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

export const enableItem = (type, name) => {
  const config = loadConfig();
  const cleanName = name.replace('.md', '').replace('.disabled', '');
  if (config.disabled[type]) {
    config.disabled[type] = config.disabled[type].filter((n) => n !== cleanName);
  }
  return saveConfig(config);
};

export const getDisabledItems = (type) => {
  const config = loadConfig();
  return config.disabled[type] || [];
};

export const getAllDisabled = () => {
  const config = loadConfig();
  return config.disabled;
};
