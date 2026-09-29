import { useEffect, useState } from 'react';
import { useSession } from '../store/session';

const LINES = (vectors: number) => [
  'ORACLE 2084 · RECORDS TERMINAL',
  'HARDWARE CHECK ............ OK',
  `CORPUS LOADED ............. ${vectors} VECTORS`,
  'UPLINK .................... ESTABLISHED',
  'PRESS ANY KEY',
];

export default function Boot({ onDone }: { onDone(): void }) {
  const vectors = useSession((s) => s.vectors);
  const status = useSession((s) => s.status);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (status !== 'ready') return;
    const t = setInterval(() => setShown((n) => n + 1), 350);
    return () => clearInterval(t);
  }, [status]);

  useEffect(() => {
    const finish = () => onDone();
    window.addEventListener('keydown', finish);
    window.addEventListener('pointerdown', finish);
    const auto = setTimeout(finish, 2500);
    return () => {
      window.removeEventListener('keydown', finish);
      window.removeEventListener('pointerdown', finish);
      clearTimeout(auto);
    };
  }, [onDone]);

  const lines = status === 'ready' ? LINES(vectors).slice(0, shown) : ['ORACLE 2084 · RECORDS TERMINAL', 'HARDWARE CHECK ...'];
  return (
    <pre className="glow p-6 text-sm leading-7 whitespace-pre-wrap">
      {lines.join('\n')}
      <span className="cursor" />
    </pre>
  );
}
