import { describe, expect, it } from 'vitest';
import { OracleError, mapError } from './errors';

describe('mapError', () => {
  it('passes OracleError through', () => {
    const e = new OracleError({ status: 'throttled', retryAfter: 12 }, 429);
    expect(mapError(e)).toBe(e);
  });
  it('maps guardrail prompt block 2016 to rejected', () => {
    const e = mapError(new Error('AiError: 2016: Prompt blocked by guardrails (S1)'));
    expect(e.payload).toEqual({ status: 'rejected', category: 'S1' });
    expect(e.httpStatus).toBe(422);
  });
  it('maps guardrail response block 2017 to rejected without a category when none is given', () => {
    const e = mapError(new Error('2017 response blocked'));
    expect(e.payload).toEqual({ status: 'rejected' });
  });
  it('maps anything else to uplink_lost', () => {
    const e = mapError(new TypeError('fetch failed'));
    expect(e.payload).toEqual({ status: 'uplink_lost' });
    expect(e.httpStatus).toBe(502);
  });
});
