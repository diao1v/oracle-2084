import { create } from 'zustand';
import { fetchHealth, sendQuery } from '../api';
import { getTurnstileToken } from '../turnstile';
import type { ChatMessage, DonePayload, ErrorPayload, Fragment } from '../../worker/types';

type Status = 'idle' | 'booting' | 'ready' | 'streaming';

type Session = {
  status: Status;
  vectors: number;
  messages: ChatMessage[];
  fragments: Fragment[];
  error: ErrorPayload | null;
  meter: DonePayload | null;
  boot(): Promise<void>;
  ask(text: string): Promise<void>;
};

export const useSession = create<Session>((set, get) => ({
  status: 'idle',
  vectors: 0,
  messages: [],
  fragments: [],
  error: null,
  meter: null,

  async boot() {
    set({ status: 'booting' });
    const vectors = await fetchHealth().catch(() => 0);
    set({ vectors, status: 'ready' });
  },

  async ask(text) {
    const content = text.trim().toUpperCase();
    if (!content || get().status === 'streaming') return;
    const history = [...get().messages, { role: 'user' as const, content }].slice(-8);
    set({ messages: history, fragments: [], error: null, status: 'streaming' });

    const token = await getTurnstileToken();
    let answer = '';
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
        appendAnswer();
      },
      onDone: (meter) => set({ meter, status: 'ready' }),
      onError: (error) => set({ error, status: 'ready' }),
    });
    if (get().status === 'streaming') set({ status: 'ready' });
  },
}));
