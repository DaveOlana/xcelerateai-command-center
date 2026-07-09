// Educational Experience Engine — Layer 1 (Mission Context)
// Displays the mission's learning objectives as a list. Supports any number
// of objectives and renders nothing when none are present — no placeholder,
// no empty state. Future regenerated JSONs populate this automatically (see
// missionAdapter.js's resolveLearningObjectives()).
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function LearningObjectives({ mission, bare = false }) {
  if (!mission || !Array.isArray(mission.learningObjectives) || mission.learningObjectives.length === 0) {
    return null;
  }

  const list = (
    <ul className="space-y-1.5 list-disc list-inside">
      {mission.learningObjectives.map((objective, i) => (
        <li key={i} className="text-xs text-slate-350 leading-relaxed">{objective}</li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="Learning Objectives">{list}</EducationalNote>;
  }

  return <SectionCard title="Learning Objectives">{list}</SectionCard>;
}
