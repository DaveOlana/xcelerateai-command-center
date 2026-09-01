// Educational Experience Engine — Layer 3 (Guided Learning)
// Displays reflective coaching questions meant to be asked WHILE building
// (e.g. "What do you expect this code to do?"), distinct from
// mission.reflectionPrompts (Layer 4's end-of-week retrospective questions).
// Never provides answers. Renders nothing when mission.thinkingPrompts is
// empty.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function ThinkingPrompt({ mission, bare = false }) {
  const prompts = Array.isArray(mission?.thinkingPrompts) ? mission.thinkingPrompts : [];
  if (prompts.length === 0) return null;

  const content = (
    <ul className="space-y-2">
      {prompts.map((prompt, i) => (
        <li key={i} className="text-xs text-slate-300 italic leading-relaxed flex items-start gap-2">
          <span aria-hidden="true" className="text-accent-cyan flex-shrink-0 mt-0.5">?</span>
          <span>{prompt}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="Think It Through">{content}</EducationalNote>;
  }

  return <SectionCard title="Think It Through">{content}</SectionCard>;
}
