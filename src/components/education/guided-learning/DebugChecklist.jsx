// Educational Experience Engine — Layer 3 (Guided Learning)
// Displays a structured debugging process as a static, read-only checklist.
// Renders nothing when mission.debugChecklist is empty — there is no
// hardcoded default list baked in (the milestone's example items are
// illustrative of what a JSON-authored checklist could contain, not a
// fallback), consistent with every other Layer 3 component's "no data, no
// render" contract.
//
// TODO(do not "fix"): rendering nothing when debugChecklist is absent is
// intentional, not a gap to fill. Do not replace it with generic hardcoded
// debugging advice as a fallback. Different disciplines require genuinely
// different debugging philosophies (e.g. a Cybersecurity bootcamp's
// debugging process is not a Software Engineering bootcamp's), and this
// component has no way to know which applies — only the bootcamp JSON
// author does. A future contributor tempted to add a "sensible default"
// checklist here would be reintroducing exactly the kind of hardcoded,
// bootcamp-specific assumption AI_CONSTITUTION.md forbids.
//
// Deliberately non-interactive: the checkbox glyphs are visual only, not
// clickable. Making them toggleable would mean tracking per-step completion
// state, which is progress-checking — explicitly forbidden for this layer
// and squarely unlockChecker.js/AppContext's responsibility, not this
// component's.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function DebugChecklist({ mission, bare = false }) {
  const steps = Array.isArray(mission?.debugChecklist) ? mission.debugChecklist : [];
  if (steps.length === 0) return null;

  const content = (
    <ul className="space-y-1.5">
      {steps.map((step, i) => (
        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <span aria-hidden="true" className="text-slate-500 flex-shrink-0">☐</span>
          <span>{step}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="Debugging Checklist">{content}</EducationalNote>;
  }

  return <SectionCard title="Debugging Checklist">{content}</SectionCard>;
}
