import posthog from 'posthog-js';
import type { DonePayload, OracleStatus } from '../worker/types';

const KEY = import.meta.env.VITE_PUBLIC_POSTHOG_KEY as string | undefined;
const HOST = import.meta.env.VITE_PUBLIC_POSTHOG_HOST as string | undefined;
const enabled = Boolean(KEY && HOST);

export type QuerySource = 'suggestion' | 'typed';
export type QueryOutcome = 'answered' | OracleStatus;

/** No-op when the key or host is missing, so dev builds without them stay silent. */
export function initAnalytics() {
  if (!enabled) return;
  posthog.init(KEY!, {
    api_host: HOST,
    ui_host: 'https://eu.posthog.com',
    autocapture: false,
    capture_pageview: false,
    capture_pageleave: false,
    disable_session_recording: true,
    disable_surveys: true,
    capture_dead_clicks: false,
    capture_performance: false,
    capture_heatmaps: false,
    // The terminal usually runs inside a cross-site iframe, where cookies are unreliable.
    persistence: 'localStorage',
  });
}

export function track(event: string, props?: Record<string, unknown>) {
  if (!enabled) return;
  posthog.capture(event, props);
}

export function queryEvent(query: string, source: QuerySource, outcome: QueryOutcome, meter: DonePayload | null) {
  return {
    query,
    source,
    outcome,
    fragments: meter?.fragmentCount ?? 0,
    latency_ms: meter?.latencyMs ?? null,
    model: meter?.model ?? null,
    embedded: window.self !== window.top,
  };
}
