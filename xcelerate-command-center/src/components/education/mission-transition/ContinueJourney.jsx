// Educational Experience Engine — Layer 5 (Mission Completion & Transition)
// The educational wrapper around the transition action — NOT navigation
// logic itself. This component never decides where to go or whether the
// learner is allowed to continue; it only provides the visual/educational
// framing around whatever action element the page hands it via `children`.
//
// Unlike the other three Layer 5 components, this one has no "render
// nothing if absent" JSON field to check — the milestone doesn't specify
// one, because this component isn't optional authored content, it's a
// structural wrapper. It still renders nothing if `mission` itself is
// missing, consistent with every other component in this engine.
import { SectionCard } from '../../common/UIComponents';

export default function ContinueJourney({ mission, bare = false, children }) {
  if (!mission) return null;

  if (bare) {
    return <div className="flex gap-3 justify-center pt-2">{children}</div>;
  }

  return (
    <SectionCard title="Ready to Continue?">
      <div className="flex gap-3 justify-center pt-2">{children}</div>
    </SectionCard>
  );
}
