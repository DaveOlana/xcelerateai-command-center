// Educational Experience Engine — Layer 1 (Mission Context)
// Displays what success looks like for a mission. Renders nothing when
// `mission.expectedOutcome` is absent — no placeholder, no empty state.
// Future regenerated JSONs populate this automatically (see
// missionAdapter.js's resolveExpectedOutcome()).
import { SectionCard } from '../../common/UIComponents';

export default function ExpectedOutcome({ mission, bare = false }) {
  if (!mission || !mission.expectedOutcome) return null;

  if (bare) {
    return (
      <div className="p-4 bg-navy-800 border border-navy-700/30 rounded-xl text-xs text-slate-350">
        <p className="font-bold text-white uppercase tracking-wider text-[10px] mb-1">Expected Deliverable:</p>
        <p className="italic">"{mission.expectedOutcome}"</p>
      </div>
    );
  }

  return (
    <SectionCard title="Expected Outcome">
      <p className="text-[13px] text-text-secondary leading-relaxed italic">"{mission.expectedOutcome}"</p>
    </SectionCard>
  );
}
