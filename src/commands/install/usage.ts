import chalk from 'chalk';
import path from 'path';
import type { EditorTarget } from '../../types.js';
import { ASSETS_DIR, EDITOR_CONFIGS, getFiles, listSkillsNested } from '../../utils/symlink.js';

/**
 * Final "Usage" banner. Counts are computed from assets/ at print time so the
 * post-install summary can never drift from what was actually installed.
 */

const agentCount = (): number =>
  getFiles(path.join(ASSETS_DIR, 'agents', 'developers')).length +
  getFiles(path.join(ASSETS_DIR, 'agents', 'utilities')).length;

const commandCount = (): number => getFiles(path.join(ASSETS_DIR, 'commands')).length;

const skillCount = (): number => listSkillsNested(path.join(ASSETS_DIR, 'skills')).length;

const archCount = (): number => getFiles(path.join(ASSETS_DIR, 'architecture')).length;

const printClaudeUsage = (): void => {
  console.log(chalk.bold('  Claude Code:'));
  console.log(`  Agents (${agentCount()}):`);
  console.log(chalk.gray('    Developers   @flutter-mobile-dev, @go-backend-dev, @laravel-backend-dev,'));
  console.log(chalk.gray('                 @nodejs-backend-dev, @react-frontend-dev, @remix-fullstack-dev'));
  console.log(chalk.gray('    Utilities    @api-designer, @brainstormer, @clean-architect, @code-reviewer,'));
  console.log(chalk.gray('                 @db-designer, @devops, @docs-writer, @perf-optimizer, @refactor,'));
  console.log(chalk.gray('                 @researcher, @security-audit, @test-writer'));
  console.log('');
  console.log(`  Commands (${commandCount()}):`);
  console.log(chalk.gray('    /bootstrap         Create new project'));
  console.log(chalk.gray('    /marketing         Go-to-market plan'));
  console.log('');
  console.log(`  Skills (${skillCount()}, auto-triggered):`);
  console.log(chalk.gray('    /feature-build    new, refactor, api, deprecate, track'));
  console.log(chalk.gray('    /fix-*            bug (quick, deep), incident'));
  console.log(chalk.gray('    /review-code      self, pr, architect, tdd, address'));
  console.log(chalk.gray('    /research-explore web, spike, onboarding'));
  console.log(chalk.gray('    /docs-sync        single, full'));
  console.log(chalk.gray('    /marketing-*      content (strategy, post), brand (logo, video)'));
  console.log(chalk.gray('    /challenge, /cleanup'));
  console.log('');
  console.log(chalk.gray('    Run "moicle list" to see everything installed.'));
  console.log('');
};

/** Codex & Antigravity: everything ships as SKILL.md (agents + commands + skills). */
const printSkillEditorUsage = (target: 'codex' | 'antigravity'): void => {
  const name = EDITOR_CONFIGS[target].name;
  const home = target === 'codex' ? '~/.codex' : '~/.gemini';
  const local = target === 'codex' ? './.codex' : './.gemini';
  console.log(chalk.bold(`  ${name}:`));
  console.log(chalk.gray(`    MoiCle's ${agentCount()} agents, ${commandCount()} commands & ${skillCount()} skills installed as SKILL.md files`));
  console.log(chalk.gray(`    Skills under ${home}/skills or ${local}/skills`));
  console.log(chalk.gray(`    Architecture docs under ${home}/architecture or ${local}/architecture`));
  if (target === 'codex') {
    console.log(chalk.gray('    Restart Codex after global skill installation to pick up new skills'));
  }
  console.log('');
};

const printDevinUsage = (): void => {
  console.log(chalk.bold('  Devin CLI:'));
  console.log(chalk.gray(`    Agents (${agentCount()})          ~/.config/devin/agents/ or ./.devin/agents/ (native subagent profiles)`));
  console.log(chalk.gray(`    Skills (${skillCount() + commandCount()})         ~/.config/devin/skills/ or ./.devin/skills/ (incl. commands as skills)`));
  console.log(chalk.gray(`    Architecture (${archCount()})     ~/.config/devin/architecture/ or ./.devin/architecture/`));
  console.log(chalk.gray('    Ask Devin to use a profile by name, or invoke skills with /skill-name'));
  console.log('');
};

const printCursorUsage = (): void => {
  console.log(chalk.bold('  Cursor:'));
  console.log(chalk.gray(`    Rules (${agentCount()} agents)     ~/.cursor/rules/ or ./.cursor/rules/`));
  console.log(chalk.gray(`    Commands (${commandCount()})          ~/.cursor/commands/ or ./.cursor/commands/`));
  console.log(chalk.gray(`    Skills (${skillCount()})           ~/.cursor/skills/ or ./.cursor/skills/`));
  console.log(chalk.gray(`    Architecture (${archCount()})     ~/.cursor/architecture/ or ./.cursor/architecture/`));
  console.log(chalk.gray('    Use @agent-name in chat or slash commands from the command palette'));
  console.log('');
};

export const printUsage = (targets: EditorTarget[]): void => {
  console.log('');
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log(chalk.cyan('   Usage'));
  console.log(chalk.cyan('════════════════════════════════════════'));
  console.log('');

  if (targets.includes('claude')) {
    printClaudeUsage();
  }
  if (targets.includes('codex')) {
    printSkillEditorUsage('codex');
  }
  if (targets.includes('antigravity')) {
    printSkillEditorUsage('antigravity');
  }
  if (targets.includes('cursor')) {
    printCursorUsage();
  }
  if (targets.includes('devin')) {
    printDevinUsage();
  }

  const rulesFileTargets = targets.filter((t) => t === 'windsurf');
  if (rulesFileTargets.length > 0) {
    console.log(chalk.bold('  Rules-file Editors:'));
    for (const target of rulesFileTargets) {
      const config = EDITOR_CONFIGS[target];
      console.log(chalk.gray(`    ${config.name}: ${agentCount()} agents merged into ${config.rulesFile} + architecture docs`));
    }
    console.log('');
  }
};
