declare global {
  interface Window {
    turnstile?: {
      render(
        el: HTMLElement,
        opts: { sitekey: string; callback(token: string): void; 'error-callback'?(code?: string): boolean },
      ): string;
      reset(id: string): void;
    };
  }
}

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string;
// Long enough for a visitor to complete an interactive challenge if Turnstile asks for one.
const TOKEN_WAIT_MS = 60_000;

let widgetId: string | null = null;
let pending: Promise<string> | null = null;
let resolveToken: ((t: string) => void) | null = null;

function newPending() {
  pending = new Promise<string>((resolve) => (resolveToken = resolve));
}

function renderWidget() {
  if (widgetId || !window.turnstile) return;
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:12px;right:12px;z-index:20';
  document.body.appendChild(el);
  try {
    // Widget mode (managed / invisible) is configured on the widget in the dashboard, not here.
    widgetId = window.turnstile.render(el, {
      sitekey: SITEKEY,
      callback: (token) => resolveToken?.(token),
      'error-callback': (code) => {
        console.error('turnstile error', code);
        resolveToken?.('');
        return true; // handled: keep Turnstile from retrying on its own
      },
    });
  } catch (e) {
    console.error('turnstile render failed', e);
  }
}

const SCRIPT_WAIT_MS = 15_000;

/** Call once at startup. Polls for the Turnstile script (its onload hook races the module bundle) and renders the widget as soon as it is there. */
export function initTurnstile() {
  newPending();
  const deadline = Date.now() + SCRIPT_WAIT_MS;
  const tick = () => {
    if (window.turnstile) renderWidget();
    else if (Date.now() < deadline) setTimeout(tick, 100);
    else console.error('turnstile script never loaded');
  };
  tick();
}

/** Resolves with an unused token (or '' on failure or timeout), then immediately requests the next one. */
export async function getTurnstileToken(): Promise<string> {
  if (!pending) initTurnstile();
  const timeout = new Promise<string>((r) => setTimeout(() => r(''), TOKEN_WAIT_MS));
  const token = await Promise.race([pending!, timeout]);
  newPending();
  if (widgetId) window.turnstile?.reset(widgetId);
  return token;
}
