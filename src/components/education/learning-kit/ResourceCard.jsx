import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { getProviderIdentity } from '../../common/ProviderIdentity';

export default function ResourceCard({
  resource,
  className = '',
  linkLabel = 'Open Resource',
  headerRight = null,
  footer = null,
  statusBadge = null,
  onOpen = null,
  detailsContent = null,
  detailsOpen = false,
  onToggleDetails = null,
}) {
  if (!resource) return null;
  const { name: providerName, Icon: ProviderIcon, color: providerColor } = getProviderIdentity(resource);

  return (
    <article className={`resource-card surface-card surface-card--compact flex flex-col overflow-hidden ${className}`}>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="flex h-8 w-8 flex-none items-center justify-center rounded-xl border border-border-default bg-bg-soft" style={{ color: providerColor }}>
              <ProviderIcon className="h-4 w-4" aria-hidden="true" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-text-secondary" title={providerName}>{providerName}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{resource.type || 'Resource'}</p>
            </div>
          </div>
          {headerRight}
        </div>

        <h3 className="font-heading text-lg font-extrabold leading-snug text-text-primary">{resource.title}</h3>

        <div className="mt-auto space-y-2.5 pt-2">
          <a href={resource.url} target="_blank" rel="noopener noreferrer" onClick={() => onOpen?.(resource)} className="btn-primary flex w-full items-center justify-center gap-2 px-4 py-2.5 text-sm">
            <ExternalLink className="h-4 w-4" aria-hidden="true" /> {linkLabel}
          </a>
          {footer}
          <div className="flex min-h-8 items-center justify-between gap-2">
            {statusBadge || <span />}
            {detailsContent && onToggleDetails && (
              <button type="button" onClick={onToggleDetails} aria-expanded={detailsOpen} className="flex items-center gap-1 text-xs font-bold text-text-secondary hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">
                {detailsOpen ? 'Hide details' : 'Details / Insight'}
                {detailsOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
            )}
          </div>
        </div>
      </div>

      {detailsOpen && detailsContent && (
        <div className="border-t border-border-divider bg-bg-soft p-5 motion-safe:animate-fade-in">
          {detailsContent}
        </div>
      )}
    </article>
  );
}
