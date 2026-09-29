import { describe, expect, it } from 'vitest';
import { parseAiLine, pipeAiStream, sseEvent, sseStream } from './stream';
import { aiStream } from './test-helpers';

async function readAll(stream: ReadableStream<Uint8Array>) {
  return new TextDecoder().decode(new Uint8Array(await new Response(stream).arrayBuffer()));
}

describe('parseAiLine', () => {
  it('extracts response text', () => {
    expect(parseAiLine('data: {"response":"hel"}')).toBe('hel');
  });
  it('returns null for [DONE], blanks and malformed', () => {
    expect(parseAiLine('data: [DONE]')).toBeNull();
    expect(parseAiLine('')).toBeNull();
    expect(parseAiLine('data: {"nope":1}')).toBeNull();
  });
});

describe('sseStream', () => {
  it('emits events in the order the producer emits them', async () => {
    const out = await readAll(
      sseStream(async (emit) => {
        emit('status', { text: 'RETRIEVING' });
        emit('fragments', []);
        emit('done', { model: 'm', latencyMs: 5, fragmentCount: 0 });
      }),
    );
    expect(out).toBe(
      'event: status\ndata: {"text":"RETRIEVING"}\n\n' + 'event: fragments\ndata: []\n\n' + 'event: done\ndata: {"model":"m","latencyMs":5,"fragmentCount":0}\n\n',
    );
  });

  it('turns a thrown guardrail error into an error event with its category', async () => {
    const out = await readAll(
      sseStream(async () => {
        throw new Error('2016: blocked (S1)');
      }),
    );
    expect(out).toBe('event: error\ndata: {"status":"rejected","category":"S1"}\n\n');
  });

  it('turns any other throw into uplink_lost and still closes', async () => {
    const out = await readAll(
      sseStream(async (emit) => {
        emit('status', { text: 'GENERATING' });
        throw new TypeError('boom');
      }),
    );
    expect(out).toBe('event: status\ndata: {"text":"GENERATING"}\n\n' + 'event: error\ndata: {"status":"uplink_lost"}\n\n');
  });
});

describe('pipeAiStream', () => {
  const collect = () => {
    const events: string[] = [];
    return { events, emit: (name: string, data: unknown) => events.push(sseEvent(name, data)) };
  };

  it('emits one delta per token', async () => {
    const { events, emit } = collect();
    await pipeAiStream(aiStream(['data: {"response":"A"}\n\ndata: {"response":"B"}\n\ndata: [DONE]\n\n']), emit);
    expect(events).toEqual(['event: delta\ndata: {"text":"A"}\n\n', 'event: delta\ndata: {"text":"B"}\n\n']);
  });

  it('handles a data line split across two chunks without dropping or duplicating', async () => {
    const { events, emit } = collect();
    await pipeAiStream(aiStream(['data: {"resp', 'onse":"AB"}\n\ndata: [DONE]\n\n']), emit);
    expect(events).toEqual(['event: delta\ndata: {"text":"AB"}\n\n']);
  });

  it('rethrows when the source fails mid-stream, after emitting what arrived', async () => {
    const { events, emit } = collect();
    let pulls = 0;
    const failing = new ReadableStream<Uint8Array>({
      pull(c) {
        if (pulls++ === 0) c.enqueue(new TextEncoder().encode('data: {"response":"A"}\n\n'));
        else c.error(new Error('boom'));
      },
    });
    await expect(pipeAiStream(failing, emit)).rejects.toThrow('boom');
    expect(events).toEqual(['event: delta\ndata: {"text":"A"}\n\n']);
  });
});
