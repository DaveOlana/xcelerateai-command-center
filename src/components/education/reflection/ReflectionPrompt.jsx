// Educational Experience Engine — Layer 4 (Reflection & Consolidation)
// Displays reflective questions after completing a mission. Renders nothing
// when mission.reflectionPrompts is empty.
//
// Unlike every other Layer 3/4 field, reflectionPrompts is NOT empty by
// default: normalizeRoadmap.js generates 5 fallback prompts for any week
// that doesn't supply its own, so this component reflects real, existing
// content today. This is a genuine extraction — the bare-mode markup below
// is copied verbatim (same classes, same "Prompt Questions:" header) from
// WeeklyMissions.jsx's pre-existing Reflection Stage JSX, not new content.
import { SectionCard } from '../../common/UIComponents';

export default function ReflectionPrompt({ mission, bare = false }) {
  const prompts = Array.isArray(mission?.reflectionPrompts) ? mission.reflectionPrompts : [];
  if (prompts.length === 0) return null;

  const content = (
    <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
      {prompts.map((p, idx) => (
        <li key={idx}>{p}</li>
      ))}
    </ul>
  );

  if (bare) {
    return (
      <div className="bg-navy-850 p-4 rounded-xl border border-navy-700/30">
        <h4 className="text-xs font-bold text-accent-cyan uppercase tracking-wider mb-2">Prompt Questions:</h4>
        {content}
      </div>
    );
  }

  return <SectionCard title="Reflection Prompts">{content}</SectionCard>;
}
