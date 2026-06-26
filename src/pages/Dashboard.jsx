import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Flame, TrendingUp, CheckCircle2, ChevronRight, Award, ShieldAlert, AlertTriangle, Clock, Calendar, BarChart2, Coffee, Sparkles, FolderKanban, FileText, ShieldCheck, ExternalLink, ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateOverallProgress,
  getActiveWeekData,
  getMotivationalMessage,
  calculateDynamicReadiness,
} from '../utils/progressCalculator';
import {
  getGreeting,
  getBootcampDay,
  getDaysRemaining,
  getBootcampDurationPercent,
} from '../utils/dateUtils';
import { getWeekStepStatus } from '../utils/unlockChecker';
import { PageShell, SectionCard, ActionCard, ReflectionCard, MetricCard, ProgressBar, StatusBadge } from '../components/common/UIComponents';

export default function Dashboard() {
  const {
    roadmap,
    progress,
    checkpointStatuses,
    settings,
    streak,
    blockers,
    weekProofs,
    sessionTimer,
    resourcesStatus,
    practicalMissions,
    userProfile,
    notes,
    weekReflections,
    skillChecks,
    exportProgress,
  } = useApp();

  const [hideBackupBannerLocal, setHideBackupBannerLocal] = React.useState(false);

  // Synchronously ensure session ID exists
  const sessionId = React.useMemo(() => {
    let sId = sessionStorage.getItem('xai_session_id');
    if (!sId) {
      sId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      sessionStorage.setItem('xai_session_id', sId);
    }
    return sId;
  }, []);

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const activeWeekData = getActiveWeekData(roadmap, settings.activeWeek);
  const greeting = getGreeting();

  // ── Dynamic duration calculations ──────────────────────────────────────────
  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays);
  const durationPercent = getBootcampDurationPercent(settings.startDate, totalDays);
  const motivational = getMotivationalMessage(prog.overall, streak.currentStreak);

  // ── Dynamic readiness score ────────────────────────────────────────────────
  const dynamicReadiness = calculateDynamicReadiness(roadmap, progress, resourcesStatus, practicalMissions);
  const overallReadinessScore = dynamicReadiness.length > 0
    ? Math.round(dynamicReadiness.reduce((acc, c) => acc + c.percent, 0) / dynamicReadiness.length)
    : 0;

  // ── Roadmap title properties ───────────────────────────────────────────────
  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;
  const readinessSectionTitle = `${roadmapShortTitle} Readiness`;

  // ── Open Blockers filter ───────────────────────────────────────────────────
  const activeBlockers = blockers.filter((b) => b.status !== 'Solved');

  // ── Backup Reminder ────────────────────────────────────────────────────────
  const showBackupReminder = React.useMemo(() => {
    if (hideBackupBannerLocal) return false;

    // Check snooze
    const snoozedUntil = localStorage.getItem('xai_backup_banner_snoozed_until');
    if (snoozedUntil && Date.now() < Number(snoozedUntil)) return false;

    // Check session dismissal
    const dismissedSession = localStorage.getItem('xai_backup_banner_dismissed_session');
    if (dismissedSession && dismissedSession === sessionId) return false;

    const needsBackup = !settings.lastBackupDate || (Date.now() - new Date(settings.lastBackupDate).getTime() > 7 * 24 * 60 * 60 * 1000);
    if (!needsBackup) return false;
    return bootcampDay >= 7 || prog.tasks.completed > 3 || (Array.isArray(progress.completedWeeks) ? progress.completedWeeks : []).length >= 1;
  }, [settings.lastBackupDate, bootcampDay, prog.tasks.completed, progress.completedWeeks, hideBackupBannerLocal, sessionId]);

  // ── Proof status checks ────────────────────────────────────────────────────
  const isProofMissingForActiveWeek = React.useMemo(() => {
    if (!settings.activeWeek) return false;
    const proof = weekProofs[settings.activeWeek];
    return !proof || !proof.githubRepoLink || !proof.githubCommitLink || !proof.readmeCompleted;
  }, [weekProofs, settings.activeWeek]);

  const weeksCompleted = progress.completedWeeks?.length || 0;
  const totalWeeks = roadmap?.weeks?.length || 1;
  const weekPercent = Math.round((weeksCompleted / totalWeeks) * 100);

  // ── Active Step Status ─────────────────────────────────────────────────────
  const stepStatus = React.useMemo(() => {
    if (!activeWeekData?.week) return null;
    return getWeekStepStatus({
      week: activeWeekData.week,
      weekNum: settings.activeWeek,
      monthNum: settings.activeMonth,
      progress,
      resourcesStatus,
      skillChecks,
      practicalMissions,
      weekProofs,
      weekReflections,
      settings,
    });
  }, [activeWeekData, settings, progress, resourcesStatus, skillChecks, practicalMissions, weekProofs, weekReflections]);

  // ── Today's Next Move Session Selector ─────────────────────────────────────
  const sessions = activeWeekData?.week?.scheduledSessions || activeWeekData?.week?.sessions || [];
  const nextSession = React.useMemo(() => {
    if (!activeWeekData?.week) return null;

    // 1. If a timer is active, prioritize that
    if (sessionTimer.activeSessionId) {
      const activeSession = sessions.find(
        (s, idx) => (s.sessionId || `w${settings.activeWeek}-s${idx}`) === sessionTimer.activeSessionId
      );
      if (activeSession) return activeSession;
    }

    // 2. Otherwise, find the first session that isn't fully completed yet
    for (let i = 0; i < sessions.length; i++) {
      const session = sessions[i];
      const type = (session.type || '').toLowerCase();
      let isDone = false;

      if (stepStatus) {
        if (type.includes('study')) isDone = stepStatus.resourcesDone;
        else if (type.includes('skill')) isDone = stepStatus.skillCheckDone;
        else if (type.includes('build')) isDone = stepStatus.practicalsDone;
        else if (type.includes('proof')) isDone = stepStatus.proofDone;
        else if (type.includes('reflection')) isDone = stepStatus.reflectionDone;
      }

      if (!isDone) {
        return session;
      }
    }

    return null;
  }, [sessions, sessionTimer.activeSessionId, stepStatus, settings.activeWeek, activeWeekData]);

  // ── Current Project Selection ──────────────────────────────────────────────
  const projects = roadmap?.projects || [];
  const activeProject = React.useMemo(() => {
    if (projects.length === 0) return null;
    // Find the first project with incomplete milestones
    for (let pi = 0; pi < projects.length; pi++) {
      const p = projects[pi];
      const done = progress.completedProjectMilestones?.[pi] || [];
      const total = p.milestones?.length || 0;
      if (done.length < total) {
        return { project: p, index: pi };
      }
    }
    return { project: projects[0], index: 0 };
  }, [projects, progress.completedProjectMilestones]);

  const learnerDisplayName = userProfile?.displayName?.trim() || userProfile?.name?.trim() || '';

  return (
    <PageShell>
      {/* ── Backup Export Reminder Banner ── */}
      {showBackupReminder && (
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 bg-brand-amber/5 border border-brand-amber/20 rounded-radius-xxl animate-fade-in">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Backup Export Recommended</p>
              <p className="text-[14px] text-text-secondary mt-1">Safeguard your progress. Export your database backup file now to prevent accidental data loss.</p>
            </div>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto justify-end flex-wrap sm:flex-nowrap">
            <button
              onClick={() => {
                exportProgress();
                setHideBackupBannerLocal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-amber text-navy-900 hover:bg-brand-amber/90 transition-all whitespace-nowrap active:scale-95"
            >
              Backup Now
            </button>
            <button
              onClick={() => {
                localStorage.setItem('xai_backup_banner_snoozed_until', (Date.now() + 24 * 60 * 60 * 1000).toString());
                setHideBackupBannerLocal(true);
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-navy-800 border border-navy-700 text-slate-350 hover:bg-navy-750 hover:text-white transition-all whitespace-nowrap active:scale-95"
            >
              Remind Me Later
            </button>
            <button
              onClick={() => {
                localStorage.setItem('xai_backup_banner_dismissed_session', sessionId);
                setHideBackupBannerLocal(true);
              }}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-350 transition-all whitespace-nowrap"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* ── Active Blockers Alert Banner ── */}
      {activeBlockers.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-5 bg-brand-red/5 border border-brand-red/20 rounded-radius-xxl animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-brand-red flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">System Blocked: {activeBlockers.length} Open Errors</p>
              <p className="text-[14px] text-text-secondary mt-1">Resolve logged blockers to clear indicators and restore velocity.</p>
            </div>
          </div>
          <Link to="/blockers" className="btn-secondary py-2 px-4 text-xs font-bold bg-brand-red/10 border-brand-red/25 text-brand-red whitespace-nowrap hover:bg-brand-red/20">
            Open Blockers
          </Link>
        </div>
      )}

      {/* ── 1. Daily Learning Hero ── */}
      <div
        data-tour="dashboard-hero"
        className="relative overflow-hidden rounded-radius-xxl border border-border-default bg-bg-surface p-8 lg:p-10 shadow-card flex flex-col md:flex-row items-center justify-between gap-8 animate-fade-in"
      >
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-6 flex-1 text-left w-full">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-xs text-brand-blue font-bold tracking-widest uppercase">
              {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? 'Learning Studio Active' : 'Waiting for Initialization'}
            </span>
          </div>

          {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
                {learnerDisplayName ? `Welcome back, ${learnerDisplayName}.` : 'Welcome back.'}
              </h1>
              <p className="text-text-secondary mt-3 text-[15px] leading-relaxed max-w-xl">
                You are currently following the <span className="text-white font-bold">{roadmapShortTitle}</span> tracks. 
                Week {settings.activeWeek} coordinates are active.
              </p>
              <p className="text-xs text-text-muted mt-2.5 italic">
                {motivational}
              </p>
            </div>
          ) : (
            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight font-heading">
                Initialize Learning Workspace.
              </h1>
              <p className="text-text-secondary mt-2 text-[15px] leading-relaxed max-w-xl">
                Import a structured learning roadmap JSON to activate your personalized mission dashboard.
              </p>
            </div>
          )}

          <div className="flex flex-wrap gap-4 pt-2 no-print">
            {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
              <>
                <Link to="/today" className="btn-primary py-3 px-6 text-[14px] font-bold">
                  Continue Today's Focus
                </Link>
                <Link to="/missions" className="btn-secondary py-3 px-6 text-[14px] font-semibold">
                  View Weekly Missions
                </Link>
              </>
            ) : (
              <Link to="/import" className="btn-primary py-3 px-6 text-[14px] font-bold">
                Import Roadmap
              </Link>
            )}
          </div>
        </div>

        {/* Option C: Minimal abstract visual panel (visible on md+) */}
        {roadmap && roadmap.weeks && roadmap.weeks.length > 0 && (
          <div className="hidden md:flex w-full md:w-72 lg:w-80 h-44 rounded-radius-xl bg-gradient-to-br from-brand-blue/10 to-brand-cyan/15 border border-border-default relative overflow-hidden flex-shrink-0 items-center justify-center">
            {/* Soft shapes and grid overlay */}
            <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />
            <div className="absolute -left-10 -top-10 w-24 h-24 bg-brand-blue/15 rounded-full blur-xl animate-glow-pulse" />
            <div className="absolute -right-10 -bottom-10 w-24 h-24 bg-brand-cyan/15 rounded-full blur-xl animate-glow-pulse" />
            
            {/* Visual nodes representing progress */}
            <div className="relative flex items-center justify-between gap-6 z-10">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${prog.overall >= 25 ? 'border-brand-blue bg-brand-blue/20 text-white' : 'border-border-strong bg-bg-soft text-text-muted'} transition-all`}>
                  <span className="text-[11px] font-bold font-mono">25%</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mt-1">Kickoff</span>
              </div>
              <div className="w-8 h-[2px] bg-border-strong relative">
                <div className="absolute inset-0 bg-brand-blue transition-all" style={{ width: `${Math.min(100, Math.max(0, (prog.overall / 50) * 100))}%` }} />
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${prog.overall >= 50 ? 'border-brand-cyan bg-brand-cyan/20 text-white' : 'border-border-strong bg-bg-soft text-text-muted'} transition-all`}>
                  <span className="text-[11px] font-bold font-mono">50%</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mt-1">Midway</span>
              </div>
              <div className="w-8 h-[2px] bg-border-strong relative">
                <div className="absolute inset-0 bg-brand-cyan transition-all" style={{ width: `${Math.min(100, Math.max(0, ((prog.overall - 50) / 50) * 100))}%` }} />
              </div>
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full border-2 flex items-center justify-center ${prog.overall >= 100 ? 'border-brand-green bg-brand-green/20 text-white' : 'border-border-strong bg-bg-soft text-text-muted'} transition-all`}>
                  <span className="text-[11px] font-bold font-mono">100%</span>
                </div>
                <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 mt-1">Mastery</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 3. Momentum Overview Deck ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          label="Overall Progress"
          value={`${prog.overall}%`}
          icon={TrendingUp}
          accentColor="blue"
          helperText={`${prog.tasks.completed}/${prog.tasks.total} tasks resolved`}
        />
        <MetricCard
          label="Active Coordinates"
          value={`Week ${settings.activeWeek}`}
          icon={Calendar}
          accentColor="cyan"
          helperText={`Month ${settings.activeMonth} · Phase ${Math.ceil(settings.activeWeek / 4)}`}
        />
        <MetricCard
          label="Study Streak"
          value={`${streak.currentStreak} Day${streak.currentStreak !== 1 ? 's' : ''}`}
          icon={Flame}
          accentColor="amber"
          helperText={`Longest: ${streak.longestStreak} days`}
        />
        <MetricCard
          label="Proof Status"
          value={isProofMissingForActiveWeek ? 'Action Due' : 'Verified'}
          icon={Award}
          accentColor={isProofMissingForActiveWeek ? 'amber' : 'green'}
          helperText={`Week ${settings.activeWeek} evidence submission`}
        />
      </div>

      {/* ── Layout Grid of secondary content cards ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT COLUMN: Main Functional Actions (spans 2) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* ── 2. Today's Next Move ── */}
          {roadmap && roadmap.weeks && roadmap.weeks.length > 0 && (
            <ActionCard className="border-border-default bg-bg-surface flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-brand-blue" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Next Move</span>
                  </div>
                  {nextSession && (
                    <StatusBadge status={sessionTimer.activeSessionId === (nextSession.sessionId || `w${settings.activeWeek}-s${sessions.indexOf(nextSession)}`) && sessionTimer.isRunning ? 'Active' : 'Recommended'} />
                  )}
                </div>

                {nextSession ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-white font-heading">{nextSession.title}</h3>
                      <p className="text-xs text-text-muted mt-1.5 uppercase font-semibold tracking-wider">{nextSession.type || 'Focus Session'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                      {nextSession.durationMinutes && (
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <Clock className="w-3.5 h-3.5 text-brand-blue" />
                          <span>⏱ {nextSession.durationMinutes} Minutes</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>
                          {nextSession.type?.toLowerCase().includes('build') || nextSession.type?.toLowerCase().includes('proof')
                            ? 'GitHub evidence submission required.'
                            : 'No proof required yet.'}
                        </span>
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-4">
                    <h3 className="text-base font-bold text-white font-heading">No focus session is scheduled yet.</h3>
                    <p className="text-xs text-text-secondary mt-1">
                      You have completed all scheduled focus hours, practical builds, and reflections for Week {settings.activeWeek}.
                    </p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t border-border-divider mt-4 flex justify-between items-center gap-3">
                <p className="text-xs text-text-muted hidden sm:block">Coordinates: W{settings.activeWeek} · {nextSession ? 'Session in progress' : 'Syllabus complete'}</p>
                <Link to="/today" className="btn-primary py-2.5 px-5 text-xs font-bold no-print">
                  Open Focus Console <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </ActionCard>
          )}

          {/* ── 5. Current Project / Build Track ── */}
          <SectionCard
            title="Current Project / Build Track"
            subtitle="Connecting theoretical concepts to production outcome products."
            headerActions={
              projects.length > 0 && (
                <Link to="/projects" className="text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline no-print">
                  View Tracker
                </Link>
              )
            }
          >
            {activeProject ? (() => {
              const { project, index } = activeProject;
              const done = progress.completedProjectMilestones?.[index] || [];
              const total = project.milestones?.length || 0;
              const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
              const isCapstone = project.capstone === true || project.featured === true;

              // Find next milestone
              const nextMilestoneIdx = project.milestones?.findIndex((_, idx) => !done.includes(idx));
              const nextMilestone = nextMilestoneIdx !== -1 && project.milestones ? project.milestones[nextMilestoneIdx] : null;
              const nextMilestoneTitle = nextMilestone
                ? (typeof nextMilestone === 'string' ? nextMilestone : nextMilestone.title || nextMilestone.name || '')
                : 'All milestones completed!';

              const githubLink = progress.projectGithubLinks?.[index] || '';

              return (
                <div className="space-y-5 pt-2">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Project {index + 1}</span>
                        {isCapstone && <span className="bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">Capstone</span>}
                      </div>
                      <p className="text-base font-bold text-white mt-1 leading-snug font-heading">{project.name || project.title}</p>
                    </div>
                    <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${percent === 100 ? 'badge-green' : 'badge-blue'}`}>
                      {percent}% Built
                    </span>
                  </div>

                  <div className="space-y-2 border-t border-border-divider pt-4">
                    <div className="flex justify-between text-xs text-slate-500">
                      <span>Next Active Milestone</span>
                      {nextMilestone && <span className="font-semibold text-slate-400">Milestone {nextMilestoneIdx + 1} of {total}</span>}
                    </div>
                    <p className="text-xs font-semibold text-white truncate bg-bg-soft border border-border-default rounded-xl p-3 leading-relaxed">
                      {nextMilestoneTitle}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-border-divider pt-4 text-xs">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Repository Link</span>
                      <span className="font-semibold text-slate-300 truncate block max-w-[200px]">
                        {githubLink ? (
                          <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">
                            Repo Linked <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : 'No repository linked yet'}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block mb-0.5">Project Type</span>
                      <span className="font-semibold text-slate-300">{project.type || 'Deliverable'}</span>
                    </div>
                  </div>

                  <div className="pt-2 no-print">
                    <Link to="/projects" className="btn-secondary w-full py-2.5 text-xs font-bold justify-center">
                      Open Project Tracker
                    </Link>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-8 space-y-4">
                <FolderKanban className="w-10 h-10 text-slate-650 mx-auto" />
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">No Active Project Selected Yet</h4>
                  <p className="text-xs text-text-secondary mt-1">Import a custom roadmap that lists projects to begin tracking build deliverables.</p>
                </div>
              </div>
            )}
          </SectionCard>

          {/* ── Roadmap Tracks (Redeadiness Categories) ── */}
          {dynamicReadiness.length > 0 && (
            <SectionCard
              title="Dynamic Syllabus Competencies"
              subtitle="Calculated dynamically across active weekly missions and resource check-offs."
            >
              <div className="grid sm:grid-cols-2 gap-4 pt-2">
                {dynamicReadiness.map((cat) => (
                  <div key={cat.id} className="bg-bg-soft p-4 rounded-xl border border-border-default space-y-3">
                    <div className="flex justify-between items-start text-xs">
                      <div>
                        <h4 className="font-bold text-white text-[13px]">{cat.title}</h4>
                        {cat.description && (
                          <p className="text-[11px] text-text-muted mt-1 leading-snug">{cat.description}</p>
                        )}
                      </div>
                      <span className="font-mono font-bold text-slate-350 bg-bg-surface px-2 py-0.5 rounded border border-border-divider text-[11px]">
                        {cat.percent}%
                      </span>
                    </div>
                    <ProgressBar percent={cat.percent} colorClass={`bg-gradient-to-r ${cat.color}`} />
                  </div>
                ))}
              </div>
            </SectionCard>
          )}
        </div>

        {/* RIGHT COLUMN: Metadata & Verification (spans 1) */}
        <div className="space-y-6">
          
          {/* ── 4. Active Roadmap Summary ── */}
          <SectionCard
            title="Active Roadmap Summary"
            subtitle="Overall course parameters and duration statistics."
            headerActions={
              <Link to="/settings" className="text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline no-print">
                Settings
              </Link>
            }
          >
            <div className="space-y-4 text-left">
              <div>
                <h4 className="text-[11px] text-slate-500 uppercase font-bold tracking-wider mb-1">Active Target</h4>
                <p className="text-sm font-bold text-white leading-snug">{roadmapTitle}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-border-divider pt-3 text-xs">
                <div>
                  <span className="text-slate-500 block mb-0.5">Course Duration</span>
                  <span className="font-semibold text-slate-350">{roadmap?.duration || 'No duration supplied'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Weekly Commitment</span>
                  <span className="font-semibold text-slate-350">{roadmap?.weeklyHours || 'Weekly hours not supplied'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Total Duration Weeks</span>
                  <span className="font-semibold text-slate-350">
                    {roadmap?.weeks?.length ? `${roadmap.weeks.length} Weeks` : 'Total weeks unavailable'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block mb-0.5">Active Coordinates</span>
                  <span className="font-semibold text-slate-350">Month {settings.activeMonth} · Week {settings.activeWeek}</span>
                </div>
              </div>

              <div className="border-t border-border-divider pt-3 space-y-1.5">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Timeline Progress</span>
                  <span className="font-semibold text-white">{weekPercent}% Weeks Completed</span>
                </div>
                <ProgressBar percent={weekPercent} colorClass="bg-gradient-to-r from-brand-blue to-brand-cyan" />
              </div>
            </div>
          </SectionCard>

          {/* ── 6. Proof and Evidence Status ── */}
          <SectionCard
            title="Proof & Evidence Status"
            subtitle="Verification checkpoint for active coordinates."
            headerActions={
              <Link to="/proof" className="text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline no-print">
                Proof Console
              </Link>
            }
          >
            {(() => {
              const currentProof = weekProofs[settings.activeWeek];
              const hasRepo = currentProof?.githubRepoLink;
              const hasCommit = currentProof?.githubCommitLink;
              const isReadmeChecked = currentProof?.readmeCompleted;
              const isComplete = hasRepo && hasCommit && isReadmeChecked;

              const activeWeekObj = activeWeekData?.week;
              const proofRequired = activeWeekObj?.proofOfWork !== false && (activeWeekObj?.deliverable || activeWeekObj?.proofOfWork);

              let statusText = "Proof Pending";
              let statusDesc = `Submit repository and commit references to verify Week ${settings.activeWeek} deliverables.`;

              if (!proofRequired) {
                statusText = "No proof required yet";
                statusDesc = `Some weeks do not require artifact proof. Continue studying Week ${settings.activeWeek} core content.`;
              } else if (isComplete) {
                statusText = "Latest Proof Submitted";
                statusDesc = `Week ${settings.activeWeek} evidence verified. Deliverables stand approved.`;
              } else if (hasRepo && !hasCommit) {
                statusText = "Commit Link Missing";
                statusDesc = "GitHub repository is linked, but a specific commit verification is pending.";
              } else if (hasRepo && hasCommit && !isReadmeChecked) {
                statusText = "Awaiting Verification";
                statusDesc = "References linked. Confirm the README completion checkbox to complete verification.";
              }

              return (
                <div className="space-y-4 text-left">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Week {settings.activeWeek} Status</span>
                    <StatusBadge status={statusText} />
                  </div>

                  <div className="bg-bg-soft border border-border-default rounded-xl p-3.5 text-xs text-slate-350 leading-relaxed">
                    {statusDesc}
                  </div>

                  <div className="pt-2 no-print">
                    <Link to="/proof" className="btn-secondary w-full py-2.5 text-xs font-bold justify-center">
                      Submit Proof of Work
                    </Link>
                  </div>
                </div>
              );
            })()}
          </SectionCard>

          {/* ── 7. Recent Note / Reflection ── */}
          {(() => {
            const latestNote = [...notes].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];

            return (
              <SectionCard
                title="Recent Note / Reflection"
                subtitle="Latest journal entry or blocker captured during study."
                headerActions={
                  <Link to="/notes" className="text-xs font-bold text-brand-blue uppercase tracking-wider hover:underline no-print">
                    Notes Journal
                  </Link>
                }
              >
                {latestNote ? (
                  <div className="space-y-4 pt-1">
                    <ReflectionCard className="border-l-brand-violet text-left">
                      <div className="flex justify-between items-start gap-3 mb-2.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-brand-violet bg-brand-violet/10 px-2 py-0.5 rounded border border-brand-violet/20">
                          {latestNote.noteType?.replace('_', ' ') || 'Journal Entry'}
                        </span>
                        <span className="text-[10px] text-text-muted">
                          {new Date(latestNote.createdAt || latestNote.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-white truncate">{latestNote.title || 'Untitled Note'}</h4>
                      <p className="text-xs text-text-secondary mt-1.5 line-clamp-3 leading-relaxed">
                        {latestNote.content || latestNote.whatLearned || latestNote.whatILearned || 'No content provided.'}
                      </p>
                    </ReflectionCard>
                    <div className="pt-1 no-print">
                      <Link to="/notes" className="btn-secondary w-full py-2.5 text-xs font-bold justify-center">
                        Open Notes Journal
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 space-y-4 bg-bg-soft/40 border border-dashed border-border-default rounded-radius-xl p-4">
                    <p className="text-xs text-text-muted italic">No notes yet. Capture your first learning note.</p>
                    <Link to="/notes" className="btn-secondary inline-flex py-2 px-4 text-xs font-bold no-print">
                      Write Note
                    </Link>
                  </div>
                )}
              </SectionCard>
            );
          })()}
        </div>
      </div>
    </PageShell>
  );
}
