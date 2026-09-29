export async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  if (url.pathname === '/api/health') {
    return Response.json({ ok: true });
  }
  return new Response('Not found', { status: 404 });
}

export default {
  fetch: handleRequest,
} satisfies ExportedHandler<Env>;
