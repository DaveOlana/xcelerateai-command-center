// Educational Experience Engine — shared layout helper (Milestone 7)
// The "eyebrow label + content" wrapper repeated identically across nine
// Layer 3/4/5 components (LearningObjectives, HintsPanel,
// LearningBottlenecks, DebugChecklist, ThinkingPrompt, KnowledgeCheck,
// MissionReview, ProgressReflection, MissionSummary). Extracted here purely
// to remove duplicated markup — no behavior, no data access, nothing
// mission-aware. Deliberately has no default top margin: every current call
// site renders inside a parent that already uses space-y-* utilities, so an
// additional margin here would double up spacing rather than add it once.
export default function EducationalNote({ label, children, className = '' }) {
  return (
    <div className={className}>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mb-1.5">{label}</p>
      {children}
    </div>
  );
}
