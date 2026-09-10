import React from 'react';
import { ArrowRight, BookOpen, CheckCircle2, FolderKanban, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageShell, ProgressBar } from '../../components/common/UIComponents';
import { useApp } from '../../context/AppContext';
import { getV2NextAction } from '../../curriculum-v2/runtime/progression.js';
import { getAllV2ProjectProgress } from '../../curriculum-v2/runtime/projects.js';

export default function V2Dashboard() {
  const { activeV2Curriculum: curriculum, activeV2Learner: learner, userProfile } = useApp();
  const next = React.useMemo(() => getV2NextAction(curriculum, learner), [curriculum, learner]);
  const completed = learner?.completedWeekIds?.length || 0;
  const percent = curriculum.weeks.length ? Math.round((completed / curriculum.weeks.length) * 100) : 0;
  const projects = React.useMemo(() => getAllV2ProjectProgress(curriculum, learner), [curriculum, learner]);
  const activeProject = projects.find((project) => !project.completed) || projects[0];
  const learnerName = userProfile?.displayName?.trim() || userProfile?.name?.trim() || 'Learner';
  return (
    <PageShell className="max-w-6xl">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-violet">Welcome back, {learnerName}</p><h1 className="mt-2 font-heading text-3xl font-extrabold text-text-primary">{curriculum.metadata.shortTitle}</h1><p className="mt-2 text-sm text-text-secondary">Revision {curriculum.revision} · Your prior achievements remain preserved across updates.</p></div>
        <Link to="/curricula" className="btn-secondary gap-2 px-4 py-2.5 text-sm"><RefreshCw className="h-4 w-4" /> Switch curriculum</Link>
      </header>
      <section className="surface-card mt-8 overflow-hidden p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_280px] lg:items-center">
          <div><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Canonical next action</p><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{next?.title || 'Course complete'}</h2><p className="mt-2 text-sm leading-relaxed text-text-secondary">Continue from the first unsatisfied stage in your active week.</p><Link to={`/missions${next ? `?week=${encodeURIComponent(next.weekId)}&stage=${encodeURIComponent(next.stage)}` : ''}`} className="btn-primary mt-6 inline-flex gap-2 px-5 py-3 text-sm">{next?.label || 'Review Missions'} <ArrowRight className="h-4 w-4" /></Link></div>
          <div className="rounded-2xl border border-border-default bg-bg-soft p-5"><div className="flex items-end justify-between"><span className="text-sm font-semibold text-text-secondary">Course progress</span><span className="font-mono text-3xl font-extrabold text-text-primary">{percent}%</span></div><ProgressBar value={percent} className="mt-4" /><p className="mt-3 text-xs text-text-muted">{completed} of {curriculum.weeks.length} weeks complete</p></div>
        </div>
      </section>
      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <Link to="/missions?view=path" className="surface-card p-5 transition hover:border-border-strong"><BookOpen className="h-5 w-5 text-brand-blue" /><h2 className="mt-4 font-bold text-text-primary">Missions</h2><p className="mt-1 text-sm text-text-muted">Study, verify, build, prove, and reflect.</p></Link>
        <Link to="/workspace/projects" className="surface-card p-5 transition hover:border-border-strong"><FolderKanban className="h-5 w-5 text-brand-violet" /><h2 className="mt-4 font-bold text-text-primary">{activeProject?.project.title || 'Projects'}</h2><p className="mt-1 text-sm text-text-muted">{activeProject ? `${activeProject.completedCount} of ${activeProject.totalCount} Build-derived milestones` : 'No project milestones'}</p></Link>
        <Link to="/progress" className="surface-card p-5 transition hover:border-border-strong"><CheckCircle2 className="h-5 w-5 text-brand-green" /><h2 className="mt-4 font-bold text-text-primary">Development story</h2><p className="mt-1 text-sm text-text-muted">See competency evidence without invented mastery scores.</p></Link>
      </div>
    </PageShell>
  );
}
