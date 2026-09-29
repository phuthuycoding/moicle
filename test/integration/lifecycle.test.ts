import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { makeTempDir, removeTempDir, runCli } from '../helpers.js';

describe('disable/enable/status lifecycle (TC-007)', () => {
  let cwd: string;
  const skillsDir = () => path.join(cwd, '.claude', 'skills');

  beforeEach(() => {
    cwd = makeTempDir();
    runCli(['install', '--project', '--target', 'claude'], { cwd });
  });

  afterEach(() => {
    removeTempDir(cwd);
  });

  it('disable renames the skill dir to .disabled', () => {
    const res = runCli(['disable', 'cleanup', '--project', '--target', 'claude'], { cwd });
    expect(res.status).toBe(0);
    expect(fs.existsSync(path.join(skillsDir(), 'cleanup.disabled'))).toBe(true);
    expect(fs.existsSync(path.join(skillsDir(), 'cleanup'))).toBe(false);
  });

  it('status reports the disabled item', () => {
    runCli(['disable', 'cleanup', '--project', '--target', 'claude'], { cwd });
    const res = runCli(['status', '--project'], { cwd });
    expect(res.status).toBe(0);
    expect(res.stdout).toMatch(/cleanup.*disabled|disabled.*cleanup/i);
  });

  it('enable restores the original name', () => {
    runCli(['disable', 'cleanup', '--project', '--target', 'claude'], { cwd });
    const res = runCli(['enable', 'cleanup', '--project', '--target', 'claude'], { cwd });
    expect(res.status).toBe(0);
    expect(fs.existsSync(path.join(skillsDir(), 'cleanup'))).toBe(true);
    expect(fs.existsSync(path.join(skillsDir(), 'cleanup.disabled'))).toBe(false);
  });

  it('project-scope disable writes project config, never the global one (regression)', () => {
    const home = makeTempDir('moicle-home-');
    runCli(['disable', 'cleanup', '--project', '--target', 'claude'], { cwd, home });
    const globalConfig = path.join(home, '.claude', 'moicle-config.json');
    const projectConfig = path.join(cwd, '.claude', 'moicle-config.json');
    expect(fs.existsSync(projectConfig)).toBe(true);
    const disabled = fs.existsSync(globalConfig)
      ? JSON.parse(fs.readFileSync(globalConfig, 'utf-8')).disabled
      : { skills: [] };
    expect(disabled.skills ?? []).not.toContain('cleanup');
    removeTempDir(home);
  });
});

describe('stale items + manifest + uninstall (TC-008, FR-007)', () => {
  let cwd: string;
  const claudeDir = () => path.join(cwd, '.claude');
  const manifestPath = () => path.join(claudeDir(), '.moicle-manifest.json');

  beforeEach(() => {
    cwd = makeTempDir();
    runCli(['install', '--project', '--target', 'claude'], { cwd });
    // simulate a stale skill an OLDER moicle version installed — recorded in manifest
    const manifest = JSON.parse(fs.readFileSync(manifestPath(), 'utf-8'));
    manifest.items.push('skills/feature-track');
    fs.writeFileSync(manifestPath(), JSON.stringify(manifest));
    fs.mkdirSync(path.join(claudeDir(), 'skills', 'feature-track'), { recursive: true });
    fs.writeFileSync(path.join(claudeDir(), 'skills', 'feature-track', 'SKILL.md'), '---\nname: feature-track\n---\n');
    // a file moicle never installed — must survive uninstall
    fs.writeFileSync(path.join(claudeDir(), 'skills', 'my-custom-skill'), 'x');
  });

  afterEach(() => {
    removeTempDir(cwd);
  });

  it('install writes a manifest of shipped items', () => {
    const manifest = JSON.parse(fs.readFileSync(manifestPath(), 'utf-8'));
    expect(manifest.items).toContain('skills/feature-build');
    expect(manifest.items).toContain('architecture/_shared');
    expect(manifest.items.length).toBeGreaterThan(20);
  });

  it('status does not crash on stale installed items', () => {
    const res = runCli(['status', '--project'], { cwd });
    expect(res.status).toBe(0);
  });

  it('uninstall removes disabled items too (regression)', () => {
    runCli(['disable', 'cleanup', '--project', '--target', 'claude'], { cwd });
    const res = runCli(['uninstall', '--project', '--target', 'claude'], { cwd });
    expect(res.status).toBe(0);
    expect(fs.existsSync(path.join(claudeDir(), 'skills', 'cleanup.disabled'))).toBe(false);
    expect(fs.existsSync(path.join(claudeDir(), 'skills', 'cleanup'))).toBe(false);
  });

  it('uninstall removes manifest-recorded stale items, spares user files', () => {
    const res = runCli(['uninstall', '--project', '--target', 'claude'], { cwd });
    expect(res.status).toBe(0);

    // stale item recorded in the manifest is gone
    expect(fs.existsSync(path.join(claudeDir(), 'skills', 'feature-track'))).toBe(false);
    // manifest file itself is removed
    expect(fs.existsSync(manifestPath())).toBe(false);
    // user-owned file untouched
    expect(fs.existsSync(path.join(claudeDir(), 'skills', 'my-custom-skill'))).toBe(true);
  });
});
