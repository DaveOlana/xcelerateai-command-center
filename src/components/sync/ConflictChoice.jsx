import React from 'react';

function readableValue(value) {
  if (value == null) return 'Deleted or empty';
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (value.record) return value.record.whatLearned || value.record.whatWentWrong || value.record.title || 'Saved learner record';
  return value.response ?? value.value ?? value.whatLearned ?? value.whatWentWrong ?? value.title ?? 'Progress record';
}

function editableField(value) {
  if (!value || typeof value !== 'object') return null;
  const source = value.record && typeof value.record === 'object' ? value.record : value;
  return ['response', 'value', 'whatLearned', 'whatWentWrong', 'solutionNotes', 'content', 'body', 'text']
    .find((field) => typeof source[field] === 'string') || null;
}

function manualText(value, field) {
  if (!field || !value || typeof value !== 'object') return '';
  const source = value.record && typeof value.record === 'object' ? value.record : value;
  return source[field] || '';
}

export default function ConflictChoice({ item, index, conflict, onResolve }) {
  const local = item.local ?? conflict.local;
  const remote = item.remote ?? conflict.remote;
  const field = editableField(item.local) || editableField(item.remote);
  const [combining, setCombining] = React.useState(false);
  const [combinedText, setCombinedText] = React.useState(() => manualText(item.local, field));
  const canCombine = item.path !== '$' && Boolean(field);

  return (
    <article className="rounded-xl border border-border-default bg-bg-soft p-4">
      <p className="text-sm font-bold text-text-primary">
        {item.type === 'reset_generation_barrier' || item.path === '$'
          ? 'A curriculum reset conflicts with progress on this device.'
          : `Changed on two devices: ${item.path.split('.').slice(-2).join(' / ')}`}
      </p>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-lg border border-border-default bg-bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">This device</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{readableValue(local)}</p>
          <button type="button" onClick={() => onResolve(index, 'local')} className="btn-secondary mt-3 w-full justify-center px-3 py-2 text-xs">Use this device</button>
        </div>
        <div className="rounded-lg border border-border-default bg-bg-surface p-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Cloud version</p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-text-primary">{readableValue(remote)}</p>
          <button type="button" onClick={() => onResolve(index, 'remote')} className="btn-secondary mt-3 w-full justify-center px-3 py-2 text-xs">Use cloud version</button>
        </div>
      </div>
      {canCombine && (
        <div className="mt-3">
          {!combining ? (
            <button type="button" onClick={() => setCombining(true)} className="text-xs font-semibold text-accent-primary hover:underline">Combine manually</button>
          ) : (
            <div className="rounded-lg border border-border-default bg-bg-surface p-3">
              <label htmlFor={`sync-combine-${index}`} className="text-[10px] font-bold uppercase tracking-wider text-text-muted">Combined version</label>
              <textarea id={`sync-combine-${index}`} value={combinedText} onChange={(event) => setCombinedText(event.target.value)} rows={5} className="mt-2 w-full rounded-lg border border-border-default bg-bg-soft p-3 text-sm text-text-primary" />
              <button type="button" onClick={() => onResolve(index, 'local', { field, value: combinedText })} className="btn-primary mt-3 px-3 py-2 text-xs">Use combined version</button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}
