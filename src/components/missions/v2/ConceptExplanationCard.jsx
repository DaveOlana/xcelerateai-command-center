import React from 'react';
import { ChevronDown, ChevronUp, Lightbulb } from 'lucide-react';

export default function ConceptExplanationCard({ concept }) {
  const [expanded, setExpanded] = React.useState(false);
  const contentId = React.useId();

  return (
    <article className="rounded-2xl border border-border-default bg-bg-soft p-4 sm:p-5">
      <button type="button" onClick={() => setExpanded((value) => !value)} aria-expanded={expanded} aria-controls={contentId} className="flex min-h-11 w-full items-start justify-between gap-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet focus-visible:ring-offset-2 focus-visible:ring-offset-bg-soft">
        <span className="flex min-w-0 items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-brand-violet/20 bg-brand-violet/10 text-brand-violet"><Lightbulb className="h-4 w-4" aria-hidden="true" /></span>
          <span><span className="block font-bold text-text-primary">{concept.term}</span><span className="mt-1 block text-sm leading-relaxed text-text-secondary">{concept.simpleMeaning}</span></span>
        </span>
        {expanded ? <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" /> : <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
      </button>
      {expanded && (
        <div id={contentId} className="mt-4 space-y-4 border-t border-border-divider pt-4">
          <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Why it matters here</h4><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{concept.relevance}</p></div>
          <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Tiny example</h4><pre tabIndex="0" className="mt-2 max-w-full overflow-x-auto whitespace-pre-wrap break-words rounded-xl border border-border-default bg-bg-surface p-3 font-mono text-xs leading-relaxed text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">{concept.example}</pre></div>
          <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Common mistake</h4><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{concept.commonMistake}</p></div>
        </div>
      )}
    </article>
  );
}
