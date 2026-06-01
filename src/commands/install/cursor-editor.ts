import chalk from 'chalk';
import path from 'path';
import fs from 'fs';
import type { FileResult, Scope } from '../../types.js';
import {
  ASSETS_DIR,
  ensureDir,
  getEditorConfig,
  getEditorDir,
  getFiles,
  listSkillsNested,
} from '../../utils/symlink.js';
import { CURSOR_RULE_EXT } from '../../utils/editor-constants.js';
import { printSummary } from './print.js';
import { extractFrontmatter, rewriteCursorPaths } from './transform.js';
import { buildCursorRuleMdc } from './cursor-transform.js';
import { writeIfChanged } from './write-if-changed.js';

const installCursorArchitecture = (targetDir: string): FileResult[] => {
  const archDir = path.join(ASSETS_DIR, 'architecture');
  const targetArchDir = path.join(targetDir, 'architecture');
  ensureDir(targetArchDir);

  if (!fs.existsSync(archDir)) {
    return [];
  }

  return getFiles(archDir).map((file) => {
    const content = rewriteCursorPaths(fs.readFileSync(file, 'utf-8'));
    return writeIfChanged(path.join(targetArchDir, path.basename(file)), content, path.basename(file));
  });
};

const installCursorSkills = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const targetSkillsDir = path.join(targetDir, 'skills');
  ensureDir(targetSkillsDir);

  const skillsDir = path.join(ASSETS_DIR, 'skills');
  if (fs.existsSync(skillsDir)) {
    for (const skill of listSkillsNested(skillsDir)) {
      const skillTargetDir = path.join(targetSkillsDir, skill.name);
      ensureDir(skillTargetDir);

      let status: FileResult['status'] = 'created';
      for (const file of getFiles(skill.path, 8)) {
        const targetFile = path.join(skillTargetDir, path.relative(skill.path, file));
        ensureDir(path.dirname(targetFile));
        const content = rewriteCursorPaths(fs.readFileSync(file, 'utf-8'));
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
      results.push({ status, name: skill.name });
    }
  }

  return results;
};

const installCursorCommands = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const commandsDir = path.join(ASSETS_DIR, 'commands');
  const targetCommandsDir = path.join(targetDir, 'commands');
  ensureDir(targetCommandsDir);

  if (!fs.existsSync(commandsDir)) {
    return results;
  }

  for (const file of getFiles(commandsDir)) {
    const name = path.basename(file, '.md');
    const content = rewriteCursorPaths(fs.readFileSync(file, 'utf-8'));
    results.push(writeIfChanged(path.join(targetCommandsDir, `${name}.md`), content, name));
  }

  return results;
};

const installCursorRules = (targetDir: string): FileResult[] => {
  const results: FileResult[] = [];
  const rulesDir = path.join(targetDir, 'rules');
  ensureDir(rulesDir);

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
          ? `MoiCle developer persona for ${name}. Use when the task matches this stack specialist.`
          : `MoiCle utility persona for ${name}. Use when the task matches this specialist.`);
      const body = rewriteCursorPaths(parsed.body.trimStart());
      const content = buildCursorRuleMdc(description, body);
      results.push(writeIfChanged(path.join(rulesDir, `${name}${CURSOR_RULE_EXT}`), content, name));
    }
  }

  return results;
};

export const installCursorScope = async (scope: Scope): Promise<void> => {
  const isGlobal = scope === 'global';
  const label = isGlobal ? 'Global' : 'Project';
  const name = getEditorConfig('cursor').name;
  const baseDir = getEditorDir('cursor', scope);

  console.log('');
  console.log(chalk.cyan(`>>> ${label} ${name} Installation`));
  console.log(chalk.gray(`    Target: ${baseDir}`));
  console.log('');

  ensureDir(baseDir);

  const archResults = installCursorArchitecture(baseDir);
  console.log(chalk.green(`  ✓ Architecture installed to ${chalk.cyan(path.join(baseDir, 'architecture'))}`));
  printSummary(archResults);

  const ruleResults = installCursorRules(baseDir);
  console.log(chalk.green(`  ✓ Agent rules installed to ${chalk.cyan(path.join(baseDir, 'rules'))}`));
  printSummary(ruleResults);

  const commandResults = installCursorCommands(baseDir);
  console.log(chalk.green(`  ✓ Commands installed to ${chalk.cyan(path.join(baseDir, 'commands'))}`));
  printSummary(commandResults);

  const skillResults = installCursorSkills(baseDir);
  console.log(chalk.green(`  ✓ Skills installed to ${chalk.cyan(path.join(baseDir, 'skills'))}`));
  printSummary(skillResults);

  console.log('');
  console.log(chalk.green(`✓ ${label} ${name} installation complete!`));
};
