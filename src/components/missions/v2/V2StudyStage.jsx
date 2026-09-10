import React from 'react';
import { Lightbulb } from 'lucide-react';
import StudyResourceCard from './StudyResourceCard';

export default function V2StudyStage({ curriculum, week, learner, status, inspectionOnly, onOpenResource, onCompleteResource, onAddRecoveryInsight }) {
  const [recoveryInsight, setRecoveryInsight] = React.useState('');
  const [feedback, setFeedback] = React.useState('');

  React.useEffect(() => {
    setRecoveryInsight('');
    setFeedback('');
  }, [week.id]);

  const openResource = (resourceId) => {
    if (!inspectionOnly) onOpenResource(week.id, resourceId, week.skillCheck.id);
  };
  const completeResource = (resourceId) => {
    onCompleteResource(week.id, resourceId);
    setFeedback('Resource marked complete.');
  };
  const saveRecoveryInsight = () => {
    onAddRecoveryInsight(week.skillCheck.id, recoveryInsight);
    setRecoveryInsight('');
    setFeedback('Recovery insight saved.');
  };

  return (
    <div className="space-y-5">
      <section className="surface-card surface-card--hero p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Stage 1 · Study</p>
        <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">Build the understanding you need next.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{week.study.objective}</p>
        <div className="mt-5 max-w-sm">
          <div className="mb-2 flex justify-between gap-4 text-xs font-semibold text-text-muted"><span>Core progress</span><span>{status.study.completedCore}/{status.study.required}</span></div>
          <div className="h-2 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-[width] duration-200" style={{ width: `${Math.min(100, status.study.required ? (status.study.completedCore / status.study.required) * 100 : 100)}%` }} /></div>
          <p className="mt-2 text-xs text-text-muted">Complete {week.study.coreMinimum} Core resource{week.study.coreMinimum === 1 ? '' : 's'}. Optional resources never block progress.</p>
        </div>
      </section>

      {status.recoveryLocked && (
        <section className="surface-card border-brand-amber/30 p-5">
          <div className="flex items-start gap-3"><Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-brand-amber" aria-hidden="true" /><div className="min-w-0 flex-1"><h3 className="font-bold text-text-primary">Recovery insight</h3><p className="mt-1 text-sm text-text-secondary">After reopening a Study resource, record one fresh insight to unlock another attempt.</p><label htmlFor="v2-recovery-insight" className="sr-only">What became clearer after reviewing?</label><textarea id="v2-recovery-insight" value={recoveryInsight} onChange={(event) => setRecoveryInsight(event.target.value)} rows={3} className="input-base mt-4 w-full text-sm" placeholder="What became clearer after reviewing?" /><button type="button" disabled={inspectionOnly || !recoveryInsight.trim()} onClick={saveRecoveryInsight} className="btn-primary mt-3 min-h-11 px-4 py-2 text-sm disabled:opacity-40">Save fresh insight</button></div></div>
        </section>
      )}

      <p className="sr-only" aria-live="polite">{feedback}</p>
      <section aria-labelledby="v2-study-resources-heading">
        <div className="mb-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">Study resources</p><h2 id="v2-study-resources-heading" className="mt-1 font-heading text-xl font-extrabold text-text-primary">Choose your next resource</h2></div>
        <div className="grid gap-4 lg:grid-cols-2">
          {week.study.resources.map((assignment) => {
            const resource = curriculum.indexes.resourcesById[assignment.resourceId];
            if (!resource) return null;
            return <StudyResourceCard key={resource.id} assignment={assignment} resource={resource} record={learner?.resources?.[week.id]?.[resource.id] || {}} inspectionOnly={inspectionOnly} onOpen={openResource} onComplete={completeResource} />;
          })}
        </div>
      </section>
    </div>
  );
}
