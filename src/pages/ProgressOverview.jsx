import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TrendingUp, CheckCircle2, Flame, BarChart2, Calendar, Award, Zap, BookOpen, Github, FileText, AlertTriangle, ChevronRight, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOverallProgress, getMonthProgress, calculateDynamicReadiness } from '../utils/progressCalculator';
import { getBootcampDay, getDaysRemaining } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, StatCard, ProgressBar, StatusBadge, InfoPill, ActionCard } from '../components/common/UIComponents';

export default function ProgressOverview() {
  const navigate = useNavigate();
  const {
    roadmap,
    progress,
    checkpointStatuses,
    settings,
    streak,
    resourcesStatus,
    practicalMissions,
    weekProofs,
    weekReflections,
    skillChecks
  } = useApp();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays);

  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';

  // 1. Flatten all weeks
  const weeks = React.useMemo(() => {
    const list = [];
    if (roadmap?.months) {
      roadmap.months.forEach((month) => {
        month.weeks?.forEach((week) => {
          list.push({ ...week, monthNumber: month.monthNumber });
        });
      });
    } else if (roadmap?.weeks) {
      list.push(...roadmap.weeks);
    }
    return list;
  }, [roadmap]);

  // 2. Compute dynamic next recommended action
  const nextAction = React.useMemo(() => {
    if (!roadmap) return { text: 'Import a learning roadmap to start tracking.', link: '/import', label: 'Import Roadmap' };
    if (weeks.length === 0) return { text: 'No syllabus weeks found. Please configure your roadmap.', link: '/settings', label: 'Go to Settings' };

    for (const week of weeks) {
      const monthNum = week.monthNumber || 1;
      const weekNum = week.weekNumber;
      const key = `m${monthNum}_w${weekNum}`;

      // Check A: Study Resources
      const rawResources = week.resources ?? week.studyResources ?? [];
      const studyResources = Array.isArray(rawResources) ? rawResources : [rawResources];
      const incompleteResource = studyResources.find(res => res && res.title && resourcesStatus?.[res.title] !== 'Studied');
      if (incompleteResource) {
        return {
          text: `Study resource: "${incompleteResource.title}" for Week ${weekNum}.`,
          link: '/missions',
          label: 'Open Weekly Missions'
        };
      }

      // Check B: Checklist Tasks
      const tasks = Array.isArray(week.tasks) ? week.tasks : [];
      const doneTasks = progress?.completedTasks?.[key] || [];
      const firstIncompleteTaskIdx = tasks.findIndex((_, idx) => !doneTasks.includes(idx));
      if (firstIncompleteTaskIdx !== -1) {
        return {
          text: `Complete task: "${tasks[firstIncompleteTaskIdx]}" in Week ${weekNum}.`,
          link: '/today',
          label: 'Open Today\'s Focus'
        };
      }

      // Check C: Practical Missions
      const pmList = Array.isArray(week.practicalMissions) ? week.practicalMissions : [];
      const incompletePM = pmList.find(pm => {
        const pmId = pm.missionId || pm.id;
        return practicalMissions?.[pmId]?.status !== 'Completed';
      });
      if (incompletePM) {
        return {
          text: `Build milestone: "${incompletePM.title || incompletePM.name}" for Week ${weekNum}.`,
          link: incompletePM.missionId ? `/mission/${incompletePM.missionId}` : '/missions',
          label: 'Start Build Task'
        };
      }

      // Check D: Skill Check Assessment
      const hasQuiz = !!(week.skillCheck ?? week.skillChecks ?? week.quiz);
      const quizDone = !!skillChecks?.[weekNum];
      if (hasQuiz && !quizDone) {
        return {
          text: `Take the Skill Check Assessment for Week ${weekNum} to validate your learning.`,
          link: '/missions',
          label: 'Take Assessment'
        };
      }

      // Check E: Proof of Work
      const hasProof = !!(week.proof ?? week.proofRequirement ?? week.deliverable);
      const proofSubmitted = !!(weekProofs?.[weekNum]?.githubRepoLink && weekProofs?.[weekNum]?.githubCommitLink && weekProofs?.[weekNum]?.readmeCompleted);
      if (hasProof && !proofSubmitted) {
        return {
          text: `Submit your Proof of Work for Week ${weekNum}.`,
          link: '/proof',
          label: 'Submit Proof'
        };
      }

      // Check F: Reflection Journal
      const reflectionDone = !!weekReflections?.[weekNum];
      if (!reflectionDone) {
        return {
          text: `Log your weekly experience and reflection for Week ${weekNum} in the journal.`,
          link: '/today',
          label: 'Write Reflection'
        };
      }
    }

    // Check Projects
    const projects = roadmap.projects || [];
    for (let pi = 0; pi < projects.length; pi++) {
      const p = projects[pi];
      const doneMilestones = progress.completedProjectMilestones?.[pi] || [];
      const totalMilestones = p.milestones?.length || 0;
      if (doneMilestones.length < totalMilestones) {
        return {
          text: `Continue project build: Complete milestone "${p.milestones[doneMilestones.length]}" for project "${p.name}".`,
          link: '/projects',
          label: 'Open Project Tracker'
        };
      }
      const savedRepo = progress.projectGithubLinks?.[pi];
      if (!savedRepo) {
        return {
          text: `Add repository link for completed project "${p.name}".`,
          link: '/projects',
          label: 'Open Project Tracker'
        };
      }
    }

    return {
      text: 'Congratulations! You have completed all weekly tracks and capstone projects in this roadmap. Ready for deployment! 🚀',
      link: '/',
      label: 'Go to Dashboard'
    };
  }, [roadmap, weeks, progress, resourcesStatus, practicalMissions, skillChecks, weekProofs, weekReflections]);

  // Compute dynamic category readiness
  const dynamicReadiness = React.useMemo(() => {
    return calculateDynamicReadiness(roadmap, progress, resourcesStatus, practicalMissions);
  }, [roadmap, progress, resourcesStatus, practicalMissions]);

  // Helper to resolve week milestones state
  const getWeekStats = (week) => {
    const monthNum = week.monthNumber || 1;
    const weekNum = week.weekNumber;
    const key = `m${monthNum}_w${weekNum}`;
    const tasks = Array.isArray(week.tasks) ? week.tasks : [];
    const doneTasks = progress?.completedTasks?.[key] || [];

    const hasProof = !!(week.proof ?? week.proofRequirement ?? week.deliverable);
    const proofSubmitted = !!(weekProofs?.[weekNum]?.githubRepoLink && weekProofs?.[weekNum]?.githubCommitLink && weekProofs?.[weekNum]?.readmeCompleted);
    const completedTasksCount = doneTasks.length;
    const totalTasksCount = tasks.length;
    const percent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 100;

    return {
      percent,
      completedTasksCount,
      totalTasksCount,
      hasProof,
      proofSubmitted,
      complete: percent === 100 && (!hasProof || proofSubmitted)
    };
  };

  return (
    <PageShell>
      <PageHeader 
        title="Roadmap Progress Center" 
        subtitle={`Your complete learning progress across ${roadmapTitle}.`}
      />

      {/* ── Next Recommended Action Card ── */}
      <ActionCard onClick={() => navigate(nextAction.link)} className="border-brand-blue/40 bg-navy-900/40">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="text-[10px] text-brand-blue font-extrabold uppercase tracking-widest block">Next Action Point</span>
            <p className="text-white font-extrabold text-sm sm:text-base leading-relaxed">
              {nextAction.text}
            </p>
          </div>
          <button className="btn-primary py-2.5 px-5 text-xs font-bold whitespace-nowrap flex items-center gap-1.5 self-stretch sm:self-auto text-center justify-center">
            {nextAction.label} <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </ActionCard>

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
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Roadmap Complete</span>
            </div>
          </div>
          <div className="mt-5 space-y-1">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Mastery progress</h3>
            <p className="text-[13px] text-slate-450 leading-relaxed max-w-[200px] mx-auto">Weighted progress score across tasks, projects, and self-assessments.</p>
          </div>
        </SectionCard>

        {/* Weighted Progress Breakdown */}
        <SectionCard title="Mastery Breakdown" className="lg:col-span-2 flex flex-col justify-between" subtitle="Weighted progress tracks mapped to operational domains.">
          <div className="space-y-5 py-2">
            {[
              { label: 'Checklist Tasks & Materials', percent: prog.tasks.percent, detail: `${prog.tasks.completed} of ${prog.tasks.total} tasks completed`, weight: '50% weight', color: 'bg-gradient-to-r from-accent-primary to-blue-500' },
              { label: 'Skill Checkpoints', percent: prog.checkpoints.percent, detail: `${prog.checkpoints.confident} confident targets, ${prog.checkpoints.learning} learning concepts`, weight: '30% weight', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
              { label: 'Capstone Projects', percent: prog.projects.percent, detail: `${prog.projects.completed} of ${prog.projects.total} milestones complete`, weight: '20% weight', color: 'bg-gradient-to-r from-accent-cyan to-blue-500' },
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
                <p className="text-[12px] text-slate-450 mt-1.5">{detail}</p>
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
              label="Days Active" 
              value={bootcampDay || 1} 
              icon={Calendar} 
              helperText={`of ${totalDays} total days`}
              accentColor="blue"
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

      {/* ── Dynamic Category Progress ── */}
      {dynamicReadiness.length > 0 && (
        <SectionCard title="Topic Readiness Map" subtitle="Progress overview mapped dynamically by syllabus category.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {dynamicReadiness.map((cat) => (
              <div key={cat.id} className="p-5 bg-navy-900/30 border border-navy-800/80 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-extrabold text-white text-sm">{cat.title}</h4>
                    {cat.description && <p className="text-[11px] text-slate-450 mt-0.5">{cat.description}</p>}
                  </div>
                  <span className="text-xs font-mono font-bold text-white bg-navy-950/60 border border-navy-850 px-2 py-0.5 rounded">{cat.percent}%</span>
                </div>
                <ProgressBar percent={cat.percent} colorClass={`bg-gradient-to-r ${cat.color}`} />
                <p className="text-[11px] text-slate-500 font-medium">Mapped across {cat.weekCount} syllabus modules</p>
              </div>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Capstone Projects Progress ── */}
      {roadmap?.projects && roadmap.projects.length > 0 && (
        <SectionCard title="Capstone Projects Tracker" subtitle="Completions of final builder deliverables.">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {roadmap.projects.map((project, pi) => {
              const done = progress.completedProjectMilestones?.[pi] || [];
              const total = project.milestones?.length || 0;
              const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
              const isCapstone = project.capstone === true || project.featured === true;
              return (
                <div
                  key={pi}
                  className={`p-5 rounded-2xl border transition-all ${
                    percent === 100 ? 'bg-emerald-500/5 border-emerald-500/10' : 'bg-navy-900 border-navy-700/25 hover:border-navy-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">{project.name}</span>
                      {isCapstone && <span className="bg-accent-cyan/15 text-accent-cyan text-[9px] px-1.5 py-0.5 rounded font-black">CAPSTONE</span>}
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-350">{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} colorClass={isCapstone ? 'bg-gradient-to-r from-accent-cyan to-brand-blue' : 'bg-gradient-to-r from-brand-blue to-blue-500'} />
                  <p className="text-[11px] text-slate-450 mt-2.5">
                    {done.length}/{total} Milestones Complete · {percent === 100 ? 'Project Complete!' : 'In Progress'}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* ── Missions Timeline & Proof Status ── */}
      <SectionCard title="Missions Timeline & Proof Status" subtitle="Weekly overview of checklist objectives and verification submissions.">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-navy-700 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Module</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4">Checklist Progress</th>
                <th className="py-3 px-4">Proof Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800/40 text-slate-300 font-medium">
              {weeks.map((week) => {
                const stats = getWeekStats(week);
                return (
                  <tr key={week.weekNumber} className="hover:bg-navy-900/25 transition-all">
                    <td className="py-3.5 px-4 font-bold text-brand-blue">Week {week.weekNumber}</td>
                    <td className="py-3.5 px-4 text-white font-extrabold">{week.title}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3 max-w-[120px]">
                        <ProgressBar percent={stats.percent} className="h-1.5" />
                        <span className="font-mono text-[10px] text-slate-400">{stats.completedTasksCount}/{stats.totalTasksCount}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {stats.hasProof ? (
                        stats.proofSubmitted ? (
                          <span className="bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold">
                            Verified
                          </span>
                        ) : (
                          <span className="bg-brand-amber/10 text-brand-amber border border-brand-amber/20 px-2 py-0.5 rounded text-[10px] font-bold animate-pulse">
                            Missing
                          </span>
                        )
                      ) : (
                        <span className="bg-navy-900 text-slate-500 border border-navy-800 px-2 py-0.5 rounded text-[10px] font-bold">
                          None Required
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <Link
                        to="/today"
                        onClick={() => {
                          // Note: In contexts using settings, switching the active week is done in settings
                        }}
                        className="text-accent-cyan hover:text-white font-bold hover:underline transition-all"
                      >
                        Launch
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* ── Confidence Grid ── */}
      <SectionCard title="Syllabus Skills Confidence Tracker" subtitle="Self-assessed confidence levels for core skill concepts.">
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
