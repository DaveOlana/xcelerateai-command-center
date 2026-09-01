// Educational Experience Engine — Layer 3 (Guided Learning)
// Displays progressively helpful hints while the learner is building.
// Renders nothing when mission.hints is empty. Rendering only: no
// normalization, no alias resolution, no unlock/progress checking — all of
// that belongs to missionAdapter.js.
//
// "Progressively helpful" is implemented as a local, purely-UI reveal
// mechanism: the first hint is visible by default, and the learner must
// actively ask for each subsequent one. This is local component state only
// (not AppContext, not progress tracking) — it directly serves "guide
// thinking without revealing the complete solution" from the milestone's
// educational philosophy, forcing an active choice before each additional
// hint rather than dumping the full solution path at once.
//
// TODO(Phase 8C, future milestone): revealedCount is intentionally
// local-only React state today — it resets on remount (e.g. switching tabs
// or weeks) and is never persisted. A future version should persist which
// hints a learner has revealed using the learner's progress/session system
// (AppContext/localStorage), the same way resourcesStatus/skillChecks/etc.
// are persisted, so a learner's hint progress survives navigation. Do not
// implement this here — this component must stay presentation-only per the
// Educational Experience Engine's architecture; persistence would need to be
// threaded in from a page-level/AppContext source, the same pattern already
// used for study-status tracking in LearningKit's slot props.
import { useState } from 'react';
import { Lightbulb } from 'lucide-react';
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function HintsPanel({ mission, bare = false }) {
  const hints = Array.isArray(mission?.hints) ? mission.hints : [];
  const [revealedCount, setRevealedCount] = useState(hints.length > 0 ? 1 : 0);

  if (hints.length === 0) return null;

  const visibleHints = hints.slice(0, revealedCount);
  const hasMore = revealedCount < hints.length;

  const content = (
    <div className="space-y-3">
      <div className="space-y-2">
        {visibleHints.map((hint, i) => (
          <p key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
            <Lightbulb className="w-3.5 h-3.5 text-brand-amber flex-shrink-0 mt-0.5" aria-hidden="true" />
            <span>{hint}</span>
          </p>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setRevealedCount((c) => Math.min(c + 1, hints.length))}
          className="btn-secondary py-2 px-3 text-xs font-bold text-brand-amber border-brand-amber/20 hover:bg-brand-amber/5"
        >
          Reveal Next Hint ({revealedCount}/{hints.length})
        </button>
      )}
    </div>
  );

  if (bare) {
    return <EducationalNote label="Hints">{content}</EducationalNote>;
  }

  return <SectionCard title="Hints">{content}</SectionCard>;
}
