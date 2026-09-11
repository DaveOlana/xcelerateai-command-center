import React from 'react';
import { AlertTriangle, Check, Cloud, CloudOff, Loader2, X } from 'lucide-react';
import { useSync } from '../../context/SyncContext.jsx';
import ConflictChoice from './ConflictChoice.jsx';

function StatusIcon({ status }) {
  if (status === 'syncing') return <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />;
  if (status === 'offline') return <CloudOff className="h-3.5 w-3.5" aria-hidden="true" />;
  if (status === 'conflict' || status === 'error' || status === 'update_required') return <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />;
  if (status === 'synced') return <Check className="h-3.5 w-3.5" aria-hidden="true" />;
  return <Cloud className="h-3.5 w-3.5" aria-hidden="true" />;
}

function ConflictReview({ conflict, onResolve, onClose }) {
  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/55 p-4" role="dialog" aria-modal="true" aria-labelledby="sync-conflict-title">
      <div className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border-default bg-bg-surface p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-wider text-brand-amber">Sync conflict</p><h2 id="sync-conflict-title" className="mt-1 text-xl font-bold text-text-primary">Choose only the incompatible changes</h2><p className="mt-2 text-sm text-text-secondary">Safe progress has already been combined. Your local learning remains available while this is unresolved.</p></div>
          <button type="button" onClick={onClose} className="rounded-lg p-2 text-text-muted hover:bg-bg-soft" aria-label="Close conflict review"><X className="h-4 w-4" /></button>
        </div>
        <div className="mt-6 space-y-4">
          {(conflict.unresolvedConflicts || []).map((item, index) => (
            <ConflictChoice key={`${item.path}-${index}`} item={item} index={index} conflict={conflict} onResolve={onResolve} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SyncStatus() {
  const sync = useSync();
  const [reviewing, setReviewing] = React.useState(false);
  const actionable = sync.status === 'conflict' || sync.status === 'error' || sync.status === 'offline';
  return <>
    <button type="button" onClick={() => sync.status === 'conflict' ? setReviewing(true) : actionable && sync.retry()} className={`fixed right-4 top-[76px] z-30 inline-flex items-center gap-2 rounded-full border bg-bg-surface/95 px-3 py-1.5 text-xs font-semibold shadow-sm backdrop-blur lg:top-4 ${sync.status === 'conflict' || sync.status === 'error' ? 'border-brand-amber/40 text-brand-amber' : 'border-border-default text-text-muted'}`} title={sync.detail || sync.label}>
      <StatusIcon status={sync.status} /><span>{sync.label}</span>
    </button>
    {reviewing && sync.conflict && <ConflictReview conflict={sync.conflict} onResolve={sync.resolveConflict} onClose={() => setReviewing(false)} />}
  </>;
}
