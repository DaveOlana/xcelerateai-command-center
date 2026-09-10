import React from 'react';
import {
  BookOpen,
  CheckCircle2,
  CheckSquare,
  FileText,
  Lock,
  Target,
  Zap,
} from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { PageShell } from '../../components/common/UIComponents';
import MissionStageStepper from '../../components/missions/MissionStageStepper';
import SkillCheckStage from '../../components/missions/SkillCheckStage';
import V2BuildStage from '../../components/missions/v2/V2BuildStage';
import V2StudyStage from '../../components/missions/v2/V2StudyStage';
import { useApp } from '../../context/AppContext';
import { getV2WeekProgress } from '../../curriculum-v2/runtime/progression.js';

const STAGES = [
  { id: 'study', label: 'Study', icon: BookOpen },
  { id: 'skillCheck', label: 'Skill Check', icon: CheckSquare },
  { id: 'builds', label: 'Build', icon: Target },
  { id: 'proof', label: 'Proof', icon: FileText },
  { id: 'reflection', label: 'Reflect', icon: Zap },
  { id: 'complete', label: 'Complete', icon: CheckCircle2 },
];

const uiSkillCheck = (definition) => ({
  ...definition,
  mode: 'quiz',
  skillCheckId: definition.id,
  questions: definition.questions.map((question) => ({ ...question, type: 'multiple_choice' })),
});

const defaultStage = (status) => STAGES.find((stage) => !status[stage.id]?.done)?.id || 'complete';

