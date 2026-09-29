declare global {
  interface Window {
    turnstile?: {
      render(
        el: HTMLElement,
        opts: { sitekey: string; appearance?: 'always' | 'interaction-only'; callback(token: string): void; 'error-callback'?(): void },
      ): string;
      reset(id: string): void;
    };
  }
}

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string;
const SCRIPT_WAIT_MS = 5000;
// Long enough for a visitor to complete an interactive challenge if Turnstile asks for one.
const TOKEN_WAIT_MS = 60_000;

let widgetId: string | null = null;
let pending: Promise<string> | null = null;
let resolveToken: ((t: string) => void) | null = null;

function newPending() {
  pending = new Promise<string>((resolve) => (resolveToken = resolve));
}

async function waitForScript(): Promise<boolean> {
  const deadline = Date.now() + SCRIPT_WAIT_MS;
  while (!window.turnstile) {
    if (Date.now() > deadline) return false;
    await new Promise((r) => setTimeout(r, 100));
  }
  return true;
}

function ensureWidget() {
  if (widgetId || !window.turnstile) return;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:20';
  document.body.appendChild(el);
  newPending();
  try {
    // Invisible mode is configured on the widget in the dashboard, not here.
    widgetId = window.turnstile.render(el, {
      sitekey: SITEKEY,
      appearance: 'interaction-only',
      callback: (token) => resolveToken?.(token),
      'error-callback': () => resolveToken?.(''),
    });
  } catch (e) {
    console.error('turnstile render failed', e);
  }
}

/** Resolves with an unused token (or '' on failure), then immediately requests the next one. */
export async function getTurnstileToken(): Promise<string> {
  if (!(await waitForScript())) return '';
  ensureWidget();
  if (!widgetId || !pending) return '';
  const timeout = new Promise<string>((r) => setTimeout(() => r(''), TOKEN_WAIT_MS));
  const token = await Promise.race([pending, timeout]);
  newPending();
  window.turnstile!.reset(widgetId);
  return token;
}
