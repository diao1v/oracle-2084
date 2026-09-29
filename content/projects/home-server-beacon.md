# Home Server Beacon

Home Server Beacon is one of the subject's software projects.
Summary: Home-lab monitoring — web dashboard + an LED panel.

## Links
- Monitor: https://github.com/diao1v/home-server-beacon
- LED panel: https://github.com/diao1v/home-server-beacon-led

## Gallery
- The web dashboard
- The LED panel

**Home Server Beacon** keeps an eye on a fleet of home servers and shows their health on two surfaces: a real-time web dashboard, and a physical LED panel for the shelf. A lightweight agent on each box reports its metrics; a central monitor collects them, keeps a rolling 24 hours of history, and serves both the dashboard and a compact status feed that an ESP32-driven LED matrix reads — so a glance at the panel tells you whether everything's OK, no browser required.

## Why built this

I run a handful of low-power home servers, and I wanted to know at a glance whether they're all healthy — CPU, disk, temperature — without SSH-ing into each one or standing up something as heavy as Grafana and Prometheus. So I built a lightweight monitor with a clean dashboard, and then a little LED panel for the shelf that shows the whole fleet's status ambiently. Now the answer to "is everything fine?" is just a look across the room.

## Features

- **Fleet monitoring** — a small agent on each host reports CPU, RAM, disk usage and IO, temperature, and Docker containers over HTTP.
- **Real-time dashboard** — a central monitor polls every agent, keeps 24h of history in SQLite, and serves a live React dashboard with sparklines.
- **Ambient LED panel** — an ESP32-driven P2.5 matrix (128×64) shows each server's status dot and colour-coded CPU/RAM/disk bars, so fleet health is readable across the room.
- **Optional email alerts** — get notified when a host goes offline or crosses a threshold.
- **Efficient by design** — the panel's `/api/display` feed is ETag-cached (returns 304 when nothing changed), so it only redraws on real updates.

## How it works

```
Agents (PM2 on each host) ──HTTP──> Monitor (poll + 24h SQLite) ──> React dashboard
                                          └──> GET /api/display ──HTTP/ETag──> ESP32 ──> LED panel
```

Each **agent** runs natively under PM2 (not in a container, so it can read host disks, the process table, and thermal sensors directly) and exposes API-key-protected metrics. The **monitor** polls all agents, persists history to SQLite, serves the React dashboard, and exposes a compact `/api/display` endpoint. The **LED panel firmware** (ESP32) polls that endpoint over WiFi — honouring ETags to skip unchanged frames — and renders a header plus one row per server, colouring each bar by threshold to match the dashboard. Types and Zod schemas are shared across agent, monitor, and UI through a workspace package.

## Technologies Used

- **Monitor & agents**: TypeScript, pnpm workspaces (shared / agent / monitor / ui), Zod, SQLite, PM2
- **Dashboard**: React
- **LED panel**: ESP32 (Arduino / PlatformIO), P2.5 HUB75 128×64 matrix
- **Deployment**: Docker Compose (monitor), PM2 (agents)
- **Tooling**: Biome
