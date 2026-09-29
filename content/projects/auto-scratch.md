# WeChat DIY Likes Vending Machine

WeChat DIY Likes Vending Machine is one of the subject's software projects.
Summary: WeChat Moments screenshot Likes collection simulator.
Note: Private repo

## Links
- Production site: https://zanful.diaoev.com/

## Gallery
- The app: editor with a live iPhone preview
- A generated Moment opened on a real phone

**WeChat DIY Likes Vending Machine** generates a realistic, simulated WeChat Moments screenshot showing an article shared and already liked by a chosen number of friends — the exact "proof" that share-and-collect-likes discount campaigns ask for, without pestering anyone. You paste a WeChat article link (rendered as a shared card), dial in how many likes to show, and add threaded comments; it composes the whole post inside a pixel-accurate iPhone + Moments UI with your own avatar and username, ready to download or share. Bilingual in Chinese and English.

## Why built this

More and more sellers, services, and merchants gate their discounts behind a share-to-collect-likes task: share their article to your Moments and collect a certain number of likes from friends before you qualify for the deal or perk. For an introvert, pestering friends for likes is exactly the kind of thing you'd rather not do. This tool is my small rebellion against that — it generates the Moments screenshot these campaigns ask for, so you can opt out of spamming your friends. It was also a good excuse to get pixel-accurate DOM-to-image export working and to put a properly secured edge proxy in front of a scraper.

## Features

- **Configurable likes** — set exactly how many likes to show; each is filled from a pool of random friend avatars, so the screenshot hits whatever count a campaign demands.
- **Article link cards** — paste a WeChat article URL and it scrapes the title, cover image, and account name to render an authentic-looking shared card.
- **Realistic Moments UI** — an iPhone frame around a faithful WeChat Moments layout, scaled to preview and export sizes.
- **Composable content** — custom avatar, username, and post text, plus threaded comments with reply prefixes.
- **Smart timestamps** — separate post and screenshot times produce relative labels ("just now", "5 minutes ago", "yesterday", dated).
- **One-tap export** — `modern-screenshot` renders the DOM to PNG; desktop downloads directly, mobile uses the native share sheet (reliable on iOS Safari).
- **Bilingual** — full zh/en interface from a single translation dictionary.

## How it works

```
Browser (React) ──> CF Worker (fetch + parse + rate limit + cache + R2) ──> WeChat article
      │
      └──> modern-screenshot (DOM → PNG) ──> download / share sheet
```

The frontend never fetches WeChat directly. A Cloudflare Worker (Hono) takes a single `{ url }`, checks it against a host allowlist (`mp.weixin.qq.com`), and enforces a per-IP KV rate limit. It then streams the article HTML itself and regex-matches the Open Graph tags (`og:title`, `og:image`, `og:site_name`) plus the account nick-name, bailing as soon as all are found (hard-capped at 2 MiB so a long article can't tie up the worker). Cover images are copied into an R2 bucket and served from a custom domain, and successful responses are cached for 24h via the Cache API. A separate image-proxy endpoint serves avatars and thumbnails under their own rate limit.

## Technologies Used

- **Frontend**: React + TypeScript, Vite (rolldown), Tailwind CSS v4
- **UI**: Radix UI primitives, lucide-react, react-day-picker
- **State / forms**: Zustand, TanStack Form, Zod
- **Image export**: modern-screenshot (DOM → PNG)
- **Backend**: Cloudflare Workers (Hono), KV rate limiting, Cache API, R2 storage
- **Scraping**: direct HTML fetch + Open Graph / nick-name regex extraction (no third-party scraper)