export default function V2Missions() {
  const {
    activeV2Curriculum: curriculum,
    activeV2Learner: learner,
    settings,
    setActiveV2Week,
    openV2Resource,
    completeV2Resource,
    submitV2SkillCheckAttempt,
    addV2RecoveryInsight,
    setV2BuildCompleted,
    setV2ProofEvidence,
    setV2ReflectionResponse,
    completeV2Week,
  } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const requestedWeek = searchParams.get('week');
  const initialWeekId = curriculum.indexes.weeksById[requestedWeek] ? requestedWeek : learner?.activeWeekId || curriculum.weeks[0].id;
  const [weekId, setWeekId] = React.useState(initialWeekId);
  const week = curriculum.indexes.weeksById[weekId] || curriculum.weeks[0];
  const status = getV2WeekProgress(curriculum, learner, week.id);
  const requestedStage = searchParams.get('stage');
  const [stage, setStage] = React.useState(STAGES.some((item) => item.id === requestedStage) ? requestedStage : defaultStage(status));
  const [reflectionDrafts, setReflectionDrafts] = React.useState({});
  const [feedback, setFeedback] = React.useState('');
  const weekIndex = curriculum.weeks.findIndex((item) => item.id === week.id);
  const previousComplete = weekIndex === 0 || learner?.completedWeekIds?.includes(curriculum.weeks[weekIndex - 1].id);
  const inspectionOnly = !previousComplete && settings.manualOverrideEnabled;
  const inaccessible = !previousComplete && !settings.manualOverrideEnabled;

  React.useEffect(() => {
    setActiveV2Week(week.id);
    setStage((current) => STAGES.some((item) => item.id === current) ? current : defaultStage(status));
    setReflectionDrafts(Object.fromEntries(week.reflection.prompts.map((prompt) => [prompt.id, learner?.reflections?.[week.id]?.[prompt.id]?.response || ''])));
    setFeedback('');
  }, [week.id]); // Stable curriculum selection owns the remaining dependencies.

  const chooseWeek = (nextWeek) => {
    setWeekId(nextWeek.id);
    setSearchParams({ week: nextWeek.id }, { replace: true });
  };
  const chooseStage = (nextStage) => {
    const gate = status[nextStage];
    if (!gate?.unlocked && !settings.manualOverrideEnabled) return;
    setStage(nextStage);
    setSearchParams({ week: week.id, stage: nextStage }, { replace: true });
  };
  const stageStatus = (stageId) => {
    if (stage === stageId) return 'active';
    if (status[stageId]?.done) return 'completed';
    if (!status[stageId]?.unlocked && !settings.manualOverrideEnabled) return 'locked';
    return 'available';
  };

  if (inaccessible) return (
    <PageShell className="max-w-5xl"><section className="surface-card p-8 text-center"><Lock className="mx-auto h-7 w-7 text-text-muted" /><h1 className="mt-4 text-xl font-extrabold text-text-primary">This week is still locked.</h1><p className="mt-2 text-sm text-text-secondary">Complete the previous week before moving forward.</p><button type="button" onClick={() => chooseWeek(curriculum.weeks[Math.max(0, weekIndex - 1)])} className="btn-primary mt-5 px-5 py-2.5 text-sm">Return to available week</button></section></PageShell>
  );

  const skillDefinition = uiSkillCheck(week.skillCheck);
  const assessmentRecord = learner?.skillChecks?.[week.skillCheck.id] || { attempts: [], consecutiveFailures: 0, recovery: null };
  return (
    <PageShell className="max-w-6xl">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-violet">{curriculum.metadata.shortTitle} · Week {week.sequence}</p><h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{week.title}</h1><p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{week.outcome}</p></div>
        <select aria-label="Choose week" value={week.id} onChange={(event) => chooseWeek(curriculum.indexes.weeksById[event.target.value])} className="input-base min-w-56 text-sm">{curriculum.weeks.map((item, index) => { const unlocked = index === 0 || learner?.completedWeekIds?.includes(curriculum.weeks[index - 1].id) || settings.manualOverrideEnabled; return <option key={item.id} value={item.id} disabled={!unlocked}>Week {item.sequence}: {item.title}{learner?.completedWeekIds?.includes(item.id) ? ' · Complete' : ''}</option>; })}</select>
      </header>
      {inspectionOnly && <div className="mt-5 rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-4 text-sm text-text-secondary"><strong className="text-text-primary">Inspection only.</strong> Manual override lets you review this future week, but cannot satisfy stages or complete it.</div>}
      <div className="mt-6"><MissionStageStepper steps={STAGES} activeStage={stage} getStatus={stageStatus} onSelect={chooseStage} /></div>
      <main className="mt-6">
        {stage === 'study' && <V2StudyStage curriculum={curriculum} week={week} learner={learner} status={status} inspectionOnly={inspectionOnly} onOpenResource={openV2Resource} onCompleteResource={completeV2Resource} onAddRecoveryInsight={addV2RecoveryInsight} />}
        {stage === 'skillCheck' && <SkillCheckStage roadmapId={curriculum.curriculumId} week={{ ...week, weekNumber: week.sequence }} definition={skillDefinition} unlocked={status.skillCheck.unlocked && !inspectionOnly} attemptRecord={assessmentRecord} onSubmitAttempt={(attempt) => submitV2SkillCheckAttempt(week.id, week.skillCheck.id, attempt)} onAssessmentStateChange={() => {}} onReturnToStudy={() => chooseStage('study')} onContinue={() => chooseStage('builds')} />}
        {stage === 'builds' && <V2BuildStage curriculum={curriculum} week={week} learner={learner} status={status} inspectionOnly={inspectionOnly} onCompleteBuild={setV2BuildCompleted} />}
        {stage === 'proof' && <section className="surface-card p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Stage 4</p><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">Proof</h2><p className="mt-2 text-sm leading-relaxed text-text-secondary">{week.proof.prompt}</p><div className="mt-6 space-y-5">{week.proof.evidence.map((evidence) => { const record = learner?.proofs?.[week.proof.id]?.evidence?.[evidence.id]; const value = record?.value ?? (evidence.type === 'confirmation' ? false : ''); return <label key={evidence.id} className="block"><span className="text-sm font-bold text-text-primary">{evidence.label}{evidence.required && <span className="text-brand-amber"> *</span>}</span>{evidence.type === 'confirmation' ? <span className="mt-2 flex items-center gap-3 rounded-xl border border-border-default bg-bg-soft p-4"><input type="checkbox" checked={value === true} disabled={inspectionOnly || !status.proof.unlocked} onChange={(event) => setV2ProofEvidence(week.id, week.proof.id, evidence.id, event.target.checked)} className="h-4 w-4 accent-brand-violet" /><span className="text-sm text-text-secondary">Confirm</span></span> : evidence.type === 'text' ? <textarea rows={4} value={value} disabled={inspectionOnly || !status.proof.unlocked} onChange={(event) => setV2ProofEvidence(week.id, week.proof.id, evidence.id, event.target.value)} className="input-base mt-2 w-full text-sm" /> : <input type="url" value={value} disabled={inspectionOnly || !status.proof.unlocked} onChange={(event) => setV2ProofEvidence(week.id, week.proof.id, evidence.id, event.target.value)} placeholder="https://..." className="input-base mt-2 w-full text-sm" />}</label>; })}</div>{status.proof.done && <p className="mt-5 flex items-center gap-2 text-sm font-bold text-brand-green"><CheckCircle2 className="h-4 w-4" /> Required Proof is complete.</p>}</section>}
        {stage === 'reflection' && <section className="surface-card p-6 sm:p-8"><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Stage 5</p><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">Reflect</h2><p className="mt-2 text-sm text-text-secondary">Answer at least {week.reflection.minimumResponses} prompt{week.reflection.minimumResponses === 1 ? '' : 's'} meaningfully.</p><form onSubmit={(event) => { event.preventDefault(); Object.entries(reflectionDrafts).forEach(([promptId, response]) => setV2ReflectionResponse(week.id, promptId, response)); setFeedback('Reflection saved.'); }} className="mt-6 space-y-5">{week.reflection.prompts.map((prompt) => <label key={prompt.id} className="block"><span className="text-sm font-bold text-text-primary">{prompt.prompt}</span><textarea rows={4} value={reflectionDrafts[prompt.id] || ''} disabled={inspectionOnly || !status.reflection.unlocked} onChange={(event) => setReflectionDrafts((current) => ({ ...current, [prompt.id]: event.target.value }))} className="input-base mt-2 w-full text-sm" /></label>)}<button type="submit" disabled={inspectionOnly || !status.reflection.unlocked} className="btn-primary px-5 py-2.5 text-sm disabled:opacity-40">Save reflection</button>{feedback && <span className="ml-3 text-sm font-semibold text-brand-green">{feedback}</span>}</form></section>}
        {stage === 'complete' && <section className="surface-card p-8 text-center"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-brand-green/30 bg-brand-green/10 text-brand-green"><CheckCircle2 className="h-7 w-7" /></span><h2 className="mt-5 font-heading text-2xl font-extrabold text-text-primary">{status.completed ? 'Week completed' : status.complete.unlocked ? 'All requirements met' : 'Complete the remaining stages'}</h2><p className="mx-auto mt-2 max-w-xl text-sm text-text-secondary">{status.completed ? 'This achievement remains preserved across future curriculum revisions.' : 'Complete is available only after Study, Skill Check, required Builds, required Proof, and Reflection.'}</p>{!status.completed && <button type="button" disabled={inspectionOnly || !status.complete.unlocked} onClick={() => completeV2Week(week.id)} className="btn-primary mt-6 px-6 py-3 text-sm disabled:opacity-40">Complete Week {week.sequence}</button>}{status.completed && curriculum.weeks[weekIndex + 1] && <button type="button" onClick={() => chooseWeek(curriculum.weeks[weekIndex + 1])} className="btn-primary mt-6 px-6 py-3 text-sm">Continue to Week {week.sequence + 1}</button>}</section>}
      </main>
    </PageShell>
  );
}
