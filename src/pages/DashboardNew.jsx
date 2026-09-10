import React from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Flame,
  FolderKanban,
  Route,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateCourseProgress, getActiveWeekData } from '../utils/progressCalculator';
import { getNextLearningAction } from '../utils/nextLearningAction';
import { PageShell, ProgressBar } from '../components/common/UIComponents';

function getMilestoneTitle(milestone) {
  if (!milestone) return '';
  if (typeof milestone === 'string') return milestone;
  return milestone.title || milestone.name || milestone.label || milestone.text || '';
}

export default function Dashboard() {
  const {
    roadmap,
    progress,
    settings,
    streak,
    blockers,
    resourcesStatus,
    practicalMissions,
    userProfile,
    weekReflections,
    skillChecks,
    skillCheckAttempts,
    weekProofs,
    sessionTimer,
  } = useApp();

  const courseProgress = calculateCourseProgress(roadmap, progress);
  const activeWeekData = getActiveWeekData(roadmap, settings.activeWeek);
  const activeWeek = activeWeekData?.week;
  const learnerName = userProfile?.displayName?.trim() || userProfile?.name?.trim() || 'Learner';
  const courseTitle = roadmap?.shortTitle || roadmap?.title || roadmap?.bootcampTitle || 'Your learning journey';
  const weekTitle = activeWeek?.title || activeWeek?.displayLabel || activeWeek?.goal || '';
  const currentStreak = streak?.currentStreak || 0;
  const totalWeeks = Array.isArray(roadmap?.months)
    ? roadmap.months.reduce((total, month) => total + (month.weeks?.length || 0), 0)
    : roadmap?.weeks?.length || 0;

  const nextAction = React.useMemo(() => getNextLearningAction({
    roadmap,
    progress,
    settings,
    resourcesStatus,
    skillChecks,
    practicalMissions,
    weekProofs,
    weekReflections,
    sessionTimer,
    skillCheckAttempts,
  }), [roadmap, progress, settings, resourcesStatus, skillChecks, skillCheckAttempts, practicalMissions, weekProofs, weekReflections, sessionTimer]);

  const activeProblems = React.useMemo(
    () => (Array.isArray(blockers) ? blockers : []).filter((problem) => problem.status !== 'Solved'),
    [blockers]
  );

  const activeProject = React.useMemo(() => {
    const projects = Array.isArray(roadmap?.projects) ? roadmap.projects : [];
    for (let index = 0; index < projects.length; index += 1) {
      const project = projects[index];
      const milestones = Array.isArray(project?.milestones) ? project.milestones : [];
      const completed = progress?.completedProjectMilestones?.[index] || [];
      if (milestones.length > 0 && completed.length < milestones.length) {
        const nextMilestoneIndex = milestones.findIndex((_, milestoneIndex) => !completed.includes(milestoneIndex));
        return {
          project,
          completed,
          milestones,
          nextMilestone: nextMilestoneIndex >= 0 ? milestones[nextMilestoneIndex] : null,
        };
      }
    }
    return null;
  }, [roadmap?.projects, progress?.completedProjectMilestones]);

  const projectPercent = activeProject
    ? Math.round((activeProject.completed.length / activeProject.milestones.length) * 100)
    : 0;
  const progressPercent = Math.min(100, Math.max(0, Math.round(courseProgress.percent || 0)));
  const progressMarkerPosition = Math.min(96, Math.max(4, progressPercent));

  return (
    <PageShell className="space-y-4 lg:space-y-5">
      <section className="surface-card surface-card--hero journey-waves relative overflow-hidden px-5 py-6 sm:px-7 lg:px-9 lg:py-7" aria-labelledby="dashboard-greeting">
        <svg className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full text-accent-primary opacity-[0.045]" viewBox="0 0 1200 180" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 122C178 54 304 160 490 96C681 31 815 146 1200 53V180H0Z" fill="currentColor" />
          <path d="M0 151C219 90 355 174 594 119C820 67 1038 126 1200 96" fill="none" stroke="currentColor" strokeWidth="0.5" />
        </svg>

        <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.72fr)] lg:items-end">
          <div className="min-w-0">
            <div className="inline-flex items-center gap-2 rounded-full border border-accent-primary/15 bg-accent-primary/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.16em] text-accent-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Your learning path
            </div>
            <h1 id="dashboard-greeting" className="mt-4 font-heading text-3xl font-extrabold tracking-[-0.035em] text-text-primary sm:text-4xl">
              Welcome back, {learnerName}
            </h1>
            <p className="mt-3 max-w-2xl truncate text-base font-semibold text-text-secondary" title={courseTitle}>{courseTitle}</p>
            {activeWeek && (
              <p className="mt-1 truncate text-sm text-text-muted" title={weekTitle || undefined}>
                Week {activeWeek.weekNumber}{weekTitle ? ` · ${weekTitle}` : ''}
              </p>
            )}
          </div>

          <div className="glass-panel rounded-2xl border border-border-default p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-accent-primary">
                {nextAction.activeSession ? 'Session in progress' : 'Continue learning'}
              </p>
              <span className="rounded-full bg-bg-soft px-2.5 py-1 text-[11px] font-semibold text-text-muted">
                {nextAction.stageLabel} · {nextAction.stagePosition}/{nextAction.totalStages}
              </span>
            </div>
            <p className="mt-3 line-clamp-2 text-sm font-medium leading-6 text-text-primary">{nextAction.description}</p>
            <Link to={nextAction.destination} className="mt-4 inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-xl bg-accent-primary px-4 py-2.5 text-sm font-bold text-[var(--text-on-brand)] shadow-sm transition-all duration-200 hover:bg-accent-primary-dim focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus sm:w-auto">
              {nextAction.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="surface-card relative overflow-hidden px-5 py-5 sm:px-7 lg:px-8" aria-labelledby="course-progress-title">
        <div className="flex items-start justify-between gap-6">
          <div>
            <p className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-text-muted">
              <Route className="h-4 w-4 text-accent-primary" />
              Course journey
            </p>
            <h2 id="course-progress-title" className="mt-1 font-heading text-lg font-bold text-text-primary">Course Progress</h2>
          </div>
          <div className="text-right">
            <p className="font-heading text-3xl font-extrabold tracking-tight text-text-primary">{progressPercent}%</p>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-text-muted">complete</p>
          </div>
        </div>

        <div className="mt-5" role="progressbar" aria-label="Course progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressPercent}>
          <div className="relative h-2 rounded-full bg-bg-soft">
            <div className="journey-gradient h-full rounded-full transition-[width] duration-[420ms] ease-out" style={{ width: `${progressPercent}%` }} />
            <span className="absolute left-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] border-bg-surface bg-accent-primary shadow-sm" />
            <span className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-bg-surface bg-accent-primary shadow-sm" style={{ left: `${progressMarkerPosition}%` }} />
            <span className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full border-[3px] border-bg-surface bg-border-strong" />
          </div>
          <div className="mt-2 flex justify-between text-[10px] font-semibold uppercase tracking-wider text-text-disabled">
            <span>Start</span><span>You are here</span><span>Complete</span>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-border-divider pt-4 text-sm">
          <span className="inline-flex items-center gap-2 text-text-secondary">
            <CalendarDays className="h-4 w-4 text-accent-primary" />
            <strong className="font-semibold text-text-primary">Week {activeWeek?.weekNumber || '—'}</strong>
            {totalWeeks > 0 && <span className="text-text-muted">of {totalWeeks}</span>}
          </span>
          <span className="inline-flex items-center gap-2 text-text-secondary">
            <Flame className="h-4 w-4 text-brand-amber" />
            <strong className="font-semibold text-text-primary">{currentStreak} day{currentStreak === 1 ? '' : 's'}</strong>
            <span className="text-text-muted">study streak</span>
          </span>
          {nextAction.completed && (
            <span className="inline-flex items-center gap-2 font-semibold text-brand-green">
              <CheckCircle2 className="h-4 w-4" /> Course requirements complete
            </span>
          )}
        </div>
      </section>

      {(activeProject || activeProblems.length > 0) && (
        <section className={`grid gap-4 ${activeProject && activeProblems.length > 0 ? 'lg:grid-cols-2' : 'max-w-2xl'}`} aria-label="Supporting learning information">
          {activeProject && (
            <article className="surface-card surface-card--compact p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-brand-violet/20 bg-brand-violet/10">
                  <FolderKanban className="h-4 w-4 text-brand-violet" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Build progress</p>
                    <span className="text-xs font-bold text-brand-violet">{projectPercent}%</span>
                  </div>
                  <h3 className="mt-1 truncate font-heading text-sm font-bold text-text-primary" title={activeProject.project.name || activeProject.project.title}>
                    {activeProject.project.name || activeProject.project.title}
                  </h3>
                  {activeProject.nextMilestone && (
                    <p className="mt-1 line-clamp-1 text-xs text-text-muted">Next: {getMilestoneTitle(activeProject.nextMilestone)}</p>
                  )}
                </div>
              </div>
              <ProgressBar percent={projectPercent} className="mt-4" colorClass="journey-gradient" />
              <Link to="/workspace/projects" className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:underline">
                Open Workspace <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          )}

          {activeProblems.length > 0 && (
            <article className="surface-card surface-card--compact border-brand-amber/20 p-5">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-brand-amber/20 bg-brand-amber/10">
                  <AlertTriangle className="h-4 w-4 text-brand-amber" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-muted">Needs attention</p>
                  <h3 className="mt-1 font-heading text-sm font-bold text-text-primary">
                    {activeProblems.length} unresolved problem{activeProblems.length === 1 ? '' : 's'}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">Review anything slowing down your current work.</p>
                </div>
              </div>
              <Link to="/workspace/problems" className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-accent-primary hover:underline">
                Review Problems <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </article>
          )}
        </section>
      )}
    </PageShell>
  );
}
