import React from 'react';
import { Check, Clipboard, ChevronDown, ChevronUp } from 'lucide-react';
import { writeTemplateToClipboard } from '../../utils/templateUtils.js';

export default function CopyTemplateButton({ template }) {
  const [copyState, setCopyState] = React.useState('idle');
  const [previewOpen, setPreviewOpen] = React.useState(false);
  const resetTimer = React.useRef(null);

  React.useEffect(() => () => clearTimeout(resetTimer.current), []);

  const copy = async () => {
    clearTimeout(resetTimer.current);
    const result = await writeTemplateToClipboard(template.content);
    if (result.ok) {
      setCopyState('success');
      resetTimer.current = setTimeout(() => setCopyState('idle'), 2400);
      return;
    }
    setCopyState('failure');
    setPreviewOpen(true);
  };

  return (
    <div className="rounded-xl border border-border-default bg-bg-soft p-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="truncate font-mono text-sm font-bold text-text-primary">{template.label}</p>
          <p className="mt-0.5 text-xs text-text-muted">Starter structure available</p>
        </div>
        <div className="flex flex-col gap-2 xs:flex-row">
          <button type="button" onClick={copy} className="btn-secondary flex min-h-10 items-center justify-center gap-2 px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-brand-violet">
            {copyState === 'success' ? <Check className="h-4 w-4" /> : <Clipboard className="h-4 w-4" />}
            {copyState === 'success' ? 'Template copied' : 'Copy template'}
          </button>
          <button type="button" onClick={() => setPreviewOpen((open) => !open)} aria-expanded={previewOpen} className="btn-secondary flex min-h-10 items-center justify-center gap-2 px-3 py-2 text-xs focus-visible:ring-2 focus-visible:ring-brand-violet">
            {previewOpen ? 'Hide template' : 'View template'}
            {previewOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <p className={`mt-2 text-xs font-semibold ${copyState === 'failure' ? 'text-brand-amber' : 'text-emerald-500'}`} aria-live="polite">
        {copyState === 'success' ? 'Template copied to clipboard.' : copyState === 'failure' ? 'Copy failed — select the template below and copy it manually.' : ''}
      </p>

      {previewOpen && (
        <div className="mt-3 border-t border-border-divider pt-3">
          {copyState === 'failure' ? (
            <textarea readOnly value={template.content} rows={12} aria-label={`${template.label} template content`} onFocus={(event) => event.currentTarget.select()} className="input-base max-h-72 w-full resize-y whitespace-pre overflow-auto font-mono text-xs leading-relaxed" />
          ) : (
            <pre tabIndex="0" aria-label={`${template.label} template preview`} className="max-h-72 select-text overflow-auto whitespace-pre rounded-xl border border-border-default bg-bg-surface p-4 font-mono text-xs leading-relaxed text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">{template.content}</pre>
          )}
        </div>
      )}
    </div>
  );
}
