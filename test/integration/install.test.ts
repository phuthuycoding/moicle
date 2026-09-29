import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { makeTempDir, removeTempDir, runCli } from '../helpers.js';

const countMd = (dir: string): number =>
  fs.existsSync(dir) ? fs.readdirSync(dir).filter((f) => f.endsWith('.md')).length : 0;

const dirsIn = (dir: string): string[] =>
  fs.existsSync(dir)
    ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isDirectory())
    : [];

describe('install --project (TC-006)', () => {
  let cwd: string;

  beforeEach(() => {
    cwd = makeTempDir();
  });

  afterEach(() => {
    removeTempDir(cwd);
  });

  it('installs 10 skills + 18 agents + architecture with _shared preserved', () => {
    const res = runCli(['install', '--project', '--target', 'claude'], { cwd });
    expect(res.status).toBe(0);

    const skills = dirsIn(path.join(cwd, '.claude', 'skills'));
    expect(skills.length).toBe(10);
    expect(skills).toContain('feature-build');
    expect(skills).not.toContain('feature-track');

    const agents = countMd(path.join(cwd, '.claude', 'agents'));
    expect(agents).toBe(18);

    // architecture keeps _shared/ structure — regression for the flattening bug
    const shared = path.join(cwd, '.claude', 'architecture', '_shared');
    expect(fs.existsSync(shared)).toBe(true);
    expect(fs.existsSync(path.join(shared, 'read-project-first.md'))).toBe(true);
  });

  it('moicle list agrees with the installed tree', () => {
    runCli(['install', '--project', '--target', 'claude'], { cwd });
    const res = runCli(['list', '--project'], { cwd });
    expect(res.status).toBe(0);
    expect(res.stdout).toContain('feature-build');
    expect(res.stdout).not.toContain('feature-track');
  });

  it('does not install removed assets (no doc/brainstorm anywhere)', () => {
    runCli(['install', '--project', '--target', 'claude'], { cwd });
    const find = (dir: string): string[] =>
      fs.readdirSync(dir, { recursive: true } as any).map(String);
    const files = find(path.join(cwd, '.claude'));
    expect(files.some((f) => f.includes('doc.md'))).toBe(false);
    expect(files.some((f) => f.includes('brainstorm.md'))).toBe(false);
    expect(files.some((f) => f.includes('feature-track'))).toBe(false);
  });
});

describe('editor-neutrality of installed content (windsurf/cursor)', () => {
  let cwd: string;
  let home: string;

  beforeEach(() => {
    cwd = makeTempDir();
    home = makeTempDir('moicle-home-');
  });

  afterEach(() => {
    removeTempDir(cwd);
    removeTempDir(home);
  });

  const grepInstalled = (dir: string, needle: RegExp): string[] => {
    const hits: string[] = [];
    const walk = (d: string): void => {
      for (const e of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, e.name);
        if (e.isDirectory()) walk(full);
        else if (needle.test(fs.readFileSync(full, 'utf-8'))) hits.push(full);
      }
    };
    walk(dir);
    return hits;
  };

  it('windsurf install contains zero ~/.claude or .claude/ refs', () => {
    // windsurf is a global-only target — installs to ~/.codeium/windsurf/memories
    const res = runCli(['install', '--target', 'windsurf'], { cwd, home });
    expect(res.status).toBe(0);
    const root = path.join(home, '.codeium', 'windsurf', 'memories');
    expect(grepInstalled(root, /~\/\.claude|\.claude\//)).toEqual([]);
    const archDoc = path.join(root, 'architecture', '_shared', 'read-project-first.md');
    expect(fs.existsSync(archDoc)).toBe(true);
    expect(fs.readFileSync(archDoc, 'utf-8')).toContain('~/.codeium/windsurf/memories/architecture/');
  });

  it('cursor install contains zero .claude refs and CLAUDE.md mentions', () => {
    const res = runCli(['install', '--project', '--target', 'cursor'], { cwd });
    expect(res.status).toBe(0);
    const root = path.join(cwd, '.cursor');
    expect(grepInstalled(root, /~\/\.claude|\.claude\//)).toEqual([]);
    expect(grepInstalled(root, /CLAUDE\.md/)).toEqual([]);
  });

  it('devin install: native subagent profiles + skills, zero .claude refs', () => {
    const res = runCli(['install', '--project', '--target', 'devin'], { cwd });
    expect(res.status).toBe(0);
    const root = path.join(cwd, '.devin');

    // native subagent profiles — flat .md with frontmatter intact
    const agentsDir = path.join(root, 'agents');
    expect(countMd(agentsDir)).toBe(18);
    const refactor = fs.readFileSync(path.join(agentsDir, 'refactor.md'), 'utf-8');
    expect(refactor).toContain('name: refactor');
    expect(refactor).toContain('.devin/architecture/');
    expect(refactor).not.toContain('.claude/');

    // skills + commands-as-skills
    const skills = dirsIn(path.join(root, 'skills'));
    expect(skills).toContain('feature-build');
    expect(skills).toContain('bootstrap'); // command → skill
    expect(skills.length).toBe(12); // 10 skills + 2 commands

    // arch preserved incl _shared
    expect(fs.existsSync(path.join(root, 'architecture', '_shared', 'read-project-first.md'))).toBe(true);

    // zero claude refs anywhere + manifest written
    expect(grepInstalled(root, /~\/\.claude|\.claude\//)).toEqual([]);
    const manifest = JSON.parse(
      fs.readFileSync(path.join(root, '.moicle-manifest.json'), 'utf-8')
    );
    expect(manifest.items.some((i: string) => i.startsWith('agents/'))).toBe(true);
  });

  it('devin uninstall removes agents/skills/architecture + manifest', () => {
    runCli(['install', '--project', '--target', 'devin'], { cwd });
    const res = runCli(['uninstall', '--project', '--target', 'devin'], { cwd });
    expect(res.status).toBe(0);
    const root = path.join(cwd, '.devin');
    expect(fs.existsSync(path.join(root, 'agents', 'refactor.md'))).toBe(false);
    expect(fs.existsSync(path.join(root, 'skills', 'feature-build'))).toBe(false);
    expect(fs.existsSync(path.join(root, '.moicle-manifest.json'))).toBe(false);
  });
});

describe('install --global (TC-006 commands)', () => {
  let home: string;
  let cwd: string;

  beforeEach(() => {
    home = makeTempDir('moicle-home-');
    cwd = makeTempDir();
  });

  afterEach(() => {
    removeTempDir(home);
    removeTempDir(cwd);
  });

  it('installs exactly 2 commands to the faked home', () => {
    const res = runCli(['install', '--global', '--no-symlink', '--target', 'claude'], { cwd, home });
    expect(res.status).toBe(0);
    const commands = countMd(path.join(home, '.claude', 'commands'));
    expect(commands).toBe(2);
    expect(fs.existsSync(path.join(home, '.claude', 'commands', 'bootstrap.md'))).toBe(true);
    expect(fs.existsSync(path.join(home, '.claude', 'commands', 'marketing.md'))).toBe(true);
  });
});
