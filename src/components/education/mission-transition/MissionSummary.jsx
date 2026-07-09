// Educational Experience Engine — Layer 5 (Mission Completion & Transition)
// A concise "mission debrief" of what the learner has just completed —
// shown only once the week is actually complete (Unlock Stage), not a
// restatement of anything shown earlier. Renders nothing when
// mission.missionDebrief is absent.
//
// Deliberately a separate field from mission.missionReview (Layer 4's
// Reflection Stage content) — see missionAdapter.js's resolveMissionDebrief()
// for why. This component does not repeat that content; it's a distinct,
// optional field a JSON author may or may not choose to also supply.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function MissionSummary({ mission, bare = false }) {
  if (!mission?.missionDebrief) return null;

  if (bare) {
    return (
      <EducationalNote label="Mission Debrief">
        <p className="text-xs text-slate-300 leading-relaxed">{mission.missionDebrief}</p>
      </EducationalNote>
    );
  }

  return (
    <SectionCard title="Mission Debrief">
      <p className="text-[13px] text-text-secondary leading-relaxed">{mission.missionDebrief}</p>
    </SectionCard>
  );
}
