import React from 'react';
import { CheckCircle2, Circle, TrendingUp } from 'lucide-react';
import { PageShell, ProgressBar } from '../../components/common/UIComponents';
import { useApp } from '../../context/AppContext';
import { deriveV2CompetencyProgress } from '../../curriculum-v2/runtime/competencyProgress.js';

const labels = { not_started: 'Not started', introduced: 'Introduced', practiced: 'Practiced', assessed: 'Assessed', applied: 'Applied', reinforced: 'Reinforced' };

export default function V2Progress() {
  const { activeV2Curriculum: curriculum, activeV2Learner: learner } = useApp();
  const competencies = React.useMemo(() => deriveV2CompetencyProgress(curriculum, learner), [curriculum, learner]);
  const completedWeeks = learner?.completedWeekIds?.length || 0;
  const percent = curriculum.weeks.length ? Math.round((completedWeeks / curriculum.weeks.length) * 100) : 0;
  const developed = competencies.filter((item) => item.status !== 'not_started').length;
  return (
    <PageShell className="max-w-6xl">
      <header><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-violet">Development story</p><h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">Progress</h1><p className="mt-2 text-sm text-text-secondary">Evidence-backed curriculum progress without confidence scores or invented mastery percentages.</p></header>
      <section className="surface-card mt-8 p-6 sm:p-8"><div className="flex items-end justify-between gap-5"><div><p className="text-sm font-semibold text-text-secondary">Course completion</p><p className="mt-1 text-sm text-text-muted">{completedWeeks} of {curriculum.weeks.length} weeks</p></div><span className="font-mono text-4xl font-extrabold text-text-primary">{percent}%</span></div><ProgressBar value={percent} className="mt-5" /></section>
      <section className="surface-card mt-6 overflow-hidden"><div className="border-b border-border-divider p-6 sm:px-8"><h2 className="font-heading text-xl font-extrabold text-text-primary">Competencies</h2><p className="mt-1 text-sm text-text-muted">{developed} of {competencies.length} have recorded learning evidence.</p></div><div className="divide-y divide-border-divider">{competencies.map((item) => <article key={item.competencyId} className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-8"><div className="flex items-start gap-3">{item.status === 'not_started' ? <Circle className="mt-0.5 h-5 w-5 text-text-muted" /> : item.status === 'reinforced' || item.status === 'applied' ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-green" /> : <TrendingUp className="mt-0.5 h-5 w-5 text-brand-violet" />}<div><h3 className="text-sm font-bold text-text-primary">{item.name}</h3><p className="mt-1 text-xs text-text-muted">{item.domain} · {item.importance}</p></div></div><div className="sm:text-right"><span className="rounded-full border border-border-default bg-bg-soft px-3 py-1 text-xs font-bold text-text-secondary">{labels[item.status]}</span>{item.evidenceIds.length > 0 && <p className="mt-2 text-[11px] text-text-muted">{item.evidenceIds.length} evidence source{item.evidenceIds.length === 1 ? '' : 's'}</p>}</div></article>)}</div></section>
    </PageShell>
  );
}
