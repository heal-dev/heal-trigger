import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@actions/core');
vi.mock('@actions/github');

describe('buildGreeting', () => {
  it('greets the given name', async () => {
    const { buildGreeting } = await import('../src/utils');
    expect(buildGreeting('Alice')).toBe('Hello, Alice!');
  });

  it('trims whitespace from the name', async () => {
    const { buildGreeting } = await import('../src/utils');
    expect(buildGreeting('  Bob  ')).toBe('Hello, Bob!');
  });

  it('falls back to World when name is empty', async () => {
    const { buildGreeting } = await import('../src/utils');
    expect(buildGreeting('')).toBe('Hello, World!');
  });

  it('falls back to World when name is whitespace', async () => {
    const { buildGreeting } = await import('../src/utils');
    expect(buildGreeting('   ')).toBe('Hello, World!');
  });
});

describe('formatTimestamp', () => {
  it('returns an ISO 8601 string for a given date', async () => {
    const { formatTimestamp } = await import('../src/utils');
    const date = new Date('2024-01-15T12:00:00.000Z');
    expect(formatTimestamp(date)).toBe('2024-01-15T12:00:00.000Z');
  });

  it('defaults to the current time', async () => {
    const { formatTimestamp } = await import('../src/utils');
    const before = Date.now();
    const result = formatTimestamp();
    const after = Date.now();
    const ts = new Date(result).getTime();
    expect(ts).toBeGreaterThanOrEqual(before);
    expect(ts).toBeLessThanOrEqual(after);
  });
});

describe('run', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('sets the greeting output', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'who-to-greet') return 'Tester';
      if (name === 'github-token') return '';
      return '';
    });

    await import('../src/index');

    expect(core.setOutput).toHaveBeenCalledWith('greeting', 'Hello, Tester!');
  });

  it('calls setFailed on error', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation(() => {
      throw new Error('input error');
    });

    await import('../src/index');

    expect(core.setFailed).toHaveBeenCalledWith('input error');
  });
});
