import chalk from 'chalk';
import inquirer from 'inquirer';
import path from 'path';
import fs from 'fs';
import type { CommandOptions, EditorTarget, FileResult, Scope } from '../types.js';
import {
  ASSETS_DIR,
  EDITOR_CONFIGS,
  isSymlinkSupported,
  ensureDir,
  createSymlink,
  copyFile,
  copyDir,
  getAgentsDir,
  getCommandsDir,
  getSkillsDir,
  getArchitectureDir,
  getClaudeDir,
  getCodexDir,
  getEditorDir,
  getEditorConfig,
  getFiles,
  getDirs,
  mergeAgentsToFile,
} from '../utils/symlink.js';
import { addTarget } from '../utils/config.js';

const printHeader = (): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   MoiCle Installer'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');
};

const printSummary = (results: FileResult[]): void => {
  const created = results.filter((r) => r.status === 'created').length;
  const updated = results.filter((r) => r.status === 'updated').length;
  const exists = results.filter((r) => r.status === 'exists').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const errors = results.filter((r) => r.status === 'error').length;

  if (created > 0) console.log(chalk.green(`  Created: ${created}`));
  if (updated > 0) console.log(chalk.yellow(`  Updated: ${updated}`));
  if (exists > 0) console.log(chalk.gray(`  Already exists: ${exists}`));
  if (skipped > 0) console.log(chalk.gray(`  Skipped: ${skipped}`));
  if (errors > 0) console.log(chalk.red(`  Errors: ${errors}`));
};

