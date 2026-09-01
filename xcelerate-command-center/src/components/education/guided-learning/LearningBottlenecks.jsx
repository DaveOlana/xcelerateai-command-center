// Educational Experience Engine — Layer 3 (Guided Learning)
// Displays common educational obstacles a learner is likely to hit while
// understanding a concept (e.g. "assignment vs comparison confusion") — NOT
// syntax errors, and never a solution. Renders nothing when there are none.
//
// Reads mission.commonMistakes. That field name is unchanged from Milestone
// 1/2 deliberately: nothing in the app has ever consumed it (Layers 1-2
// never needed it), so renaming it carried no benefit and only risk, and
// the milestone's instruction to avoid unnecessary missionAdapter.js changes
// argues for leaving it alone. The conceptual reframing from "Common
// Mistakes" to "Learning Bottlenecks" lives here, at the presentation layer,
// where the milestone actually asked for it.
import { SectionCard } from '../../common/UIComponents';
import EducationalNote from '../EducationalNote';

export default function LearningBottlenecks({ mission, bare = false }) {
  const bottlenecks = Array.isArray(mission?.commonMistakes) ? mission.commonMistakes : [];
  if (bottlenecks.length === 0) return null;

  const content = (
    <ul className="space-y-2">
      {bottlenecks.map((item, i) => (
        <li key={i} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
          <span aria-hidden="true" className="text-brand-amber flex-shrink-0 mt-0.5">•</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );

  if (bare) {
    return <EducationalNote label="Where Learners Often Get Stuck">{content}</EducationalNote>;
  }

  return <SectionCard title="Where Learners Often Get Stuck">{content}</SectionCard>;
}
