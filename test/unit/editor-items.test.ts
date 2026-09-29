import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { cleanItemDisplayName, inferItemType } from '../../src/utils/editor-items.js';
import { makeTempDir, removeTempDir } from '../helpers.js';

describe('cleanItemDisplayName', () => {
  it('strips .md', () => {
    expect(cleanItemDisplayName('bootstrap.md')).toBe('bootstrap');
  });

  it('strips .md.disabled', () => {
    expect(cleanItemDisplayName('bootstrap.md.disabled')).toBe('bootstrap');
  });

  it('strips .mdc', () => {
    expect(cleanItemDisplayName('refactor.mdc')).toBe('refactor');
  });

  it('strips .mdc.disabled', () => {
    expect(cleanItemDisplayName('refactor.mdc.disabled')).toBe('refactor');
  });

  it('strips bare .disabled', () => {
    expect(cleanItemDisplayName('fix-bug.disabled')).toBe('fix-bug');
  });

  it('returns unsuffixed names unchanged', () => {
    expect(cleanItemDisplayName('cleanup')).toBe('cleanup');
  });
});

describe('inferItemType', () => {
  let cwd: string;
  let originalCwd: string;

  beforeEach(() => {
    cwd = makeTempDir();
    originalCwd = process.cwd();
    process.chdir(cwd);
  });

  afterEach(() => {
    process.chdir(originalCwd);
    removeTempDir(cwd);
  });

  it('maps /x to commands', () => {
    expect(inferItemType('/doc', 'claude', 'project')).toBe('commands');
  });

  it('maps @x to agents', () => {
    expect(inferItemType('@refactor', 'claude', 'project')).toBe('agents');
  });

  it('maps a name to skills when the skill dir exists', () => {
    fs.mkdirSync(path.join(cwd, '.claude', 'skills', 'cleanup'), { recursive: true });
    expect(inferItemType('cleanup', 'claude', 'project')).toBe('skills');
  });

  it('maps a name to skills when only the .disabled dir exists', () => {
    fs.mkdirSync(path.join(cwd, '.claude', 'skills', 'cleanup.disabled'), { recursive: true });
    expect(inferItemType('cleanup', 'claude', 'project')).toBe('skills');
  });

  it('falls back to agents when nothing matches', () => {
    expect(inferItemType('nonexistent', 'claude', 'project')).toBe('agents');
  });
});