const installAgents = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const developersDir = path.join(ASSETS_DIR, 'agents', 'developers');
  if (fs.existsSync(developersDir)) {
    const files = getFiles(developersDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  const utilitiesDir = path.join(ASSETS_DIR, 'agents', 'utilities');
  if (fs.existsSync(utilitiesDir)) {
    const files = getFiles(utilitiesDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  console.log(chalk.green(`  ✓ Agents installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installCommands = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    const files = getFiles(commandsDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  console.log(chalk.green(`  ✓ Commands installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installSkills = async (targetDir: string, useSymlink = true): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    const dirs = getDirs(skillsDir);
    for (const dir of dirs) {
      const target = path.join(targetDir, path.basename(dir));
      if (useSymlink) {
        const result = createSymlink(dir, target);
        results.push(result);
      } else {
        const result = copyDir(dir, target);
        results.push(result);
      }
    }
  }

  console.log(chalk.green(`  ✓ Skills installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installArchitecture = async (
  targetDir: string,
  useSymlink = true
): Promise<FileResult[]> => {
  const results: FileResult[] = [];

  ensureDir(targetDir);

  const archDir = path.join(ASSETS_DIR, 'architecture');
  if (fs.existsSync(archDir)) {
    const files = getFiles(archDir);
    for (const file of files) {
      const target = path.join(targetDir, path.basename(file));
      const result = useSymlink ? createSymlink(file, target) : copyFile(file, target);
      results.push(result);
    }
  }

  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(targetDir)}`));
  printSummary(results);

  return results;
};

const installScope = async (scope: Scope, useSymlink: boolean): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const targetPath = isGlobal ? '~/.claude/' : `${process.cwd()}/.claude/`;

  console.log('');
  console.log(chalk.cyan(`>>> ${label} Installation`));
  console.log(chalk.gray(`    Target: ${targetPath}`));
  console.log('');

  const claudeDir = getClaudeDir(scope);
  ensureDir(claudeDir);

  await installAgents(getAgentsDir(scope), useSymlink);
  if (isGlobal) {
    await installCommands(getCommandsDir(scope), useSymlink);
  }
  await installSkills(getSkillsDir(scope), useSymlink);
  await installArchitecture(getArchitectureDir(scope), useSymlink);

  if (!isGlobal) {
    console.log(chalk.gray('    Note: Commands are installed globally only'));
  }

  console.log('');
  console.log(chalk.green(`✓ ${label} installation complete!`));
};

const rewriteClaudePaths = (content: string, target: 'claude' | 'codex'): string => {
  if (target === 'claude') {
    return content;
  }

  return content
    .replace(/~\/\.claude\//g, '~/.codex/')
    .replace(/\.claude\//g, '.codex/')
    .replace(/Claude Code/g, 'Codex CLI')
    .replace(/CLAUDE\.md/g, 'AGENTS.md');
};

const ensureCodexSkillDir = (baseDir: string, name: string): string => {
  const skillDir = path.join(baseDir, name);
  ensureDir(skillDir);
  return skillDir;
};

const installCodexSkillFolder = (
  sourceDir: string,
  targetSkillsDir: string
): FileResult => {
  const skillName = path.basename(sourceDir);
  const targetDir = ensureCodexSkillDir(targetSkillsDir, skillName);
  const sourceFiles = getFiles(sourceDir, 8);

  let status: FileResult['status'] = 'created';
  for (const file of sourceFiles) {
    const relativePath = path.relative(sourceDir, file);
    const targetFile = path.join(targetDir, relativePath);
    ensureDir(path.dirname(targetFile));

    const content = rewriteClaudePaths(fs.readFileSync(file, 'utf-8'), 'codex');
    const existed = fs.existsSync(targetFile);
    if (existed && fs.readFileSync(targetFile, 'utf-8') === content) {
      status = status === 'created' ? 'exists' : status;
      continue;
    }

    fs.writeFileSync(targetFile, content);
    if (existed) {
      status = 'updated';
    }
  }

  return { status, name: skillName };
};

const buildGeneratedCodexSkill = (
  name: string,
  description: string,
  body: string
): string => `---
name: ${name}
description: ${description}
---

${body}
`;

const extractFrontmatter = (
  content: string
): { frontmatter: string | null; body: string; description?: string } => {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) {
    return { frontmatter: null, body: content };
  }

  const frontmatter = match[1];
  const body = match[2];
  const descriptionMatch = frontmatter.match(/^description:\s*(.+)$/m);

  return {
    frontmatter,
    body,
    description: descriptionMatch?.[1]?.trim(),
  };
};

const installGeneratedCodexSkill = (
  targetSkillsDir: string,
  name: string,
  description: string,
  body: string
): FileResult => {
  const skillDir = ensureCodexSkillDir(targetSkillsDir, name);
  const targetFile = path.join(skillDir, 'SKILL.md');
  const content = buildGeneratedCodexSkill(name, description, rewriteClaudePaths(body, 'codex'));

  if (fs.existsSync(targetFile)) {
    if (fs.readFileSync(targetFile, 'utf-8') === content) {
      return { status: 'exists', name };
    }
    fs.writeFileSync(targetFile, content);
    return { status: 'updated', name };
  }

  fs.writeFileSync(targetFile, content);
  return { status: 'created', name };
};

const installDirectCodexSkill = (
  targetSkillsDir: string,
  name: string,
  content: string
): FileResult => {
  const skillDir = ensureCodexSkillDir(targetSkillsDir, name);
  const targetFile = path.join(skillDir, 'SKILL.md');
  const rewritten = rewriteClaudePaths(content, 'codex');

  if (fs.existsSync(targetFile)) {
    if (fs.readFileSync(targetFile, 'utf-8') === rewritten) {
      return { status: 'exists', name };
    }
    fs.writeFileSync(targetFile, rewritten);
    return { status: 'updated', name };
  }

  fs.writeFileSync(targetFile, rewritten);
  return { status: 'created', name };
};

const installCodexArchitecture = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');

  ensureDir(targetArchDir);

  if (!fs.existsSync(archDir)) {
    return results;
  }

  for (const file of getFiles(archDir)) {
    const targetFile = path.join(targetArchDir, path.basename(file));
    const content = rewriteClaudePaths(fs.readFileSync(file, 'utf-8'), 'codex');
    if (fs.existsSync(targetFile)) {
      if (fs.readFileSync(targetFile, 'utf-8') === content) {
        results.push({ status: 'exists', name: path.basename(file) });
        continue;
      }
      fs.writeFileSync(targetFile, content);
      results.push({ status: 'updated', name: path.basename(file) });
      continue;
    }

    fs.writeFileSync(targetFile, content);
    results.push({ status: 'created', name: path.basename(file) });
  }

  return results;
};

const installCodexSkills = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const targetSkillsDir = path.join(targetDir, 'skills');
  ensureDir(targetSkillsDir);

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const dir of getDirs(skillsDir)) {
      results.push(installCodexSkillFolder(dir, targetSkillsDir));
    }
  }

  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    for (const file of getFiles(commandsDir)) {
      const name = path.basename(file, '.md');
      const content = fs.readFileSync(file, 'utf-8');
      results.push(installDirectCodexSkill(targetSkillsDir, name, content));
    }
  }

  const agentDirs = ['developers', 'utilities'];
  for (const dirName of agentDirs) {
    const sourceDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (!fs.existsSync(sourceDir)) {
      continue;
    }

    for (const file of getFiles(sourceDir)) {
      const name = path.basename(file, '.md');
      const rawContent = fs.readFileSync(file, 'utf-8');
      const parsed = extractFrontmatter(rawContent);
      const description = parsed.description
        ? parsed.description
        : dirName === 'developers'
          ? `Imported MoiCle developer persona for ${name}. Use when the task matches this stack specialist.`
          : `Imported MoiCle utility persona for ${name}. Use when the task matches this specialist.`;

      results.push(installGeneratedCodexSkill(targetSkillsDir, name, description, parsed.body.trimStart()));
    }
  }

  return results;
};

