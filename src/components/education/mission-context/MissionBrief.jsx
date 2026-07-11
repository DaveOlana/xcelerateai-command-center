// Educational Experience Engine — Layer 1 (Mission Context)
// Displays mission title, summary, difficulty, estimated time/data, and
// prerequisites. Receives its data exclusively via the standardized
// `mission` object from src/utils/missionAdapter.js — never reads raw JSON,
// never normalizes, never computes progression/unlock state.
//
// `bare` renders just the inner content (no SectionCard shell) for embedding
// inside a page's own already-styled container, e.g. WeeklyMissions.jsx's
// existing week-header card. Standalone usage (bare=false) wraps itself in
// SectionCard.
import { SectionCard, InfoPill } from '../../common/UIComponents';

export default function MissionBrief({ mission, bare = false }) {
  if (!mission) return null;

  const metaPills = [];
  if (mission.difficulty) metaPills.push({ key: 'difficulty', label: mission.difficulty, variant: 'purple' });
  if (mission.estimatedTime) metaPills.push({ key: 'time', label: `⏱ ${mission.estimatedTime}`, variant: 'blue' });
  if (mission.estimatedData) metaPills.push({ key: 'data', label: `💾 ${mission.estimatedData}`, variant: 'cyan' });
  (mission.prerequisites || []).forEach((req, i) => {
    metaPills.push({ key: `req-${i}`, label: `Requires: ${req}`, variant: 'amber' });
  });

  const metaRow = metaPills.length > 0 && (
    <div className="flex flex-wrap gap-2 mt-3">
      {metaPills.map((pill) => (
        <InfoPill key={pill.key} label={pill.label} variant={pill.variant} />
      ))}
    </div>
  );

  if (bare) {
    if (!mission.summary && metaPills.length === 0) return null;
    return (
      <div className="mt-4 pt-4 border-t border-navy-700/40">
        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
          Week Briefing
        </span>
        {mission.summary && <p className="text-xs text-slate-300 leading-relaxed">{mission.summary}</p>}
        {metaRow}
      </div>
    );
  }

  return (
    <SectionCard title={mission.title}>
      {mission.summary && <p className="text-[13px] text-text-secondary leading-relaxed">{mission.summary}</p>}
      {metaRow}
    </SectionCard>
  );
}
