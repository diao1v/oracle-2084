declare global {
  interface Window {
    turnstile?: {
      render(
        el: HTMLElement,
        opts: { sitekey: string; size: 'invisible' | 'normal'; callback(token: string): void; 'error-callback'?(): void },
      ): string;
      reset(id: string): void;
    };
  }
}

const SITEKEY = import.meta.env.VITE_TURNSTILE_SITEKEY as string;
let widgetId: string | null = null;
let pending: Promise<string> | null = null;
let resolveToken: ((t: string) => void) | null = null;

function newPending() {
  pending = new Promise<string>((resolve) => (resolveToken = resolve));
}

function ensureWidget() {
  if (widgetId || !window.turnstile) return;
  const el = document.createElement('div');
  document.body.appendChild(el);
  newPending();
  widgetId = window.turnstile.render(el, {
    sitekey: SITEKEY,
    size: 'invisible',
    callback: (token) => resolveToken?.(token),
    'error-callback': () => resolveToken?.(''),
  });
}

/** Resolves with an unused token, then immediately requests the next one. */
export async function getTurnstileToken(): Promise<string> {
  ensureWidget();
  if (!widgetId || !pending) return '';
  const token = await pending;
  newPending();
  window.turnstile!.reset(widgetId);
  return token;
}
