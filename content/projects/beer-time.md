# Beer Time

Beer Time is one of the subject's software projects.
Summary: An LED panel that celebrates finished Jira tickets.
Note: Physical build — ESP32 + HUB75 LED matrix

## Links
- GitHub: https://github.com/diao1v/beer-time

## Gallery
- ESP32 and wiring
- The LED matrix panel
- Beer Time in action

**Beer Time** is a fun desk gadget that turns a Jira status change into a little party. When a ticket moves to "Test OK", an ESP32-driven LED matrix panel lights up and celebrates — animating the responsible developer's pixel avatar and ringing a bell. When nothing's happening it idles on an animated background. It's the physical, joyful counterpart to a line in a backlog: work's done, it's beer time.

## Why built this

A ticket passing testing is a genuinely satisfying moment, but it's buried in a Jira board no one's staring at. I wanted to make that moment physical — something that cheers when work lands, gives whoever finished it a little spotlight, and doubles as a nudge that it's beer o'clock. It was also the perfect excuse to build something with my hands: embedded firmware, an LED matrix, and MQTT, well outside my day-to-day web stack.

## Features

- **Celebrates finished tickets** — when a Jira ticket transitions to "Test OK", the panel breaks into a celebration animation.
- **Per-developer avatars** — the ticket's assignee gets their own pixel avatar on the panel (in-jokes and all).
- **Sound** — an I2S bell rings out each celebration.
- **Idle mode** — a full-screen animated-GIF background when idle, with daily active hours so it rests outside work time.
- **Pluggable triggers** — the notifier knows nothing about Jira; any source (GitHub, CI, a Slack command) can POST the same trigger payload.
- **Cloud MQTT, works anywhere** — the panel connects to a HiveMQ Cloud broker over TLS, so the ESP32 and the backend services no longer have to be on the same network; the panel works anywhere with WiFi.

## How it works

```
Jira ──poll "Test OK"──> jira-poller ──POST /trigger──> led-notifier ──publish──> HiveMQ Cloud ──MQTT/TLS──> ESP32 ──> HUB75 LED panel + bell
```

Three cooperating pieces, split so the trigger source is swappable. **jira-poller** (Bun) polls the Jira REST API on an interval, matches issues by status/assignee, deduplicates so each ticket fires once, and POSTs a unified event to the notifier. **led-notifier** (Bun + Hono) validates the event, maps the developer to an animation, and publishes it to a HiveMQ Cloud broker over TLS. The **ESP32 firmware** (Arduino/PlatformIO) subscribes to that broker over WiFi — so the panel doesn't have to share a network with the backend — and drives the HUB75 panel via DMA, double-buffered to avoid tearing during celebrations, plus the bell audio and the idle GIF loop. Because the notifier only speaks its own trigger protocol, adding a new source (GitHub, CI) needs no firmware changes.

## Technologies Used

- **Firmware**: ESP32 (Arduino / PlatformIO), HUB75 RGB matrix via ESP32-HUB75-MatrixPanel-DMA, PubSubClient (MQTT), I2S audio
- **Services**: Bun + TypeScript — jira-poller and a Hono-based led-notifier
- **Messaging**: MQTT over TLS (HiveMQ Cloud)
- **Integration**: Jira Cloud REST API
- **Deployment**: Docker Compose
