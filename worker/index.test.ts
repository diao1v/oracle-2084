import { describe, expect, it, vi } from 'vitest';
import { handleRequest } from './index';
import { aiStream, makeEnv } from './test-helpers';

const post = (body: unknown, headers: Record<string, string> = {}) =>
  new Request('http://x/api/chat', { method: 'POST', headers: { 'content-type': 'application/json', ...headers }, body: JSON.stringify(body) });
const good = { turnstileToken: 'tok', messages: [{ role: 'user', content: 'WHO IS THE SUBJECT' }] };
const okVerify = vi.fn(async () => new Response(JSON.stringify({ success: true })));

describe('GET /api/health', () => {
  it('returns vector count', async () => {
    const res = await handleRequest(new Request('http://x/api/health'), makeEnv());
    expect(await res.json()).toEqual({ ok: true, vectors: 42 });
  });
});

describe('POST /api/chat', () => {
  it('rejects a malformed body with 400', async () => {
    const res = await handleRequest(post({ messages: [] }), makeEnv());
    expect(res.status).toBe(400);
  });

  it('returns throttled when over the limit', async () => {
    const env = makeEnv({ RATE_LIMITER: { limit: async () => ({ success: false }) } as unknown as RateLimit });
    const res = await handleRequest(post(good), env);
    expect(res.status).toBe(429);
    expect(await res.json()).toEqual({ status: 'throttled', retryAfter: 60 });
  });

  it('returns no_record when nothing clears the floor', async () => {
    const env = makeEnv();
    vi.stubGlobal('fetch', okVerify);
    const res = await handleRequest(post(good), env);
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ status: 'no_record' });
    vi.unstubAllGlobals();
  });

  it('streams fragments, deltas and done on the happy path', async () => {
    const run = vi.fn(async (model: string) =>
      model.startsWith('@cf/baai') ? { data: [[0.1]] } : aiStream(['data: {"response":"ROLE: ENGINEER"}\n\ndata: [DONE]\n\n']),
    );
    const env = makeEnv({
      AI: { run } as unknown as Ai,
      VECTORIZE: {
        query: async () => ({ matches: [{ id: 'a:0', score: 0.9, metadata: { source: 'about.md', heading: 'Role', text: 'engineer' } }], count: 1 }),
        describe: async () => ({ vectorsCount: 1 }),
      } as unknown as VectorizeIndex,
    });
    vi.stubGlobal('fetch', okVerify);
    const res = await handleRequest(post(good), env);
    vi.unstubAllGlobals();
    expect(res.headers.get('content-type')).toBe('text/event-stream');
    const text = await res.text();
    expect(text).toContain('event: fragments\ndata: [{"id":"a:0","source":"about.md","heading":"Role","score":0.9,"text":"engineer"}]');
    expect(text).toContain('event: delta\ndata: {"text":"ROLE: ENGINEER"}');
    expect(text).toContain('event: done');
    expect(run).toHaveBeenLastCalledWith(
      '@cf/meta/llama-3.3-70b-instruct-fp8-fast',
      expect.objectContaining({ stream: true, max_tokens: 400 }),
      { gateway: { id: 'test-gateway' } },
    );
  });

  it('maps a guardrail block to rejected', async () => {
    const run = vi.fn(async (model: string) => {
      if (model.startsWith('@cf/baai')) return { data: [[0.1]] };
      throw new Error('2016: blocked (S1)');
    });
    const env = makeEnv({
      AI: { run } as unknown as Ai,
      VECTORIZE: {
        query: async () => ({ matches: [{ id: 'a:0', score: 0.9, metadata: { source: 's', heading: 'h', text: 't' } }], count: 1 }),
        describe: async () => ({ vectorsCount: 1 }),
      } as unknown as VectorizeIndex,
    });
    vi.stubGlobal('fetch', okVerify);
    const res = await handleRequest(post(good), env);
    vi.unstubAllGlobals();
    expect(res.status).toBe(422);
    expect(await res.json()).toEqual({ status: 'rejected', category: 'S1' });
  });
});
