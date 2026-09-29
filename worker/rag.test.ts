import { describe, expect, it, vi } from 'vitest';
import { buildMessages, retrieve } from './rag';
import { makeEnv } from './test-helpers';

const match = (id: string, score: number, metadata?: Record<string, unknown>) => ({ id, score, metadata });

describe('retrieve', () => {
  it('embeds the query and maps matches to fragments above the floor', async () => {
    const run = vi.fn(async () => ({ data: [[0.5, 0.5]] }));
    const query = vi.fn(async () => ({
      matches: [
        match('a:0', 0.9, { source: 'projects/a.md', heading: 'A', text: 'alpha' }),
        match('b:0', 0.44, { source: 'projects/b.md', heading: 'B', text: 'beta' }),
        match('c:0', 0.7),
      ],
      count: 3,
    }));
    const env = makeEnv({ AI: { run } as unknown as Ai, VECTORIZE: { query } as unknown as VectorizeIndex });

    const frags = await retrieve(env, 'what is a');

    // Embeddings skip the gateway: no guardrail round trip, no false positives on retrieval.
    expect(run).toHaveBeenCalledWith('@cf/baai/bge-m3', { text: ['what is a'] });
    expect(query).toHaveBeenCalledWith([0.5, 0.5], { topK: 6, returnMetadata: 'all' });
    expect(frags).toEqual([{ id: 'a:0', source: 'projects/a.md', heading: 'A', score: 0.9, text: 'alpha' }]);
  });
});

describe('buildMessages', () => {
  it('puts the system prompt and fragments first, then history', () => {
    const msgs = buildMessages(
      [{ id: 'a:0', source: 'projects/a.md', heading: 'A', score: 0.9, text: 'alpha' }],
      [{ role: 'user', content: 'hi' }],
    );
    expect(msgs[0].role).toBe('system');
    expect(msgs[0].content).toContain('FRAGMENT a:0');
    expect(msgs[0].content).toContain('projects/a.md');
    expect(msgs[0].content).toContain('alpha');
    expect(msgs.at(-1)).toEqual({ role: 'user', content: 'hi' });
  });
});

describe('similarity floor', () => {
  it('keeps a 0.47 match, which bge-m3 gives to correct short-query hits', async () => {
    const env = makeEnv({
      VECTORIZE: {
        query: async () => ({ matches: [{ id: 'a:0', score: 0.47, metadata: { source: 'about.md', heading: 'Identity', text: 'x' } }], count: 1 }),
      } as unknown as VectorizeIndex,
    });
    expect(await retrieve(env, 'who is the subject')).toHaveLength(1);
  });
});