const installCodexScope = async (scope: Scope): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const targetPath = isGlobal ? '~/.codex/' : `${process.cwd()}/.codex/`;

  console.log('');
  console.log(chalk.cyan(`>>> ${label} Codex Installation`));
  console.log(chalk.gray(`    Target: ${targetPath}`));
  console.log('');

  const codexDir = getCodexDir(scope);
  ensureDir(codexDir);

  const archResults = installCodexArchitecture(codexDir);
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(path.join(codexDir, 'architecture'))}`));
  printSummary(archResults);

  const skillResults = installCodexSkills(codexDir);
  console.log(chalk.green(`  ✓ Codex skills installed to ${chalk.cyan(path.join(codexDir, 'skills'))}`));
  printSummary(skillResults);

  console.log('');
  console.log(chalk.green(`✓ ${label} Codex installation complete!`));
};

const showTargetMenu = async (): Promise<EditorTarget> => {
  const { target } = await inquirer.prompt([
    {
      type: 'list',
      name: 'target',
      message: 'Which editor would you like to configure?',
      choices: [
        { name: 'Claude Code', value: 'claude' },
        { name: 'Codex CLI', value: 'codex' },
      ],
    },
  ]);

  return target;
};

const showInteractiveMenu = async (
  target: 'claude' | 'codex'
): Promise<'global' | 'project' | 'all'> => {
  const globalPath = target === 'claude' ? '~/.claude/' : '~/.codex/';
  const projectPath = target === 'claude' ? './.claude/' : './.codex/';

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

const installArchitectureForEditor = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');

  ensureDir(targetArchDir);

  if (fs.existsSync(archDir)) {
    const files = getFiles(archDir);
    for (const file of files) {
      const target = path.join(targetArchDir, path.basename(file));
      const result = copyFile(file, target);
      results.push(result);
    }
  }

  return results;
};

const installForOtherEditor = async (
  target: EditorTarget,
  scope: Scope
): Promise<FileResult[]> => {
  const config = getEditorConfig(target);
  const results: FileResult[] = [];

  console.log('');
  console.log(chalk.cyan(`>>> ${config.name} Installation`));
  console.log(chalk.gray(`    Target: ${getEditorDir(target, scope)}`));
  console.log('');

  const targetDir = getEditorDir(target, scope);
  ensureDir(targetDir);

  const archResults = installArchitectureForEditor(targetDir);
  results.push(...archResults);
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(targetDir + '/architecture')}`));

  if (config.rulesFile) {
    const rulesFilePath = path.join(targetDir, config.rulesFile);
    const result = mergeAgentsToFile(rulesFilePath, target);
    results.push(result);
    console.log(chalk.green(`  ✓ Agents merged to ${chalk.cyan(config.rulesFile)}`));
  }

  printSummary(results);

  console.log('');
  console.log(chalk.green(`✓ ${config.name} installation complete!`));

  return results;
};

