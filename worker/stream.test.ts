import { describe, expect, it } from 'vitest';
import { parseAiLine, sseEvent, toOracleStream } from './stream';
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

describe('toOracleStream', () => {
  const done = () => ({ model: 'm', latencyMs: 5, fragmentCount: 1 });

  it('emits head, deltas and done', async () => {
    const out = await readAll(toOracleStream(aiStream(['data: {"response":"A"}\n\ndata: {"response":"B"}\n\ndata: [DONE]\n\n']), sseEvent('fragments', []), done));
    expect(out).toBe(
      'event: fragments\ndata: []\n\n' +
        'event: delta\ndata: {"text":"A"}\n\n' +
        'event: delta\ndata: {"text":"B"}\n\n' +
        'event: done\ndata: {"model":"m","latencyMs":5,"fragmentCount":1}\n\n',
    );
  });

  it('handles a data line split across two chunks without dropping or duplicating', async () => {
    const out = await readAll(toOracleStream(aiStream(['data: {"resp', 'onse":"AB"}\n\ndata: [DONE]\n\n']), '', done));
    expect(out).toContain('event: delta\ndata: {"text":"AB"}\n\n');
    expect(out.match(/event: delta/g)).toHaveLength(1);
  });

  it('emits an error event if the source fails mid-stream', async () => {
    let pulls = 0;
    const failing = new ReadableStream<Uint8Array>({
      pull(c) {
        if (pulls++ === 0) c.enqueue(new TextEncoder().encode('data: {"response":"A"}\n\n'));
        else c.error(new Error('boom'));
      },
    });
    const out = await readAll(toOracleStream(failing, '', done));
    expect(out).toContain('event: delta\ndata: {"text":"A"}');
    expect(out).toContain('event: error\ndata: {"status":"uplink_lost"}');
    expect(out).not.toContain('event: done');
  });
});
