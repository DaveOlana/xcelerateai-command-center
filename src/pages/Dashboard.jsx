import React from 'react';
import { Link } from 'react-router-dom';
import {
  Target, Flame, TrendingUp, CheckCircle2, ChevronRight, Award, ShieldAlert, AlertTriangle, Cpu, Clock, Calendar, BarChart2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  calculateOverallProgress,
  getActiveWeekData,
  getMotivationalMessage,
  calculateReadinessScores
} from '../utils/progressCalculator';
import {
  getGreeting,
  getBootcampDay,
  getDaysRemaining,
  getBootcampDurationPercent,
} from '../utils/dateUtils';
import { getItemTitle } from '../utils/safeRender';
import { PageShell, StatCard, ProgressBar, SectionCard } from '../components/common/UIComponents';

export default function Dashboard() {
  const { roadmap, progress, checkpointStatuses, settings, streak, blockers, weekProofs, sessionTimer, resourcesStatus, practicalMissions } = useApp();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const activeWeekData = getActiveWeekData(roadmap, settings.activeWeek);
  const greeting = getGreeting();
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate);
  const durationPercent = getBootcampDurationPercent(settings.startDate);
  const motivational = getMotivationalMessage(prog.overall, streak.currentStreak);

  // Compute readiness scores
  const readiness = calculateReadinessScores(roadmap, progress, checkpointStatuses, streak, resourcesStatus, practicalMissions);

  const currentMonth = roadmap?.months?.find(
    (m) => m.monthNumber === settings.activeMonth
  );

  // Filter open/in-progress blockers
  const activeBlockers = blockers.filter((b) => b.status !== 'Solved');

  // Check backup reminder
  const showBackupReminder = React.useMemo(() => {
    const needsBackup = !settings.lastBackupDate || (Date.now() - new Date(settings.lastBackupDate).getTime() > 7 * 24 * 60 * 60 * 1000);
    if (!needsBackup) return false;
    return bootcampDay >= 7 || prog.tasks.completed > 3 || progress.completedWeeks.length >= 1;
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
          <p className="text-xs font-bold text-slate-450 tracking-widest uppercase">Reference Schema</p>
          <p className="text-[14px] font-semibold text-slate-300">{roadmap?.bootcampTitle || '6-Month Command Board'}</p>
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
                Bootcamp Cockpit
              </span>
            </div>

            <div>
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
                Building Elliot V1
              </h1>
              <p className="text-slate-400 mt-2 text-[15px] leading-relaxed max-w-xl">
                Currently working on Week {settings.activeWeek}: <span className="text-white font-medium">{activeWeekData?.week?.title || 'No active week'}</span>. Restoring system readiness triggers.
              </p>
              <p className="text-[13px] text-slate-550 mt-2 italic">
                {motivational}
              </p>
            </div>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link to="/today" className="btn-primary py-3 px-6 text-[15px] font-semibold">
                Continue Today's Focus
              </Link>
              <Link to="/progress" className="btn-secondary py-3 px-6 text-[15px] font-medium">
                View Progress
              </Link>
            </div>
          </div>

          {/* Time timeline indicator */}
          <div className="lg:border-l border-navy-700/50 lg:pl-10 flex flex-col justify-center w-full lg:w-auto flex-shrink-0 pt-6 lg:pt-0 border-t lg:border-t-0">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Bootcamp Duration</span>
            <p className="text-5xl font-extrabold text-white mt-2 tabular-nums tracking-tight">Day {bootcampDay || 1} <span className="text-[20px] text-slate-500 font-medium">/ 180</span></p>
            <p className="text-[13px] text-slate-450 mt-2">{daysRemaining} days left after today</p>
            <ProgressBar percent={durationPercent} className="w-56 mt-4 h-2" />
          </div>
        </div>
      </div>

      {/* ── Metric Indicators Deck ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Elliot Readiness"
          value={`${readiness.elliot}%`}
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

      {/* ── Elliot Build Path progression map ── */}
      <SectionCard title="Elliot Build Path Tracks" subtitle="Calculated based on readiness tags and weekly milestones completed.">
        <div className="grid md:grid-cols-2 gap-6 pt-2">
          {[
            { label: 'JavaScript variables & core loops', value: readiness.javascript, desc: 'Weeks 1-8 Foundations', color: 'from-blue-500 to-accent-primary' },
            { label: 'React interactive state components', value: readiness.react, desc: 'Weeks 9-12 User Interface', color: 'from-blue-600 to-accent-cyan' },
            { label: 'Mobile Native framework layouts', value: readiness.mobile, desc: 'Weeks 13-16 Phone Interface', color: 'from-purple-600 to-pink-500' },
            { label: 'Backend Database and Firebase Auth', value: readiness.backend, desc: 'Weeks 17-20 Storage & Server', color: 'from-amber-600 to-orange-500' },
            { label: 'Product Builder & Capstone launch', value: readiness.product, desc: 'Weeks 21-24 Operational Release', color: 'from-pink-600 to-red-500' },
            { label: 'Elliot Assembly Threshold integration', value: readiness.elliot, desc: 'Emotional Target Threshold', color: 'from-accent-cyan to-accent-primary' },
          ].map((track) => (
            <div key={track.label} className="bg-navy-900 p-5 rounded-2xl border border-navy-700/20 space-y-3">
              <div className="flex justify-between items-start text-xs">
                <div>
                  <h4 className="font-bold text-white text-[14px]">{track.label}</h4>
                  <p className="text-[12px] text-slate-450 mt-1 font-medium">{track.desc}</p>
                </div>
                <span className="font-mono font-bold text-slate-350 bg-navy-850 px-2 py-0.5 rounded border border-navy-700/40 text-[12px]">
                  {track.value}%
                </span>
              </div>
              <ProgressBar percent={track.value} colorClass={`bg-gradient-to-r ${track.color}`} />
            </div>
          ))}
        </div>
      </SectionCard>

      {/* ── Current Month Timeline select grid ── */}
      {currentMonth && (
        <SectionCard
          title={`Active Month Index — ${currentMonth.monthNumber}`}
          subtitle={`${currentMonth.title} · ${currentMonth.objective}`}
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
