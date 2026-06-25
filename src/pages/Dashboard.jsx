import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Flame, TrendingUp, CheckCircle2, ChevronRight, Award, ShieldAlert, AlertTriangle, Clock, Calendar, BarChart2
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
import { PageShell, StatCard, ProgressBar, SectionCard } from '../components/common/UIComponents';

export default function Dashboard() {
  const { roadmap, progress, checkpointStatuses, settings, streak, blockers, weekProofs, sessionTimer, resourcesStatus, practicalMissions, userProfile } = useApp();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const activeWeekData = getActiveWeekData(roadmap, settings.activeWeek);
  const greeting = getGreeting();

  // ── Dynamic duration from normalized roadmap ──────────────────────────────
  // roadmap.totalDays is set by normalizeRoadmap → getDerivedDuration
  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays);
  const durationPercent = getBootcampDurationPercent(settings.startDate, totalDays);
  const motivational = getMotivationalMessage(prog.overall, streak.currentStreak);

  // ── Dynamic readiness from activeRoadmap.readinessCategories ─────────────
  const dynamicReadiness = calculateDynamicReadiness(roadmap, progress, resourcesStatus, practicalMissions);

  // ── Overall readiness score (average of dynamic categories) ───────────────
  const overallReadinessScore = dynamicReadiness.length > 0
    ? Math.round(dynamicReadiness.reduce((acc, c) => acc + c.percent, 0) / dynamicReadiness.length)
    : 0;

  // ── Dynamic title fields from normalized roadmap ──────────────────────────
  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;
  const readinessSectionTitle = `${roadmapShortTitle} Readiness`;

  const currentMonth = roadmap?.months?.find(
    (m) => m.monthNumber === settings.activeMonth
  );

  // Filter open/in-progress blockers
  const activeBlockers = blockers.filter((b) => b.status !== 'Solved');

  // Check backup reminder
  const showBackupReminder = React.useMemo(() => {
    const needsBackup = !settings.lastBackupDate || (Date.now() - new Date(settings.lastBackupDate).getTime() > 7 * 24 * 60 * 60 * 1000);
    if (!needsBackup) return false;
    return bootcampDay >= 7 || prog.tasks.completed > 3 || (Array.isArray(progress.completedWeeks) ? progress.completedWeeks : []).length >= 1;
  }, [settings.lastBackupDate, bootcampDay, prog.tasks.completed, progress.completedWeeks]);

  // Calculate missing proofs for active week
  const isProofMissingForActiveWeek = React.useMemo(() => {
    if (!settings.activeWeek) return false;
    const proof = weekProofs[settings.activeWeek];
    return !proof || !proof.githubRepoLink || !proof.githubCommitLink || !proof.readmeCompleted;
  }, [weekProofs, settings.activeWeek]);

  return (
    <PageShell>
      {/* ── Brand Header ── */}
      <div className="relative overflow-hidden rounded-3xl border border-navy-700/25 bg-navy-900 px-7 py-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 border border-white/10">
            <img src="/xcelerate-icon.png" alt="Xcelerate" className="w-6 h-6 object-contain" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-400 tracking-widest uppercase">Mission Console</h2>
            <h1 className="text-[20px] font-extrabold text-white tracking-tight">XcelerateAI Command Center</h1>
          </div>
        </div>
        <div className="text-right hidden sm:block">
          <p className="text-xs font-bold text-slate-450 tracking-widest uppercase">Active Roadmap</p>
          <p className="text-[14px] font-semibold text-slate-300">{roadmapTitle}</p>
        </div>
      </div>

      {/* ── Backup Export Reminder ── */}
      {showBackupReminder && (
        <div className="flex items-center justify-between gap-4 p-5 bg-amber-500/5 border border-amber-500/20 rounded-3xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">Backup Export Required</p>
              <p className="text-[14px] text-slate-400 mt-1">Please export your progress configuration under Settings to avoid data loss.</p>
            </div>
          </div>
          <Link to="/settings" className="btn-secondary py-2 px-4 text-[13px] bg-amber-500/10 text-amber-400 border-amber-500/20 whitespace-nowrap">
            Backup Now
          </Link>
        </div>
      )}

      {/* ── Active Blockers Alert Banner ── */}
      {activeBlockers.length > 0 && (
        <div className="flex items-center justify-between gap-4 p-5 bg-red-500/5 border border-red-500/20 rounded-3xl animate-pulse">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold text-white uppercase tracking-wider">System Blocked: {activeBlockers.length} Open Errors</p>
              <p className="text-[14px] text-slate-400 mt-1">Solve logged blockers to restore normal progress indicators.</p>
            </div>
          </div>
          <Link to="/blockers" className="btn-secondary py-2 px-4 text-[13px] bg-red-500/10 text-red-450 border-red-500/20 whitespace-nowrap">
            Open Blockers
          </Link>
        </div>
      )}

      {/* ── Hero Cockpit Status Card ── */}
      <div
        data-tour="dashboard-hero"
        className="relative overflow-hidden rounded-3xl border border-navy-700/25 bg-navy-850 p-8 lg:p-10 shadow-card"
      >
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-accent-primary/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row gap-8 justify-between items-start lg:items-center relative">
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <span className="text-xs text-accent-primary font-bold tracking-widest uppercase">
                {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? 'Mission Cockpit Active' : 'Initialization Mode'}
              </span>
            </div>

            {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Welcome back, {userProfile?.displayName || userProfile?.name || 'Operator'}.
                </h1>
                <p className="text-slate-350 mt-2.5 text-[15px] leading-relaxed max-w-xl">
                  You are currently working on <span className="text-white font-semibold">Week {settings.activeWeek}: {activeWeekData?.week?.title || 'No active week set'}</span>. Today's focus is waiting.
                </p>
                <p className="text-[13px] text-slate-500 mt-2.5 italic">
                  {motivational}
                </p>
              </div>
            ) : (
              <div>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                  Welcome to XcelerateAI Command Center.
                </h1>
                <p className="text-slate-350 mt-2 text-[15px] leading-relaxed max-w-xl">
                  Import a learning roadmap JSON to initialize your personalized mission cockpit.
                </p>
              </div>
            )}

            <div className="flex flex-wrap gap-4 pt-2">
              {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
                <>
                  <Link to="/today" className="btn-primary py-3 px-6 text-[15px] font-semibold">
                    Continue Today's Focus
                  </Link>
                  <Link to="/missions" className="btn-secondary py-3 px-6 text-[15px] font-medium">
                    View Weekly Missions
                  </Link>
                </>
              ) : (
                <Link to="/import" className="btn-primary py-3 px-6 text-[15px] font-semibold">
                  Import Roadmap
                </Link>
              )}
            </div>
          </div>

          {roadmap && roadmap.weeks && roadmap.weeks.length > 0 ? (
            /* ── Dynamic duration indicator ── */
            <div className="lg:border-l border-navy-700/50 lg:pl-10 flex flex-col justify-center w-full lg:w-auto flex-shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Duration</span>
              <p className="text-5xl font-extrabold text-white mt-2 tabular-nums tracking-tight">
                Day {bootcampDay || 1}{' '}
                <span className="text-[20px] text-slate-500 font-medium">/ {totalDays}</span>
              </p>
              <p className="text-[13px] text-slate-450 mt-2">{daysRemaining} days left after today</p>
              <ProgressBar percent={durationPercent} className="w-56 mt-4 h-2" />
            </div>
          ) : (
            <div className="lg:border-l border-navy-700/50 lg:pl-10 flex flex-col justify-center w-full lg:w-auto flex-shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0 text-slate-500 text-sm italic">
              System offline. Waiting for roadmap upload.
            </div>
          )}
        </div>
      </div>

      {/* ── Metric Indicators Deck ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {/* ── Dynamic readiness score — label from roadmap shortTitle ── */}
        <StatCard
          label={readinessSectionTitle}
          value={`${overallReadinessScore}%`}
          icon={({ className }) => <img src="/xcelerate-icon.png" alt="Xcelerate" className={`object-contain ${className}`} />}
          accentColor="cyan"
          helperText="Based on missions, proof, projects, and checkpoints."
        />
        <StatCard
          label="Active Progress"
          value={`${prog.overall}%`}
          icon={TrendingUp}
          accentColor="blue"
          helperText={`${prog.tasks.completed}/${prog.tasks.total} roadmap tasks resolved`}
        />
        <StatCard
          label="Study Streak"
          value={`${streak.currentStreak} Day${streak.currentStreak !== 1 ? 's' : ''}`}
          icon={Flame}
          accentColor="orange"
          helperText={`Longest recorded streak: ${streak.longestStreak} days`}
        />
        <StatCard
          label="Proof Status"
          value={isProofMissingForActiveWeek ? 'Action Due' : 'Verified'}
          icon={Award}
          accentColor={isProofMissingForActiveWeek ? 'amber' : 'green'}
          helperText={`Week ${settings.activeWeek} submission checks`}
        />
      </div>

      {/* ── Dynamic Roadmap Build Tracks ── */}
      {/* Rendered from readinessCategories in the active JSON — not hardcoded */}
      {dynamicReadiness.length > 0 ? (
        <SectionCard
          title="Roadmap Tracks"
          subtitle={`${roadmapShortTitle} readiness · Calculated from weekly missions and resource progress.`}
        >
          <div className="grid md:grid-cols-2 gap-6 pt-2">
            {dynamicReadiness.map((cat) => (
              <div key={cat.id} className="bg-navy-900 p-5 rounded-2xl border border-navy-700/20 space-y-3">
                <div className="flex justify-between items-start text-xs">
                  <div>
                    <h4 className="font-bold text-white text-[14px]">{cat.title}</h4>
                    {cat.description && (
                      <p className="text-[12px] text-slate-450 mt-1 font-medium leading-snug">{cat.description}</p>
                    )}
                  </div>
                  <span className="font-mono font-bold text-slate-350 bg-navy-850 px-2 py-0.5 rounded border border-navy-700/40 text-[12px]">
                    {cat.percent}%
                  </span>
                </div>
                <ProgressBar percent={cat.percent} colorClass={`bg-gradient-to-r ${cat.color}`} />
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        // Fallback if the roadmap has no readinessCategories
        <SectionCard
          title="Roadmap Tracks"
          subtitle="No readiness categories defined in the active roadmap."
        >
          <p className="text-sm text-slate-500 py-4 text-center">
            Import a roadmap JSON that includes <code className="text-accent-primary bg-navy-700 px-1.5 py-0.5 rounded font-mono text-xs">readinessCategories</code> to see dynamic progress tracks here.
          </p>
        </SectionCard>
      )}

      {/* ── Current Month Timeline select grid ── */}
      {currentMonth && (
        <SectionCard
          title={`Active Month Index — ${currentMonth.monthNumber}`}
          subtitle={`${currentMonth.title} · ${currentMonth.objective || currentMonth.theme || ''}`}
          headerActions={
            <Link to="/timeline" className="text-[13px] text-accent-primary font-bold uppercase tracking-wider hover:underline flex items-center gap-1">
              Timeline view <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mt-2">
            {currentMonth.weeks?.map((week) => {
              const key = `m${currentMonth.monthNumber}_w${week.weekNumber}`;
              const doneTasks = progress.completedTasks?.[key]?.length || 0;
              const totalTasks = week.tasks?.length || 0;
              const isActive = week.weekNumber === settings.activeWeek;
              const isComplete = progress.completedWeeks?.includes(week.weekNumber);

              return (
                <Link
                  key={week.weekNumber}
                  to="/missions"
                  className={`p-5 rounded-2xl border flex flex-col justify-between h-32 transition-all duration-300 relative group ${
                    isComplete
                      ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                      : isActive
                      ? 'bg-navy-800 border-accent-primary/45 hover:border-accent-primary'
                      : 'bg-navy-900 border-navy-700/25 hover:border-navy-600'
                  }`}
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Week {week.weekNumber}</span>
                      {isComplete ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      ) : isActive ? (
                        <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
                      ) : null}
                    </div>
                    <p className="text-sm font-bold text-white truncate group-hover:text-accent-primary transition-colors">{week.title}</p>
                  </div>
                  <div>
                    <div className="flex justify-between items-center text-[13px] text-slate-500 mb-1.5">
                      <span>Tasks Status</span>
                      <span className="font-semibold text-slate-400">{doneTasks}/{totalTasks}</span>
                    </div>
                    <ProgressBar percent={totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0} />
                  </div>
                </Link>
              );
            })}
          </div>
        </SectionCard>
      )}
    </PageShell>
  );
}
