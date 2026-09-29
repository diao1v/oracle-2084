import { z } from 'zod';

const message = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().trim().min(1).max(500),
});

export const chatBodySchema = z.object({
  turnstileToken: z.string().min(1).max(2048),
  messages: z
    .array(message)
    .min(1)
    .max(8)
    .refine((m) => m[m.length - 1].role === 'user', { message: 'last message must be from user' }),
});

export type ChatBody = z.infer<typeof chatBodySchema>;
