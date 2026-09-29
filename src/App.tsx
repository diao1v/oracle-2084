import { useEffect, useState } from 'react';
import Boot from './components/Boot';
import Fragments from './components/Fragments';
import StatusLine from './components/StatusLine';
import Terminal from './components/Terminal';
import { useSession } from './store/session';

export default function App() {
  const boot = useSession((s) => s.boot);
  const [booted, setBooted] = useState(false);
  useEffect(() => void boot(), [boot]);

  return (
    <main className="crt flex h-dvh flex-col">
      {booted ? (
        <>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <div className="min-h-0 flex-1"><Terminal /></div>
            <Fragments />
          </div>
          <StatusLine />
        </>
      ) : (
        <Boot onDone={() => setBooted(true)} />
      )}
    </main>
  );
}
