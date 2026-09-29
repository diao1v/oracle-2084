# Currency Tracker

Currency Tracker is one of the subject's software projects.
Summary: AI-powered forex analysis, emailed daily.
Note: Private repo
Note: Helps decide the best time to transfer money between currencies

## Gallery
- Daily AI forex recommendation email

**Currency Tracker** is a self-hosted forex analysis service that helps decide the best time to move money between currencies. Every weekday after market close it captures closing rates, scores them with 17 technical indicators, asks an AI to reason over the raw numbers, and emails a clear buy / wait / avoid recommendation to whoever is subscribed to that currency pair.

## Why built this

I regularly need to move money between currencies and never had a good way to tell whether today's rate was actually favourable or whether it was worth waiting. Eyeballing charts felt like guessing, so need a data-driven, unemotional second opinion — the technical signals plus an AI's read on them — delivered to my inbox on a schedule, instead of something I had to remember to check.

## Features

- **17 technical indicators** — multi-timeframe percentiles and z-scores (7/30/90/180-day), RSI-14, Bollinger Bands, moving averages, and MA golden/death crossover, combined into a 100-point score.
- **AI reasoning** — DeepSeek Reasoner receives the raw, unbiased indicator values and returns a suggestion, the indicators for and against, a risk assessment, a confidence level, and a day-over-day comparison.
- **Resilient rate data** — automatic failover across three providers (FCS API → ExchangeRate-API → Frankfurter), so a rate-limited or down API never stops a run.
- **Subscriber-driven emails** — recipients are managed in Airtable; only pairs that have subscribers get analyzed, which keeps AI token spend low.
- **Automated & scheduled** — a daily cron captures closing rates, runs the analysis, sends HTML emails, and stores every run for historical reference.

## How it works

```
Cron (daily) ──> Capture rates ──> 17 indicators ──> DeepSeek reasoning ──> Email
                      │                                                        │
                      └──> Convex (history) <──────── Airtable (subscribers) ──┘
```

Rates come in through an adapter layer (one adapter per provider, tried in priority order), technical analysis runs as ten small, independently tested indicator modules, and the results flow through a Routes → Handlers → Services pipeline. Analysis is async, so the API responds instantly while emails go out about a minute later.

## Technologies Used

- **Language / runtime**: TypeScript on Node.js
- **Web framework**: Hono
- **Database**: Convex
- **AI**: DeepSeek Reasoner
- **Data sources**: FCS API, ExchangeRate-API, Frankfurter
- **Email / recipients**: Nodemailer + Airtable
- **Scheduling**: node-cron
- **Testing**: Vitest
