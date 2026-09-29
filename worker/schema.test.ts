import { describe, expect, it } from 'vitest';
import { chatBodySchema } from './schema';

const ok = { turnstileToken: 'tok', messages: [{ role: 'user', content: 'WHO IS THE SUBJECT' }] };

describe('chatBodySchema', () => {
  it('accepts a valid body', () => {
    expect(chatBodySchema.safeParse(ok).success).toBe(true);
  });
  it('rejects an empty or whitespace query', () => {
    expect(chatBodySchema.safeParse({ ...ok, messages: [{ role: 'user', content: '   ' }] }).success).toBe(false);
  });
  it('rejects more than eight messages', () => {
    const messages = Array.from({ length: 9 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: 'x' }));
    expect(chatBodySchema.safeParse({ ...ok, messages }).success).toBe(false);
  });
  it('rejects a message over 500 characters', () => {
    expect(chatBodySchema.safeParse({ ...ok, messages: [{ role: 'user', content: 'a'.repeat(501) }] }).success).toBe(false);
  });
  it('rejects when the last message is not from the user', () => {
    const messages = [{ role: 'user', content: 'a' }, { role: 'assistant', content: 'b' }];
    expect(chatBodySchema.safeParse({ ...ok, messages }).success).toBe(false);
  });
  it('rejects a missing token', () => {
    expect(chatBodySchema.safeParse({ messages: ok.messages }).success).toBe(false);
  });
});
