// Educational Experience Engine — Layer 4 (Reflection & Consolidation)
// Displays active-recall prompts (e.g. "explain what a closure is, without
// looking at your notes") — NOT a quiz, no answer submission, no scoring.
// Renders nothing when mission.recallPrompts is empty.
//
// Deliberately reads a separate `recallPrompts` field rather than the
// pre-existing `skillCheck` field, even though both are "check your
// understanding" concepts. skillCheck is the formal, tracked, progression-
// gating assessment (Stage 2 — submitSkillCheck/skillChecks in AppContext).
// This component must never become that: it's presentation-only, receives
// nothing but `mission`, and has no concept of being "passed" or "graded."
// Reusing skillCheck's data here would risk that gating meaning leaking
// into what's meant to be an ungraded memory-retrieval nudge.
//
// TODO(do not "fix"): this component must never become an assessment or
// progression gate. No answer field, no scoring, no completion tracking,
// no unlock dependency should ever be added here — that is SkillCheck's
// role exclusively (Stage 2, submitSkillCheck/skillChecks in AppContext).
// KnowledgeCheck exists solely to prompt active recall; if a future
// contributor is tempted to add "mark as reviewed" or similar tracking to
// this component, that's a sign that feature belongs in SkillCheck instead.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function KnowledgeCheck({ mission, bare = false }) {
  const prompts = Array.isArray(mission?.recallPrompts) ? mission.recallPrompts : [];
  if (prompts.length === 0) return null;

  const content = (
    <ul className="space-y-2">
      {prompts.map((prompt, i) => (
        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <span aria-hidden="true" className="text-brand-violet flex-shrink-0 mt-0.5">◆</span>
          <span>{prompt}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="Knowledge Check — From Memory">{content}</EducationalNote>;
  }

  return <SectionCard title="Knowledge Check">{content}</SectionCard>;
}
