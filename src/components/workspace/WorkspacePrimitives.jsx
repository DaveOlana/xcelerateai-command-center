import React from 'react';
import { ChevronDown, Inbox, Search } from 'lucide-react';

export function WorkspaceSectionHeader({ eyebrow, title, description, action }) {
  return (
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && <p className="text-xs font-bold text-brand-violet">{eyebrow}</p>}
        <h2 className="mt-1 font-heading text-2xl font-extrabold tracking-tight text-text-primary sm:text-3xl">{title}</h2>
        {description && <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">{description}</p>}
      </div>
      {action && <div className="flex-none">{action}</div>}
    </header>
  );
}

export function WorkspaceSearch({ value, onChange, placeholder, label = 'Search' }) {
  return (
    <label className="relative block min-w-0 flex-1">
      <span className="sr-only">{label}</span>
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input type="search" value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} className="input-base min-h-11 w-full pl-10 text-sm" />
    </label>
  );
}

export function WorkspaceFilterPills({ options, value, onChange, label }) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1" role="group" aria-label={label}>
      {options.map((option) => {
        const item = typeof option === 'string' ? { value: option, label: option } : option;
        const active = value === item.value;
        return (
          <button key={item.value} type="button" aria-pressed={active} onClick={() => onChange(item.value)} className={`min-h-10 whitespace-nowrap rounded-xl border px-3 py-2 text-xs font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet ${active ? 'border-brand-violet/35 bg-brand-violet/10 text-brand-violet' : 'border-border-default bg-bg-surface text-text-secondary hover:border-border-strong hover:text-text-primary'}`}>
            {item.label}{item.count !== undefined ? ` ${item.count}` : ''}
          </button>
        );
      })}
    </div>
  );
}

export function WorkspaceEmptyState({ title, description, action }) {
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-dashed border-border-strong bg-bg-soft px-6 py-12 text-center">
      <Inbox className="mx-auto h-7 w-7 text-text-muted" aria-hidden="true" />
      <h3 className="mt-3 font-heading text-lg font-bold text-text-primary">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">{description}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function DetailDisclosure({ title, summary, children, defaultOpen = false }) {
  return (
    <details open={defaultOpen || undefined} className="group border-t border-border-divider py-1">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-4 rounded-lg py-3 text-sm font-bold text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">
        <span>{title}{summary && <span className="ml-2 font-normal text-text-muted">{summary}</span>}</span>
        <ChevronDown className="h-4 w-4 flex-none text-text-muted transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none" />
      </summary>
      <div className="pb-5 pt-1">{children}</div>
    </details>
  );
}

export function formatWorkspaceDate(value) {
  if (!value) return '';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '' : date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
