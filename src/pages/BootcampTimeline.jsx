import React, { useState } from 'react';
import { CheckCircle2, Lock, Calendar, ChevronDown, ChevronUp } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getMonthProgress } from '../utils/progressCalculator';
import ImportRequiredCard from '../components/common/ImportRequiredCard';
import { PageShell, PageHeader, StatusBadge, ProgressBar } from '../components/common/UIComponents';

function getMonthStatus(month, progress, settings) {
  const completedWeeks = Array.isArray(progress?.completedWeeks) ? progress.completedWeeks : [];
  const allWeekNums = month.weeks?.map((w) => w.weekNumber) || [];
  const allComplete = allWeekNums.length > 0 && allWeekNums.every((wn) => completedWeeks.includes(wn));
  if (allComplete) return 'completed';
  if (month.monthNumber === settings.activeMonth) return 'active';
  if (month.monthNumber < settings.activeMonth) return 'active'; // past months
  return 'locked';
}

export default function BootcampTimeline() {
  const { roadmap, progress, settings, isWeekComplete, setActiveWeek } = useApp();
  const [expandedMonth, setExpandedMonth] = useState(settings.activeMonth);

  const months = roadmap?.months || [];

  if (months.length === 0) {
    return <ImportRequiredCard pageName="Bootcamp Timeline" />;
  }

  return (
    <PageShell>
      <PageHeader 
        title="Bootcamp Timeline" 
        subtitle={`Your complete ${roadmap?.duration || '6-month'} journey — ${months.length} months, ${months.reduce((a, m) => a + (m.weeks?.length || 0), 0)} weeks.`}
      />

      <div className="relative pl-10 sm:pl-14 space-y-8">
        {/* Vertical Progress Line with glowing accent */}
        <div className="absolute left-[11px] sm:left-[15px] top-4 bottom-4 w-[2px] bg-navy-500/25 rounded-full overflow-hidden">
          <div 
            className="w-full bg-gradient-to-b from-accent-primary via-accent-cyan to-navy-500/20 rounded-full transition-all duration-700 ease-out shadow-primary-glow" 
            style={{ 
              height: `${(months.filter(m => getMonthStatus(m, progress, settings) !== 'locked').length / months.length) * 100}%` 
            }}
          />
        </div>

        {months.map((month, mi) => {
          const status = getMonthStatus(month, progress, settings);
          const { taskPercent, completedWeeks: cw, totalWeeks: tw } = getMonthProgress(month, progress);
          const isExpanded = expandedMonth === month.monthNumber;
          const isLocked = status === 'locked';

          // Node configuration based on status
          let nodeStyles = "";
          let cardStyles = "";
          
          if (status === 'completed') {
            nodeStyles = "bg-blue-500/20 border-blue-500 text-blue-400 shadow-blue-500/20";
            cardStyles = "border-blue-500/25 bg-navy-800/40 hover:border-blue-500/40 hover:shadow-card-hover";
          } else if (status === 'active') {
            nodeStyles = "bg-accent-primary/10 border-accent-primary text-accent-primary shadow-primary-glow scale-105";
            cardStyles = "border-accent-primary/35 shadow-primary-glow-sm bg-navy-800/90";
          } else {
            nodeStyles = "bg-navy-950 border-navy-500/50 text-slate-600";
            cardStyles = "border-navy-500/10 opacity-50 bg-navy-950/20";
          }

          return (
            <div key={month.monthNumber} className="relative group transition-all duration-300">
              {/* Timeline Bullet Node with subtle glows */}
              <div 
                className={`absolute -left-10 sm:-left-14 top-2.5 w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm transition-all duration-300 z-10 ${nodeStyles}`}
              >
                {status === 'completed' ? (
                  <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 h-4" />
                ) : isLocked ? (
                  <Lock className="w-3 h-3 text-slate-500" />
                ) : (
                  month.monthNumber
                )}
              </div>

              {/* Month Card */}
              <div className={`rounded-2xl p-5 border backdrop-blur-sm transition-all duration-300 ${cardStyles}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-bold tracking-widest text-slate-505 uppercase font-mono">
                        Month {month.monthNumber}
                      </span>
                      <StatusBadge status={status === 'completed' ? 'Completed' : status === 'active' ? 'Active' : 'Locked'} />
                    </div>
                    <h2 className="text-base font-bold text-white mt-1.5">{month.title}</h2>
                    
                    {!isLocked ? (
                      <>
                        <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{month.objective}</p>
                        <div className="flex items-center gap-4 mt-4">
                          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-500" />
                            <span>{cw}/{tw} Weeks Completed</span>
                          </div>
                          <div className="flex-1 max-w-[150px]">
                            <ProgressBar percent={taskPercent} />
                          </div>
                          <span className="text-xs font-mono font-bold text-accent-cyan">{taskPercent}%</span>
                        </div>
                      </>
                    ) : (
                      <p className="text-xs text-slate-500 italic mt-1.5">Future campaign details are currently locked.</p>
                    )}
                  </div>

                  {!isLocked && (
                    <button
                      onClick={() => setExpandedMonth(isExpanded ? null : month.monthNumber)}
                      className="self-end sm:self-center bg-navy-700/80 hover:bg-navy-700 border border-navy-500 text-slate-300 hover:text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all active:scale-95 no-print"
                    >
                      <span>{isExpanded ? 'Hide Details' : 'View Weeks'}</span>
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                  )}
                </div>

                {/* Expanded Weeks List */}
                {isExpanded && !isLocked && month.weeks && (
                  <div className="mt-5 pt-5 border-t border-navy-500/40 space-y-3 animate-slide-up">
                    <h4 className="text-[13px] font-bold text-slate-500 uppercase tracking-widest font-mono">
                      Target Milestones
                    </h4>
                    <div className="grid gap-2.5">
                      {month.weeks.map((week) => {
                        const weekComplete = isWeekComplete(week.weekNumber);
                        const isActive = week.weekNumber === settings.activeWeek;
                        const key = `m${month.monthNumber}_w${week.weekNumber}`;
                        const doneTasks = progress.completedTasks?.[key]?.length || 0;
                        const totalTasks = week.tasks?.length || 0;

                        return (
                          <div
                            key={week.weekNumber}
                            className={`flex flex-col sm:flex-row sm:items-center gap-3 p-3.5 rounded-xl border transition-all duration-205 ${
                              weekComplete
                                ? 'bg-blue-500/5 border-blue-500/20'
                                : isActive
                                ? 'bg-accent-primary/5 border-accent-primary/30 shadow-primary-glow-sm'
                                : 'bg-navy-800/40 border-navy-500/30 hover:border-navy-400'
                            }`}
                          >
                            <div className="flex items-center gap-3 flex-1 min-w-0">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold font-mono
                                ${weekComplete
                                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                                  : isActive
                                  ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/20'
                                  : 'bg-navy-700 text-slate-400 border border-navy-500/50'
                                }`}
                              >
                                {weekComplete ? '✓' : `W${week.weekNumber}`}
                              </div>

                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{week.title}</p>
                                <p className="text-[13px] text-slate-500 mt-0.5 flex items-center gap-2 font-mono">
                                  <span>{doneTasks}/{totalTasks} Tasks</span>
                                  <span>·</span>
                                  <span>{week.resources?.length || 0} Resources</span>
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t border-navy-500/20 sm:border-none">
                              {isActive ? (
                                <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-xs px-2 py-0.5 rounded font-mono font-bold uppercase tracking-wider">
                                  Active
                                </span>
                              ) : (
                                <button
                                  onClick={() => setActiveWeek(week.weekNumber)}
                                  className="text-[13px] font-bold text-slate-400 hover:text-accent-primary hover:underline uppercase tracking-wider font-mono transition-colors"
                                >
                                  Jump to week
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </PageShell>
  );
}