export const installCommand = async (options: CommandOptions): Promise<void> => {
  printHeader();

  if (!fs.existsSync(ASSETS_DIR)) {
    console.log(chalk.red('Error: Assets directory not found.'));
    console.log(chalk.gray(`Expected: ${ASSETS_DIR}`));
    process.exit(1);
  }

  let targets: EditorTarget[] = [];

  let useSymlink: boolean;
  if (options.symlink === true) {
    useSymlink = true;
  } else if (options.symlink === false) {
    useSymlink = false;
  } else {
    useSymlink = isSymlinkSupported();
  }

  const strategyLabel = useSymlink ? 'symlinks' : 'file copy';
  const isAutoDetected = options.symlink === undefined;
  if (isAutoDetected) {
    console.log(chalk.gray(`  Auto-detected file strategy: ${strategyLabel} (${process.platform})`));
  } else {
    console.log(chalk.gray(`  File strategy: ${strategyLabel} (user override)`));
  }
  console.log('');

  if (options.target) {
    targets = [options.target];
  } else {
    targets = [await showTargetMenu()];
  }

  for (const target of targets) {
    addTarget(target);

    if (target === 'claude' || target === 'codex') {
      let installType: 'global' | 'project' | 'all';

      if (options.global) {
        installType = 'global';
      } else if (options.project) {
        installType = 'project';
      } else if (options.all) {
        installType = 'all';
      } else {
        installType = await showInteractiveMenu(target);
      }

      switch (installType) {
        case 'global':
          if (target === 'claude') {
            await installScope('global', useSymlink);
          } else {
            await installCodexScope('global');
          }
          break;
        case 'project':
          if (target === 'claude') {
            await installScope('project', false);
          } else {
            await installCodexScope('project');
          }
          break;
        case 'all':
          if (target === 'claude') {
            await installScope('global', useSymlink);
            await installScope('project', false);
          } else {
            await installCodexScope('global');
            await installCodexScope('project');
          }
          break;
      }
    } else {
      await installForOtherEditor(target, 'global');
    }
  }

  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Usage'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');

  if (targets.includes('claude')) {
    console.log(chalk.bold('  Claude Code:'));
    console.log('  Agents:');
    console.log(chalk.gray('    @clean-architect   Clean Architecture expert'));
    console.log(chalk.gray('    @code-reviewer     Code review expert'));
    console.log(chalk.gray('    @test-writer       Test writing expert'));
    console.log('');
    console.log('  Commands:');
    console.log(chalk.gray('    /bootstrap         Create new project'));
    console.log(chalk.gray('    /brainstorm        Brainstorm ideas'));
    console.log(chalk.gray('    /doc               Generate documentation'));
    console.log('');
    console.log('  Skills (auto-triggered):');
    console.log(chalk.gray('    new-feature        Feature development'));
    console.log(chalk.gray('    hotfix             Bug fix with rollback'));
    console.log('');
  }

  if (targets.includes('codex')) {
    console.log(chalk.bold('  Codex CLI:'));
    console.log(chalk.gray('    Skills installed under ~/.codex/skills or ./.codex/skills'));
    console.log(chalk.gray('    Architecture docs installed under ~/.codex/architecture or ./.codex/architecture'));
    console.log(chalk.gray('    Restart Codex after global skill installation to pick up new skills'));
    console.log('');
  }

  const otherTargets = targets.filter((t) => t !== 'claude' && t !== 'codex');
  if (otherTargets.length > 0) {
    console.log(chalk.bold('  Other Editors:'));
    for (const target of otherTargets) {
      const config = EDITOR_CONFIGS[target];
      console.log(chalk.gray(`    ${config.name}: Agents merged into ${config.rulesFile}`));
    }
    console.log('');
  }
};
