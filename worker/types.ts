export type ChatMessage = { role: 'user' | 'assistant'; content: string };
export type Fragment = { id: string; source: string; heading: string; score: number; text: string };
export type OracleStatus = 'throttled' | 'rejected' | 'no_record' | 'uplink_lost';
export type ErrorPayload = { status: OracleStatus; category?: string; retryAfter?: number };
export type DonePayload = { model: string; latencyMs: number; fragmentCount: number };
