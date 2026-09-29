import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { chunkMarkdown, type Chunk } from './chunk.ts';

const ACCOUNT = process.env.ORACLE_ACCOUNT_ID;
const TOKEN = process.env.ORACLE_API_TOKEN;
const INDEX = 'oracle-2084';
const MODEL = '@cf/baai/bge-m3';
const ROOT = join(import.meta.dirname, '..', 'content');
const MANIFEST = join(ROOT, 'manifest.json');

if (!ACCOUNT || !TOKEN) throw new Error('ORACLE_ACCOUNT_ID and ORACLE_API_TOKEN must be set in .env');

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return walk(p);
    return name.endsWith('.md') ? [p] : [];
  });
}

async function embed(texts: string[]): Promise<number[][]> {
  const res = await fetch(`https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/ai/run/${MODEL}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: texts }),
  });
  if (!res.ok) throw new Error(`embed failed: ${res.status} ${await res.text()}`);
  const json = (await res.json()) as { result: { data: number[][] } };
  return json.result.data;
}

const files = walk(ROOT);
if (files.length === 0) throw new Error('content/ is empty, refusing to run');

const chunks: Chunk[] = files.flatMap((f) => chunkMarkdown(relative(ROOT, f), readFileSync(f, 'utf8')));
console.log(`${files.length} files -> ${chunks.length} chunks`);

const vectors: number[][] = [];
for (let i = 0; i < chunks.length; i += 100) {
  vectors.push(...(await embed(chunks.slice(i, i + 100).map((c) => c.text))));
  console.log(`embedded ${Math.min(i + 100, chunks.length)}/${chunks.length}`);
}

const dir = mkdtempSync(join(tmpdir(), 'oracle-'));
const file = join(dir, 'vectors.ndjson');
writeFileSync(
  file,
  chunks
    .map((c, i) =>
      JSON.stringify({ id: c.id, values: vectors[i], metadata: { source: c.source, heading: c.heading, text: c.text } }),
    )
    .join('\n') + '\n',
);
execFileSync('npx', ['wrangler', 'vectorize', 'upsert', INDEX, `--file=${file}`], { stdio: 'inherit' });

let previous: string[] = [];
try {
  previous = JSON.parse(readFileSync(MANIFEST, 'utf8')).ids;
} catch {}
const current = new Set(chunks.map((c) => c.id));
const stale = previous.filter((id) => !current.has(id));
if (stale.length) {
  execFileSync('npx', ['wrangler', 'vectorize', 'delete-vectors', INDEX, `--ids=${stale.join(',')}`], { stdio: 'inherit' });
  console.log(`deleted ${stale.length} stale vectors`);
}
writeFileSync(MANIFEST, JSON.stringify({ ids: [...current], updatedAt: new Date().toISOString() }, null, 2) + '\n');
console.log('manifest written');
