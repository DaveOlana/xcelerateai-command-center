import React from 'react';
import { TrendingUp, CheckCircle2, Flame, BarChart2, Calendar, Award, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOverallProgress, getMonthProgress } from '../utils/progressCalculator';
import { getBootcampDay, getDaysRemaining } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, StatCard, ProgressBar, StatusBadge } from '../components/common/UIComponents';

export default function ProgressOverview() {
  const { roadmap, progress, checkpointStatuses, settings, streak } = useApp();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays);

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
              <circle cx="64" cy="64" r="52" fill="none" stroke="#0C0F1E" strokeWidth="8" />
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
                  <stop offset="0%" stopColor="#2563EB" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-4xl font-extrabold text-white tracking-tight">{prog.overall}%</span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Bootcamp Complete</span>
            </div>
          </div>
          <div className="mt-5 space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mastery progress</h3>
            <p className="text-[14px] text-slate-400 leading-relaxed max-w-[200px] mx-auto">Weighted progress score across tasks, projects, and self-assessments.</p>
          </div>
        </SectionCard>

        {/* Weighted Progress Breakdown */}
        <SectionCard title="Mastery Breakdown" className="lg:col-span-2 flex flex-col justify-between" subtitle="Weighted progress tracks mapped to operational domains.">
          <div className="space-y-5 py-2">
            {[
              { label: 'Study & Practical Tasks', percent: prog.tasks.percent, detail: `${prog.tasks.completed} of ${prog.tasks.total} checklist items resolved`, weight: '50% weight', color: 'bg-gradient-to-r from-accent-primary to-blue-500' },
              { label: 'Skill Checkpoints', percent: prog.checkpoints.percent, detail: `${prog.checkpoints.confident} confident targets, ${prog.checkpoints.learning} active reviews`, weight: '30% weight', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
              { label: 'Project Milestones', percent: prog.projects.percent, detail: `${prog.projects.completed} of ${prog.projects.total} critical portfolio portfolio completions`, weight: '20% weight', color: 'bg-gradient-to-r from-accent-cyan to-blue-500' },
            ].map(({ label, percent, detail, weight, color }) => (
              <div key={label} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-sm font-semibold text-slate-200">{label}</span>
                    <span className="bg-navy-900 border border-navy-750 text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded font-mono uppercase tracking-wider">{weight}</span>
                  </div>
                  <span className="text-sm font-mono font-bold text-white">{percent}%</span>
                </div>
                <ProgressBar percent={percent} colorClass={color} />
                <p className="text-[13px] text-slate-450 mt-1.5">{detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── KPI Deck ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {settings.startDate && (
          <>
            <StatCard 
              label="Days in Bootcamp" 
              value={bootcampDay || 1} 
              icon={Calendar} 
              helperText={`of ${totalDays} total days`}
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
      <SectionCard title="Month-by-Month Progress Overview" subtitle="Tracks showing completed syllabus segments.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {!roadmap?.months || roadmap.months.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 italic">
              No syllabus segments defined in this roadmap.
            </div>
          ) : (
            roadmap.months.map((month) => {
              const { taskPercent, completedTasks, totalTasks, completedWeeks: cw, totalWeeks: tw } = getMonthProgress(month, progress);
              const isActive = month.monthNumber === settings.activeMonth;

              return (
                <div key={month.monthNumber} className={`p-5 rounded-2xl border transition-all ${isActive ? 'bg-navy-800 border-accent-primary/25' : 'bg-navy-900 border-navy-700/25'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        M{month.monthNumber}: {month.title}
                      </span>
                      {isActive && <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/25 text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider">Active</span>}
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-350">{taskPercent}%</span>
                  </div>
                  <ProgressBar percent={taskPercent} />
                  <p className="text-[13px] text-slate-450 mt-3">
                    {completedTasks}/{totalTasks} Tasks Completed · {cw}/{tw} Weeks Complete
                  </p>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>

      {/* ── Confidence Grid ── */}
      <SectionCard title="Syllabus Skills Confidence Tracker" subtitle="Self-assessed status tags for core skill concepts.">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {!roadmap?.checkpoints || roadmap.checkpoints.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-500 italic">
              No self-assessment checkpoints defined in this roadmap.
            </div>
          ) : (
            roadmap.checkpoints.map((cp, i) => {
              const status = checkpointStatuses[cp.skill]?.status || 'Not yet';
              
              let statusStyles = "";
              let dotStyles = "";
              if (status === 'Confident') {
                statusStyles = "bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/30";
                dotStyles = "bg-emerald-400";
              } else if (status === 'Learning') {
                statusStyles = "bg-amber-500/5 border-amber-500/20 hover:border-amber-500/30";
                dotStyles = "bg-amber-450";
              } else {
                statusStyles = "bg-navy-900 border-navy-700/20";
                dotStyles = "bg-slate-600";
              }

              return (
                <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-200 ${statusStyles}`}>
                  <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${dotStyles}`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{cp.skill}</p>
                    <p className={`text-[11px] font-bold mt-1 uppercase tracking-widest
                      ${status === 'Confident' ? 'text-emerald-450' : status === 'Learning' ? 'text-amber-450' : 'text-slate-500'}`}>
                      {status}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </SectionCard>
    </PageShell>
  );
}
