# Devs Assistant Platform

Devs Assistant Platform is one of the subject's software projects.
Summary: A multi-agent platform for engineering teams — first up, ticket → PR.

**Devs Assistant Platform** is a platform of specialized AI agents that take routine work off an engineering team's plate. Its first capability is a Jira-driven coding pipeline — assign a Jira ticket to the bot and it plans the work, writes the code in an isolated git worktree, and opens a pull request for human review (humans are always the gate). It's genuinely multi-agent: alongside the one that writes code, a read-only agent security-reviews each PR and another gates a ticket's readiness before any code is written. And the same framework is designed to keep growing — a shared team-memory agent, an agent that reads CI failures and drives fixes — each one just a new definition on the same orchestration.

## Why built this

A lot of engineering time goes into small, well-specified tickets — the kind where the "what" is clear and most of the effort is the mechanical implementation plus the back-and-forth of review. I wanted to see how far a safe, human-gated pipeline could take one of those on its own: from a clear ticket to a reviewable PR, with a person always making the final call. The interesting part was never the model — it was the orchestration around it: making the whole process durable, idempotent, and trustworthy.

## Features

- **Ticket → PR, end to end** — a ticket assigned to the bot becomes a planned change, committed on its own branch and opened as a pull request with the work summarized.
- **Humans stay the gate** — it drafts and revises, but never merges; a person always reviews and approves.
- **Plan-readiness gate** — before writing any code, an agent checks the ticket is well-defined enough to implement, and asks one specific question if it isn't.
- **Automated security review** — a dedicated, read-only agent reviews each PR for genuine, exploitable security risks (ignoring style and quality, which another check covers) and feeds anything it finds back into the revision loop.
- **Automated review loop** — it feeds those security findings and human PR comments back into the coding agent and revises until the checks are clean (or a round cap is hit), then writes QA/testing notes back onto the ticket and hands off to a human.
- **Provider-agnostic agents** — each subagent declares its own model and provider (e.g. Anthropic Claude, or OpenAI), so adding a new one is just a definition, not an orchestrator change.
- **Durable and idempotent** — everything runs off a Postgres-backed job queue; long waits (review, human input) are parked as durable state and resumed on the next event, so restarts and duplicate events are harmless.

## How it works

```
ticket assigned ──> Orchestrator (state machine) ──> subagents (clarify / code / security review / interpret)
      ▲                     │                                  │
   webhooks / poll          ├── git worktree: edit, commit, push ──> Pull Request
                            └── Postgres job queue (durable, resumable)
```

The guiding principle is "the LLM proposes, the orchestrator disposes." A deterministic orchestrator — plain code, a state machine — routes the work, talks to Jira and GitHub, enforces the rules, and decides what happens next. It calls LLM subagents only for the thinking: one writes code (in a throwaway git worktree with no access to credentials, the database, or git transport), one gates ticket readiness before any code is written, one security-reviews the PR, one classifies incoming human comments, one drafts testing notes. External changes arrive as webhooks (or by polling) carrying just a ticket key; the orchestrator fetches authoritative state and acts on it, so every step is idempotent and a late or duplicate event is harmless. State lives in Postgres, work flows through the job queue, and subagents simply receive a task plus a working directory and return a structured result.

## Technologies Used

- **Language**: TypeScript (pnpm-workspaces monorepo)
- **App / API**: Hono
- **Database**: PostgreSQL with Drizzle
- **Job queue**: graphile-worker (Postgres-backed)
- **Integrations**: typed Jira (jira.js) and GitHub (Octokit) SDKs
- **Agents**: a multi-provider agent engine with a per-repo / per-label "skills" system folded into prompts
- **Isolation**: a disposable git worktree per run
