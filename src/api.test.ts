import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendQuery } from './api';

const sse = (body: string) =>
  new Response(body, { headers: { 'content-type': 'text/event-stream' } });

afterEach(() => vi.unstubAllGlobals());

describe('sendQuery', () => {
  it('reports uplink_lost instead of throwing when an event carries malformed JSON', async () => {
    vi.stubGlobal('fetch', async () => sse('event: delta\ndata: {"text":"A"}\n\nevent: delta\ndata: {broken\n\n'));
    const errors: unknown[] = [];
    const deltas: string[] = [];
    await sendQuery([{ role: 'user', content: 'x' }], 'tok', {
      onFragments: () => {},
      onDelta: (t) => deltas.push(t),
      onDone: () => {},
      onError: (e) => errors.push(e),
    });
    expect(deltas).toEqual(['A']);
    expect(errors).toEqual([{ status: 'uplink_lost' }]);
  });

  it('passes non-stream JSON statuses straight to onError', async () => {
    vi.stubGlobal('fetch', async () => Response.json({ status: 'no_record' }));
    const errors: unknown[] = [];
    await sendQuery([{ role: 'user', content: 'x' }], 'tok', {
      onFragments: () => {},
      onDelta: () => {},
      onDone: () => {},
      onError: (e) => errors.push(e),
    });
    expect(errors).toEqual([{ status: 'no_record' }]);
  });
});
