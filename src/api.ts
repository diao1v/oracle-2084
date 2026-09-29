import { parseSse } from './sse';
import type { ChatMessage, DonePayload, ErrorPayload, Fragment } from '../worker/types';

type Handlers = {
  onFragments(f: Fragment[]): void;
  onDelta(t: string): void;
  onDone(d: DonePayload): void;
  onError(e: ErrorPayload): void;
};

export async function sendQuery(messages: ChatMessage[], token: string, h: Handlers): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ turnstileToken: token, messages }),
    });
  } catch {
    return h.onError({ status: 'uplink_lost' });
  }

  if (!res.headers.get('content-type')?.startsWith('text/event-stream')) {
    const payload = (await res.json().catch(() => ({ status: 'uplink_lost' }))) as ErrorPayload;
    return h.onError(payload);
  }

  const reader = res.body!.getReader();
  const dec = new TextDecoder();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += dec.decode(value, { stream: true });
    const parsed = parseSse(buffer);
    buffer = parsed.rest;
    for (const ev of parsed.events) {
      if (ev.name === 'fragments') h.onFragments(JSON.parse(ev.data));
      else if (ev.name === 'delta') h.onDelta(JSON.parse(ev.data).text);
      else if (ev.name === 'done') h.onDone(JSON.parse(ev.data));
      else if (ev.name === 'error') h.onError(JSON.parse(ev.data));
    }
  }
}

export async function fetchHealth(): Promise<number> {
  const res = await fetch('/api/health');
  return ((await res.json()) as { vectors: number }).vectors;
}
