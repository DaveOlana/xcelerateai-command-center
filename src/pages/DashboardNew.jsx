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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

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

  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate) || 1;
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays) || totalDays;
  const durationPercent = getBootcampDurationPercent(settings.startDate, totalDays) || 0;
  const motivational = getMotivationalMessage(prog.overall, streak.currentStreak);

  const hasTotalDays = roadmap && roadmap.totalDays !== undefined && roadmap.totalDays !== null && roadmap.totalDays > 0;
  const hasStartDate = settings.startDate !== undefined && settings.startDate !== null && settings.startDate !== "";
  const calculatedBootcampDay = hasStartDate ? (getBootcampDay(settings.startDate) || 1) : null;
  const calculatedDaysRemaining = hasStartDate ? getDaysRemaining(settings.startDate, totalDays) : null;
  const showDaysRemaining = hasTotalDays && hasStartDate && calculatedDaysRemaining !== null && calculatedDaysRemaining !== undefined;
  const showStreak = streak && streak.currentStreak !== undefined && streak.currentStreak !== null;

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
      <style>{`
        @keyframes scan-pulse {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(500%); }
        }
        .animate-scan {
          animation: scan-pulse 6s ease-in-out infinite;
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-scan {
            animation: none !important;
            background: linear-gradient(to right, transparent, rgba(6, 182, 212, 0.25), transparent) !important;
            transform: none !important;
            left: 0 !important;
            width: 100% !important;
          }
        }
      `}</style>

      {/* ── Mission Console Top Header ── */}
      {roadmap && (
        <div className="bg-bg-surface border border-border-default rounded-radius-xxl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
            <div className="w-10 h-10 rounded-xl bg-navy-800/80 border border-navy-700 flex items-center justify-center flex-shrink-0">
              <img src="/xcelerate-icon.png" alt="X" className="w-5 h-5 object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Mission Console</p>
              <h2 className="text-lg font-extrabold text-white mt-1.5 leading-none truncate">XcelerateAI Command Center</h2>
            </div>
          </div>
          <div className="text-left sm:text-right min-w-0 w-full sm:w-auto">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-none">Active Roadmap</p>
            <p className="text-xs font-semibold text-slate-400 mt-1.5 break-words line-clamp-2 sm:truncate max-w-md">
              {roadmapTitle}
            </p>
          </div>
        </div>
      )}

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* ── 1. Command Hero with Journey Tracker ── */}
        <div
          data-tour="dashboard-hero"
          className="col-span-1 lg:col-span-3 order-1 lg:order-1 relative overflow-hidden rounded-radius-xxl border border-border-default bg-bg-surface p-6 sm:p-8 lg:p-12 shadow-card animate-fade-in"
        >
          <div className="absolute -left-20 -top-20 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-brand-cyan/5 rounded-full blur-3xl pointer-events-none" />



          <div className="flex flex-col md:grid md:grid-cols-4 gap-8 lg:gap-12 items-stretch relative z-10 w-full">
            {/* Left Column: Command Briefing */}
            <div className="flex flex-col justify-between md:col-span-3 order-1 md:order-1 text-left w-full space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-3.5">
                  <span className="w-2 h-2 rounded-full bg-brand-blue animate-pulse" />
                  <span className="text-xs text-brand-blue font-bold tracking-widest uppercase">
                    Mission Cockpit Active
                  </span>
                </div>

                {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
                  <div className="space-y-4">
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading leading-tight">
                      {learnerDisplayName ? `Welcome back, ${learnerDisplayName}.` : 'Welcome back, Operator.'}
                    </h1>
                    
                    <p className="text-slate-300 font-semibold text-[16px] lg:text-[18px]">
                      You’re currently working on Week {settings.activeWeek}: <span className="text-white font-bold">{activeWeekData?.week?.title || 'Active Session'}</span>
                    </p>

                    <div className="relative w-full h-[1px] bg-navy-800/60 my-4 overflow-hidden">
                      <span className="absolute top-0 left-0 h-full w-28 bg-gradient-to-r from-transparent via-brand-cyan/20 to-transparent animate-scan blur-[0.5px]" />
                    </div>

                    <div className="text-text-secondary text-[14px] leading-relaxed max-w-2xl">
                      {activeWeekData?.week?.briefing ? (
                        <p className="text-slate-400 font-medium">
                          {activeWeekData.week.briefing}
                        </p>
                      ) : activeWeekData?.month?.objective ? (
                        <p className="text-slate-400 font-medium">
                          {activeWeekData.month.objective}
                        </p>
                      ) : (
                        <p className="text-slate-400 font-medium">Today’s focus is waiting.</p>
                      )}

                      {motivational && (
                        <p className="text-xs text-text-muted italic mt-4 block">
                          "{motivational}"
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight font-heading leading-tight">
                      Initialize Learning Workspace.
                    </h1>
                    <p className="text-text-secondary mt-3 text-[15px] leading-relaxed max-w-xl">
                      Import a structured learning roadmap JSON to activate your personalized mission dashboard.
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons (Desktop only, hidden on mobile to stack button correctly below journey panel) */}
              <div className="hidden md:flex flex-wrap gap-4 pt-2 no-print">
                {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
                  <>
                    <Link to="/today" className="btn-primary py-2.5 px-5 text-xs font-bold active:scale-[0.98] transition-transform">
                      Continue Today's Focus
                    </Link>
                    <Link to="/missions" className="btn-secondary py-2.5 px-5 text-xs font-semibold active:scale-[0.98] transition-transform">
                      View Weekly Missions
                    </Link>
                  </>
                ) : (
                  <Link to="/import" className="btn-primary py-2.5 px-5 text-xs font-bold">
                    Import Roadmap
                  </Link>
                )}
              </div>
            </div>

            {/* Right Column: Journey Tracker */}
            {roadmap && roadmap.weeks && roadmap.weeks.length > 0 && (
              <div className="order-2 md:order-2 md:col-span-1 flex flex-col justify-center md:border-l md:border-navy-800/50 md:pl-8 pt-6 md:pt-0 border-t md:border-t-0 border-navy-800/40">
                <div className="space-y-4 w-full max-w-[240px] mx-auto md:ml-auto md:mr-0">
                  <div>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-0.5">Duration</span>
                    <div className="flex items-baseline gap-1.5 mt-1">
                      {hasStartDate ? (
                        <>
                          <span className={`text-4xl font-black text-white tracking-tight font-heading transition-all duration-500 transform ${
                            mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'
                          }`}>
                            Day {calculatedBootcampDay}
                          </span>
                          {hasTotalDays && (
                            <span className="text-xs text-slate-500 font-bold">/ {totalDays}</span>
                          )}
                        </>
                      ) : (
                        <span className="text-xs font-bold text-slate-400">Day tracking unavailable</span>
                      )}
                    </div>
                    {showDaysRemaining && (
                      <p className="text-[11px] text-slate-400 mt-1 font-medium">
                        {calculatedDaysRemaining} days left after today
                      </p>
                    )}
                  </div>

                  <div className="w-full pt-0.5">
                    <ProgressBar percent={mounted ? durationPercent : 0} colorClass="bg-gradient-to-r from-brand-blue to-brand-cyan" />
                  </div>

                  {/* Footer metadata pills */}
                  {((settings.activeWeek !== undefined && settings.activeWeek !== null && settings.activeWeek !== '') || showStreak) && (
                    <div className="flex flex-wrap gap-1.5 pt-2.5">
                      {settings.activeWeek !== undefined && settings.activeWeek !== null && settings.activeWeek !== '' && (
                        <span className="text-[9px] font-bold text-slate-400 bg-navy-950/40 border border-navy-850 px-2 py-0.5 rounded">
                          Week {settings.activeWeek}
                        </span>
                      )}
                      {showStreak && (
                        <span className="text-[9px] font-bold text-slate-400 bg-navy-950/40 border border-navy-850 px-2 py-0.5 rounded">
                          {streak.currentStreak}-day streak
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons (Mobile only, rendered here to be placed below the journey tracker) */}
            <div className="flex md:hidden flex-col gap-2.5 pt-2 order-3 no-print">
              {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
                <>
                  <Link to="/today" className="btn-primary py-3 px-5 text-xs font-bold text-center active:scale-[0.98]">
                    Continue Today's Focus
                  </Link>
                  <Link to="/missions" className="btn-secondary py-3 px-5 text-xs font-semibold text-center active:scale-[0.98]">
                    View Weekly Missions
                  </Link>
                </>
              ) : (
                <Link to="/import" className="btn-primary py-3 px-5 text-xs font-bold text-center">
                  Import Roadmap
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* ── 2. Today’s Next Move (Order 2 on Mobile, 3 on Desktop) ── */}
        {roadmap && roadmap.weeks && roadmap.weeks.length > 0 && (
          <div className="col-span-1 lg:col-span-2 order-2 lg:order-3">
            <ActionCard className="border-2 border-brand-blue/35 bg-bg-surface flex flex-col justify-between h-full hover:border-brand-blue transition-all duration-300">
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
                      <h3 className="text-xl font-bold text-white font-heading">{nextSession.title}</h3>
                      <p className="text-xs text-text-muted mt-1 uppercase font-semibold tracking-wider">{nextSession.type || 'Focus Session'}</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-xs pt-2">
                      {nextSession.durationMinutes && (
                        <span className="flex items-center gap-1.5 text-text-secondary">
                          <Clock className="w-3.5 h-3.5 text-brand-blue" />
                          <span>{nextSession.durationMinutes} Minutes</span>
                        </span>
                      )}

                      <span className="flex items-center gap-1.5 text-text-secondary">
                        <FileText className="w-3.5 h-3.5 text-brand-cyan" />
                        <span>
                          {nextSession.type?.toLowerCase().includes('build') || nextSession.type?.toLowerCase().includes('proof')
                            ? 'GitHub evidence submission required.'
                            : 'Proof not required yet.'}
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

              <div className="pt-6 border-t border-border-divider mt-6 flex flex-wrap items-center justify-between gap-4">
                <Link to="/today" className="btn-primary py-2.5 px-5 text-xs font-bold no-print active:scale-[0.98]">
                  Continue Today’s Focus
                </Link>
                <Link to="/missions" className="text-xs font-bold text-brand-blue hover:underline uppercase tracking-wider">
                  View Weekly Missions
                </Link>
              </div>
            </ActionCard>
          </div>
        )}

        {/* ── 3. Momentum Strip (Order 3 on Mobile, 2 on Desktop) ── */}
        <div className="col-span-1 lg:col-span-3 order-3 lg:order-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <MetricCard
              label={readinessSectionTitle}
              value={`${overallReadinessScore}%`}
              icon={ShieldCheck}
              accentColor="blue"
              helperText="Based on missions, proof, projects, and checkpoints."
            />
            <MetricCard
              label="ACTIVE PROGRESS"
              value={`${prog.overall}%`}
              icon={TrendingUp}
              accentColor="blue"
              helperText={`${prog.tasks.completed}/${prog.tasks.total} roadmap tasks resolved`}
            />
            <MetricCard
              label="STUDY STREAK"
              value={`${streak.currentStreak} Day${streak.currentStreak !== 1 ? 's' : ''}`}
              icon={Flame}
              accentColor="amber"
              helperText={`Longest recorded streak: ${streak.longestStreak} days`}
            />
            <MetricCard
              label="PROOF STATUS"
              value={isProofMissingForActiveWeek ? 'Action Due' : 'Verified'}
              icon={Award}
              accentColor={isProofMissingForActiveWeek ? 'amber' : 'green'}
              helperText={`Week ${settings.activeWeek} submission checks`}
            />
          </div>
        </div>

        {/* ── 4. Current Project / Build Track (Order 4 on Mobile & Desktop) ── */}
        <div className="col-span-1 lg:col-span-1 order-4 lg:order-4">
          <SectionCard
            title="Current Project / Build Track"
            subtitle="Connecting theoretical concepts to production outcome products."
            className="h-full"
          >
            {activeProject ? (() => {
              const { project, index } = activeProject;
              const done = progress.completedProjectMilestones?.[index] || [];
              const total = project.milestones?.length || 0;
              const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;

              // Find next milestone
              const nextMilestoneIdx = project.milestones?.findIndex((_, idx) => !done.includes(idx));
              const nextMilestone = nextMilestoneIdx !== -1 && project.milestones ? project.milestones[nextMilestoneIdx] : null;
              const nextMilestoneTitle = nextMilestone
                ? (typeof nextMilestone === 'string' ? nextMilestone : nextMilestone.title || nextMilestone.name || '')
                : (total === 0 ? 'No active milestone supplied' : (done.length >= total ? 'All milestones completed!' : 'Next milestone unavailable'));

              const githubLink = progress.projectGithubLinks?.[index] || '';

              return (
                <div className="space-y-4 pt-1 h-full flex flex-col justify-between">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-4">
                      <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Project {index + 1}</span>
                        <p className="text-base font-bold text-white mt-1 leading-snug font-heading">{project.name || project.title}</p>
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-bold whitespace-nowrap ${percent === 100 ? 'badge-green' : 'badge-blue'}`}>
                        {percent}% built
                      </span>
                    </div>

                    <div className="border-t border-border-divider pt-3 space-y-1">
                      <span className="text-[10px] text-slate-500 block">Next Milestone</span>
                      <p className="text-xs font-semibold text-white truncate bg-bg-soft border border-border-default rounded-xl p-3 leading-relaxed">
                        {nextMilestoneTitle}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4 border-t border-border-divider pt-3 text-[11px]">
                      <div>
                        <span className="text-slate-500 block mb-0.5">Repository Status</span>
                        <span className="font-semibold text-slate-350 truncate block">
                          {githubLink ? (
                            <a href={githubLink} target="_blank" rel="noopener noreferrer" className="text-brand-blue hover:underline inline-flex items-center gap-1">
                              Repo Linked <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : 'No repository linked yet'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block mb-0.5">Project Type</span>
                        <span className="font-semibold text-slate-350">{project.type || 'Deliverable'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 no-print border-t border-border-divider">
                    <Link to="/projects" className="btn-secondary w-full py-2 px-4 text-xs font-bold justify-center active:scale-[0.98]">
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
        </div>

        {/* ── 5. Compact Skill Profile (Order 5 on Mobile & Desktop) ── */}
        <div className="col-span-1 lg:col-span-2 order-5 lg:order-5">
          <SectionCard
            title="Skill Profile"
            subtitle="Calculated readiness across syllabus competencies."
            headerActions={
              <span className="text-xs px-2 py-0.5 rounded bg-brand-blue/10 text-brand-blue border border-brand-blue/20 font-bold font-mono">
                {overallReadinessScore}% Ready
              </span>
            }
            className="h-full flex flex-col justify-between"
          >
            {dynamicReadiness.length > 0 ? (() => {
              const totalCompetencies = dynamicReadiness.length;
              const movingCount = dynamicReadiness.filter(c => c.percent > 0).length;
              const waitingCount = totalCompetencies - movingCount;
              
              const sortedByPercent = [...dynamicReadiness].sort((a, b) => b.percent - a.percent);
              const strongest = sortedByPercent[0];
              const lowest = [...dynamicReadiness].sort((a, b) => a.percent - b.percent)[0];

              const strongestLabel = strongest && strongest.percent > 0 
                ? `Top signal: ${strongest.title} — ${strongest.percent}%` 
                : 'No moving competencies yet';
                
              const lowestLabel = lowest && lowest.percent === 0
                ? `Attention: ${lowest.title} has not started`
                : lowest
                ? `Focus Area: ${lowest.title} — ${lowest.percent}%`
                : 'All competencies completed';

              return (
                <div className="space-y-5 pt-1 h-full flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Summary Chips */}
                    <div className="flex flex-wrap gap-2">
                      <span className="bg-navy-900/60 border border-navy-750/30 text-slate-350 text-[11px] px-2.5 py-1 rounded-lg font-semibold">
                        {totalCompetencies} Competencies Tracked
                      </span>
                      <span className="bg-navy-900/60 border border-navy-750/30 text-slate-350 text-[11px] px-2.5 py-1 rounded-lg font-semibold">
                        {movingCount} Moving · {waitingCount} Waiting
                      </span>
                    </div>

                    {/* Details list */}
                    <div className="space-y-2.5 text-xs">
                      <div className="p-3 bg-bg-soft border border-border-default rounded-xl flex items-center justify-between gap-3">
                        <span className="text-slate-500 font-semibold">Top Signal</span>
                        <span className="text-white font-bold text-right truncate max-w-[200px]" title={strongestLabel}>
                          {strongest && strongest.percent > 0 ? `${strongest.title} (${strongest.percent}%)` : 'None'}
                        </span>
                      </div>
                      <div className="p-3 bg-bg-soft border border-border-default rounded-xl flex items-center justify-between gap-3">
                        <span className="text-slate-500 font-semibold">Attention Area</span>
                        <span className="text-white font-bold text-right truncate max-w-[200px]" title={lowestLabel}>
                          {lowest ? `${lowest.title} (${lowest.percent}%)` : 'None'}
                        </span>
                      </div>
                    </div>

                    {/* Bottom Progress Bar */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Overall Competency Readiness</span>
                      <ProgressBar percent={overallReadinessScore} colorClass="bg-gradient-to-r from-brand-blue to-brand-cyan" />
                    </div>
                  </div>

                  <div className="pt-4 no-print border-t border-border-divider">
                    <Link to="/progress" className="btn-secondary w-full py-2 px-4 text-xs font-bold justify-center flex items-center gap-1 active:scale-[0.98]">
                      View Full Skill Profile <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })() : (
              <div className="text-center py-8 space-y-2">
                <BarChart2 className="w-10 h-10 text-slate-650 mx-auto" />
                <p className="text-xs text-text-secondary">Skill profile unavailable</p>
              </div>
            )}
          </SectionCard>
        </div>

        {/* ── 6. Verification & Journaling (Order 6 on Mobile & Desktop) ── */}
        <div className="col-span-1 lg:col-span-1 order-6 lg:order-6">
          <SectionCard
            title="Verification & Journaling"
            subtitle="Proof of work and latest reflections."
            className="h-full flex flex-col justify-between"
          >
            <div className="space-y-4 pt-1 h-full flex flex-col justify-between">
              <div className="space-y-4">
                {/* Proof Section */}
                {(() => {
                  const currentProof = weekProofs[settings.activeWeek];
                  const hasRepo = currentProof?.githubRepoLink;
                  const hasCommit = currentProof?.githubCommitLink;
                  const isReadmeChecked = currentProof?.readmeCompleted;
                  const isComplete = hasRepo && hasCommit && isReadmeChecked;

                  const activeWeekObj = activeWeekData?.week;
                  const proofRequired = activeWeekObj?.proofOfWork !== false && (activeWeekObj?.deliverable || activeWeekObj?.proofOfWork);

                  let statusText = "Proof Pending";
                  if (!proofRequired) statusText = "No proof required yet";
                  else if (isComplete) statusText = "Verified";
                  else if (hasRepo && !hasCommit) statusText = "Commit Missing";
                  else if (hasRepo && hasCommit && !isReadmeChecked) statusText = "Awaiting Verification";

                  const proofMessage = proofRequired 
                    ? `Proof ${isComplete ? 'verified' : 'pending'} for Week ${settings.activeWeek}`
                    : 'No proof required yet';

                  return (
                    <div className="p-3 bg-bg-soft border border-border-default rounded-xl flex justify-between items-center gap-3">
                      <div>
                        <h4 className="text-[12px] font-bold text-white">Verification Status</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5">{proofMessage}</p>
                      </div>
                      <StatusBadge status={statusText} />
                    </div>
                  );
                })()}

                {/* Note Section */}
                {(() => {
                  const latestNote = [...notes].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
                  return (
                    <div className="p-3 bg-bg-soft border border-border-default rounded-xl space-y-2">
                      <div className="flex justify-between items-center">
                        <h4 className="text-[12px] font-bold text-white">Latest Journal Entry</h4>
                        {latestNote && (
                          <span className="text-[10px] text-text-muted">
                            {new Date(latestNote.createdAt || latestNote.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                          </span>
                        )}
                      </div>
                      {latestNote ? (
                        <div className="space-y-1">
                          <p className="text-xs font-bold text-brand-violet truncate">{latestNote.title || 'Untitled Note'}</p>
                          <p className="text-[11px] text-text-secondary line-clamp-2 leading-relaxed">
                            {latestNote.content || latestNote.whatLearned || latestNote.whatILearned || 'No content provided.'}
                          </p>
                        </div>
                      ) : (
                        <p className="text-[11px] text-text-muted italic">No journal entries yet</p>
                      )}
                    </div>
                  );
                })()}
              </div>

              <div className="pt-4 no-print border-t border-border-divider">
                <Link to="/proof" className="btn-secondary w-full py-2 px-4 text-xs font-bold justify-center flex items-center gap-1 active:scale-[0.98]">
                  Open Proof of Work <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>

      </div>
    </PageShell>
  );
}
