import { mapError } from './errors';

type Emit = (name: string, data: unknown) => void;

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

/**
 * Runs `producer` and streams whatever it emits as SSE. A throw becomes one `error`
 * event (guardrail blocks keep their category, everything else is uplink_lost) and the
 * stream always closes, so the client never waits on a dead connection.
 */
export function sseStream(producer: (emit: Emit) => Promise<void>): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const emit: Emit = (name, data) => controller.enqueue(enc.encode(sseEvent(name, data)));
      try {
        await producer(emit);
      } catch (e) {
        emit('error', mapError(e).payload);
      } finally {
        controller.close();
      }
    },
  });
}

/** Reads a Workers AI SSE stream and emits one `delta` per token. Rethrows source failures. */
export async function pipeAiStream(ai: ReadableStream<Uint8Array>, emit: Emit): Promise<void> {
  const dec = new TextDecoder();
  const reader = ai.getReader();
  let buffer = '';
  for (;;) {
    const { value, done } = await reader.read();
    if (done) break;
    buffer += dec.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';
    for (const line of lines) {
      const text = parseAiLine(line);
      if (text) emit('delta', { text });
    }
  }
  const tail = parseAiLine(buffer);
  if (tail) emit('delta', { text: tail });
}
