import { describe, it, expect } from 'bun:test';
import {
  rewriteClaudePaths,
  rewriteCursorPaths,
  extractFrontmatter,
  buildGeneratedSkill,
} from '../../src/commands/install/transform.js';
import { buildCursorRuleMdc, sanitizeDescription } from '../../src/commands/install/cursor-transform.js';
import { DESCRIPTION_MAX_LENGTH } from '../../src/utils/editor-constants.js';

describe('rewriteClaudePaths', () => {
  it('returns content unchanged for claude', () => {
    const content = 'see ~/.claude/architecture/x.md';
    expect(rewriteClaudePaths(content, 'claude')).toBe(content);
  });

  it('rewrites home and relative paths for codex', () => {
    const content = 'see ~/.claude/architecture/x.md and .claude/skills';
    const out = rewriteClaudePaths(content, 'codex');
    expect(out).toContain('~/.codex/architecture/x.md');
    expect(out).toContain('.codex/skills');
    expect(out).not.toContain('.claude');
  });

  it('rewrites Claude Code branding and CLAUDE.md for codex', () => {
    const out = rewriteClaudePaths('Claude Code reads CLAUDE.md', 'codex');
    expect(out).toContain('Codex CLI');
    expect(out).toContain('AGENTS.md');
  });

  it('rewrites to .gemini for antigravity', () => {
    const out = rewriteClaudePaths('~/.claude/skills', 'antigravity');
    expect(out).toBe('~/.gemini/skills');
  });
});

describe('rewriteCursorPaths', () => {
  it('rewrites both global and relative .claude paths', () => {
    const out = rewriteCursorPaths('a ~/.claude/x b .claude/y');
    expect(out).toBe('a ~/.cursor/x b .cursor/y');
  });
});

describe('extractFrontmatter', () => {
  it('parses frontmatter, body and description', () => {
    const md = '---\nname: x\ndescription: does things\nmodel: sonnet\n---\nbody here';
    const parsed = extractFrontmatter(md);
    expect(parsed.frontmatter).toContain('model: sonnet');
    expect(parsed.body).toBe('body here');
    expect(parsed.description).toBe('does things');
  });

  it('handles missing frontmatter', () => {
    const parsed = extractFrontmatter('just a body');
    expect(parsed.frontmatter).toBeNull();
    expect(parsed.body).toBe('just a body');
    expect(parsed.description).toBeUndefined();
  });
});

describe('buildGeneratedSkill', () => {
  it('wraps body in name+description frontmatter', () => {
    const out = buildGeneratedSkill('my-skill', 'does x', 'do the thing');
    expect(out).toContain('name: my-skill');
    expect(out).toContain('description: does x');
    expect(out).toContain('do the thing');
  });
});

describe('cursor .mdc generation', () => {
  it('emits description + alwaysApply frontmatter', () => {
    const out = buildCursorRuleMdc('review code well', '## Rules\nbe nice');
    expect(out).toContain('description: review code well');
    expect(out).toContain('alwaysApply: false');
    expect(out).toContain('## Rules');
  });

  it('quotes descriptions containing yaml-special chars', () => {
    const out = buildCursorRuleMdc('says: "hi" #1', 'body');
    expect(out).toContain('description: "says: \\"hi\\" #1"');
  });

  it('keeps long descriptions whole (no silent trigger loss)', () => {
    const long = 'x'.repeat(DESCRIPTION_MAX_LENGTH + 50);
    const out = sanitizeDescription(long);
    expect(out).toBe(long);
  });
});
