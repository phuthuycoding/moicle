import fs from 'fs';
import path from 'path';
import os from 'os';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get the package root directory
export const PACKAGE_ROOT = path.resolve(__dirname, '..', '..');

// Get assets directory
export const ASSETS_DIR = path.join(PACKAGE_ROOT, 'assets');

// Get Claude directories
export const getClaudeDir = (type = 'global') => {
  if (type === 'global') {
    return path.join(os.homedir(), '.claude');
  }
  return path.join(process.cwd(), '.claude');
};

export const getAgentsDir = (type = 'global') => path.join(getClaudeDir(type), 'agents');
export const getCommandsDir = (type = 'global') => path.join(getClaudeDir(type), 'commands');
export const getSkillsDir = (type = 'global') => path.join(getClaudeDir(type), 'skills');
export const getArchitectureDir = (type = 'global') => path.join(getClaudeDir(type), 'architecture');

// Ensure directory exists
export const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    return true;
  }
  return false;
};

// Create symlink (idempotent)
export const createSymlink = (source, target) => {
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
    if (err.code !== 'ENOENT') {
      if (fs.existsSync(target)) {
        return { status: 'skipped', name, reason: 'file exists' };
      }
    }
  }

  try {
    fs.symlinkSync(source, target);
    return { status: 'created', name };
  } catch (err) {
    return { status: 'error', name, reason: err.message };
  }
};

// Copy file
export const copyFile = (source, target) => {
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
    return { status: 'error', name, reason: err.message };
  }
};

// Copy directory recursively
export const copyDir = (source, target) => {
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
    return { status: 'error', name, reason: err.message };
  }
};

// Remove symlink or file
export const removeItem = (target) => {
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
    if (err.code === 'ENOENT') {
      return { status: 'not_found', name };
    }
    return { status: 'error', name, reason: err.message };
  }
};

// List items in directory
export const listItems = (dir) => {
  try {
    if (!fs.existsSync(dir)) {
      return [];
    }
    const items = fs.readdirSync(dir);
    return items.map((name) => {
      const fullPath = path.join(dir, name);
      let isSymlink = false;
      let target = null;

      try {
        isSymlink = fs.lstatSync(fullPath).isSymbolicLink();
        if (isSymlink) {
          target = fs.readlinkSync(fullPath);
        }
      } catch (err) {
        // Ignore errors
      }

      return { name, path: fullPath, isSymlink, target };
    });
  } catch (err) {
    return [];
  }
};

// Get all files from a directory (recursive for specific depth)
export const getFiles = (dir, depth = 1) => {
  const files = [];

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

// Get all directories from a directory
export const getDirs = (dir) => {
  const dirs = [];

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
