import { mkdtempSync, rmSync } from 'fs';
import { tmpdir } from 'os';
import path from 'path';
import { spawnSync, type SpawnSyncReturns } from 'child_process';

export const REPO_ROOT = path.resolve(import.meta.dir, '..');

export const makeTempDir = (prefix = 'moicle-test-'): string =>
  mkdtempSync(path.join(tmpdir(), prefix));

export const removeTempDir = (dir: string): void => {
  rmSync(dir, { recursive: true, force: true });
};

export interface CliResult {
  status: number | null;
  stdout: string;
  stderr: string;
}

/**
 * Run the built CLI (`dist/` must exist — the test script builds first).
 * `cwd` controls project-scope installs; `home` fakes $HOME for global scope.
 */
export const runCli = (
  args: string[],
  opts: { cwd?: string; home?: string } = {}
): CliResult => {
  const env = { ...process.env };
  if (opts.home) {
    env.HOME = opts.home;
  }
  const res: SpawnSyncReturns<string> = spawnSync(
    'node',
    [path.join(REPO_ROOT, 'bin', 'cli.js'), ...args],
    {
      cwd: opts.cwd ?? REPO_ROOT,
      env,
      encoding: 'utf-8',
    }
  );
  return { status: res.status, stdout: res.stdout ?? '', stderr: res.stderr ?? '' };
};
