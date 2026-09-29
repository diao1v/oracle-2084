const ACCOUNT = process.env.ORACLE_ACCOUNT_ID;
const TOKEN = process.env.ORACLE_API_TOKEN;
if (!ACCOUNT || !TOKEN) throw new Error('ORACLE_ACCOUNT_ID and ORACLE_API_TOKEN must be set in .env');
const BASE = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}`;
const headers = { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' };

// Expected is a substring of the top match's source path.
const CASES: [string, string][] = [
  ['who is the subject', 'about.md'],
  ['what is crawlbrief', 'projects/crawlbrief.md'],
  ['tell me about the macintosh portfolio', 'projects/macos-portfolio'],
  ['what does the subject do off work', 'off-work/'],
  ['aws certification', 'achievements/aws-saa.md'],
  ['woodworking', 'off-work/woodworks.md'],
  ['lego', 'off-work/lego-hplc-fragment-collector.md'],
  ['cycling event', 'achievements/lake-taupo-cycle-challenge.md'],
  ['currency tracker', 'projects/currency-tracker.md'],
  ['work history', 'cv.md'],
];

async function embed(text: string): Promise<number[]> {
  const res = await fetch(`${BASE}/ai/run/@cf/baai/bge-m3`, { method: 'POST', headers, body: JSON.stringify({ text: [text] }) });
  if (!res.ok) throw new Error(`embed failed: ${res.status} ${await res.text()}`);
  return ((await res.json()) as { result: { data: number[][] } }).result.data[0];
}

let hits = 0;
for (const [q, expected] of CASES) {
  const vector = await embed(q);
  const res = await fetch(`${BASE}/vectorize/v2/indexes/oracle-2084/query`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ vector, topK: 3, returnMetadata: 'all' }),
  });
  if (!res.ok) throw new Error(`query failed: ${res.status} ${await res.text()}`);
  const { result } = (await res.json()) as { result: { matches: { score: number; metadata: { source: string } }[] } };
  const top = result.matches[0];
  const hit = top && top.score >= 0.45 && top.metadata.source.includes(expected);
  hits += hit ? 1 : 0;
  console.log(`${hit ? 'HIT ' : 'MISS'} ${q.padEnd(40)} -> ${top?.metadata.source ?? 'none'} (${top?.score.toFixed(2) ?? '-'})`);
}
console.log(`\n${hits}/${CASES.length} hits`);
process.exitCode = hits === CASES.length ? 0 : 1;

export {};
