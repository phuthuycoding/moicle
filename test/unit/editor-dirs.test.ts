import { describe, it, expect } from 'bun:test';
import os from 'os';
import path from 'path';
import { EDITOR_CONFIGS, getEditorDir } from '../../src/utils/symlink.js';
import type { EditorTarget } from '../../src/types.js';

const TARGETS: EditorTarget[] = ['claude', 'codex', 'cursor', 'windsurf', 'antigravity', 'devin'];

describe('getEditorDir / EDITOR_CONFIGS', () => {
  it('resolves a non-empty dir for every target and scope', () => {
    for (const target of TARGETS) {
      for (const scope of ['global', 'project'] as const) {
        const dir = getEditorDir(target, scope);
        expect(dir.length).toBeGreaterThan(0);
        expect(EDITOR_CONFIGS[target].name.length).toBeGreaterThan(0);
      }
    }
  });

  it('global dirs live under the home directory', () => {
    const home = os.homedir();
    for (const target of TARGETS) {
      expect(getEditorDir(target, 'global').startsWith(home)).toBe(true);
    }
  });

  it('project dirs are relative to cwd for skill-style editors', () => {
    const cwd = process.cwd();
    expect(getEditorDir('claude', 'project')).toBe(path.join(cwd, '.claude'));
    expect(getEditorDir('cursor', 'project')).toBe(path.join(cwd, '.cursor'));
    expect(getEditorDir('codex', 'project')).toBe(path.join(cwd, '.codex'));
  });

  it('windsurf project dir resolves to .windsurf/rules', () => {
    expect(getEditorDir('windsurf', 'project')).toBe(
      path.join(process.cwd(), '.windsurf', 'rules')
    );
  });

  it('devin dirs follow the .devin / ~/.config/devin convention', () => {
    expect(getEditorDir('devin', 'project')).toBe(path.join(process.cwd(), '.devin'));
    expect(getEditorDir('devin', 'global')).toBe(
      path.join(os.homedir(), '.config', 'devin')
    );
  });
});
