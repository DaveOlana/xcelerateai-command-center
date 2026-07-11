// Educational Experience Engine — Layer 1 (Mission Context)
// Displays the learning context/scenario for a mission. Renders nothing when
// `mission.scenario` is absent — no placeholder, no empty state — so the
// learner never sees an empty educational card. Future regenerated JSONs
// populate this automatically once they include a scenario/context field
// (see missionAdapter.js's resolveScenario()).
import { SectionCard } from '../../common/UIComponents';

export default function MissionScenario({ mission, bare = false }) {
  if (!mission || !mission.scenario) return null;

  if (bare) {
    return (
      <div className="bg-accent-cyan/5 border border-accent-cyan/10 rounded-xl p-3 mt-2 text-slate-350">
        <p className="text-accent-cyan font-bold uppercase tracking-wider text-[10px] mb-1">Mission Scenario</p>
        <p className="leading-relaxed">{mission.scenario}</p>
      </div>
    );
  }

  return (
    <SectionCard title="Mission Scenario">
      <p className="text-[13px] text-text-secondary leading-relaxed">{mission.scenario}</p>
    </SectionCard>
  );
}
