import { OracleError } from './errors';

export function clientIp(request: Request): string {
  return request.headers.get('cf-connecting-ip') ?? 'local';
}

export async function verifyTurnstile(token: string, ip: string, secret: string, fetchFn: typeof fetch = fetch): Promise<void> {
  let ok = false;
  try {
    const res = await fetchFn('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(10_000),
    });
    if (res.ok) ok = ((await res.json()) as { success?: boolean }).success === true;
  } catch (e) {
    console.error('turnstile siteverify failed', e);
  }
  if (!ok) throw new OracleError({ status: 'rejected' }, 403);
}

export async function checkRateLimit(request: Request, limiter: RateLimit): Promise<void> {
  const { success } = await limiter.limit({ key: clientIp(request) });
  if (!success) throw new OracleError({ status: 'throttled', retryAfter: 60 }, 429);
}
