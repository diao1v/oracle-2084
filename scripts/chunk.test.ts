import { describe, expect, it } from 'vitest';
import { chunkMarkdown } from './chunk';

const doc = `# Crawlbrief

Intro paragraph one.

## Stack

Built with Hono and Drizzle.

## Lessons

${'word '.repeat(900)}
`;

describe('chunkMarkdown', () => {
  it('splits on headings and keeps the heading in metadata', () => {
    const chunks = chunkMarkdown('projects/crawlbrief.md', doc);
    expect(chunks[0].heading).toBe('Crawlbrief');
    expect(chunks[1].heading).toBe('Stack');
    expect(chunks[1].text).toContain('Hono');
    expect(chunks.every((c) => c.source === 'projects/crawlbrief.md')).toBe(true);
  });

  it('caps sections at maxWords with overlap', () => {
    const chunks = chunkMarkdown('a.md', doc, { maxWords: 400, overlapWords: 40 });
    const lessons = chunks.filter((c) => c.heading === 'Lessons');
    expect(lessons.length).toBeGreaterThan(1);
    for (const c of lessons) expect(c.text.split(/\s+/).length).toBeLessThanOrEqual(400);
  });

  it('gives stable ids', () => {
    const a = chunkMarkdown('a.md', doc);
    const b = chunkMarkdown('a.md', doc);
    expect(a.map((c) => c.id)).toEqual(b.map((c) => c.id));
    expect(a[0].id).toMatch(/^[0-9a-f]{12}:0$/);
  });

  it('returns nothing for empty input', () => {
    expect(chunkMarkdown('a.md', '   \n')).toEqual([]);
  });
});
