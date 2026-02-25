import { describe, it, expect, vi, beforeEach } from 'vitest';
import { globToRegex } from '../src/utils';

vi.mock('@actions/core');

function matches(pattern: string, slug: string): boolean {
  return new RegExp(globToRegex(pattern), 'i').test(slug);
}

describe('globToRegex', () => {
  it('matches an exact slug', () => {
    expect(matches('finance', 'finance')).toBe(true);
    expect(matches('finance', 'Finance')).toBe(true); // case-insensitive
    expect(matches('finance', 'fin')).toBe(false);
    expect(matches('finance', 'finances')).toBe(false);
  });

  it('matches a leading wildcard', () => {
    expect(matches('*nance', 'finance')).toBe(true);
    expect(matches('*nance', 'nance')).toBe(true);
    expect(matches('*nance', 'fin')).toBe(false);
  });

  it('matches surrounding wildcards', () => {
    expect(matches('*login*', 'test-login-flow')).toBe(true);
    expect(matches('*login*', 'login')).toBe(true);
    expect(matches('*login*', 'logout')).toBe(false);
  });

  it('handles special regex characters in slugs', () => {
    expect(matches('heal.dev', 'heal.dev')).toBe(true);
    expect(matches('heal.dev', 'healXdev')).toBe(false);
  });

  it('throws on an invalid pattern', () => {
    expect(() => globToRegex('')).toThrow('Invalid glob pattern: ""');
  });
});

describe('run', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({
          executionId: 'exec-123',
          healExecutionUrl: 'https://app.heal.dev/executions/123',
        }),
      }),
    );
  });

  it('calls the trigger endpoint with no filters when no optional inputs are set', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      return '';
    });

    await import('../src/index');

    expect(fetch).toHaveBeenCalledWith(
      'https://backend.heal.dev/api/v1/executions/trigger',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer test-token' }),
        body: JSON.stringify({}),
      }),
    );
    expect(core.setOutput).toHaveBeenCalledWith('url', 'https://app.heal.dev/executions/123');
    expect(core.info).toHaveBeenCalledWith('Execution triggered: https://app.heal.dev/executions/123');
  });

  it('sends teamSlugRegex that matches the given team pattern', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      if (name === 'team') return '*nance';
      return '';
    });

    await import('../src/index');

    const { teamSlugRegex } = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(new RegExp(teamSlugRegex, 'i').test('finance')).toBe(true);
    expect(new RegExp(teamSlugRegex, 'i').test('nance')).toBe(true);
    expect(new RegExp(teamSlugRegex, 'i').test('fin')).toBe(false);
  });

  it('sends all filters when team, feature, and test-case are provided', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      if (name === 'team') return 'finance';
      if (name === 'feature') return 'decision-analysis';
      if (name === 'test-case') return '*login*';
      return '';
    });

    await import('../src/index');

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string);
    expect(new RegExp(body.teamSlugRegex, 'i').test('finance')).toBe(true);
    expect(new RegExp(body.teamSlugRegex, 'i').test('other')).toBe(false);
    expect(new RegExp(body.featureSlugRegex, 'i').test('decision-analysis')).toBe(true);
    expect(new RegExp(body.featureSlugRegex, 'i').test('other')).toBe(false);
    expect(new RegExp(body.testCaseSlugRegex, 'i').test('test-login-flow')).toBe(true);
    expect(new RegExp(body.testCaseSlugRegex, 'i').test('logout')).toBe(false);
  });

  it('uses a custom backend-url when provided', async () => {
    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      if (name === 'backend-url') return 'https://staging.heal.dev';
      return '';
    });

    await import('../src/index');

    expect(fetch).toHaveBeenCalledWith('https://staging.heal.dev/api/v1/executions/trigger', expect.anything());
  });

  it('calls setFailed on a non-ok API response', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        text: async () => 'Forbidden',
      }),
    );

    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      return '';
    });

    await import('../src/index');

    expect(core.setFailed).toHaveBeenCalledWith('Heal API error 403: Forbidden');
  });

  it('calls setFailed on a network error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network failure')));

    const core = await import('@actions/core');
    vi.mocked(core.getInput).mockImplementation((name: string) => {
      if (name === 'api-token') return 'test-token';
      return '';
    });

    await import('../src/index');

    expect(core.setFailed).toHaveBeenCalledWith('network failure');
  });
});
