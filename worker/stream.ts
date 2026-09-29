import type { DonePayload } from './types';

export function sseEvent(name: string, data: unknown): string {
  return `event: ${name}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function parseAiLine(line: string): string | null {
  if (!line.startsWith('data:')) return null;
  const body = line.slice(5).trim();
  if (!body || body === '[DONE]') return null;
  try {
    const parsed = JSON.parse(body) as { response?: unknown };
    return typeof parsed.response === 'string' ? parsed.response : null;
  } catch {
    return null;
  }
}

export function toOracleStream(ai: ReadableStream<Uint8Array>, head: string, done: () => DonePayload): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  const dec = new TextDecoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      if (head) controller.enqueue(enc.encode(head));
      const reader = ai.getReader();
      let buffer = '';
      try {
        for (;;) {
          const { value, done: finished } = await reader.read();
          if (finished) break;
          buffer += dec.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            const text = parseAiLine(line);
            if (text) controller.enqueue(enc.encode(sseEvent('delta', { text })));
          }
        }
        const tail = parseAiLine(buffer);
        if (tail) controller.enqueue(enc.encode(sseEvent('delta', { text: tail })));
        controller.enqueue(enc.encode(sseEvent('done', done())));
      } catch (e) {
        console.error('stream failed', e);
        controller.enqueue(enc.encode(sseEvent('error', { status: 'uplink_lost' })));
      } finally {
        controller.close();
      }
    },
  });
}
