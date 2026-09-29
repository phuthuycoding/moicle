import { describe, it, expect } from 'bun:test';
import { parseSemver, compareVersions } from '../../src/commands/upgrade.js';

describe('parseSemver', () => {
  it('parses plain semver', () => {
    expect(parseSemver('3.1.0')).toEqual([3, 1, 0]);
  });

  it('strips v prefix', () => {
    expect(parseSemver('v3.1.0')).toEqual([3, 1, 0]);
  });

  it('strips pre-release suffix', () => {
    expect(parseSemver('3.1.0-beta.2')).toEqual([3, 1, 0]);
  });

  it('defaults missing parts to zero', () => {
    expect(parseSemver('3')).toEqual([3, 0, 0]);
  });
});

describe('compareVersions', () => {
  it('orders by major, minor, patch', () => {
    expect(compareVersions('3.0.2', '3.1.0')).toBeLessThan(0);
    expect(compareVersions('3.1.0', '3.0.2')).toBeGreaterThan(0);
    expect(compareVersions('4.0.0', '3.9.9')).toBeGreaterThan(0);
  });

  it('returns 0 for equal versions', () => {
    expect(compareVersions('3.1.0', '3.1.0')).toBe(0);
    expect(compareVersions('v3.1.0', '3.1.0')).toBe(0);
  });
});
