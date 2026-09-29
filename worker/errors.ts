import type { ErrorPayload } from './types';

export class OracleError extends Error {
  constructor(public payload: ErrorPayload, public httpStatus: number) {
    super(payload.status);
  }
}

export function mapError(e: unknown): OracleError {
  if (e instanceof OracleError) return e;
  const message = e instanceof Error ? e.message : String(e);
  if (message.includes('2016') || message.includes('2017')) {
    const category = /\b([SP]\d{1,2})\b/.exec(message)?.[1];
    return new OracleError(category ? { status: 'rejected', category } : { status: 'rejected' }, 422);
  }
  console.error('uplink_lost', e);
  return new OracleError({ status: 'uplink_lost' }, 502);
}
