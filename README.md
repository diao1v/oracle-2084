# Oracle 2084

Terminal oracle about Yiwei. Cloudflare Worker + Vectorize + Workers AI, guarded by Turnstile, a rate limiter and AI Gateway Guardrails.

- `pnpm dev` local dev with remote AI and Vectorize bindings
- `pnpm ingest` re-embed `content/` and upsert to Vectorize
- `pnpm smoke` check retrieval against ten known questions
- `pnpm test` unit and worker tests
- `pnpm run deploy` build and deploy by hand (`run` is required: pnpm has a built-in `deploy` command)

Spec: `docs/superpowers/specs/2026-09-29-oracle-2084-design.md`
