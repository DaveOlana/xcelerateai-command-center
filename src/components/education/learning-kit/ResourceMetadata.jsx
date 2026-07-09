// Educational Experience Engine — Layer 2 (Learn)
// Displays optional resource metadata (difficulty, estimated time, estimated
// data, quality score). Gracefully hides whatever is absent — never renders a
// placeholder for a missing value. Rendering only: receives plain values,
// does no normalization and no status/progression logic.
//
// Tags are rendered separately by ResourceCard (after the description, per
// the Learning Kit's card hierarchy) rather than here, so this component is
// purely the compact "quick facts" row.
//
// Deliberately does NOT display a "required" flag. Whether a resource is
// required is not reliably readable from the resource's own data alone —
// unlockChecker.js's getRequiredResources() treats ALL resources as
// implicitly required whenever a week has no explicit required:true flags
// set (see WeeklyMissions.jsx), so the correct answer depends on unlock
// logic this component must never implement or duplicate. Callers that need
// to show a "Required" badge should compute it themselves (via
// getRequiredResources()) and inject it through ResourceCard's headerRight
// slot instead.
import { Clock, Star } from 'lucide-react';
import { cleanDifficultyLabel } from '../../../utils/safeRender';

const DIFFICULTY_STYLES = {
  Beginner: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
  Intermediate: 'bg-brand-amber/10 text-brand-amber border-brand-amber/20',
  Advanced: 'bg-red-500/10 text-red-400 border-red-500/20',
  Expert: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
};

export default function ResourceMetadata({
  difficulty,
  estimatedTime,
  estimatedData,
  qualityScore,
}) {
  const difficultyLabel = difficulty ? cleanDifficultyLabel(difficulty) : null;
  const hasQuality = typeof qualityScore === 'number' && qualityScore > 0;
  const hasAny = difficultyLabel || estimatedTime || estimatedData || hasQuality;
  if (!hasAny) return null;

  const starCount = hasQuality ? Math.max(1, Math.min(5, Math.round(qualityScore / 20))) : 0;

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
      {difficultyLabel && (
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border capitalize ${DIFFICULTY_STYLES[difficultyLabel] || 'bg-navy-900 text-slate-450 border-navy-750'}`}>
          {difficultyLabel}
        </span>
      )}
      {estimatedTime && (
        <span className="text-xs text-slate-450 font-medium flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-500" aria-hidden="true" /> {estimatedTime}
        </span>
      )}
      {estimatedData && (
        <span className="text-xs text-accent-cyan font-medium flex items-center gap-1">
          <span aria-hidden="true">💾</span> {estimatedData}
        </span>
      )}
      {hasQuality && (
        <span className="flex items-center gap-0.5" title={`Quality score: ${qualityScore}/100`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${i < starCount ? 'text-brand-amber fill-brand-amber' : 'text-navy-600 fill-navy-600'}`}
              aria-hidden="true"
            />
          ))}
        </span>
      )}
    </div>
  );
}
