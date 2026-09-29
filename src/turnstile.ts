declare global {
  interface Window {
    turnstile?: {
      render(
        el: HTMLElement,
        opts: { sitekey: string; callback(token: string): void; 'error-callback'?(code?: string): boolean },
      ): string;
      reset(id: string): void;
    };
    onTurnstileLoad?: () => void;
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

/** Call once at startup. Renders the widget as soon as the Turnstile script loads (index.html uses ?onload=onTurnstileLoad). */
export function initTurnstile() {
  newPending();
  window.onTurnstileLoad = renderWidget;
  if (window.turnstile) renderWidget();
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
