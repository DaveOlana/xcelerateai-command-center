import React from 'react';
import { TrendingUp, CheckCircle2, Flame, BarChart2, Calendar, Award, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOverallProgress, getMonthProgress } from '../utils/progressCalculator';
import { getBootcampDay, getDaysRemaining } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, StatCard, ProgressBar, StatusBadge } from '../components/common/UIComponents';

export default function ProgressOverview() {
  const { roadmap, progress, checkpointStatuses, settings, streak } = useApp();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate);

  return (
    <PageShell>
      <PageHeader 
        title="Progress Overview" 
        subtitle="Your complete learning progress across all 3 key dimensional metrics."
      />

      {/* ── Overall Progress Core Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progress Ring Card */}
        <SectionCard className="flex flex-col items-center justify-center text-center py-8">
          <div className="relative w-40 h-40 flex-shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
              <circle cx="64" cy="64" r="52" fill="none" stroke="var(--color-navy-950, #0a192f)" strokeWidth="8" />
              <circle
                cx="64"
                cy="64"
                r="52"
                fill="none"
                stroke="url(#progressGrad)"
                strokeWidth="8"
                strokeDasharray={`${2 * Math.PI * 52}`}
                strokeDashoffset={`${2 * Math.PI * 52 * (1 - (prog.overall || 0) / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#00d4ff" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-extrabold text-white tracking-tight text-glow">{prog.overall}%</span>
              <span className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-0.5">Overall Done</span>
            </div>
          </div>
          <div className="mt-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Dave's Mission Track</h3>
            <p className="text-[13px] text-slate-500 mt-1 leading-relaxed">Weighted average of tasks, project completion, and self-assessments.</p>
          </div>
        </SectionCard>

        {/* Weighted Progress Breakdown */}
        <SectionCard title="Weighted Progress Dimensions" className="lg:col-span-2 flex flex-col justify-between">
          <div className="space-y-4 py-2">
            {[
              { label: 'Study & Practical Tasks', percent: prog.tasks.percent, detail: `${prog.tasks.completed} of ${prog.tasks.total} tasks completed`, weight: '50% weight', color: 'bg-gradient-to-r from-accent-primary to-blue-500' },
              { label: 'Skill Checkpoints', percent: prog.checkpoints.percent, detail: `${prog.checkpoints.confident} confident, ${prog.checkpoints.learning} learning progress`, weight: '30% weight', color: 'bg-gradient-to-r from-amber-400 to-orange-500' },
              { label: 'Project Milestones', percent: prog.projects.percent, detail: `${prog.projects.completed} of ${prog.projects.total} critical milestones`, weight: '20% weight', color: 'bg-gradient-to-r from-accent-cyan to-blue-500' },
            ].map(({ label, percent, detail, weight, color }) => (
              <div key={label} className="group">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{label}</span>
                    <span className="bg-navy-700 text-slate-400 text-xs font-bold px-1.5 py-0.5 rounded font-mono uppercase tracking-wider">{weight}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-white">{percent}%</span>
                </div>
                <ProgressBar percent={percent} colorClass={color} />
                <p className="text-[13px] text-slate-500 mt-1 font-mono">{detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── KPI Deck ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {settings.startDate && (
          <>
            <StatCard 
              label="Days in Bootcamp" 
              value={bootcampDay || 1} 
              icon={Calendar} 
              helperText="of 180 total days"
              accentColor="green"
            />
            <StatCard 
              label="Days Remaining" 
              value={daysRemaining} 
              icon={TrendingUp} 
              helperText="Stay consistent, keep building"
              accentColor="cyan"
            />
          </>
        )}
        <StatCard 
          label="Day Streak" 
          value={`${streak.currentStreak}D`} 
          icon={Flame} 
          helperText={`Longest: ${streak.longestStreak} days`}
          accentColor="orange"
        />
        <StatCard 
          label="Total Study Days" 
          value={streak.totalStudyDays || 0} 
          icon={Award} 
          helperText="Active login/commit days"
          accentColor="purple"
        />
      </div>

      {/* ── Month-by-Month Progress Track ── */}
      <SectionCard title="Month-by-Month Target Progress">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap?.months?.map((month) => {
            const { taskPercent, completedTasks, totalTasks, completedWeeks: cw, totalWeeks: tw } = getMonthProgress(month, progress);
            const isActive = month.monthNumber === settings.activeMonth;

            return (
              <div key={month.monthNumber} className={`p-4 rounded-xl border transition-all ${isActive ? 'bg-navy-800/60 border-accent-primary/30' : 'bg-navy-800/20 border-navy-500/20'}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                      M{month.monthNumber}: {month.title}
                    </span>
                    {isActive && <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-xs px-1.5 py-0.5 rounded font-bold uppercase font-mono">Active</span>}
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-400">{taskPercent}%</span>
                </div>
                <ProgressBar percent={taskPercent} />
                <p className="text-[13px] text-slate-500 mt-2 font-mono">
                  {completedTasks}/{totalTasks} Tasks · {cw}/{tw} Weeks Complete
                </p>
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* ── Confidence Grid ── */}
      <SectionCard title="Skills Confidence Dashboard">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {roadmap?.checkpoints?.map((cp, i) => {
            const status = checkpointStatuses[cp.skill]?.status || 'Not yet';
            
            let statusStyles = "";
            let dotStyles = "";
            if (status === 'Confident') {
              statusStyles = "bg-accent-primary/5 border-accent-primary/20 hover:border-accent-primary/30";
              dotStyles = "bg-accent-primary";
            } else if (status === 'Learning') {
              statusStyles = "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30";
              dotStyles = "bg-amber-400";
            } else {
              statusStyles = "bg-navy-800/30 border-navy-500/25";
              dotStyles = "bg-slate-600";
            }

            return (
              <div key={i} className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-200 ${statusStyles}`}>
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dotStyles}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white truncate">{cp.skill}</p>
                  <p className={`text-xs font-mono mt-0.5 uppercase tracking-wider font-semibold
                    ${status === 'Confident' ? 'text-accent-primary' : status === 'Learning' ? 'text-amber-400' : 'text-slate-500'}`}>
                    {status}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </PageShell>
  );
}
