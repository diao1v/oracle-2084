import { useState } from 'react';
import { useSession } from '../store/session';

export default function Fragments() {
  const fragments = useSession((s) => s.fragments);
  const [open, setOpen] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(true);
  if (fragments.length === 0) return null;

  return (
    <aside className="border-t border-phosphor-dim text-xs md:w-80 md:border-t-0 md:border-l">
      <button className="w-full p-3 text-left md:hidden" onClick={() => setCollapsed((c) => !c)}>
        DATA FRAGMENTS [{fragments.length}] {collapsed ? '+' : '−'}
      </button>
      <div className={`${collapsed ? 'hidden' : ''} p-3 md:block`}>
        <div className="mb-2 hidden md:block">DATA FRAGMENTS</div>
        {fragments.map((f, i) => (
          <div key={f.id} className="mb-2">
            <button className="text-left hover:text-phosphor" onClick={() => setOpen(open === f.id ? null : f.id)}>
              FRAGMENT 0x{(i + 26).toString(16).toUpperCase()} · {f.source} · {f.score.toFixed(2)}
            </button>
            {open === f.id && <pre className="mt-1 whitespace-pre-wrap text-phosphor-dim">{f.text}</pre>}
          </div>
        ))}
      </div>
    </aside>
  );
}
