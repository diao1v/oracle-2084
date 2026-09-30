import { create } from 'zustand';
import { fetchHealth, sendQuery } from '../api';
import { getTurnstileToken } from '../turnstile';
import { queryEvent, track, type QueryOutcome, type QuerySource } from '../analytics';
import type { ChatMessage, DonePayload, ErrorPayload, Fragment } from '../../worker/types';

type Status = 'idle' | 'booting' | 'ready' | 'streaming';

type Session = {
  status: Status;
  vectors: number;
  messages: ChatMessage[];
  fragments: Fragment[];
  error: ErrorPayload | null;
  meter: DonePayload | null;
  progress: string | null;
  boot(): Promise<void>;
  ask(text: string, source?: QuerySource): Promise<void>;
};

export const useSession = create<Session>((set, get) => ({
  status: 'idle',
  vectors: 0,
  messages: [],
  fragments: [],
  error: null,
  meter: null,
  progress: null,

  async boot() {
    set({ status: 'booting' });
    const vectors = await fetchHealth().catch(() => 0);
    set({ vectors, status: 'ready' });
    track('oracle_boot', { vectors, embedded: window.self !== window.top });
  },

  async ask(text, source = 'typed') {
    const content = text.trim().toUpperCase();
    if (!content || get().status === 'streaming') return;
    const history = [...get().messages, { role: 'user' as const, content }].slice(-8);
    set({ messages: history, fragments: [], error: null, progress: 'LINKING', status: 'streaming' });

    const token = await getTurnstileToken();
    let answer = '';
    // Object, not a let: the callbacks below assign it and TS would otherwise narrow it to the initial literal.
    const result: { outcome: QueryOutcome } = { outcome: 'uplink_lost' };
    const appendAnswer = () =>
      set((s) => {
        const last = s.messages[s.messages.length - 1];
        const rest = last?.role === 'assistant' ? s.messages.slice(0, -1) : s.messages;
        return { messages: [...rest, { role: 'assistant', content: answer }] };
      });

    await sendQuery(history, token, {
      onFragments: (fragments) => set({ fragments }),
      onDelta: (t) => {
        answer += t;
        set({ progress: null });
        appendAnswer();
      },
      onDone: (meter) => {
        result.outcome = 'answered';
        set({ meter, progress: null, status: 'ready' });
      },
      onError: (error) => {
        result.outcome = error.status;
        set({ error, progress: null, status: 'ready' });
      },
      onStatus: (progress) => set({ progress }),
    });
    if (get().status === 'streaming') set({ status: 'ready', progress: null });
    track('oracle_query', queryEvent(content, source, result.outcome, result.outcome === 'answered' ? get().meter : null));
  },
}));
