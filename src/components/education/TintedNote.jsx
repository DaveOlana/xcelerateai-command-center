// Educational Experience Engine — shared layout helper (Milestone 7)
// The tinted-box "eyebrow label + content" wrapper repeated (with a tiny
// mb-1/mb-1.5 inconsistency between the two) across CommanderNotes and
// NextMissionPreview. Extracted purely to remove duplicated markup and fix
// that inconsistency — both call sites were authored fresh in Milestones
// 5-6 with no pre-existing original markup to preserve, so standardizing
// them is safe (unlike MissionScenario, which intentionally keeps its own
// bespoke classes because they were copied verbatim from pre-existing
// original page markup). No default top margin, for the same reason as
// EducationalNote — current call sites already sit inside space-y-* parents.
const TONE_STYLES = {
  cyan: { box: 'bg-accent-cyan/5 border-accent-cyan/15', label: 'text-accent-cyan' },
  purple: { box: 'bg-purple-500/5 border-purple-500/15', label: 'text-purple-400' },
};

export default function TintedNote({ tone = 'cyan', label, children, className = '' }) {
  const styles = TONE_STYLES[tone] || TONE_STYLES.cyan;
  return (
    <div className={`p-3 rounded-xl border ${styles.box} ${className}`}>
      <p className={`font-bold uppercase tracking-wider text-[10px] mb-1.5 ${styles.label}`}>{label}</p>
      {children}
    </div>
  );
}
