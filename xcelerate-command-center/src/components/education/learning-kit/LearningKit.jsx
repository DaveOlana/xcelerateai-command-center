// Educational Experience Engine — Layer 2 (Learn)
// Top-level entry point for rendering a mission's learning resources.
// Receives ONLY `mission` (already produced by missionAdapter.js) — never
// reads raw JSON, never resolves resource aliases, never checks unlock
// status. It groups resources, preserves ordering, gracefully handles empty
// lists, and delegates all actual rendering to ResourceSection/ResourceCard.
// Nothing else.
//
// Two rendering modes:
//   - grouped={true} (default): one ResourceSection per canonical resource
//     type present in mission.resources, in the canonical taxonomy's own
//     order (missionAdapter.js's CANONICAL_RESOURCE_TYPES). This is the
//     fully spec'd Layer 2 presentation and the one future pages should use.
//   - grouped={false}: all resources rendered in a single flat grid via
//     ResourceCard, with no section headers, in their original array order.
//     This exists specifically so WeeklyMissions.jsx's pilot integration can
//     preserve its exact current appearance (one continuous grid, no
//     grouping) while still reusing the same underlying ResourceCard.
//
//     TODO(Phase 8C, post-JSON-Regeneration): grouped={false} is a temporary
//     compatibility mode, not the intended long-term default. It exists only
//     because today's JSON/UI predates the canonical resource taxonomy.
//     Once regenerated JSON files are introduced later in Phase 8C,
//     WeeklyMissions.jsx (and any other consumer) should migrate to
//     grouped={true} so resources are actually presented by category, as
//     Layer 2 was originally specified. Do not remove grouped={false}
//     until that migration happens — do not implement the migration itself
//     as part of an unrelated change either.
//
// `renderResourceFooter`/`renderResourceHeaderRight`/`renderResourceStatusBadge`/
// `getResourceClassName` are optional per-resource slot functions forwarded to
// every ResourceCard, so a consuming page (e.g. WeeklyMissions.jsx) can
// compose its own interactive elements (study-status badge, mark-studied
// button, status-tinted border) around these otherwise purely presentational
// components.
import { BookOpen } from 'lucide-react';
import ResourceSection from './ResourceSection';
import ResourceCard from './ResourceCard';
import { CANONICAL_RESOURCE_TYPES } from '../../../utils/missionAdapter';

export default function LearningKit({
  mission,
  grouped = true,
  linkLabel,
  renderResourceHeaderRight,
  renderResourceFooter,
  renderResourceStatusBadge,
  getResourceClassName,
  emptyMessage = 'No Study Resources were supplied for this week.',
  className = '',
}) {
  const resources = Array.isArray(mission?.resources) ? mission.resources : [];

  if (resources.length === 0) {
    return (
      <div className="p-6 bg-navy-850 rounded-2xl border border-navy-700/20 text-center">
        <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
        <p className="text-xs text-slate-400 font-medium">{emptyMessage}</p>
      </div>
    );
  }

  if (!grouped) {
    return (
      <div className={`grid md:grid-cols-2 gap-4 ${className}`}>
        {resources.map((resource, idx) => (
          <ResourceCard
            key={resource.title ? resource.title : idx}
            resource={resource}
            linkLabel={linkLabel}
            className={getResourceClassName ? getResourceClassName(resource) : ''}
            headerRight={renderResourceHeaderRight ? renderResourceHeaderRight(resource) : null}
            footer={renderResourceFooter ? renderResourceFooter(resource) : null}
            statusBadge={renderResourceStatusBadge ? renderResourceStatusBadge(resource) : null}
          />
        ))}
      </div>
    );
  }

  // Grouped mode: iterate the canonical taxonomy's own order so section
  // order is deterministic and matches the agreed Phase 8C taxonomy —
  // resources keep their original relative order within each section.
  const byType = new Map();
  resources.forEach((resource) => {
    const key = resource.type || 'Reference';
    if (!byType.has(key)) byType.set(key, []);
    byType.get(key).push(resource);
  });

  return (
    <div className={`space-y-6 ${className}`}>
      {CANONICAL_RESOURCE_TYPES.map((category) => (
        <ResourceSection
          key={category}
          category={category}
          resources={byType.get(category) || []}
          linkLabel={linkLabel}
          renderResourceHeaderRight={renderResourceHeaderRight}
          renderResourceFooter={renderResourceFooter}
          renderResourceStatusBadge={renderResourceStatusBadge}
          getResourceClassName={getResourceClassName}
        />
      ))}
    </div>
  );
}
