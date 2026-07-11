// Educational Experience Engine — Layer 5 (Mission Completion & Transition)
// A small, curiosity-building teaser of what comes next — never a detailed
// explanation of the next lesson. Renders nothing when
// mission.nextMissionTeaser is absent.
//
// This is plain JSON-authored copy, not derived by looking up the roadmap's
// actual next week — see missionAdapter.js's resolveNextMissionTeaser() for
// why (buildMissionObject() has no reference to other weeks, and the
// milestone's own example reads as hand-written curiosity copy rather than
// an auto-generated blurb from a raw title).
import { SectionCard } from '../../common/UIComponents';
import TintedNote from '../TintedNote';

export default function NextMissionPreview({ mission, bare = false }) {
  if (!mission?.nextMissionTeaser) return null;

  if (bare) {
    return (
      <TintedNote tone="cyan" label="Coming Up">
        <p className="text-xs text-slate-300 leading-relaxed">{mission.nextMissionTeaser}</p>
      </TintedNote>
    );
  }

  return (
    <SectionCard title="Coming Up">
      <p className="text-[13px] text-text-secondary leading-relaxed">{mission.nextMissionTeaser}</p>
    </SectionCard>
  );
}
