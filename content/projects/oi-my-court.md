# oi-my-court

oi-my-court is one of the subject's software projects.
Summary: Auckland badminton court booking platform.
Note: Private repos (frontend + court-data backend)
Note: "Stop refreshing. Start smashing."

## Links
- Production site: https://oimycourt.diaoev.com/

## Gallery
- Landing and passwordless sign-in
- Cross-venue availability grid
- Booking a court
- Bookings and watched slots
- Settings: venue selection and encrypted credentials

**oi-my-court** ("Oi, My Court") is a booking platform that pulls badminton court availability from multiple Auckland venues into one clean interface, so you can compare, book, and cancel without hopping between each venue's clunky, dated booking site. It aggregates live availability, lets you book with securely stored venue credentials, and — for slots that are fully booked — runs a watcher that keeps checking and alerts you the moment one frees up.

It's two codebases working together: a Turborepo monorepo (React web app + a Hono API + a Convex backend) and **courtfinder-akl**, a separate Cloudflare Worker that continuously aggregates each venue's availability.

## Why built this

I play badminton around Auckland, and booking a court is genuinely painful: every venue has its own website, each with its own login, and most of them are clunky and dated to book through. On top of that, the good evening and weekend slots vanish within minutes — so even when you check constantly, they're already gone. I wanted one clean place to see availability across venues and book in a click, and — most importantly — a watcher that keeps an eye on a fully-booked slot for me and pings me the instant it frees up, instead of me refreshing a dozen ugly tabs.

## Features

- **Cross-venue availability** — real-time court availability across supported Auckland venues (Badminton North Harbour, Evergreen Sports) in one calendar/grid view.
- **Book & cancel** — reserve an available slot in a click and cancel it later, with each venue's cancellation policy surfaced up front.
- **Passwordless auth** — email magic-link login via Better Auth; no passwords stored.
- **Stored venue credentials** — your per-venue logins are encrypted (AES-256-GCM) and only decrypted at the edge at booking time, never persisted in the clear.
- **Slot watchers** — can't find a slot? Set a watcher and a 15-minute cron polls the venues and emails you when your time window opens up.
- **Realtime dashboard** — bookings and watcher status update live via Convex subscriptions.

## How it works

```
React SPA (CF Pages)
   ├── Convex ............ auth, users, watchers, credentials, realtime
   ├── Hono API (Workers)  booking, cancel, credential decrypt at the edge
   └── courtfinder-akl (Worker) ─ cron 15m ─> KV cache ─> venue APIs (Active, Evergreen)
                                                 └─> email alerts
```

The system splits into two backends on purpose. **Convex** owns user data, auth, watchers, and realtime dashboard state. A **Hono API on Cloudflare Workers** handles the messy venue interactions — decrypting credentials in memory only when a booking runs, calling the venue APIs, and writing results back. **courtfinder-akl** is a standalone Worker that polls each venue every 15 minutes, caches availability in KV (serving stale data within a bounded window if a venue is down), and sends email alerts. Types and Zod schemas are shared across all of it through a workspace package.

## Technologies Used

- **Frontend**: React + Vite, TypeScript, Tailwind CSS, React Router
- **State / data**: Zustand, TanStack Query, Convex (reactive DB + realtime)
- **Auth**: Better Auth (passwordless magic link) + Convex
- **APIs**: Hono on Cloudflare Workers
- **Court-data backend**: courtfinder-akl — Cloudflare Workers, KV cache, Cron Triggers, email alerts
- **Validation**: Zod (shared workspace package)
- **Monorepo**: Turborepo + pnpm workspaces
- **Hosting**: Cloudflare Pages + Workers + Convex
