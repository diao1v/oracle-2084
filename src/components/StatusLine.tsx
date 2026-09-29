import { useSession } from '../store/session';

export default function StatusLine() {
  const meter = useSession((s) => s.meter);
  const vectors = useSession((s) => s.vectors);
  return (
    <footer className="flex flex-wrap gap-x-4 border-t border-phosphor-dim px-4 py-2 text-[11px] text-phosphor-dim">
      <span>MODEL {meter?.model.replace('@cf/meta/', '') ?? '—'}</span>
      <span>FRAGMENTS {meter?.fragmentCount ?? 0}</span>
      <span>LATENCY {meter ? `${meter.latencyMs}ms` : '—'}</span>
      <span>CORPUS {vectors}</span>
      <span>LIMIT 10/MIN</span>
    </footer>
  );
}
