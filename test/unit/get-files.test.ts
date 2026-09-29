import { describe, it, expect, beforeEach, afterEach } from 'bun:test';
import fs from 'fs';
import path from 'path';
import { getFiles } from '../../src/utils/symlink.js';
import { makeTempDir, removeTempDir } from '../helpers.js';

describe('getFiles', () => {
  let dir: string;

  beforeEach(() => {
    dir = makeTempDir();
  });

  afterEach(() => {
    removeTempDir(dir);
  });

  it('lists files recursively within depth', () => {
    fs.writeFileSync(path.join(dir, 'a.md'), 'x');
    fs.mkdirSync(path.join(dir, 'sub'));
    fs.writeFileSync(path.join(dir, 'sub', 'b.md'), 'x');
    const files = getFiles(dir);
    expect(files.map((f) => path.basename(f)).sort()).toEqual(['a.md', 'b.md']);
  });

  it('does not crash on a broken symlink (regression)', () => {
    fs.writeFileSync(path.join(dir, 'real.md'), 'x');
    fs.symlinkSync(path.join(dir, 'missing-target'), path.join(dir, 'dangling'));
    const files = getFiles(dir);
    expect(files.map((f) => path.basename(f))).toEqual(['real.md']);
  });

  it('returns empty for a missing dir', () => {
    expect(getFiles(path.join(dir, 'nope'))).toEqual([]);
  });
});
