/**
 * Content transforms shared by the skill-based editors (Codex, Antigravity).
 * Claude assets are authored as-is; other editors need paths/brand names rewritten
 * and agent personas wrapped as SKILL.md files.
 */

/** Skill-based editors that consume rewritten SKILL.md folders. */
export type SkillEditorTarget = 'codex' | 'antigravity';

const REWRITE_RULES: Record<SkillEditorTarget, Array<[RegExp, string]>> = {
  codex: [
    [/~\/\.claude\//g, '~/.codex/'],
    [/\.claude\//g, '.codex/'],
    [/Claude Code/g, 'Codex CLI'],
    [/CLAUDE\.md/g, 'AGENTS.md'],
  ],
  antigravity: [
    [/~\/\.claude\//g, '~/.gemini/'],
    [/\.claude\//g, '.gemini/'],
    [/Claude Code/g, 'Antigravity'],
    [/CLAUDE\.md/g, 'GEMINI.md'],
  ],
};

export const rewriteClaudePaths = (
  content: string,
  target: 'claude' | SkillEditorTarget
): string => {
  if (target === 'claude') {
    return content;
  }
  return REWRITE_RULES[target].reduce((acc, [pattern, replacement]) => acc.replace(pattern, replacement), content);
};

export const extractFrontmatter = (
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

export const buildGeneratedSkill = (name: string, description: string, body: string): string => `---
name: ${name}
description: ${description}
---

${body}
`;
