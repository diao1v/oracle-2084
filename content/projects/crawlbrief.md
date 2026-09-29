# CrawlBrief

CrawlBrief is one of the subject's software projects.
Summary: AI-powered competitor monitoring pipeline.
Note: Self-hosted; delivers summaries straight to Slack

## Links
- CrawlBrief: https://github.com/diao1v/crawlbrief
- Firecrawl Gateway: https://github.com/diao1v/firecrawl-gateway
- Firecrawl (fork): https://github.com/diao1v/firecrawl

## Gallery
- A summarized competitor brief delivered to Slack

**CrawlBrief** is a self-hosted pipeline that monitors competitor websites, extracts anything new, and delivers AI-written summaries to Slack — so I never have to manually check a dozen blogs and changelogs again. Cron-scheduled monitors watch listing pages, change tracking skips anything that hasn't moved, and an LLM turns new posts into concise, categorized briefs.

It's built as three cooperating services: **CrawlBrief** (the orchestrator), a **Firecrawl Gateway** (an authenticated proxy I wrote in front of the scraper), and a self-hosted fork of the open-source **Firecrawl** crawler.

## Why built this

Keeping tabs on what competitors ship. This will prevent any surprises in the market, and help me stay on top of trends. I also wanted to explore how to combine a self-hosted scraper with LLMs for automated summarization.

## Features

- **Scheduled monitoring** — per-monitor cron jobs watch listing pages (blog indexes, changelog pages).
- **Change detection** — uses Firecrawl's change tracking to skip unchanged pages, so nothing is re-processed.
- **AI extraction and summarization** — LLM pulls new article URLs out of a listing page's markdown. Summarys are generated for each article, including a headline, summary, key-feature bullets, a category (feature / improvement / announcement), and a 1–10 relevance score.
- **Async & resilient** — webhook-driven batch scraping, deduplication, and exponential-backoff retries on transient failures.

## Architecture

```
Cron ──> Monitor Runner ──> Firecrawl Gateway ──> Firecrawl (self-hosted)
                │                                        │
                ├──> LLM (extract + summarize)           │  webhooks
                │                                        v
                └──> PostgreSQL <────────────── /webhooks/firecrawl
                          │
                          └──> Notification Processor ──> Slack
```

- **CrawlBrief** — Hono HTTP server, node-cron scheduler, and a monitor runner that drives each run end to end.
- **Firecrawl Gateway** — bearer-token auth (anonymous or per-client), request logging, response normalization, and SSRF protection in front of the scraper.
- **Firecrawl** — a self-hosted fork of the open-source crawler that does the actual scraping.

## Technologies Used

- **Language / runtime**: TypeScript on Node.js
- **Web framework**: Hono
- **Database**: PostgreSQL with Drizzle ORM
- **Scraping**: self-hosted Firecrawl behind a custom gateway
- **LLMs**: OpenAI / Anthropic, with BYOK key management via Cloudflare AI Gateway
- **Notifications**: Slack Bot API
- **Delivery**: Docker Compose
