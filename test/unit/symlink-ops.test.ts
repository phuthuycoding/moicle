import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import {
  ensureDir,
  createSymlink,
  copyFile,
  copyDir,
  removeItem,
  listItems,
  listSkillsNested,
  writeInstallManifest,
  readInstallManifest,
  removeInstallManifest,
  manifestNames,
  isSymlinkSupported,
} from '../../src/utils/symlink.js';
import { makeTempDir, removeTempDir } from '../helpers.js';

describe('ensureDir', () => {
  let dir: string;
  beforeEach(() => {
    dir = path.join(makeTempDir(), 'a', 'b');
  });
  afterEach(() => {
    removeTempDir(path.join(dir, '..', '..'));
  });

  it('creates nested dirs and is idempotent', () => {
    ensureDir(dir);
    expect(fs.existsSync(dir)).toBe(true);
    ensureDir(dir);
    expect(fs.existsSync(dir)).toBe(true);
  });
});

describe('createSymlink', () => {
  let dir: string;
  let src: string;

  beforeEach(() => {
    dir = makeTempDir();
    src = path.join(dir, 'source.md');
    fs.writeFileSync(src, 'x');
  });
  afterEach(() => {
    removeTempDir(dir);
  });

  it('creates a symlink and reports exists on second run', () => {
    if (!isSymlinkSupported()) return;
    const target = path.join(dir, 'link.md');
    expect(createSymlink(src, target).status).toBe('created');
    expect(fs.lstatSync(target).isSymbolicLink()).toBe(true);
    expect(createSymlink(src, target).status).toBe('exists');
  });

  it('updates a symlink pointing at a different source', () => {
    if (!isSymlinkSupported()) return;
    const other = path.join(dir, 'other.md');
    fs.writeFileSync(other, 'y');
    const target = path.join(dir, 'link.md');
    fs.symlinkSync(other, target);
    expect(createSymlink(src, target).status).toBe('updated');
    expect(fs.readlinkSync(target)).toBe(src);
  });

  it('fails without clobbering when a real file occupies the target', () => {
    if (!isSymlinkSupported()) return;
    const target = path.join(dir, 'link.md');
    fs.writeFileSync(target, 'occupied');
    expect(createSymlink(src, target).status).toBe('error');
    expect(fs.readFileSync(target, 'utf-8')).toBe('occupied');
  });
});

describe('copyFile', () => {
  let dir: string;
  let src: string;

  beforeEach(() => {
    dir = makeTempDir();
    src = path.join(dir, 'source.md');
    fs.writeFileSync(src, 'v1');
  });
  afterEach(() => {
    removeTempDir(dir);
  });

  it('creates then reports exists on identical content', () => {
    const target = path.join(dir, 'copy.md');
    expect(copyFile(src, target).status).toBe('created');
    expect(copyFile(src, target).status).toBe('exists');
  });

  it('updates when content differs', () => {
    const target = path.join(dir, 'copy.md');
    fs.writeFileSync(target, 'old');
    expect(copyFile(src, target).status).toBe('updated');
    expect(fs.readFileSync(target, 'utf-8')).toBe('v1');
  });
});

describe('copyDir + removeItem + listItems', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => {
    removeTempDir(dir);
  });

  it('copyDir copies a whole tree recursively', () => {
    const src = path.join(dir, 'src-dir');
    fs.mkdirSync(path.join(src, 'inner'), { recursive: true });
    fs.writeFileSync(path.join(src, 'inner', 'f.md'), 'x');
    const target = path.join(dir, 'dst-dir');
    expect(copyDir(src, target).status).toBe('created');
    expect(fs.readFileSync(path.join(target, 'inner', 'f.md'), 'utf-8')).toBe('x');
  });

  it('removeItem removes dirs, files, symlinks; not_found when absent', () => {
    const file = path.join(dir, 'f.md');
    fs.writeFileSync(file, 'x');
    expect(removeItem(file).status).toBe('removed');
    expect(removeItem(file).status).toBe('not_found');

    if (isSymlinkSupported()) {
      const real = path.join(dir, 'real');
      const link = path.join(dir, 'link');
      fs.writeFileSync(real, 'x');
      fs.symlinkSync(real, link);
      expect(removeItem(link).status).toBe('removed');
      expect(fs.existsSync(real)).toBe(true); // link target untouched
    }
  });

  it('listItems reports symlink targets', () => {
    if (!isSymlinkSupported()) return;
    const real = path.join(dir, 'real.md');
    fs.writeFileSync(real, 'x');
    fs.symlinkSync(real, path.join(dir, 'link.md'));
    const items = listItems(dir);
    const link = items.find((i) => i.name === 'link.md');
    expect(link?.isSymlink).toBe(true);
    expect(link?.target).toBe(real);
  });
});

describe('listSkillsNested', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => {
    removeTempDir(dir);
  });

  it('flattens group/action dirs to <group>-<action>, keeps single-level', () => {
    fs.mkdirSync(path.join(dir, 'feature', 'build'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'feature', 'build', 'SKILL.md'), 'x');
    fs.mkdirSync(path.join(dir, 'challenge'), { recursive: true });
    fs.writeFileSync(path.join(dir, 'challenge', 'SKILL.md'), 'x');
    const names = listSkillsNested(dir).map((s) => s.name).sort();
    expect(names).toEqual(['challenge', 'feature-build']);
  });

  it('treats a group dir without nested skills as a flat skill folder', () => {
    fs.mkdirSync(path.join(dir, 'feature', 'build'), { recursive: true });
    const names = listSkillsNested(dir).map((s) => s.name);
    expect(names).toEqual(['feature']);
  });
});

describe('install manifest helpers', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });
  afterEach(() => {
    removeTempDir(dir);
  });

  it('writes, reads, and removes the manifest', () => {
    writeInstallManifest(dir, ['skills/feature-build', 'agents/refactor.md']);
    const manifest = readInstallManifest(dir);
    expect(manifest.has('skills/feature-build')).toBe(true);
    removeInstallManifest(dir);
    expect(readInstallManifest(dir).size).toBe(0);
  });

  it('manifestNames filters by dir prefix', () => {
    const m = new Set(['skills/a', 'agents/b.md', 'architecture/_shared']);
    expect([...manifestNames(m, 'skills')]).toEqual(['a']);
    expect([...manifestNames(m, 'architecture')]).toEqual(['_shared']);
    expect(manifestNames(m, 'commands').size).toBe(0);
  });
});
