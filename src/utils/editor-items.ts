import path from 'path';
import fs from 'fs';
import type { CommandOptions, EditorTarget, ItemType, ListItem, Scope } from '../types.js';
import { CURSOR_RULE_EXT, DISABLED_SUFFIX, MARKDOWN_EXT } from './editor-constants.js';
import {
  getEditorAgentsDir,
  getEditorCommandsDir,
  getEditorSkillsDir,
  listItems,
} from './symlink.js';

export const resolveEditorTarget = (options: CommandOptions): EditorTarget =>
  options.target ?? 'claude';

export const cleanItemDisplayName = (fileName: string): string => {
  if (fileName.endsWith(`${CURSOR_RULE_EXT}${DISABLED_SUFFIX}`)) {
    return fileName.slice(0, -(CURSOR_RULE_EXT.length + DISABLED_SUFFIX.length));
  }
  if (fileName.endsWith(`${MARKDOWN_EXT}${DISABLED_SUFFIX}`)) {
    return fileName.slice(0, -(MARKDOWN_EXT.length + DISABLED_SUFFIX.length));
  }
  if (fileName.endsWith(CURSOR_RULE_EXT)) {
    return fileName.slice(0, -CURSOR_RULE_EXT.length);
  }
  if (fileName.endsWith(MARKDOWN_EXT)) {
    return fileName.slice(0, -MARKDOWN_EXT.length);
  }
  if (fileName.endsWith(DISABLED_SUFFIX)) {
    return fileName.slice(0, -DISABLED_SUFFIX.length);
  }
  return fileName;
};

export const getItemDir = (type: ItemType, target: EditorTarget, scope: Scope): string => {
  switch (type) {
    case 'agents':
      return getEditorAgentsDir(target, scope);
    case 'commands':
      return getEditorCommandsDir(target, scope);
    case 'skills':
      return getEditorSkillsDir(target, scope);
  }
};

export const getAgentEnabledPath = (target: EditorTarget, dir: string, name: string): string =>
  path.join(
    dir,
    target === 'cursor' ? `${name}${CURSOR_RULE_EXT}` : `${name}${MARKDOWN_EXT}`
  );

export const getAgentDisabledPath = (target: EditorTarget, dir: string, name: string): string =>
  path.join(
    dir,
    target === 'cursor'
      ? `${name}${CURSOR_RULE_EXT}${DISABLED_SUFFIX}`
      : `${name}${MARKDOWN_EXT}${DISABLED_SUFFIX}`
  );

export const getCommandEnabledPath = (dir: string, name: string): string =>
  path.join(dir, `${name}${MARKDOWN_EXT}`);

export const getCommandDisabledPath = (dir: string, name: string): string =>
  path.join(dir, `${name}${MARKDOWN_EXT}${DISABLED_SUFFIX}`);

export const listCursorRuleItems = (rulesDir: string): ListItem[] =>
  listItems(rulesDir).filter(
    (item) =>
      item.name.endsWith(CURSOR_RULE_EXT) ||
      item.name.endsWith(`${CURSOR_RULE_EXT}${DISABLED_SUFFIX}`)
  );

export const inferItemType = (
  itemName: string,
  target: EditorTarget,
  scope: Scope
): ItemType => {
  const cleanName = itemName.replace('@', '').replace('/', '');
  if (itemName.startsWith('/')) {
    return 'commands';
  }
  if (itemName.startsWith('@')) {
    return 'agents';
  }
  const skillsDir = getEditorSkillsDir(target, scope);
  if (
    fs.existsSync(path.join(skillsDir, cleanName)) ||
    fs.existsSync(path.join(skillsDir, `${cleanName}${DISABLED_SUFFIX}`))
  ) {
    return 'skills';
  }
  return 'agents';
};
