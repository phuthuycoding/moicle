import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import type { FileResult, Scope } from '../../types.js';
import { ASSETS_DIR, ensureDir, getEditorConfig, getEditorDir, getFiles, listSkillsNested } from '../../utils/symlink.js';
import { printSummary } from './print.js';
import { writeIfChanged } from './write-if-changed.js';
import {
  type SkillEditorTarget,
  rewriteClaudePaths,
  extractFrontmatter,
  buildGeneratedSkill,
} from './transform.js';

/**
 * Skill-based editors (Codex, Antigravity). Both consume a flat `skills/` folder
 * of rewritten SKILL.md files plus an `architecture/` folder. The two editors are
 * identical apart from the rewrite target, so everything here is parameterized by
 * `target` — there is no per-editor branching.
 */

const ensureSkillDir = (baseDir: string, name: string): string => {
  const skillDir = path.join(baseDir, name);
  ensureDir(skillDir);
  return skillDir;
};

/** Copy a Claude skill folder (SKILL.md + assets) with paths rewritten. */
const installSkillFolder = (
  sourceDir: string,
  targetSkillsDir: string,
  target: SkillEditorTarget,
  skillName: string = path.basename(sourceDir)
): FileResult => {
  const targetDir = ensureSkillDir(targetSkillsDir, skillName);

  let status: FileResult['status'] = 'created';
  for (const file of getFiles(sourceDir, 8)) {
    const targetFile = path.join(targetDir, path.relative(sourceDir, file));
    ensureDir(path.dirname(targetFile));

    const content = rewriteClaudePaths(fs.readFileSync(file, 'utf-8'), target);
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

/** Wrap an agent/command body as a generated SKILL.md. */
const installGeneratedSkill = (
  targetSkillsDir: string,
  name: string,
  description: string,
  body: string,
  target: SkillEditorTarget
): FileResult => {
  const skillDir = ensureSkillDir(targetSkillsDir, name);
  const content = buildGeneratedSkill(name, description, rewriteClaudePaths(body, target));
  return writeIfChanged(path.join(skillDir, 'SKILL.md'), content, name);
};

/** Copy a command file straight into its own SKILL.md (frontmatter already present). */
const installDirectSkill = (
  targetSkillsDir: string,
  name: string,
  content: string,
  target: SkillEditorTarget
): FileResult => {
  const skillDir = ensureSkillDir(targetSkillsDir, name);
  return writeIfChanged(path.join(skillDir, 'SKILL.md'), rewriteClaudePaths(content, target), name);
};

const installEditorArchitecture = (targetDir: string, target: SkillEditorTarget): FileResult[] => {
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');
  ensureDir(targetArchDir);

  if (!fs.existsSync(archDir)) {
    return [];
  }

  return getFiles(archDir).map((file) => {
    const content = rewriteClaudePaths(fs.readFileSync(file, 'utf-8'), target);
    return writeIfChanged(path.join(targetArchDir, path.basename(file)), content, path.basename(file));
  });
};

const installEditorSkills = (targetDir: string, target: SkillEditorTarget): FileResult[] => {
  const results: FileResult[] = [];
  const targetSkillsDir = path.join(targetDir, 'skills');
  ensureDir(targetSkillsDir);

  // 1. Skill folders → copied verbatim (paths rewritten). Nested groups are
  //    flattened to a single-level "<group>-<action>" skill folder.
  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const skill of listSkillsNested(skillsDir)) {
      results.push(installSkillFolder(skill.path, targetSkillsDir, target, skill.name));
    }
  }

  // 2. Commands → each becomes a SKILL.md (frontmatter already present).
  const commandsDir = path.join(ASSETS_DIR, 'commands');
  if (fs.existsSync(commandsDir)) {
    for (const file of getFiles(commandsDir)) {
      const name = path.basename(file, '.md');
      results.push(installDirectSkill(targetSkillsDir, name, fs.readFileSync(file, 'utf-8'), target));
    }
  }

  // 3. Agent personas → wrapped as generated SKILL.md.
  for (const dirName of ['developers', 'utilities'] as const) {
    const sourceDir = path.join(ASSETS_DIR, 'agents', dirName);
    if (!fs.existsSync(sourceDir)) {
      continue;
    }
    for (const file of getFiles(sourceDir)) {
      const name = path.basename(file, '.md');
      const parsed = extractFrontmatter(fs.readFileSync(file, 'utf-8'));
      const description =
        parsed.description ??
        (dirName === 'developers'
          ? `Imported MoiCle developer persona for ${name}. Use when the task matches this stack specialist.`
          : `Imported MoiCle utility persona for ${name}. Use when the task matches this specialist.`);
      results.push(installGeneratedSkill(targetSkillsDir, name, description, parsed.body.trimStart(), target));
    }
  }

  return results;
};

export const installSkillEditorScope = async (scope: Scope, target: SkillEditorTarget): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const name = getEditorConfig(target).name;
  const baseDir = getEditorDir(target, scope);

  console.log('');
  console.log(chalk.cyan(`>>> ${label} ${name} Installation`));
  console.log(chalk.gray(`    Target: ${baseDir}`));
  console.log('');

  ensureDir(baseDir);

  const archResults = installEditorArchitecture(baseDir, target);
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(path.join(baseDir, 'architecture'))}`));
  printSummary(archResults);

  const skillResults = installEditorSkills(baseDir, target);
  console.log(chalk.green(`  ✓ ${name} skills installed to ${chalk.cyan(path.join(baseDir, 'skills'))}`));
  printSummary(skillResults);

  console.log('');
  console.log(chalk.green(`✓ ${label} ${name} installation complete!`));
};
