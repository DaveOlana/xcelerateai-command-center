// Educational Experience Engine — Layer 2 (Learn)
// Renders one resource category (e.g. "Official Documentation", "Video").
// Renders nothing if its resource list is empty. Delegates each resource's
// rendering to ResourceCard — does no normalization, no alias resolution,
// no status computation of its own.
//
// `renderResourceFooter`/`renderResourceHeaderRight`/`renderResourceStatusBadge`
// are optional per-resource slot functions, forwarded straight through to
// each ResourceCard so a consuming page can inject interactive elements
// without ResourceSection or ResourceCard needing to know what they are.
import ResourceCard from './ResourceCard';

export default function ResourceSection({
  category,
  resources = [],
  linkLabel,
  renderResourceHeaderRight,
  renderResourceFooter,
  renderResourceStatusBadge,
  getResourceClassName,
  className = '',
}) {
  if (!Array.isArray(resources) || resources.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <h5 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{category}</h5>
      <div className="grid md:grid-cols-2 gap-4">
        {resources.map((resource, idx) => (
          <ResourceCard
            key={resource.title ? `${category}-${resource.title}` : `${category}-${idx}`}
            resource={resource}
            linkLabel={linkLabel}
            className={getResourceClassName ? getResourceClassName(resource) : ''}
            headerRight={renderResourceHeaderRight ? renderResourceHeaderRight(resource) : null}
            footer={renderResourceFooter ? renderResourceFooter(resource) : null}
            statusBadge={renderResourceStatusBadge ? renderResourceStatusBadge(resource) : null}
          />
        ))}
      </div>
    </div>
  );
}
