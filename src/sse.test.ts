import { describe, expect, it } from 'vitest';
import { parseSse } from './sse';

describe('parseSse', () => {
  it('parses complete events and keeps the incomplete tail', () => {
    const { events, rest } = parseSse('event: delta\ndata: {"text":"A"}\n\nevent: del');
    expect(events).toEqual([{ name: 'delta', data: '{"text":"A"}' }]);
    expect(rest).toBe('event: del');
  });
  it('handles multiple events in one buffer', () => {
    const { events } = parseSse('event: a\ndata: 1\n\nevent: b\ndata: 2\n\n');
    expect(events.map((e) => e.name)).toEqual(['a', 'b']);
  });
});
