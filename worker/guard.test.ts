import { describe, expect, it } from 'vitest';
import { checkRateLimit, clientIp, verifyTurnstile } from './guard';
import { OracleError } from './errors';

const fakeFetch = (body: unknown, ok = true) =>
  (async () => new Response(JSON.stringify(body), { status: ok ? 200 : 500 })) as unknown as typeof fetch;

describe('verifyTurnstile', () => {
  it('resolves on success', async () => {
    await expect(verifyTurnstile('tok', '1.2.3.4', 'sec', fakeFetch({ success: true }))).resolves.toBeUndefined();
  });
  it('throws rejected on failure or spent token', async () => {
    const err = await verifyTurnstile('tok', '1.2.3.4', 'sec', fakeFetch({ success: false, 'error-codes': ['timeout-or-duplicate'] })).catch((e) => e);
    expect(err).toBeInstanceOf(OracleError);
    expect(err.payload).toEqual({ status: 'rejected' });
    expect(err.httpStatus).toBe(403);
  });
  it('throws rejected when siteverify itself fails', async () => {
    const err = await verifyTurnstile('tok', '1.2.3.4', 'sec', fakeFetch({}, false)).catch((e) => e);
    expect(err.payload).toEqual({ status: 'rejected' });
  });
});

describe('clientIp', () => {
  it('reads cf-connecting-ip', () => {
    expect(clientIp(new Request('http://x', { headers: { 'cf-connecting-ip': '9.9.9.9' } }))).toBe('9.9.9.9');
  });
  it('falls back to a fixed key locally', () => {
    expect(clientIp(new Request('http://x'))).toBe('local');
  });
});

describe('checkRateLimit', () => {
  it('passes when under the limit', async () => {
    const limiter = { limit: async () => ({ success: true }) } as unknown as RateLimit;
    await expect(checkRateLimit(new Request('http://x'), limiter)).resolves.toBeUndefined();
  });
  it('throws throttled with retryAfter when over', async () => {
    const limiter = { limit: async () => ({ success: false }) } as unknown as RateLimit;
    const err = await checkRateLimit(new Request('http://x'), limiter).catch((e) => e);
    expect(err.payload).toEqual({ status: 'throttled', retryAfter: 60 });
    expect(err.httpStatus).toBe(429);
  });
});
