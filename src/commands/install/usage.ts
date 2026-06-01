import chalk from 'chalk';
import type { EditorTarget } from '../../types.js';
import { EDITOR_CONFIGS } from '../../utils/symlink.js';

/**
 * Final "Usage" banner. Counts/names are kept in sync with assets/ here so the
 * post-install summary never drifts from what was actually installed.
 */

const printClaudeUsage = (): void => {
  console.log(chalk.bold('  Claude Code:'));
  console.log('  Agents (16):');
  console.log(chalk.gray('    Developers   @flutter-mobile-dev, @go-backend-dev, @laravel-backend-dev,'));
  console.log(chalk.gray('                 @nodejs-backend-dev, @react-frontend-dev, @remix-fullstack-dev'));
  console.log(chalk.gray('    Utilities    @api-designer, @clean-architect, @code-reviewer, @db-designer,'));
  console.log(chalk.gray('                 @devops, @docs-writer, @perf-optimizer, @refactor,'));
  console.log(chalk.gray('                 @security-audit, @test-writer'));
  console.log('');
  console.log('  Commands (4):');
  console.log(chalk.gray('    /bootstrap         Create new project'));
  console.log(chalk.gray('    /brainstorm        Brainstorm ideas'));
  console.log(chalk.gray('    /doc               Generate documentation'));
  console.log(chalk.gray('    /marketing         Go-to-market plan'));
  console.log('');
  console.log('  Skills (21, auto-triggered, prefixed /group-action):');
  console.log(chalk.gray('    /feature-*    new, refactor, api, deprecate'));
  console.log(chalk.gray('    /fix-*        hotfix, root-cause, incident, pr-comment'));
  console.log(chalk.gray('    /review-*     branch, pr, architect, tdd'));
  console.log(chalk.gray('    /research-*   web, spike, onboarding'));
  console.log(chalk.gray('    /docs-*       write, sync'));
  console.log(chalk.gray('    /marketing-*  content, seo-blog, logo, video'));
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
  console.log(chalk.gray(`    MoiCle's 16 agents, 4 commands & 21 skills installed as SKILL.md files`));
  console.log(chalk.gray(`    Skills under ${home}/skills or ${local}/skills`));
  console.log(chalk.gray(`    Architecture docs under ${home}/architecture or ${local}/architecture`));
  if (target === 'codex') {
    console.log(chalk.gray('    Restart Codex after global skill installation to pick up new skills'));
  }
  console.log('');
};

const printCursorUsage = (): void => {
  console.log(chalk.bold('  Cursor:'));
  console.log(chalk.gray('    Rules (16 agents)     ~/.cursor/rules/ or ./.cursor/rules/'));
  console.log(chalk.gray('    Commands (4)          ~/.cursor/commands/ or ./.cursor/commands/'));
  console.log(chalk.gray('    Skills (21)           ~/.cursor/skills/ or ./.cursor/skills/'));
  console.log(chalk.gray('    Architecture (11)     ~/.cursor/architecture/ or ./.cursor/architecture/'));
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

  const rulesFileTargets = targets.filter((t) => t === 'windsurf');
  if (rulesFileTargets.length > 0) {
    console.log(chalk.bold('  Rules-file Editors:'));
    for (const target of rulesFileTargets) {
      const config = EDITOR_CONFIGS[target];
      console.log(chalk.gray(`    ${config.name}: 16 agents merged into ${config.rulesFile} + architecture docs`));
    }
    console.log('');
  }
};
