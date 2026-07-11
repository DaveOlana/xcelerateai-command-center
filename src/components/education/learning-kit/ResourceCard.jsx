// Educational Experience Engine — Layer 2 (Learn)
// Renders one resource: provider identity, title, quick facts (time/
// difficulty/quality), description, tags, an external link, and whatever
// interactive controls the page injects. Rendering only — never mutates
// state, never opens the link itself (the anchor tag is just markup the
// learner clicks), never tracks study status.
//
// `resource` is one entry from mission.resources (already normalized by
// missionAdapter.js — canonical type, metadata already resolved). This
// component trusts that shape completely and does no resolution of its own,
// aside from deriving a provider brand mark from the resource's own URL
// (see ProviderIdentity.jsx — also presentation-only, no normalization).
//
// `headerRight` / `footer` / `statusBadge` are optional slots (the same
// pattern SectionCard already uses via `headerActions`) so a consuming page
// can compose its own interactive elements (a "Required" tag, the Study/
// Mark Done action, a live study-status pill) around this otherwise purely
// presentational card without ResourceCard needing to know anything about
// study-status tracking or AppContext. `statusBadge` renders last, below the
// action buttons — deliberately last in the card's visual hierarchy, since
// it reports state rather than inviting an action.
import { ExternalLink } from 'lucide-react';
import ResourceMetadata from './ResourceMetadata';
import { getProviderIdentity } from '../../common/ProviderIdentity';

export default function ResourceCard({
  resource,
  className = '',
  linkLabel = 'Open',
  headerRight = null,
  footer = null,
  statusBadge = null,
}) {
  if (!resource) return null;

  const description = resource.whatToExpect || resource.missionObjective || null;
  const metadata = resource.metadata || {};
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];
  const { name: providerName, Icon: ProviderIcon, color: providerColor } = getProviderIdentity(resource);

  return (
    <div
      className={`resource-card bg-navy-850/40 p-5 rounded-2xl border border-navy-700/20 flex flex-col gap-3.5 ${className}`}
      style={{ '--card-accent': `${providerColor}66`, '--card-accent-soft': `${providerColor}26` }}
    >
      {/* Provider identity + category / required */}
      <div className="flex items-center justify-between gap-x-3 gap-y-1.5 flex-wrap">
        <div className="flex items-center gap-2 min-w-0 max-w-full">
          <div
            className="w-7 h-7 rounded-lg border flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${providerColor}1A`, borderColor: `${providerColor}33`, color: providerColor }}
          >
            <ProviderIcon className="w-3.5 h-3.5" aria-hidden="true" />
          </div>
          <span
            className="text-[11px] font-bold uppercase tracking-wider truncate min-w-[2.5rem]"
            style={{ color: providerColor }}
            title={providerName}
          >
            {providerName}
          </span>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="bg-navy-900 text-[10px] text-slate-500 font-bold border border-navy-750 px-2 py-0.5 rounded uppercase tracking-wider">
            {resource.type || 'Resource'}
          </span>
          {headerRight}
        </div>
      </div>

      {/* Title */}
      <h4 className="font-bold text-white text-[15px] leading-snug">{resource.title}</h4>

      {/* Quick facts: time, difficulty, quality */}
      <ResourceMetadata
        difficulty={metadata.difficulty}
        estimatedTime={metadata.estimatedDuration}
        estimatedData={metadata.estimatedData}
        qualityScore={metadata.qualityScore}
      />

      {/* Description */}
      {description && (
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{description}</p>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, i) => (
            <span key={i} className="text-[10px] font-medium px-1.5 py-[1px] text-slate-500 bg-navy-800/50 rounded">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions + status */}
      <div className="mt-auto pt-3.5 border-t border-navy-800/40 space-y-2.5">
        <div className="grid grid-cols-2 gap-2">
          {footer}
          <a
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary py-2 px-2 text-xs text-center flex items-center justify-center gap-1 font-bold"
          >
            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" /> {linkLabel}
          </a>
        </div>
        {statusBadge && <div className="flex justify-center">{statusBadge}</div>}
      </div>
    </div>
  );
}
