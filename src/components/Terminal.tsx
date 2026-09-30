import { useEffect, useRef, useState } from 'react';
import { useSession } from '../store/session';
import type { ErrorPayload } from '../../worker/types';
import type { QuerySource } from '../analytics';

const SUGGESTIONS = ['WHAT IS THIS', 'WHO IS THIS GUY', 'WHAT HAS HE DONE', 'WHAT ELSE IS HE DOING'];

function errorLine(e: ErrorPayload): string {
  switch (e.status) {
    case 'throttled': return `LINK THROTTLED · RETRY IN ${e.retryAfter ?? 60}s`;
    case 'rejected': return `QUERY REJECTED${e.category ? ` · HAZARD CLASS ${e.category}` : ''}`;
    case 'no_record': return 'NO RECORD';
    default: return 'UPLINK LOST · RETRY';
  }
}

export default function Terminal() {
  const { messages, status, error, progress, ask } = useSession();
  const [draft, setDraft] = useState('');
  const log = useRef<HTMLDivElement>(null);
  const input = useRef<HTMLInputElement>(null);

  // Scroll the log container directly and focus without scrolling: scrollIntoView() and focus()
  // also scroll ancestor frames, which shoved this page out of view inside the 3D Macintosh.
  useEffect(() => {
    const el = log.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, error, status]);
  useEffect(() => {
    input.current?.focus({ preventScroll: true });
  }, [status]);

  const submit = (text: string, source: QuerySource = 'typed') => {
    setDraft('');
    void ask(text, source);
  };

  const lastUser = [...messages].reverse().find((m) => m.role === 'user');

  return (
    <section className="flex h-full flex-col p-4 md:p-6" onClick={() => input.current?.focus()}>
      <div ref={log} className="glow flex-1 overflow-y-auto text-sm leading-6">
        {messages.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'mt-4 text-phosphor-dim' : 'whitespace-pre-wrap'}>
            {m.role === 'user' ? `QUERY: ${m.content}` : `RESPONSE:\n${m.content}`}
            {m.role === 'assistant' && status === 'streaming' && i === messages.length - 1 && <span className="cursor" />}
          </div>
        ))}
        {status === 'streaming' && messages[messages.length - 1]?.role === 'user' && (
          <div className="cursor">RESPONSE: {progress && <span className="text-phosphor-dim">{progress}… </span>}</div>
        )}
        {error && (
          <div className="mt-2 text-red-400">
            {errorLine(error)}
            {error.status === 'uplink_lost' && lastUser && (
              <button className="ml-3 underline" onClick={() => submit(lastUser.content)}>[R]</button>
            )}
          </div>
        )}
      </div>

      {messages.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2 text-xs text-phosphor-dim">
          {SUGGESTIONS.map((s) => (
            <button key={s} className="border border-phosphor-dim px-2 py-1 hover:text-phosphor" onClick={() => submit(s, 'suggestion')}>
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex gap-2 border-t border-phosphor-dim pt-3 text-sm"
        onSubmit={(e) => {
          e.preventDefault();
          submit(draft);
        }}
      >
        <span>QUERY:</span>
        <input
          ref={input}
          aria-label="Query"
          className="flex-1 bg-transparent uppercase outline-none"
          value={draft}
          maxLength={500}
          disabled={status === 'streaming'}
          onChange={(e) => setDraft(e.target.value)}
          autoComplete="off"
        />
      </form>
    </section>
  );
}
