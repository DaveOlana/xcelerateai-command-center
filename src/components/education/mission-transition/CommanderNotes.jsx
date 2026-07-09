// Educational Experience Engine — Layer 5 (Mission Completion & Transition)
// Displays mentor guidance written by the bootcamp author. Tone is coach /
// mentor / experienced engineer — never a motivational speaker, never
// generic praise. This component only renders whatever string(s) the JSON
// author wrote; it has no way to enforce tone itself, that's a content-
// authoring responsibility, not something code can validate.
// Renders nothing when mission.commanderNotes is empty.
import { SectionCard } from '../../common/UIComponents';
import TintedNote from '../TintedNote';

export default function CommanderNotes({ mission, bare = false }) {
  const notes = Array.isArray(mission?.commanderNotes) ? mission.commanderNotes : [];
  if (notes.length === 0) return null;

  const content = (
    <div className="space-y-2">
      {notes.map((note, i) => (
        <p key={i} className="text-xs text-slate-300 leading-relaxed italic">&ldquo;{note}&rdquo;</p>
      ))}
    </div>
  );

  if (bare) {
    return (
      <TintedNote tone="purple" label="Commander’s Notes">
        {content}
      </TintedNote>
    );
  }

  return <SectionCard title="Commander's Notes">{content}</SectionCard>;
}
