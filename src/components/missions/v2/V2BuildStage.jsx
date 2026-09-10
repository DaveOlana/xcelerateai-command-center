import React from 'react';
import { Check, CheckCircle2, ChevronDown, ChevronUp, Clock3, Target } from 'lucide-react';
import CopyTemplateButton from '../../common/CopyTemplateButton';
import {
  formatEstimatedEffort,
  resolveBuildSessions,
  resolveConceptReferences,
  resolvePriorKnowledge,
} from '../../../curriculum-v2/runtime/learningPresentation.js';
import BuildSessionPlan from './BuildSessionPlan';
import ConceptExplanationCard from './ConceptExplanationCard';

function Milestones({ steps }) {
  if (!steps.length) return null;
  return <section><h3 className="text-sm font-bold text-text-primary">Build milestones</h3><ol className="mt-3 space-y-3">{steps.map((step, index) => <li key={step.id} className="flex gap-3 rounded-xl border border-border-default bg-bg-soft p-3.5 text-sm leading-relaxed text-text-secondary"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-violet/25 bg-brand-violet/10 font-mono text-xs font-bold text-brand-violet">{index + 1}</span><span>{step.text}</span></li>)}</ol></section>;
}

function AcceptanceCriteria({ criteria }) {
  return <section><h3 className="text-sm font-bold text-text-primary">Acceptance criteria</h3><p className="mt-1 text-xs text-text-muted">These requirements define when the Build is complete.</p><ul className="mt-3 space-y-2">{criteria.map((criterion) => <li key={criterion.id} className="flex gap-3 text-sm leading-relaxed text-text-secondary"><CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" aria-hidden="true" />{criterion.text}</li>)}</ul></section>;
}

function ProfessionalSpecification({ build, effort }) {
  const [open, setOpen] = React.useState(false);
  const contentId = React.useId();
  return (
    <section className="rounded-2xl border border-border-default bg-bg-soft">
      <button type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls={contentId} className="flex min-h-12 w-full items-center justify-between gap-4 rounded-2xl px-4 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet sm:px-5">
        <span><span className="block text-sm font-bold text-text-primary">Professional specification</span><span className="block text-xs text-text-muted">Authoritative technical requirements and support material</span></span>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" /> : <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" aria-hidden="true" />}
      </button>
      {open && <div id={contentId} className="space-y-6 border-t border-border-divider p-4 sm:p-5">
        <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Outcome</h4><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{build.outcome}</p></div>
        <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Technical brief</h4><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{build.brief}</p></div>
        <div><h4 className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Exact estimate</h4><p className="mt-1.5 text-sm text-text-secondary">{effort?.exact || `${build.estimatedMinutes} minutes`}</p></div>
        <Milestones steps={build.steps} />
        <AcceptanceCriteria criteria={build.acceptanceCriteria} />
        {build.hints.length > 0 && <div><h4 className="text-sm font-bold text-text-primary">Hints</h4><ul className="mt-2 space-y-2">{build.hints.map((hint, index) => <li key={`${build.id}-hint-${index}`} className="text-sm leading-relaxed text-text-secondary">• {hint}</li>)}</ul></div>}
        {build.templates.length > 0 && <div className="space-y-3"><h4 className="text-sm font-bold text-text-primary">Templates</h4>{build.templates.map((template) => <CopyTemplateButton key={template.id} template={template} />)}</div>}
        {build.stretch && <div><h4 className="text-sm font-bold text-text-primary">Stretch work</h4><p className="mt-1.5 text-sm leading-relaxed text-text-secondary">{build.stretch}</p></div>}
      </div>}
    </section>
  );
}

function BuildCard({ curriculum, build, done, unlocked, inspectionOnly, onComplete }) {
  const guide = build.learnerGuide;
  const effort = formatEstimatedEffort(build.estimatedMinutes, guide?.sessions?.length || 0);
  const priorKnowledge = resolvePriorKnowledge(guide?.priorKnowledgeCompetencyIds, curriculum.indexes.competenciesById);
  const concepts = resolveConceptReferences(guide?.conceptRefs, curriculum.indexes.conceptsById);
  const sessions = resolveBuildSessions(guide?.sessions, build.steps);

  return (
    <article className="surface-card overflow-hidden">
      <div className="p-6 sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0"><span className="text-xs font-bold uppercase tracking-wider text-brand-violet">{build.required ? 'Required Build' : 'Optional Build'}</span><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{build.title}</h2><p className="mt-3 max-w-3xl text-sm leading-relaxed text-text-secondary">{guide?.summary || build.brief}</p></div>
          {effort && <div className="shrink-0 rounded-2xl border border-border-default bg-bg-soft p-4 sm:min-w-44"><div className="flex items-center gap-2 text-text-primary"><Clock3 className="h-4 w-4 text-brand-violet" aria-hidden="true" /><span className="font-bold">{effort.primary}</span></div>{effort.secondary && <p className="mt-1 pl-6 text-xs text-text-muted">{effort.secondary}</p>}</div>}
        </div>

        {guide && <div className="mt-7 grid gap-4 lg:grid-cols-2">
          <section className="rounded-2xl border border-border-default bg-bg-soft p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Why you are building it</p><p className="mt-2 text-sm leading-relaxed text-text-secondary">{guide.whyItMatters}</p></section>
          <section className="rounded-2xl border border-border-default bg-bg-soft p-5"><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">What the finished result looks like</p><p className="mt-2 text-sm leading-relaxed text-text-secondary">{guide.finishedResult}</p></section>
        </div>}

        {priorKnowledge.length > 0 && <section className="mt-7"><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">What you already know</p><div className="mt-3 grid gap-3 md:grid-cols-2">{priorKnowledge.map((competency) => <div key={competency.id} className="rounded-xl border border-border-default bg-bg-soft p-4"><h3 className="text-sm font-bold text-text-primary">{competency.name}</h3><p className="mt-1 text-xs leading-relaxed text-text-secondary">{competency.description}</p></div>)}</div></section>}

        {concepts.length > 0 && <section className="mt-7" aria-labelledby={`${build.id}-concepts-heading`}><p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">New concepts</p><h3 id={`${build.id}-concepts-heading`} className="mt-1 font-heading text-lg font-extrabold text-text-primary">Terms used in this Build</h3><div className="mt-3 grid gap-3 lg:grid-cols-2">{concepts.map((concept) => <ConceptExplanationCard key={concept.id} concept={concept} />)}</div></section>}

        {sessions.length > 0 && <div className="mt-8"><BuildSessionPlan sessions={sessions} headingId={`${build.id}-session-plan-heading`} /></div>}
        <div className="mt-8 space-y-7"><Milestones steps={build.steps} /><AcceptanceCriteria criteria={build.acceptanceCriteria} /></div>
        <div className="mt-7"><ProfessionalSpecification build={build} effort={effort} /></div>
        <button type="button" disabled={done || inspectionOnly || !unlocked} onClick={() => onComplete(build.id)} className={`${done ? 'btn-secondary' : 'btn-primary'} mt-7 min-h-11 w-full px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto`}>{done ? <><Check className="h-4 w-4" aria-hidden="true" /> Build completed</> : 'Mark Build complete'}</button>
      </div>
    </article>
  );
}

export default function V2BuildStage({ curriculum, week, learner, status, inspectionOnly, onCompleteBuild }) {
  return (
    <div className="space-y-5">
      <section className="surface-card surface-card--hero p-6 sm:p-8"><div className="flex items-start gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-brand-violet/20 bg-brand-violet/10 text-brand-violet"><Target className="h-5 w-5" aria-hidden="true" /></span><div><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Stage 3 · Build</p><h2 className="mt-1 font-heading text-2xl font-extrabold text-text-primary">Turn understanding into working output.</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">Use the learner view to orient yourself, then consult the professional specification for the authoritative requirements.</p></div></div></section>
      {week.builds.map((build) => <BuildCard key={build.id} curriculum={curriculum} build={build} done={Boolean(learner?.builds?.[build.id]?.completedAt)} unlocked={status.builds.unlocked} inspectionOnly={inspectionOnly} onComplete={(buildId) => onCompleteBuild(week.id, buildId, true)} />)}
    </div>
  );
}
