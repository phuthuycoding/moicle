import { describe, it, expect } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { REPO_ROOT } from '../helpers.js';

const ASSETS = path.join(REPO_ROOT, 'assets');

const mdFiles = (dir: string): string[] => {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...mdFiles(full));
    else if (entry.name.endsWith('.md')) out.push(full);
  }
  return out;
};

const descriptionOf = (file: string): string => {
  const content = fs.readFileSync(file, 'utf-8');
  const match = content.match(/^description:\s*(.+)$/m);
  return match?.[1] ?? '';
};

const quotedPhrases = (description: string): string[] =>
  [...description.matchAll(/"([^"]+)"/g)].map((m) => m[1]);

const assetFiles = (): string[] => [
  ...mdFiles(path.join(ASSETS, 'skills')),
  ...mdFiles(path.join(ASSETS, 'commands')),
];

const grepRepo = (pattern: string, paths: string[]): string => {
  try {
    return execSync(
      `grep -rn ${JSON.stringify(pattern)} ${paths.map((p) => JSON.stringify(p)).join(' ')} || true`,
      { cwd: REPO_ROOT, encoding: 'utf-8' }
    ).trim();
  } catch {
    return '';
  }
};

describe('TC-009: trigger de-collision', () => {
  it('no quoted trigger phrase appears in two descriptions', () => {
    const owners = new Map<string, string[]>();
    for (const file of assetFiles()) {
      for (const phrase of quotedPhrases(descriptionOf(file))) {
        owners.set(phrase, [...(owners.get(phrase) ?? []), file]);
      }
    }
    const dupes = [...owners.entries()].filter(([, files]) => files.length > 1);
    expect(dupes).toEqual([]);
  });

  it('feature-build does not claim cleanup-owned phrases', () => {
    const desc = descriptionOf(path.join(ASSETS, 'skills', 'feature', 'build', 'SKILL.md'));
    expect(desc).not.toContain('"clean up"');
    expect(desc).not.toContain('"improve code"');
  });
});

describe('TC-010: TRACK merge integrity', () => {
  const buildPath = path.join(ASSETS, 'skills', 'feature', 'build', 'SKILL.md');
  const build = fs.readFileSync(buildPath, 'utf-8');

  it('feature-build documents a TRACK mode in the mode table', () => {
    expect(build).toMatch(/\*\*TRACK\*\*/);
    expect(build).toContain('# Mode TRACK');
  });

  it('carries every former feature-track trigger phrase', () => {
    let oldDesc = '';
    try {
      oldDesc = execSync('git show HEAD:assets/skills/feature/track/SKILL.md', {
        cwd: REPO_ROOT,
        encoding: 'utf-8',
      }).match(/^description:\s*(.+)$/m)?.[1] ?? '';
    } catch {
      // no git history — fall back to the known trigger list
      oldDesc =
        '"bắt đầu loop", "làm track này", "tracked loop", "checklist driven dev", "run the loop", "checkout branch and start track", "brainstorm rồi làm track", "implement with checklist and commit per task"';
    }
    const desc = descriptionOf(buildPath);
    const missing = quotedPhrases(oldDesc).filter((p) => !desc.includes(p));
    expect(missing).toEqual([]);
  });

  it('feature/track dir is gone and no /feature-track refs remain in shipped content', () => {
    expect(fs.existsSync(path.join(ASSETS, 'skills', 'feature', 'track'))).toBe(false);
    // docs may still name the path in stale-cleanup guidance; shipped code/content must not
    const hits = grepRepo('/feature-track', ['assets', 'src']);
    expect(hits).toBe('');
    expect(fs.readFileSync(path.join(REPO_ROOT, 'CLAUDE.md'), 'utf-8')).not.toContain('/feature-track');
  });
});

describe('TC-011: docs sync', () => {
  const readme = fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf-8');
  const claudeMd = fs.readFileSync(path.join(REPO_ROOT, 'CLAUDE.md'), 'utf-8');

  it('README counts match the assets tree', () => {
    const agents =
      fs.readdirSync(path.join(ASSETS, 'agents', 'developers')).length +
      fs.readdirSync(path.join(ASSETS, 'agents', 'utilities')).length;
    const commands = fs.readdirSync(path.join(ASSETS, 'commands')).length;
    expect(readme).toContain(`**${agents} AI Agents**`);
    expect(readme).toContain(`**${commands} Commands**`);
    expect(readme).toContain('**10 Skills**');
  });

  it('CLAUDE.md has no feature-track/brainstorm rows left', () => {
    expect(claudeMd).not.toContain('/feature-track');
    expect(claudeMd).not.toContain('### /brainstorm');
  });

  it('challenge description carries the documented Vietnamese triggers', () => {
    const desc = descriptionOf(path.join(ASSETS, 'skills', 'challenge', 'SKILL.md'));
    for (const phrase of ['check kĩ hơn', 'soi lại', 'phản biện', 'có lặp code không']) {
      expect(desc).toContain(phrase);
    }
  });
});

describe('TC-013: agent frontmatter is editor-neutral', () => {
  it('no agent file has a model: field; name+description intact', () => {
    const agents = [
      ...mdFiles(path.join(ASSETS, 'agents', 'developers')),
      ...mdFiles(path.join(ASSETS, 'agents', 'utilities')),
    ];
    expect(agents.length).toBe(18);
    for (const file of agents) {
      const content = fs.readFileSync(file, 'utf-8');
      const fm = content.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? '';
      expect(fm).not.toMatch(/^model:/m);
      expect(fm).toMatch(/^name:/m);
      expect(fm).toMatch(/^description:/m);
    }
  });
});

describe('TC-014: new agents + brainstorm removal', () => {
  const researcher = path.join(ASSETS, 'agents', 'utilities', 'researcher.md');
  const brainstormer = path.join(ASSETS, 'agents', 'utilities', 'brainstormer.md');

  it('both agent files exist with convention frontmatter', () => {
    for (const file of [researcher, brainstormer]) {
      expect(fs.existsSync(file)).toBe(true);
      const content = fs.readFileSync(file, 'utf-8');
      expect(content).toMatch(/^name:/m);
      expect(content).toMatch(/^description:/m);
      expect(content).toContain('Engineering Principles');
    }
  });

  it('brainstormer carries all 6 frameworks', () => {
    const content = fs.readFileSync(brainstormer, 'utf-8');
    for (const framework of [
      'First Principles',
      'SCAMPER',
      'Design Thinking',
      'Working Backwards',
      '5 Whys',
      'Rapid Fire',
    ]) {
      expect(content).toContain(framework);
    }
  });

  it('brainstorm.md is gone and no /brainstorm refs remain', () => {
    expect(fs.existsSync(path.join(ASSETS, 'commands', 'brainstorm.md'))).toBe(false);
    const hits = grepRepo('/brainstorm', ['assets', 'src', 'README.md', 'CLAUDE.md', 'AGENTS.md']);
    expect(hits).toBe('');
  });
});
