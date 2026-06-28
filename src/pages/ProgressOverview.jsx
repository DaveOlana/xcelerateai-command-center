import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  TrendingUp, CheckCircle2, Flame, BarChart2, Calendar, Award, Zap, 
  AlertTriangle, Lock, FolderKanban, BookOpen, ChevronDown, 
  ChevronRight, ExternalLink, ShieldAlert, Sparkles, ArrowRight,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { calculateOverallProgress, getMonthProgress, calculateDynamicReadiness } from '../utils/progressCalculator';
import { getBootcampDay, getDaysRemaining } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, MetricCard, ProgressBar, StatusBadge } from '../components/common/UIComponents';

export default function ProgressOverview() {
  const { 
    roadmap, progress, checkpointStatuses, settings, streak, 
    blockers, notes, weekProofs, weekReflections, skillChecks,
    resourcesStatus, practicalMissions
  } = useApp();
  
  const navigate = useNavigate();

  const prog = calculateOverallProgress(roadmap, progress, checkpointStatuses);
  const totalDays = roadmap?.totalDays || 180;
  const bootcampDay = getBootcampDay(settings.startDate);
  const daysRemaining = getDaysRemaining(settings.startDate, totalDays);

  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;

  // Flatten all weeks
  const weeks = useMemo(() => {
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

  // Collapsible Month Timelines
  const [expandedMonths, setExpandedMonths] = useState({ [settings.activeMonth || 1]: true });
  
  const toggleMonth = (mNum) => {
    setExpandedMonths(prev => ({ ...prev, [mNum]: !prev[mNum] }));
  };

  const isWeekComplete = (wNum) => {
    return Array.isArray(progress.completedWeeks) && progress.completedWeeks.includes(wNum);
  };

  const isWeekLocked = (wNum) => {
    if (settings.manualOverrideEnabled) return false;
    return wNum > settings.activeWeek;
  };

  // Custom Stats
  const totalWeeks = weeks.length;
  const completedWeeksCount = progress?.completedWeeks?.length || 0;
  const weekPercent = totalWeeks > 0 ? Math.round((completedWeeksCount / totalWeeks) * 100) : 0;

  // Proof submissions count (fully complete proofs)
  const submittedProofsCount = Object.keys(weekProofs || {}).filter(wNum => {
    const proof = weekProofs[wNum];
    return proof && proof.githubRepoLink && proof.githubCommitLink && proof.readmeCompleted;
  }).length;

  const projects = roadmap?.projects || [];
  const completedProjectsCount = projects.filter((proj, idx) => {
    const doneMilestones = progress?.completedProjectMilestones?.[idx] || [];
    return doneMilestones.length > 0 && doneMilestones.length === proj.milestones?.length;
  }).length;

  // Compute dynamic next recommended action
  const nextAction = useMemo(() => {
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
          label: "Open Today's Focus"
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
  }, [roadmap, weeks, progress, resourcesStatus, practicalMissions, skillChecks, weekProofs, weekReflections, projects]);

  // Compute dynamic category progress
  const dynamicReadiness = useMemo(() => {
    return calculateDynamicReadiness(roadmap, progress, resourcesStatus, practicalMissions);
  }, [roadmap, progress, resourcesStatus, practicalMissions]);

  // Compile Recent Wins
  const recentWins = useMemo(() => {
    const wins = [];

    // Completed Weeks
    (progress?.completedWeeks || []).forEach(wNum => {
      const wk = weeks.find(w => w.weekNumber === wNum);
      wins.push({
        type: 'week',
        title: `Completed Week ${wNum}`,
        detail: wk ? wk.title : 'Milestone Module',
        timestamp: settings.startDate ? new Date(new Date(settings.startDate).getTime() + (wNum - 1) * 7 * 24 * 60 * 60 * 1000) : null
      });
    });

    // Submitted Proofs
    Object.keys(weekProofs || {}).forEach(wNum => {
      const p = weekProofs[wNum];
      if (p?.githubRepoLink && p?.githubCommitLink && p?.readmeCompleted) {
        wins.push({
          type: 'proof',
          title: `Submitted Week ${wNum} Proof`,
          detail: 'GitHub commit references verified',
          timestamp: null
        });
      }
    });

    // Project Milestones
    Object.keys(progress?.completedProjectMilestones || {}).forEach(projIdx => {
      const milestones = progress.completedProjectMilestones[projIdx] || [];
      const proj = projects[projIdx];
      if (proj && milestones.length > 0) {
        wins.push({
          type: 'project',
          title: `Milestone Completed`,
          detail: `Built milestone on ${proj.name}`,
          timestamp: null
        });
      }
    });

    // Notes
    (notes || []).slice(0, 3).forEach(n => {
      wins.push({
        type: 'note',
        title: 'Logged Learning Note',
        detail: n.title || 'Studio thoughts',
        timestamp: n.createdAt || n.date ? new Date(n.createdAt || n.date) : null
      });
    });

    return wins.slice(0, 4);
  }, [progress, weekProofs, notes, projects, weeks, settings.startDate]);

  // Compile Attention Areas
  const attentionAreas = useMemo(() => {
    const areas = [];

    // 1. Active Blocker open
    const activeBlockers = blockers.filter(b => b.status !== 'Solved');
    if (activeBlockers.length > 0) {
      areas.push({
        type: 'blocker',
        title: `${activeBlockers.length} Active Blocker${activeBlockers.length > 1 ? 's' : ''} Open`,
        detail: 'Log answers or get debugging advice to resolve logged stack errors.',
        actionText: 'Solve Blockers',
        actionPath: '/blockers',
        accentColor: 'red'
      });
    }

    // 2. Proof pending for current/past weeks
    const missingProofs = weeks
      .filter(w => w.weekNumber <= settings.activeWeek)
      .filter(w => w.proofOfWork !== false && (w.deliverable || w.proofOfWork))
      .filter(w => {
        const p = weekProofs[w.weekNumber];
        return !p || !p.githubRepoLink || !p.githubCommitLink || !p.readmeCompleted;
      });

    if (missingProofs.length > 0) {
      areas.push({
        type: 'proof',
        title: `${missingProofs.length} Pending Verification${missingProofs.length > 1 ? 's' : ''}`,
        detail: `Week ${missingProofs.map(w => w.weekNumber).join(', ')} proof of work requires submission.`,
        actionText: 'Submit Proof',
        actionPath: '/proof',
        accentColor: 'amber'
      });
    }

    return areas;
  }, [blockers, weeks, weekProofs, settings.activeWeek]);

  return (
    <PageShell>
      <PageHeader 
        title="Roadmap Progress Center" 
        subtitle={`Your complete learning progress across ${roadmapTitle}.`}
      />

      {/* ── Next Recommended Action Card ── */}
      <div 
        onClick={() => navigate(nextAction.link)} 
        className="relative overflow-hidden rounded-2xl border border-brand-blue/20 bg-bg-soft/40 p-5 cursor-pointer hover:border-brand-blue/40 transition-all duration-300 font-sans mb-6"
      >
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
      </div>

      {/* ── Overall Progress Core Metrics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
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
                stroke="url(#progressGradOverview)"
                strokeWidth="8"
                strokeDasharray={`\${2 * Math.PI * 52}`}
                strokeDashoffset={`\${2 * Math.PI * 52 * (1 - (prog.overall || 0) / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
              <defs>
                <linearGradient id="progressGradOverview" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3B82F6" />
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
            <p className="text-[13px] text-slate-455 leading-relaxed max-w-[200px] mx-auto">Weighted progress score across tasks, projects, and self-assessments.</p>
          </div>
        </SectionCard>

        {/* Weighted Progress Breakdown */}
        <SectionCard title="Mastery Breakdown" className="lg:col-span-2 flex flex-col justify-between" subtitle="Weighted progress tracks mapped to operational domains.">
          <div className="space-y-5 py-2">
            {[
              { label: 'Checklist Tasks & Materials', percent: prog.tasks.percent, detail: `\${prog.tasks.completed} of \${prog.tasks.total} tasks completed`, weight: '50% weight', color: 'bg-gradient-to-r from-accent-primary to-blue-500' },
              { label: 'Skill Checkpoints', percent: prog.checkpoints.percent, detail: `\${prog.checkpoints.confident} confident targets, \${prog.checkpoints.learning} learning concepts`, weight: '30% weight', color: 'bg-gradient-to-r from-amber-500 to-orange-500' },
              { label: 'Capstone Projects', percent: prog.projects.percent, detail: `\${prog.projects.completed} of \${prog.projects.total} milestones complete`, weight: '20% weight', color: 'bg-gradient-to-r from-accent-cyan to-blue-500' },
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
                <p className="text-[12px] text-slate-455 mt-1.5">{detail}</p>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      {/* ── Momentum Metrics Grid ── */}
      {roadmap && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <MetricCard
            label="Syllabus Mastery"
            value={`\${prog.overall}%`}
            icon={TrendingUp}
            accentColor="blue"
            helperText={`\${prog.tasks.completed}/\${prog.tasks.total} checkpoints complete`}
          />
          <MetricCard
            label="Completed Weeks"
            value={`\${completedWeeksCount}/\${totalWeeks}`}
            icon={Calendar}
            accentColor="cyan"
            helperText={`\${weekPercent}% of modules completed`}
          />
          <MetricCard
            label="Evidence Submitted"
            value={`\${submittedProofsCount}`}
            icon={Award}
            accentColor={submittedProofsCount > 0 ? "green" : "amber"}
            helperText={`\${submittedProofsCount} verified GitHub proofs`}
          />
          <MetricCard
            label="Portfolio Projects"
            value={`\${completedProjectsCount}/\${projects.length}`}
            icon={FolderKanban}
            accentColor="violet"
            helperText={`\${completedProjectsCount} completed application builds`}
          />
        </div>
      )}

      {/* ── Learning Journey & Side Panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2/3 width) - Learning Journey Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <SectionCard 
            title="Learning Journey path" 
            subtitle="Compact, interactive roadmap timeline showing weeks and months."
          >
            {!roadmap?.months || roadmap.months.length === 0 ? (
              <div className="text-center py-12 text-slate-500 italic bg-navy-850/20 border border-navy-800/40 rounded-xl">
                No syllabus timeline segments defined in this roadmap.
              </div>
            ) : (
              <div className="space-y-4 font-sans">
                {roadmap.months.map((month) => {
                  const isActiveMonth = month.monthNumber === settings.activeMonth;
                  const isExpanded = expandedMonths[month.monthNumber];
                  const monthProgress = getMonthProgress(month, progress);
                  
                  return (
                    <div key={month.monthNumber} className="border border-navy-800/40 rounded-2xl bg-bg-soft/20 overflow-hidden font-sans">
                      {/* Month Accordion Header */}
                      <button
                        onClick={() => toggleMonth(month.monthNumber)}
                        className={`w-full flex items-center justify-between p-4 hover:bg-navy-800/25 transition-all text-left border-b border-navy-800/20`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-white uppercase tracking-wider">
                              Month {month.monthNumber}: {month.title}
                            </span>
                            {isActiveMonth && (
                              <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                                Active Coordinates
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-text-secondary">
                            {monthProgress.completedTasks}/{monthProgress.totalTasks} Tasks · {monthProgress.completedWeeks}/{monthProgress.totalWeeks} Weeks complete
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-mono font-bold text-slate-400 bg-bg-surface px-2.5 py-1 rounded-lg border border-border-divider">
                            {monthProgress.taskPercent}%
                          </span>
                          {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                        </div>
                      </button>

                      {/* Month Weeks Timeline Details */}
                      {isExpanded && (
                        <div className="p-5 bg-navy-900/10 space-y-4 relative border-t border-navy-800/10">
                          {/* Central vertical connecting line */}
                          <div className="absolute top-6 bottom-6 left-7 w-[1px] bg-navy-800/40" />

                          {month.weeks?.map((w) => {
                            const completed = isWeekComplete(w.weekNumber);
                            const active = w.weekNumber === settings.activeWeek;
                            const locked = isWeekLocked(w.weekNumber);

                            let dotStyle = "bg-navy-900 border-navy-700 text-slate-500";
                            let cardStyle = "border-border-default bg-bg-surface/50 opacity-70";
                            let iconNode = <Lock className="w-3 h-3 text-slate-650" />;

                            if (completed) {
                              dotStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-400";
                              cardStyle = "border-emerald-500/10 bg-emerald-500/5 hover:border-emerald-500/20";
                              iconNode = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-455" />;
                            } else if (active) {
                              dotStyle = "bg-brand-amber/15 border-brand-amber text-brand-amber shadow-primary-glow-sm animate-pulse";
                              cardStyle = "border-brand-amber/35 bg-brand-amber/5 hover:border-brand-amber";
                              iconNode = <Sparkles className="w-3.5 h-3.5 text-brand-amber" />;
                            } else if (!locked) {
                              dotStyle = "bg-navy-800 border-navy-600 text-slate-350";
                              cardStyle = "border-border-default bg-bg-surface hover:border-border-strong";
                              iconNode = <BookOpen className="w-3.5 h-3.5 text-slate-400" />;
                            }

                            return (
                              <div key={w.weekNumber} className="flex gap-4 items-start relative z-10">
                                {/* Timeline Node Pin */}
                                <div className={`w-6 h-6 rounded-full border flex items-center justify-center flex-shrink-0 mt-2 text-[10px] font-bold ${dotStyle}`}>
                                  {completed ? iconNode : locked ? iconNode : w.weekNumber}
                                </div>

                                {/* Week Details Card */}
                                <div className={`flex-1 p-4 rounded-xl border transition-all ${cardStyle}`}>
                                  <div className="flex justify-between items-start gap-4 flex-wrap">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-550">Week {w.weekNumber}</span>
                                        {active && <span className="bg-brand-amber/15 text-brand-amber text-[9px] font-bold px-1.5 py-0.5 rounded border border-brand-amber/25">Active</span>}
                                      </div>
                                      <h4 className="font-bold text-white text-sm leading-snug mt-1">{w.title}</h4>
                                    </div>
                                    <Link 
                                      to="/missions" 
                                      className="text-[11px] font-bold text-brand-blue uppercase tracking-widest hover:underline whitespace-nowrap"
                                    >
                                      Open Missions
                                    </Link>
                                  </div>
                                  
                                  {w.deliverable && (
                                    <p className="text-xs text-text-secondary mt-2 border-t border-navy-850/50 pt-2 leading-relaxed">
                                      🎯 <span className="italic">"{w.deliverable}"</span>
                                    </p>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* ── Dynamic Category Progress ── */}
          {dynamicReadiness.length > 0 && (
            <SectionCard title="Topic Readiness Map" subtitle="Progress overview mapped dynamically by syllabus category.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {dynamicReadiness.map((cat) => (
                  <div key={cat.id} className="p-5 bg-navy-900/30 border border-navy-800/80 rounded-2xl space-y-3 font-sans">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-extrabold text-white text-sm">{cat.title}</h4>
                        {cat.description && <p className="text-[11px] text-slate-455 mt-0.5">{cat.description}</p>}
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
          {projects.length > 0 && (
            <SectionCard title="Capstone Projects Tracker" subtitle="Completions of final builder deliverables.">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((project, pi) => {
                  const done = progress.completedProjectMilestones?.[pi] || [];
                  const total = project.milestones?.length || 0;
                  const percent = total > 0 ? Math.round((done.length / total) * 100) : 0;
                  const isCapstone = project.capstone === true || project.featured === true;
                  return (
                    <div
                      key={pi}
                      className={`p-5 rounded-2xl border transition-all font-sans ${
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
                      <p className="text-[11px] text-slate-455 mt-2.5">
                        {done.length}/{total} Milestones Complete · {percent === 100 ? 'Project Complete!' : 'In Progress'}
                      </p>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}

          {/* ── Confidence Grid ── */}
          {roadmap?.checkpoints && roadmap.checkpoints.length > 0 && (
            <SectionCard title="Syllabus Skills Confidence Tracker" subtitle="Self-assessed confidence levels for core skill concepts.">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {roadmap.checkpoints.map((cp) => {
                  const status = checkpointStatuses?.[cp.skill];
                  let label = "Unassessed";
                  let color = "bg-navy-900 border-navy-800 text-slate-500";
                  if (status === 'Confident') {
                    label = "Confident";
                    color = "bg-emerald-500/10 border-emerald-500/20 text-emerald-400";
                  } else if (status === 'Learning') {
                    label = "Learning";
                    color = "bg-amber-500/10 border-brand-amber/20 text-brand-amber";
                  }

                  return (
                    <div key={cp.skill || cp.id} className="p-4 bg-navy-900/30 border border-navy-800/80 rounded-2xl flex items-center justify-between gap-3 font-sans">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{cp.category || 'Skill'}</span>
                        <h5 className="font-bold text-white text-xs mt-1 truncate leading-tight">{cp.title}</h5>
                      </div>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${color}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          )}
        </div>

        {/* Right Column (1/3 width) - Recent Wins, Attention Areas, Linked Evidence */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Latest Wins */}
          <SectionCard 
            title="Latest wins" 
            subtitle="Evidence of your learning outcomes and milestones."
          >
            {recentWins.length === 0 ? (
              <div className="text-center py-6 text-text-secondary italic bg-bg-soft/40 border border-dashed border-border-default rounded-radius-xl p-4 font-sans text-xs">
                Your first win will appear here after you complete a mission, submit proof, or finish a project step.
              </div>
            ) : (
              <div className="space-y-3 pt-1 font-sans">
                {recentWins.map((win, idx) => {
                  let badgeColor = "bg-navy-800 border-navy-700 text-slate-400";
                  if (win.type === 'week') badgeColor = "bg-emerald-500/10 border-emerald-500/20 text-emerald-450";
                  if (win.type === 'proof') badgeColor = "bg-blue-500/10 border-blue-500/20 text-blue-450";
                  if (win.type === 'project') badgeColor = "bg-brand-violet/10 border-brand-violet/20 text-brand-violet";

                  return (
                    <div key={idx} className="bg-bg-soft border border-border-default p-3.5 rounded-xl text-left flex gap-3 items-start">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        win.type === 'week' ? 'bg-emerald-400' : win.type === 'proof' ? 'bg-blue-400' : 'bg-brand-violet'
                      }`} />
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between items-center gap-2">
                          <span className={`text-[9px] font-bold uppercase tracking-wider border px-1.5 py-0.5 rounded ${badgeColor}`}>
                            {win.type}
                          </span>
                          {win.timestamp && (
                            <span className="text-[10px] text-text-secondary">
                              {win.timestamp.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-white text-xs mt-1 truncate">{win.title}</h4>
                        <p className="text-[11px] text-text-secondary mt-0.5 truncate">{win.detail}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Attention Areas */}
          <SectionCard 
            title="Attention Areas" 
            subtitle="Actions suggested to clear obstacles or secure progress."
          >
            {attentionAreas.length === 0 ? (
              <div className="text-center py-6 text-emerald-450 italic bg-emerald-500/5 border border-emerald-500/20 rounded-radius-xl p-4 font-sans text-xs">
                ✓ No attention areas right now. All deliverables are complete!
              </div>
            ) : (
              <div className="space-y-3 pt-1 font-sans">
                {attentionAreas.map((area, idx) => {
                  let alertStyle = "border-brand-amber/20 bg-brand-amber/5 text-brand-amber";
                  let Icon = AlertTriangle;

                  if (area.accentColor === 'red') {
                    alertStyle = "border-brand-red/25 bg-brand-red/5 text-brand-red";
                    Icon = ShieldAlert;
                  }

                  return (
                    <div key={idx} className={`border p-4 rounded-xl flex flex-col justify-between gap-3 ${alertStyle}`}>
                      <div className="flex gap-2.5 items-start">
                        <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider">{area.title}</h4>
                          <p className="text-[11px] text-text-secondary mt-1 leading-normal">{area.detail}</p>
                        </div>
                      </div>
                      <Link 
                        to={area.actionPath}
                        className="btn-secondary py-1.5 px-3 text-[10px] font-bold text-center border-navy-700/40 text-slate-350 hover:text-white"
                      >
                        {area.actionText}
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </SectionCard>

          {/* Linked Evidence Summary */}
          <SectionCard 
            title="Linked Evidence Summary" 
            subtitle="Bridges to details pages for submission references."
          >
            <div className="space-y-4 pt-1 font-sans">
              <div className="p-3.5 bg-bg-soft/40 border border-border-default rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span>Proof Submissions</span>
                  <span className="text-brand-blue font-mono">{submittedProofsCount} Complete</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Submit specific GitHub commit URLs to verify weekly task completions.
                </p>
                <Link to="/proof" className="btn-secondary py-2 text-xs font-bold text-center w-full mt-2 flex items-center justify-center gap-1.5">
                  Open Proof of Work <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="p-3.5 bg-bg-soft/40 border border-border-default rounded-xl space-y-2">
                <div className="flex justify-between items-center text-xs font-bold text-white">
                  <span>Capstone Projects</span>
                  <span className="text-brand-violet font-mono">{completedProjectsCount} / {projects.length} Done</span>
                </div>
                <p className="text-[11px] text-text-secondary leading-relaxed">
                  Turn syllabus criteria into production-grade portfolio project builds.
                </p>
                <Link to="/projects" className="btn-secondary py-2 text-xs font-bold text-center w-full mt-2 flex items-center justify-center gap-1.5">
                  Open Project Tracker <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </SectionCard>
        </div>

      </div>
    </PageShell>
  );
}
