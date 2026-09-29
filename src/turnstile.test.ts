import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

type Opts = { sitekey: string; callback(token: string): void; 'error-callback'?(code?: string): boolean } & Record<string, unknown>;
type Fake = { render(el: unknown, o: Opts): string; reset(id: string): void };

function installFakeDom(turnstile?: Fake) {
  vi.stubGlobal('document', { createElement: () => ({ style: {} }), body: { appendChild: () => {} } });
  vi.stubGlobal('window', { turnstile });
}
const win = () => globalThis as unknown as { window: { turnstile?: Fake; onTurnstileLoad?: () => void } };

beforeEach(() => {
  vi.useFakeTimers();
  vi.resetModules();
});
afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

describe('initTurnstile + getTurnstileToken', () => {
  it('renders the widget when the script reports loaded, and a query waits for that token', async () => {
    installFakeDom(undefined);
    const { initTurnstile, getTurnstileToken } = await import('./turnstile');
    initTurnstile();
    const p = getTurnstileToken();
    let cb: Opts | undefined;
    await vi.advanceTimersByTimeAsync(1200);
    win().window.turnstile = { render: (_el, o) => ((cb = o), 'w1'), reset: () => {} };
    win().window.onTurnstileLoad!();
    await vi.advanceTimersByTimeAsync(10);
    cb!.callback('tok-1');
    await expect(p).resolves.toBe('tok-1');
  });

  it('gives up with an empty token when the challenge never calls back', async () => {
    installFakeDom({ render: () => 'w1', reset: () => {} });
    const { initTurnstile, getTurnstileToken } = await import('./turnstile');
    initTurnstile();
    const p = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(60_100);
    await expect(p).resolves.toBe('');
  });

  it('hands out each token once and requests the next one', async () => {
    const callbacks: Opts[] = [];
    const reset = vi.fn();
    installFakeDom({ render: (_el, o) => (callbacks.push(o), 'w1'), reset });
    const { initTurnstile, getTurnstileToken } = await import('./turnstile');
    initTurnstile();
    const first = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(10);
    callbacks[0].callback('tok-1');
    await expect(first).resolves.toBe('tok-1');
    expect(reset).toHaveBeenCalledWith('w1');
    const second = getTurnstileToken();
    callbacks[0].callback('tok-2');
    await expect(second).resolves.toBe('tok-2');
  });

  it('passes only sitekey and callbacks to render (no size, no appearance)', async () => {
    let opts: Opts | undefined;
    installFakeDom({ render: (_el, o) => ((opts = o), 'w1'), reset: () => {} });
    const { initTurnstile } = await import('./turnstile');
    initTurnstile();
    expect(Object.keys(opts!).sort()).toEqual(['callback', 'error-callback', 'sitekey']);
  });

  it('returns an empty token instead of throwing when render fails', async () => {
    installFakeDom({ render: () => { throw new Error('TurnstileError'); }, reset: () => {} });
    const { initTurnstile, getTurnstileToken } = await import('./turnstile');
    initTurnstile();
    const p = getTurnstileToken();
    await vi.advanceTimersByTimeAsync(60_100);
    await expect(p).resolves.toBe('');
  });
});
