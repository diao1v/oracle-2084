import { createHash } from 'node:crypto';

export type Chunk = { id: string; source: string; heading: string; index: number; text: string };

type Opts = { maxWords?: number; overlapWords?: number };

export function chunkMarkdown(path: string, markdown: string, opts: Opts = {}): Chunk[] {
  const maxWords = opts.maxWords ?? 400;
  const overlap = opts.overlapWords ?? 40;
  const prefix = createHash('sha1').update(path).digest('hex').slice(0, 12);

  const sections: { heading: string; body: string[] }[] = [];
  let current = { heading: '', body: [] as string[] };
  for (const line of markdown.split('\n')) {
    const m = /^#{1,6}\s+(.*)$/.exec(line);
    if (m) {
      if (current.body.join(' ').trim()) sections.push(current);
      current = { heading: m[1].trim(), body: [] };
    } else {
      current.body.push(line);
    }
  }
  if (current.body.join(' ').trim()) sections.push(current);

  const out: Chunk[] = [];
  for (const s of sections) {
    const words = s.body.join('\n').split(/\s+/).filter(Boolean);
    const cap = Math.max(overlap + 1, maxWords - (s.heading ? s.heading.split(/\s+/).length : 0));
    for (let start = 0; start < words.length; start += cap - overlap) {
      const body = words.slice(start, start + cap).join(' ');
      const text = s.heading ? `${s.heading}\n${body}` : body;
      const index = out.length;
      out.push({ id: `${prefix}:${index}`, source: path, heading: s.heading, index, text });
      if (start + cap >= words.length) break;
    }
  }
  return out;
}
