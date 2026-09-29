import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Opts = { callback(token: string): void; 'error-callback'?(): void };

function installFakeDom(turnstile?: { render(el: unknown, o: Opts): string; reset(id: string): void }) {
  vi.stubGlobal('document', { createElement: () => ({ style: {} }), body: { appendChild: () => {} } });
  vi.stubGlobal('window', { turnstile });
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('getTurnstileToken', () => {
  it('waits for the turnstile script to load instead of returning an empty token', async () => {
    installFakeDom(undefined);
    const { getTurnstileToken } = await import('./turnstile');
    const p = getTurnstileToken();
    let cb: Opts | undefined;
    await vi.advanceTimersByTimeAsync(1200);
    (globalThis as { window: { turnstile?: unknown } }).window.turnstile = {
      render: (_el: unknown, o: Opts) => {
        cb = o;
        return 'w1';
      },
      reset: () => {},
    };
    await vi.advanceTimersByTimeAsync(300);
    cb!.callback('tok-1');
    await expect(p).resolves.toBe('tok-1');
  });

  it('gives up with an empty token when the challenge never calls back', async () => {
    installFakeDom({ render: () => 'w1', reset: () => {} });
    const { getTurnstileToken } = await import('./turnstile');
    const p = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(60_100);
    await expect(p).resolves.toBe('');
  });

  it('hands out each token once and requests the next one', async () => {
    const callbacks: Opts[] = [];
    const reset = vi.fn();
    installFakeDom({ render: (_el, o) => (callbacks.push(o), 'w1'), reset });
    const { getTurnstileToken } = await import('./turnstile');
    const first = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(10);
    callbacks[0].callback('tok-1');
    await expect(first).resolves.toBe('tok-1');
    expect(reset).toHaveBeenCalledWith('w1');
    const second = getTurnstileToken();
    callbacks[0].callback('tok-2');
    await expect(second).resolves.toBe('tok-2');
  });
});

describe('widget rendering', () => {
  it('does not pass size=invisible (Turnstile rejects it; invisibility is a widget setting)', async () => {
    let opts: Record<string, unknown> | undefined;
    installFakeDom({ render: (_el, o) => ((opts = o as unknown as Record<string, unknown>), 'w1'), reset: () => {} });
    const { getTurnstileToken } = await import('./turnstile');
    const p = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(10);
    (opts as unknown as Opts).callback('tok');
    await p;
    expect(opts?.size).not.toBe('invisible');
  });

  it('returns an empty token instead of throwing when render fails', async () => {
    installFakeDom({ render: () => { throw new Error('TurnstileError'); }, reset: () => {} });
    const { getTurnstileToken } = await import('./turnstile');
    await expect(getTurnstileToken()).resolves.toBe('');
  });
});
