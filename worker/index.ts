import { OracleError, mapError } from './errors';
import { checkRateLimit, clientIp, verifyTurnstile } from './guard';
import { GEN_MODEL, buildMessages, retrieve } from './rag';
import { chatBodySchema } from './schema';
import { sseEvent, toOracleStream } from './stream';

function errorResponse(e: OracleError): Response {
  return Response.json(e.payload, { status: e.httpStatus });
}

async function chat(request: Request, env: Env): Promise<Response> {
  const parsed = chatBodySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ status: 'rejected' }, { status: 400 });
  const { turnstileToken, messages } = parsed.data;

  await checkRateLimit(request, env.RATE_LIMITER);
  await verifyTurnstile(turnstileToken, clientIp(request), env.TURNSTILE_SECRET);

  const started = Date.now();
  const fragments = await retrieve(env, messages[messages.length - 1].content);
  if (fragments.length === 0) return Response.json({ status: 'no_record' });

  const ai = (await env.AI.run(
    GEN_MODEL,
    { messages: buildMessages(fragments, messages), stream: true, max_tokens: 400, temperature: 0.3 },
    { gateway: { id: env.GATEWAY_ID } },
  )) as ReadableStream<Uint8Array>;

  const body = toOracleStream(ai, sseEvent('fragments', fragments), () => ({
    model: GEN_MODEL,
    latencyMs: Date.now() - started,
    fragmentCount: fragments.length,
  }));
  return new Response(body, {
    headers: { 'content-type': 'text/event-stream', 'cache-control': 'no-cache', 'x-accel-buffering': 'no' },
  });
}

export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  try {
    if (url.pathname === '/api/health') {
      // Runtime returns vectorCount; the generated type says vectorsCount. Accept both.
      const info = (await env.VECTORIZE.describe()) as unknown as { vectorCount?: number; vectorsCount?: number };
      return Response.json({ ok: true, vectors: info.vectorCount ?? info.vectorsCount ?? 0 });
    }
    if (url.pathname === '/api/chat' && request.method === 'POST') return await chat(request, env);
    return new Response('Not found', { status: 404 });
  } catch (e) {
    return errorResponse(mapError(e));
  }
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>;
