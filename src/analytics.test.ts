import { describe, expect, it, vi } from 'vitest';
import { queryEvent } from './analytics';

vi.stubGlobal('window', { self: 1, top: 2 });

describe('queryEvent', () => {
  it('records an answered query with its meter', () => {
    expect(queryEvent('WHO IS THIS GUY', 'suggestion', 'answered', { model: 'm', latencyMs: 1500, fragmentCount: 3 })).toEqual({
      query: 'WHO IS THIS GUY',
      source: 'suggestion',
      outcome: 'answered',
      fragments: 3,
      latency_ms: 1500,
      model: 'm',
      embedded: true,
    });
  });
  it('records a failed query without a meter', () => {
    expect(queryEvent('X', 'typed', 'no_record', null)).toMatchObject({ outcome: 'no_record', fragments: 0, latency_ms: null, model: null });
  });
});
