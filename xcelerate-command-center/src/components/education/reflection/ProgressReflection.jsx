// Educational Experience Engine — Layer 4 (Reflection & Consolidation)
// Displays encouragement focused on learning behaviour rather than generic
// praise. Renders nothing when mission.progressNotes is empty.
//
// Important architectural note: this component receives ONLY `mission` —
// static, JSON-derived content — with no access to AppContext/localStorage.
// It therefore CANNOT know what a specific learner actually did (whether
// they really documented their debugging process, completed every task,
// etc.). The milestone's own example messages ("You completed every
// practical task") read as if personalized to real behaviour, but that
// would require progress computation, which this layer must never perform.
// The safe, consistent-with-Milestone-4 resolution: progressNotes is static,
// JSON-authored encouragement content tied to the mission/week, not a
// dynamically computed reflection of one learner's actual history. If truly
// personalized behavioural encouragement is wanted later, it would need a
// different component that's explicitly allowed to read progress state —
// a decision for a future milestone, not this one.
//
// TODO(Phase 8C, future milestone): long-term architectural direction is a
// ProgressReflectionAdapter (or equivalent layer) analogous to
// attachMissionStatus() in missionAdapter.js — a function that receives
// real learner progress state (completedTasks, resourcesStatus, weekProofs,
// etc.) alongside the mission and generates genuinely personalized
// behavioural reflections ("you completed every practical task" becoming
// true instead of aspirational copy). This component would then render
// whatever that adapter produces, still without touching AppContext itself.
// Do not implement this now — this is a note on direction, not a task.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function ProgressReflection({ mission, bare = false }) {
  const notes = Array.isArray(mission?.progressNotes) ? mission.progressNotes : [];
  if (notes.length === 0) return null;

  const content = (
    <ul className="space-y-1.5">
      {notes.map((note, i) => (
        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <span aria-hidden="true" className="text-emerald-400 flex-shrink-0 mt-0.5">✓</span>
          <span>{note}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="What You Practiced">{content}</EducationalNote>;
  }

  return <SectionCard title="What You Practiced">{content}</SectionCard>;
}
