export function makeEnv(overrides: Partial<Env> = {}): Env {
  const env = {
    GATEWAY_ID: 'test-gateway',
    TURNSTILE_SECRET: 'secret',
    RATE_LIMITER: { limit: async () => ({ success: true }) },
    VECTORIZE: {
      query: async () => ({ matches: [], count: 0 }),
      describe: async () => ({ vectorCount: 42, dimensions: 1024 }),
    },
    AI: { run: async () => ({ data: [[0.1, 0.2]] }) },
    ...overrides,
  };
  return env as unknown as Env;
}

export function aiStream(chunks: string[]): ReadableStream<Uint8Array> {
  const enc = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const c of chunks) controller.enqueue(enc.encode(c));
      controller.close();
    },
  });
}
