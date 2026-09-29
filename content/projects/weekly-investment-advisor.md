# Weekly Investment Advisor

Weekly Investment Advisor is one of the subject's software projects.
Summary: Sizes your weekly buy against the market, by email.

## Links
- GitHub: https://github.com/diao1v/SIP-reminder

## Gallery
- Weekly portfolio email report

**Weekly Investment Advisor** decides how much to invest each week and emails the plan. I'm a long-term, buy-and-hold investor who dollar-cost-averages into a fixed portfolio, and the whole point of this tool is to keep those weekly buys disciplined and unemotional. A single composite score blends five market signals into an investment multiplier, so the amount automatically leans in when the market is fearful and eases off when it's greedy — no second-guessing, and never pausing.

## Why built this

As a long-term investor, picking *what* to buy is the easy part — the hard part is deciding *how much* to buy each week, and not letting emotion make that call. Fear shrinks the buy exactly when I should be leaning in; greed inflates it at the top. I wanted a rule-based system that takes me out of that decision entirely: it sizes each week's contribution from the data, unemotionally, and just emails me the number. No chart-watching, no second-guessing.

## Features

- **Composite Signal Score (CSS)** — blends five signals into one 0–100 score: VIX, RSI, Bollinger Band width, MA50 trend, and the CNN Fear & Greed Index.
- **Adjusts the weekly buy** — the score maps to a 0.5x–1.2x multiplier on the base budget: more when the market is fearful, less when greedy, but never zero.
- **Falling-knife guard** — an MA50 slope filter avoids maxing out on an asset that's still trending down.
- **Real market data with fallbacks** — VIX and prices via yahoo-finance2, Fear & Greed scraped from CNN; if F&G fails, its weight is redistributed to VIX and RSI.
- **Weekly email report** — a formatted HTML email with the full CSS breakdown and per-asset allocations, on a cron (Wednesday evening).
- **History & API** — optional Convex storage of weekly snapshots, plus REST endpoints for review and backtesting.

## How it works

```
Cron (weekly) ──> fetch market data (VIX, prices, Fear & Greed)
                     │
                     ├─> technical indicators (RSI, Bollinger, MA50 + slope)
                     ├─> CSS score ──> 0.5x–1.2x multiplier ──> per-asset allocation
                     ├─> HTML email report (Nodemailer)
                     └─> Convex snapshot (history / backtest)
```

A `node-cron` job fires weekly, pulls live market data, computes the technical indicators, folds them into the weighted CSS score, and turns that into a per-asset dollar allocation across a fixed portfolio. The result goes out as an HTML email and, optionally, into Convex for historical review. The same analysis is exposed over a small Hono API so it can be triggered or queried on demand.

## Technologies Used

- **Language / runtime**: TypeScript on Node.js
- **Web framework**: Hono
- **Market data**: yahoo-finance2, axios, CNN Fear & Greed Index
- **Indicators**: technicalindicators (RSI, Bollinger Bands, moving averages, ATR)
- **Email**: Nodemailer
- **Scheduling**: node-cron
- **Database**: Convex (optional history)
- **Testing**: Vitest
