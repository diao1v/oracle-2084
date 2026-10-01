import { SYSTEM_PROMPT } from './prompt';
import type { ChatMessage, Fragment } from './types';

export const EMBED_MODEL = '@cf/baai/bge-m3';
export const GEN_MODEL = '@cf/meta/llama-3.3-70b-instruct-fp8-fast';
const TOP_K = 6;
const FLOOR = 0.40; // unrelated chunks score ~0.33-0.36; two-topic questions split their score across sections

export async function embed(env: Env, text: string): Promise<number[]> {
  // Not routed through the gateway on purpose: Guardrails would scan the query text for nothing.
  const out = (await env.AI.run(EMBED_MODEL, { text: [text] })) as { data: number[][] };
  return out.data[0];
}

export async function retrieve(env: Env, query: string): Promise<Fragment[]> {
  const vector = await embed(env, query);
  const { matches } = await env.VECTORIZE.query(vector, { topK: TOP_K, returnMetadata: 'all' });
  return matches
    .filter((m) => m.score >= FLOOR && m.metadata && typeof m.metadata.text === 'string')
    .map((m) => ({
      id: m.id,
      source: String(m.metadata!.source ?? ''),
      heading: String(m.metadata!.heading ?? ''),
      score: m.score,
      text: String(m.metadata!.text),
    }))
    .sort((a, b) => b.score - a.score);
}

export function buildMessages(fragments: Fragment[], history: ChatMessage[]) {
  // Numbered records only: ids and file names are kept out so the model cannot quote them back.
  const block = fragments.map((f, i) => `[RECORD ${i + 1}]\n${f.text}`).join('\n\n');
  return [{ role: 'system' as const, content: SYSTEM_PROMPT + block }, ...history];
}
