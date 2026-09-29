import chalk from 'chalk';
import inquirer from 'inquirer';
import ora from 'ora';
import path from 'path';
import fs from 'fs';
import type { CommandOptions, EditorTarget, Scope } from '../types.js';
import {
  ASSETS_DIR,
  EDITOR_CONFIGS,
  removeItem,
  listItems,
  listSkillsNested,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getArchitectureDir,
  getClaudeDir,
  getAntigravityDir,
  getEditorDir,
  getEditorConfig,
  readInstallManifest,
  manifestNames,
  removeInstallManifest,
} from '../utils/symlink.js';
import { getTargets, removeTarget, removeScopedConfig } from '../utils/config.js';
import { CURSOR_RULE_EXT, DISABLED_SUFFIX, MARKDOWN_EXT } from '../utils/editor-constants.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Uninstaller'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const getKitFiles = (): Set<string> => {
  const files = new Set<string>();

  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  const commandsDir = path.join(ASSETS_DIR, 'commands');
  const skillsDir = path.join(ASSETS_DIR, 'skills');

  const addFilesFromDir = (dir: string): void => {
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((f) => files.add(f));
    }
  };

  addFilesFromDir(developersDir);
  addFilesFromDir(utilitiesDir);
  addFilesFromDir(commandsDir);
  addFilesFromDir(skillsDir); // group folder names, cleans up legacy nested installs
  // Flattened skill names (<group>-<action>) created by the current installer.
  listSkillsNested(skillsDir).forEach((s) => files.add(s.name));

  return files;
};

const uninstallDir = async (dir: string, label: string, manifest: Set<string>): Promise<void> => {
  const spinner = ora(`Uninstalling ${label}...`).start();

  const kitFiles = getKitFiles();
  const tracked = manifestNames(manifest, path.basename(dir));
  const items = listItems(dir);
  let removed = 0;

  for (const item of items) {
    const cleanName = item.name.endsWith(DISABLED_SUFFIX)
      ? item.name.slice(0, -DISABLED_SUFFIX.length)
      : item.name;
    if (kitFiles.has(cleanName) || item.isSymlink || tracked.has(cleanName)) {
      const result = removeItem(item.path);
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  if (removed > 0) {
    spinner.succeed(`Removed ${removed} ${label}`);
  } else {
    spinner.info(`No ${label} to remove`);
  }
};

const uninstallScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  console.log('');
  console.log(chalk.cyan(`>>> ${label} Uninstall`));
  if (scope === 'project') {
    console.log(chalk.gray(`    Target: ${process.cwd()}/.claude/`));
  }
  console.log('');

  const manifest = readInstallManifest(getClaudeDir(scope));

  await uninstallDir(getAgentsDir(scope), 'agents', manifest);
  if (scope === 'global') {
    await uninstallDir(getCommandsDir(scope), 'commands', manifest);
  }
  await uninstallDir(getSkillsDir(scope), 'skills', manifest);
  await uninstallDir(getArchitectureDir(scope), 'architecture', manifest);
  removeInstallManifest(getClaudeDir(scope));
  removeScopedConfig(scope, 'claude');

  console.log('');
  console.log(chalk.green(`✓ ${label} uninstall complete!`));
};

const getCodexManagedNames = (): { architecture: string[]; skills: string[] } => {
  const architecture: string[] = [];
  const skills: string[] = [];

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    fs.readdirSync(archDir).forEach((name) => architecture.push(name));
  }

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir).forEach((name) => skills.push(name)); // legacy group folders
    listSkillsNested(skillsDir).forEach((s) => skills.push(s.name)); // flattened skills
  }

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
  }

  for (const dirName of ['developers', 'utilities']) {
    const agentsDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (fs.existsSync(agentsDir)) {
      fs.readdirSync(agentsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
    }
  }

  return { architecture, skills };
};

const uninstallCodexScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  const targetDir = getEditorDir('codex', scope);
  const spinner = ora(`Uninstalling Codex assets from ${label.toLowerCase()} scope...`).start();
  const managed = getCodexManagedNames();
  const manifest = readInstallManifest(targetDir);

  let removed = 0;

  const archDir = path.join(targetDir, 'architecture');
  for (const name of [...managed.architecture, ...manifestNames(manifest, 'architecture')]) {
    const result = removeItem(path.join(archDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  const skillsDir = path.join(targetDir, 'skills');
  for (const name of [...managed.skills, ...manifestNames(manifest, 'skills')]) {
    const result = removeItem(path.join(skillsDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  removeInstallManifest(targetDir);
  removeScopedConfig(scope, 'codex');
  spinner.succeed(`Removed ${removed} Codex items from ${label.toLowerCase()} scope`);
  console.log(chalk.green(`✓ ${label} Codex uninstall complete!`));
};

const getAntigravityManagedNames = (): { architecture: string[]; skills: string[] } => {
  const architecture: string[] = [];
  const skills: string[] = [];

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    fs.readdirSync(archDir).forEach((name) => architecture.push(name));
  }

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    fs.readdirSync(skillsDir).forEach((name) => skills.push(name)); // legacy group folders
    listSkillsNested(skillsDir).forEach((s) => skills.push(s.name)); // flattened skills
  }

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
  }

  for (const dirName of ['developers', 'utilities']) {
    const agentsDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (fs.existsSync(agentsDir)) {
      fs.readdirSync(agentsDir).forEach((name) => skills.push(name.replace(/\.md$/, '')));
    }
  }

  return { architecture, skills };
};

const getCursorManagedNames = (): {
  architecture: string[];
  rules: string[];
  commands: string[];
  skills: string[];
} => {
  const architecture: string[] = [];
  const rules: string[] = [];
  const commands: string[] = [];
  const skills: string[] = [];

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    fs.readdirSync(archDir).forEach((name) => architecture.push(name));
  }

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    listSkillsNested(skillsDir).forEach((s) => skills.push(s.name));
  }

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    fs.readdirSync(commandsDir).forEach((name) => commands.push(name.replace(/\.md$/, '')));
  }

  for (const dirName of ['developers', 'utilities']) {
    const agentsDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (fs.existsSync(agentsDir)) {
      fs.readdirSync(agentsDir).forEach((name) => rules.push(name.replace(/\.md$/, '')));
    }
  }

  return { architecture, rules, commands, skills };
};

const uninstallCursorScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  const targetDir = getEditorDir('cursor', scope);
  const spinner = ora(`Uninstalling Cursor assets from ${label.toLowerCase()} scope...`).start();
  const managed = getCursorManagedNames();
  const manifest = readInstallManifest(targetDir);

  let removed = 0;

  const archDir = path.join(targetDir, 'architecture');
  const managedArch = new Set([...managed.architecture, ...manifestNames(manifest, 'architecture')]);
  for (const name of managedArch) {
    for (const candidate of [name, `${name}${DISABLED_SUFFIX}`]) {
      const result = removeItem(path.join(archDir, candidate));
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  const rulesDir = path.join(targetDir, 'rules');
  const managedRules = new Set([
    ...managed.rules.map((n) => `${n}${CURSOR_RULE_EXT}`),
    ...manifestNames(manifest, 'rules'),
  ]);
  for (const file of managedRules) {
    for (const suffix of ['', DISABLED_SUFFIX]) {
      const result = removeItem(path.join(rulesDir, `${file}${suffix}`));
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  const commandsDir = path.join(targetDir, 'commands');
  const managedCommands = new Set([
    ...managed.commands.map((n) => `${n}${MARKDOWN_EXT}`),
    ...manifestNames(manifest, 'commands'),
  ]);
  for (const file of managedCommands) {
    for (const suffix of ['', DISABLED_SUFFIX]) {
      const result = removeItem(path.join(commandsDir, `${file}${suffix}`));
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  const skillsDir = path.join(targetDir, 'skills');
  for (const name of [...managed.skills, ...manifestNames(manifest, 'skills')]) {
    for (const suffix of ['', DISABLED_SUFFIX]) {
      const result = removeItem(path.join(skillsDir, `${name}${suffix}`));
      if (result.status === 'removed') {
        removed++;
      }
    }
  }

  removeInstallManifest(targetDir);
  removeScopedConfig(scope, 'cursor');
  spinner.succeed(`Removed ${removed} Cursor items from ${label.toLowerCase()} scope`);
  console.log(chalk.green(`✓ ${label} Cursor uninstall complete!`));
};

const getDevinManagedNames = (): { architecture: string[]; skills: string[]; agents: string[] } => {
  const { architecture, skills } = getAntigravityManagedNames();
  const agents: string[] = [];
  for (const dirName of ['developers', 'utilities']) {
    const agentsDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (fs.existsSync(agentsDir)) {
      fs.readdirSync(agentsDir).forEach((name) => agents.push(name));
    }
  }
  return { architecture, skills, agents };
};

const uninstallDevinScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  const targetDir = getEditorDir('devin', scope);
  const spinner = ora(`Uninstalling Devin assets from ${label.toLowerCase()} scope...`).start();
  const managed = getDevinManagedNames();
  const manifest = readInstallManifest(targetDir);

  let removed = 0;

  const archDir = path.join(targetDir, 'architecture');
  for (const name of [...managed.architecture, ...manifestNames(manifest, 'architecture')]) {
    const result = removeItem(path.join(archDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  const skillsDir = path.join(targetDir, 'skills');
  for (const name of [...managed.skills, ...manifestNames(manifest, 'skills')]) {
    const result = removeItem(path.join(skillsDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  const agentsDir = path.join(targetDir, 'agents');
  for (const name of [...managed.agents, ...manifestNames(manifest, 'agents')]) {
    const result = removeItem(path.join(agentsDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  removeInstallManifest(targetDir);
  removeScopedConfig(scope, 'devin');
  spinner.succeed(`Removed ${removed} Devin items from ${label.toLowerCase()} scope`);
  console.log(chalk.green(`✓ ${label} Devin uninstall complete!`));
};

const uninstallAntigravityScope = async (scope: Scope): Promise<void> => {
  const label = scope === 'global' ? 'Global' : 'Project';
  const targetDir = getAntigravityDir(scope);
  const spinner = ora(`Uninstalling Antigravity assets from ${label.toLowerCase()} scope...`).start();
  const managed = getAntigravityManagedNames();
  const manifest = readInstallManifest(targetDir);

  let removed = 0;

  const archDir = path.join(targetDir, 'architecture');
  for (const name of [...managed.architecture, ...manifestNames(manifest, 'architecture')]) {
    const result = removeItem(path.join(archDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  const skillsDir = path.join(targetDir, 'skills');
  for (const name of [...managed.skills, ...manifestNames(manifest, 'skills')]) {
    const result = removeItem(path.join(skillsDir, name));
    if (result.status === 'removed') {
      removed++;
    }
  }

  removeInstallManifest(targetDir);
  removeScopedConfig(scope, 'antigravity');
  spinner.succeed(`Removed ${removed} Antigravity items from ${label.toLowerCase()} scope`);
  console.log(chalk.green(`✓ ${label} Antigravity uninstall complete!`));
};

const uninstallForOtherEditor = async (target: EditorTarget): Promise<void> => {
  const config = getEditorConfig(target);
  const spinner = ora(`Uninstalling from ${config.name}...`).start();

  const targetDir = getEditorDir(target, 'global');
  const manifest = readInstallManifest(targetDir);

  for (const name of manifestNames(manifest, 'architecture')) {
    removeItem(path.join(targetDir, 'architecture', name));
  }
  removeInstallManifest(targetDir);
  removeScopedConfig('global', target);

  if (config.rulesFile) {
    const rulesFilePath = path.join(targetDir, config.rulesFile);
    if (fs.existsSync(rulesFilePath)) {
      const result = removeItem(rulesFilePath);
      if (result.status === 'removed') {
        spinner.succeed(`Removed ${config.rulesFile} from ${config.name}`);
      } else {
        spinner.info(`No files to remove from ${config.name}`);
      }
    } else {
      spinner.info(`No files to remove from ${config.name}`);
    }
  }

  removeTarget(target);
};

const showTargetMenu = async (): Promise<EditorTarget> => {
  const installedTargets = getTargets();
  const availableTargets = installedTargets.length > 0 ? installedTargets : (['claude', 'codex', 'cursor', 'antigravity', 'devin'] as EditorTarget[]);

  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Select target editor to uninstall:',
      choices: availableTargets.map((value) => ({
        name: EDITOR_CONFIGS[value].name,
        value,
      })),
    },
  ]);

  return target;
};

const showInteractiveMenu = async (
  target: 'claude' | 'codex' | 'cursor' | 'antigravity' | 'devin'
): Promise<'global' | 'project' | 'all'> => {
  const pathByTarget: Record<typeof target, { global: string; project: string }> = {
    claude: { global: '~/.claude/', project: './.claude/' },
    codex: { global: '~/.codex/', project: './.codex/' },
    cursor: { global: '~/.cursor/', project: './.cursor/' },
    antigravity: { global: '~/.gemini/', project: './.gemini/' },
    devin: { global: '~/.config/devin/', project: './.devin/' },
  };
  const globalPath = pathByTarget[target].global;
  const projectPath = pathByTarget[target].project;

  const { uninstallType } = await inquirer.prompt([
    {
      type: 'list',
      name: 'uninstallType',
      message: 'Where would you like to uninstall from?',
      choices: [
        { name: `Global (${globalPath})`, value: 'global' },
        { name: `Project (${projectPath})`, value: 'project' },
        { name: 'Both', value: 'all' },
      ],
    },
  ]);

  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Are you sure you want to uninstall?',
      default: false,
    },
  ]);

  if (!confirm) {
    console.log(chalk.yellow('Uninstall cancelled.'));
    process.exit(0);
  }

  return uninstallType;
};

export const uninstallCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  const targets = options.target ? [options.target] : [await showTargetMenu()];

  for (const target of targets) {
    if (target === 'claude' || target === 'codex' || target === 'cursor' || target === 'antigravity' || target === 'devin') {
      let uninstallType: 'global' | 'project' | 'all';

      if (options.global) {
        uninstallType = 'global';
      } else if (options.project) {
        uninstallType = 'project';
      } else if (options.all) {
        uninstallType = 'all';
      } else {
        uninstallType = await showInteractiveMenu(target);
      }

      const scopedUninstall = async (s: Scope): Promise<void> => {
        if (target === 'claude') await uninstallScope(s);
        else if (target === 'codex') await uninstallCodexScope(s);
        else if (target === 'cursor') await uninstallCursorScope(s);
        else if (target === 'devin') await uninstallDevinScope(s);
        else await uninstallAntigravityScope(s);
      };

      switch (uninstallType) {
        case 'global':
          await scopedUninstall('global');
          break;
        case 'project':
          await scopedUninstall('project');
          break;
        case 'all':
          await scopedUninstall('global');
          await scopedUninstall('project');
          break;
      }

      removeTarget(target);
    } else {
      await uninstallForOtherEditor(target);
    }
  }
};
