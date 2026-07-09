// Educational Experience Engine — Layer 4 (Reflection & Consolidation)
// Displays a concise, backward-looking summary of what the learner
// accomplished — "the learner looking back before moving forward," not
// another explanation. Renders nothing when mission.missionReview is absent.
//
// Deliberately a separate field from mission.summary (Layer 1's MissionBrief
// content — the forward-looking intro/objective shown before starting).
// Reusing `summary` here would show the same intro text twice with two
// different framings; `missionReview` is authored content specifically
// about looking back, not looking ahead.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function MissionReview({ mission, bare = false }) {
  if (!mission?.missionReview) return null;

  if (bare) {
    return (
      <EducationalNote label="Mission Review">
        <p className="text-xs text-slate-300 leading-relaxed">{mission.missionReview}</p>
      </EducationalNote>
    );
  }

  return (
    <SectionCard title="Mission Review">
      <p className="text-[13px] text-text-secondary leading-relaxed">{mission.missionReview}</p>
    </SectionCard>
  );
}
