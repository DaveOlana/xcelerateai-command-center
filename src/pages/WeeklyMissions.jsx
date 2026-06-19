import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, ExternalLink,
  Printer, BookOpen, Target, Lock, ShieldAlert, Play, Pause,
  Coffee, ChevronRight as ChevronRightIcon, AlertTriangle, FileText,
  Zap, Clock, Database, Clipboard, CheckSquare
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getWeekStepStatus, getUnknownWeekFields, isWeekAccessible,
  getRequiredResources, missionRequiresEvidence
} from '../utils/unlockChecker';

import { PageShell, PageHeader, SectionCard, StatCard, ProgressBar, StatusBadge, LockWarningCard } from '../components/common/UIComponents';

// ── Step config for the guided stepper ──
const STEPS = [
  { id: 'overview',   label: 'Overview',          icon: BookOpen,     stepNum: 0, alwaysOpen: true },
  { id: 'resources',  label: 'Study Resources',   icon: BookOpen,     stepNum: 1, alwaysOpen: true },
  { id: 'skillcheck', label: 'Skill Check',       icon: CheckSquare,  stepNum: 2, alwaysOpen: false },
  { id: 'practicals', label: 'Practical Missions',icon: Target,       stepNum: 3, alwaysOpen: false },
  { id: 'proof',      label: 'Proof of Work',     icon: FileText,     stepNum: 4, alwaysOpen: false },
  { id: 'reflection', label: 'Reflection',        icon: Zap,          stepNum: 5, alwaysOpen: false },
  { id: 'unlock',     label: 'Unlock Next Week',  icon: CheckCircle2, stepNum: 6, alwaysOpen: false },
  { id: 'tasks',      label: 'All Tasks',         icon: CheckCircle2, stepNum: -1, alwaysOpen: true },
];

const InlineLockCard = LockWarningCard;


// Status badge styles for practical missions
const STATUS_COLORS = {
  Locked: 'bg-navy-900 text-slate-500 border border-navy-750',
  Available: 'bg-navy-900 text-slate-400 border border-navy-750',
  'In Progress': 'bg-accent-primary/10 text-accent-primary border border-accent-primary/20',
  Blocked: 'bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse',
  Submitted: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  Completed: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
};

export default function WeeklyMissions() {
  const {
    roadmap, progress, settings,
    toggleTask, isTaskComplete, markWeekComplete, isWeekComplete,
    resourcesStatus, updateResourceStatus, skillChecks, submitSkillCheck,
    practicalMissions, weekProofs, submitWeekProof, saveWeekReflection, weekReflections,
    addNote, startTimer, sessionTimer, pauseTimer, resumeTimer, startBreakTimer,
  } = useApp();

  const navigate = useNavigate();

  const allWeeks = useMemo(() => {
    const list = [];
    roadmap?.months?.forEach((m) => {
      m.weeks?.forEach((w) => list.push({ week: w, month: m }));
    });
    return list;
  }, [roadmap]);

  const [selectedWeekNum, setSelectedWeekNum] = useState(settings.activeWeek);
  const currentEntry = allWeeks.find((e) => e.week.weekNumber === selectedWeekNum);

  const [activeTab, setActiveTab] = useState('overview');

  // Skill check local states
  const [skillAns, setSkillAns] = useState('');
  const [skillConf, setSkillConf] = useState(3);
  const [skillCheckSaved, setSkillCheckSaved] = useState(false);

  // Reflection local state
  const [refAns, setRefAns] = useState('');
  const [reflectionSaved, setReflectionSaved] = useState(false);

  // Proof local state
  const [proofLocal, setProofLocal] = useState({
    githubRepoLink: '', githubCommitLink: '', screenshotNote: '',
    readmeCompleted: false, reflectionCompleted: false,
  });
  const [proofSaved, setProofSaved] = useState(false);

  // Break popup state
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);

  // Week locked check (future week)
  const isWeekLocked = !isWeekAccessible(selectedWeekNum, settings.activeWeek, settings.manualOverrideEnabled);

  // Sync form fields when week changes
  React.useEffect(() => {
    if (!currentEntry) return;
    const { week } = currentEntry;
    const savedCheck = skillChecks[week.weekNumber];
    setSkillAns(savedCheck?.answers?.explanation || '');
    setSkillConf(savedCheck?.confidence || 3);
    setSkillCheckSaved(false);

    const savedRef = weekReflections[week.weekNumber];
    setRefAns(savedRef?.explanation || '');
    setReflectionSaved(false);

    const savedProof = weekProofs[week.weekNumber];
    if (savedProof) {
      setProofLocal({
        githubRepoLink: savedProof.githubRepoLink || '',
        githubCommitLink: savedProof.githubCommitLink || '',
        screenshotNote: savedProof.screenshotNote || '',
        readmeCompleted: savedProof.readmeCompleted || false,
        reflectionCompleted: savedProof.reflectionCompleted || false,
      });
    } else {
      setProofLocal({ githubRepoLink: '', githubCommitLink: '', screenshotNote: '', readmeCompleted: false, reflectionCompleted: false });
    }
    setProofSaved(false);
    setShowBreakPrompt(false);
  }, [selectedWeekNum, currentEntry]);

  // Break timer check — if timer running over maxContinuousMinutes
  React.useEffect(() => {
    if (!sessionTimer.isRunning || sessionTimer.isBreak) return;
    const maxSec = (sessionTimer.maxContinuousMinutes || 75) * 60;
    if (sessionTimer.accumulatedActiveSeconds >= maxSec) {
      setShowBreakPrompt(true);
    }
  }, [sessionTimer.accumulatedActiveSeconds, sessionTimer.isRunning, sessionTimer.isBreak, sessionTimer.maxContinuousMinutes]);

  if (!currentEntry) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500 text-sm">No roadmap data active. Please import a roadmap JSON.</p>
      </div>
    );
  }

  const { week, month } = currentEntry;
  const isComplete = isWeekComplete(week.weekNumber);
  const taskKey = `m${month.monthNumber}_w${week.weekNumber}`;
  const doneTasks = progress?.completedTasks?.[taskKey];
  const doneTasksCount = Array.isArray(doneTasks) ? doneTasks.length : 0;
  const totalTasksCount = Array.isArray(week?.tasks) ? week.tasks.length : 0;
  const taskPercent = totalTasksCount > 0 ? Math.round((doneTasksCount / totalTasksCount) * 100) : 0;

  // Get step statuses from unlock checker
  const stepStatus = getWeekStepStatus({
    week, weekNum: week.weekNumber, monthNum: month.monthNumber,
    progress, resourcesStatus, skillChecks, practicalMissions,
    weekProofs, weekReflections, settings,
  });

  const unknownFields = getUnknownWeekFields(week);
  const requiredResources = getRequiredResources(week);
  const sessions = week.sessions || [];

  // --- Handlers ---
  const handleMarkWeekComplete = () => {
    if (!settings.manualOverrideEnabled) {
      if (!stepStatus.resourcesDone && Array.isArray(requiredResources) && requiredResources.length > 0) {
        alert('Study all required resources before completing this week.');
        return;
      }
      if (week.checkpoint && !stepStatus.skillCheckDone) {
        alert('Complete the Skill Check before marking this week complete.');
        return;
      }
      if (!stepStatus.practicalsDone && Array.isArray(week.practicalMissions) && week.practicalMissions.length > 0) {
        alert('Complete all required practical missions before completing this week.');
        return;
      }
      if (!stepStatus.proofDone) {
        alert('Submit proof of work (GitHub links + checklist) before completing this week.');
        return;
      }
      if (!stepStatus.reflectionDone) {
        alert('Write your weekly reflection before completing this week.');
        return;
      }
    }
    markWeekComplete(week.weekNumber);
  };

  const handleSaveSkillCheck = (e) => {
    e.preventDefault();
    submitSkillCheck(week.weekNumber, { explanation: skillAns }, skillConf, true);
    setSkillCheckSaved(true);
  };

  const handleSaveReflection = (e) => {
    e.preventDefault();
    saveWeekReflection(week.weekNumber, { explanation: refAns });
    setReflectionSaved(true);
  };

  const handleSaveProof = (e) => {
    e.preventDefault();
    submitWeekProof(week.weekNumber, proofLocal);
    setProofSaved(true);
  };

  const handleStartSession = (session) => {
    startTimer(
      session.sessionId || `w${week.weekNumber}-manual`,
      session.type || 'Build Session',
      session.title || `Week ${week.weekNumber} Focus`,
      session.durationMinutes || 90,
      session.maxContinuousMinutes || 75,
      session.recommendedBreakMinutes || 10,
    );
  };

  const handleTakeNote = (res) => {
    addNote({
      title: `Resource Note — ${res.title}`,
      noteType: 'resource_summary',
      linkedWeek: week.weekNumber,
      linkedResource: res.title,
      whatLearned: '',
      whatConfused: '',
      whatBuilt: '',
      date: new Date().toISOString().split('T')[0],
    });
    navigate('/notes');
  };

  const goToPrev = () => { if (selectedWeekNum > 1) setSelectedWeekNum((n) => n - 1); };
  const goToNext = () => { if (selectedWeekNum < allWeeks.length) setSelectedWeekNum((n) => n + 1); };

  // Determine which steps are accessible for tab clicks (always allow clicks, locks handled inline)
  const tabAccessible = {
    overview: true,
    resources: true,
    skillcheck: true,
    practicals: true,
    proof: true,
    reflection: true,
    unlock: true,
    tasks: true,
  };

  const isStepLocked = {
    overview: false,
    resources: false,
    skillcheck: !stepStatus.skillCheckUnlocked,
    practicals: !stepStatus.practicalsUnlocked,
    proof: !stepStatus.proofUnlocked,
    reflection: !stepStatus.reflectionUnlocked,
    unlock: !stepStatus.weekCompleteUnlocked,
    tasks: false,
  };


  return (
    <PageShell className="relative">
      {/* Locked status handled inline in page shell */}

      {/* ── BREAK REMINDER POPUP ── */}
      {showBreakPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-navy-850 border border-amber-500/30 rounded-2xl w-full max-w-md p-6 animate-scale-in text-center shadow-amber-glow">
            <Coffee className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h2 className="text-lg font-bold text-white">Take a Break, Commander</h2>
            <p className="text-xs text-slate-400 mt-2">
              You've been active for{' '}
              <span className="text-amber-400 font-bold font-mono">
                {Math.floor(sessionTimer.accumulatedActiveSeconds / 60)} minutes
              </span>{' '}
              without a break. Science says rest improves retention.
            </p>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              Recommended break: {sessionTimer.recommendedBreakMinutes || 10} minutes.
            </p>
            <div className="flex flex-col gap-2 mt-5">
              <button
                onClick={() => {
                  startBreakTimer(sessionTimer.recommendedBreakMinutes || 10);
                  setShowBreakPrompt(false);
                }}
                className="bg-accent-primary text-navy-900 font-bold py-2.5 rounded-xl hover:bg-accent-primary-dim active:scale-95 transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2"
              >
                <Coffee className="w-4 h-4" /> Start {sessionTimer.recommendedBreakMinutes || 10} Min Break
              </button>
              <button
                onClick={() => setShowBreakPrompt(false)}
                className="bg-navy-700/80 border border-navy-450 text-slate-300 font-bold py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider"
              >
                Remind Me Later
              </button>
              <button
                onClick={() => setShowBreakPrompt(false)}
                className="text-xs text-slate-600 hover:text-slate-400 transition-colors py-1"
              >
                Continue Anyway
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <PageHeader
        title="Weekly Missions"
        subtitle={`Month ${month.monthNumber}: ${month.title}`}
        actions={
          <button
            onClick={() => window.print()}
            className="bg-navy-700/80 border border-navy-450 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white hover:border-accent-primary/30 transition-all text-[13px] uppercase tracking-wider active:scale-95 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Print Week Checklist
          </button>
        }
      />

      {/* ── WEEK QUICK SELECTOR ── */}
      <div className="flex items-center gap-3 no-print">
        <button onClick={goToPrev} disabled={selectedWeekNum <= 1} className="btn-secondary p-2 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-x-auto">
          <div className="flex gap-2 min-w-max pb-1">
            {allWeeks.map(({ week: w }) => {
              const done = isWeekComplete(w.weekNumber);
              const active = w.weekNumber === selectedWeekNum;
              const locked = !isWeekAccessible(w.weekNumber, settings.activeWeek, settings.manualOverrideEnabled);

              return (
                <button
                  key={w.weekNumber}
                  onClick={() => setSelectedWeekNum(w.weekNumber)}
                  title={w.title}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    active
                      ? 'bg-accent-primary border-accent-primary text-navy-900 shadow-primary-glow-sm'
                      : done
                      ? 'bg-blue-500/10 text-blue-400 border-blue-500/25'
                      : locked
                      ? 'bg-navy-800 text-slate-600 border-navy-450 opacity-60'
                      : 'bg-navy-700 text-slate-400 border-navy-400 hover:border-navy-300'
                  }`}
                >
                  {locked && <Lock className="w-2.5 h-2.5" />}
                  {done && <CheckCircle2 className="w-3 h-3" />}
                  W{w.weekNumber}
                </button>
              );
            })}
          </div>
        </div>

        <button onClick={goToNext} disabled={selectedWeekNum >= allWeeks.length} className="btn-secondary p-2 disabled:opacity-40">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {isWeekLocked ? (
        <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-8 max-w-xl mx-auto my-8 text-center space-y-5 shadow-card">
          <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto shadow-sm">
            <Lock className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-white tracking-tight">Bootcamp Week Locked</h3>
            <p className="text-[14px] text-slate-400 mt-2 leading-relaxed">
              Prerequisite missing. Please complete all tasks and submit proof for Week {selectedWeekNum - 1} before proceeding to these milestones.
            </p>
          </div>
          <div className="flex gap-3 justify-center pt-4 border-t border-navy-700/30">
            <button
              onClick={() => setSelectedWeekNum(settings.activeWeek)}
              className="btn-primary py-2.5 px-4 text-xs font-bold"
            >
              Go to Active Week ({settings.activeWeek})
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="btn-secondary py-2.5 px-4 text-xs font-semibold"
            >
              Override in Settings
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* ── WEEK TITLE CARD ── */}
          <div className="card">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {isComplete ? (
                    <span className="badge-green">✓ Completed</span>
                  ) : (
                    <span className="badge-slate animate-pulse">In Progress</span>
                  )}
                </div>
                <h2 className="text-xl font-bold text-white">{week.title}</h2>
                <p className="text-[13px] text-slate-450 font-medium mt-1">Ref: W{String(week.weekNumber).padStart(2, '0')} · Month {month.monthNumber}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-accent-primary">{taskPercent}%</p>
                <p className="text-xs text-slate-500">{doneTasksCount}/{totalTasksCount} tasks</p>
              </div>
            </div>
        <div className="progress-track">
          <div className="progress-fill" style={{ width: `${taskPercent}%` }} />
        </div>

        {/* Estimated Hours and Data */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-navy-400/50">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Hours</p>
            <p className="text-xs text-white mt-1 font-semibold flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-accent-primary" /> {week.timeEstimate || week.estimatedHours || week.hours || "Not specified"}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Estimated Data</p>
            <p className="text-xs text-white mt-1 font-semibold flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-accent-cyan" /> {week.dataEstimate || week.estimatedData || week.data || "Not specified"}
            </p>
          </div>
        </div>

        {week.briefing && (
          <div className="mt-4 pt-4 border-t border-navy-400/50">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Week Objective</p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{week.briefing}</p>
          </div>
        )}

        {week.elliotConnection && (
          <div className="mt-4 pt-4 border-t border-navy-400/50 bg-accent-cyan/5 -mx-4 px-4 py-3 border-b border-accent-cyan/10">
            <p className="text-xs text-accent-cyan font-bold uppercase tracking-wider flex items-center gap-1">
               Elliot Connection
            </p>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{week.elliotConnection}</p>
          </div>
        )}

        {/* Week Step Progress Visual */}
        <div className="mt-4 pt-4 border-t border-navy-400/50">
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider mb-3">BOOTCAMP FLOW</p>
          <div className="flex items-center gap-1 flex-wrap">
            {[
              { label: 'Study', done: stepStatus.resourcesDone, locked: false },
              { label: 'Skill Check', done: stepStatus.skillCheckDone, locked: !stepStatus.skillCheckUnlocked },
              { label: 'Build', done: stepStatus.practicalsDone, locked: !stepStatus.practicalsUnlocked },
              { label: 'Proof', done: stepStatus.proofDone, locked: !stepStatus.proofUnlocked },
              { label: 'Reflect', done: stepStatus.reflectionDone, locked: !stepStatus.reflectionUnlocked },
              { label: 'Unlock', done: isComplete, locked: !stepStatus.weekCompleteUnlocked },
            ].map((s, i, arr) => (
              <React.Fragment key={s.label}>
                <button
                  onClick={() => {
                    const stepId = ['resources', 'skillcheck', 'practicals', 'proof', 'reflection', 'unlock'][i];
                    setActiveTab(stepId);
                  }}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded text-[13px] font-bold border transition-all ${
                    s.done ? 'bg-accent-primary/10 border-accent-primary/30 text-accent-primary hover:bg-accent-primary/20' :
                    s.locked ? 'bg-navy-800 border-navy-450 text-slate-600' :
                    'bg-amber-500/10 border-amber-500/25 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  {s.done ? <CheckCircle2 className="w-3 h-3 text-accent-primary" /> : s.locked ? <Lock className="w-3 h-3 text-slate-600" /> : <Circle className="w-3 h-3 text-amber-400 animate-pulse" />}
                  {s.label}
                </button>
                {i < arr.length - 1 && (
                  <ChevronRightIcon className="w-3 h-3 text-slate-600 flex-shrink-0" />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>


      {/* ── SESSION CARDS FROM JSON ── */}
      {Array.isArray(sessions) && sessions.length > 0 && (
        <div className="space-y-3">
          <p className="text-[13px] text-slate-500 font-bold uppercase tracking-wider">SCHEDULED SESSIONS</p>
          <div className="grid sm:grid-cols-2 gap-3">
            {sessions.map((session, si) => {
              const isActive = sessionTimer.activeSessionId === (session.sessionId || `w${week.weekNumber}-s${si}`);
              return (
                <div key={si} className={`card border transition-all ${isActive ? 'border-accent-primary/40 bg-accent-primary/5' : 'border-navy-400'}`}>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">{session.type || 'Focus Session'}</span>
                      <p className="text-sm font-bold text-white mt-0.5">{session.title}</p>
                      {session.sessionId && (
                        <p className="text-xs text-slate-600 font-mono">Ref: {session.sessionId}</p>
                      )}
                    </div>
                    {isActive && (
                      <span className="badge-blue animate-pulse text-xs">Active</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-slate-400 mb-3">
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{session.durationMinutes}min</span>
                    {session.maxContinuousMinutes && (
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-500" />Max {session.maxContinuousMinutes}min</span>
                    )}
                    {session.recommendedBreakMinutes && (
                      <span className="flex items-center gap-1"><Coffee className="w-3 h-3" />{session.recommendedBreakMinutes}min break</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {!isActive ? (
                      <button
                        onClick={() => handleStartSession(session)}
                        className="btn-primary py-2 text-xs flex items-center gap-1.5 flex-1 justify-center"
                      >
                        <Play className="w-3.5 h-3.5 fill-navy-900" /> Start Session
                      </button>
                    ) : sessionTimer.isRunning ? (
                      <button onClick={pauseTimer} className="btn-secondary py-2 text-xs flex items-center gap-1.5 flex-1 justify-center">
                        <Pause className="w-3.5 h-3.5" /> Pause
                      </button>
                    ) : (
                      <button onClick={resumeTimer} className="btn-primary py-2 text-xs flex items-center gap-1.5 flex-1 justify-center">
                        <Play className="w-3.5 h-3.5 fill-navy-900" /> Resume
                      </button>
                    )}
                    {isActive && (
                      <button
                        onClick={() => startBreakTimer(session.recommendedBreakMinutes || 10)}
                        className="btn-secondary py-2 text-xs flex items-center gap-1.5 px-3"
                      >
                        <Coffee className="w-3.5 h-3.5" /> Break
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TABS ── */}
      <div className="flex border-b border-navy-700/30 no-print overflow-x-auto gap-1">
        {STEPS.map((tab) => {
          const active = activeTab === tab.id;
          const locked = isStepLocked[tab.id];
          const done = {
            overview: false,
            resources: stepStatus.resourcesDone,
            skillcheck: stepStatus.skillCheckDone,
            practicals: stepStatus.practicalsDone,
            proof: stepStatus.proofDone,
            reflection: stepStatus.reflectionDone,
            unlock: isComplete,
            tasks: false,
          }[tab.id];
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 flex items-center gap-2 py-3.5 px-4 text-[14px] font-semibold border-b-2 transition-all ${
                active
                  ? 'border-accent-primary text-white bg-accent-primary/5'
                  : done
                  ? 'border-emerald-500/20 text-emerald-450 hover:text-emerald-300'
                  : locked
                  ? 'border-transparent text-slate-600'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {locked ? (
                <Lock className="w-3.5 h-3.5 text-slate-600" />
              ) : done ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-450" />
              ) : (
                <Icon className="w-3.5 h-3.5" />
              )}
              {tab.label}
            </button>
          );
        })}
      </div>


      {/* ── TAB PANELS ── */}
      <div className="space-y-6">

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-5">
            {week.briefing && (
              <div className="card">
                <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">Mission Briefing</h3>
                <p className="text-sm text-slate-300 leading-relaxed">{week.briefing}</p>
              </div>
            )}

            {week.elliotConnection && (
              <div className="card border-accent-cyan/20 bg-accent-cyan/5">
                <h3 className="text-xs font-bold text-accent-cyan mb-2 uppercase tracking-wide"> Elliot Product Connection</h3>
                <p className="text-xs text-slate-300 leading-relaxed">{week.elliotConnection}</p>
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              {week.deliverable && (
                <div className="card border-amber-500/20 bg-amber-500/5">
                  <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Required Deliverable</span>
                  <p className="text-xs text-white leading-relaxed italic mt-1.5">"{week.deliverable}"</p>
                </div>
              )}
              {week.checkpoint && (
                <div className="card border-accent-primary/20 bg-accent-primary/5">
                  <span className="text-xs text-accent-primary font-bold uppercase tracking-wider">Confidence Checkpoint</span>
                  <p className="text-xs text-white leading-relaxed italic mt-1.5">"{week.checkpoint}"</p>
                </div>
              )}
            </div>

            {/* Unknown JSON fields accordion */}
            {unknownFields && Object.keys(unknownFields).length > 0 && (
              <div className="card">
                <details className="group">
                  <summary className="flex items-center justify-between text-xs font-bold text-slate-400 cursor-pointer select-none">
                    <span>ADDITIONAL WEEK DATA ({Object.keys(unknownFields).length} custom field{Object.keys(unknownFields).length !== 1 ? 's' : ''})</span>
                    <ChevronRightIcon className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                  </summary>
                  <div className="mt-3 pt-3 border-t border-navy-400/50 space-y-3">
                    {Object.entries(unknownFields).map(([key, val]) => (
                      <div key={key} className="text-xs">
                        <span className="font-bold text-slate-400 uppercase tracking-wider">{key}:</span>
                        {typeof val === 'object' ? (
                          <pre className="bg-navy-950 font-mono text-[13px] text-slate-400 rounded p-2 overflow-x-auto mt-1">
                            <code>{JSON.stringify(val, null, 2)}</code>
                          </pre>
                        ) : (
                          <p className="text-slate-300 mt-0.5">{String(val)}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </details>
              </div>
            )}
          </div>
        )}

        {/* RESOURCES (STUDY) TAB */}
        {activeTab === 'resources' && (
          <div className="space-y-4">
            <div className="card bg-navy-800 p-4 flex items-center justify-between border-navy-400">
              <div>
                <h3 className="font-bold text-white text-sm">Step 1: Study Resources</h3>
                <p className="text-xs text-slate-500 mt-0.5">Mark required resources as Studied to unlock the Skill Check.</p>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${stepStatus.resourcesDone ? 'badge-blue' : 'badge-slate animate-pulse'}`}>
                {stepStatus.resourcesDone ? '✓ All Studied' : 'Study Pending'}
              </span>
            </div>

            {!Array.isArray(week.resources) || week.resources.length === 0 ? (
              <div className="card text-center py-8">
                <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No resources listed for this week.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {week.resources.map((res, idx) => {
                  const status = resourcesStatus[res.title] || 'Not Started';
                  const isRequired = requiredResources.some(r => r.title === res.title);

                  return (
                    <div key={idx} className={`card flex flex-col justify-between gap-5 transition-all ${
                      status === 'Studied' ? 'border-emerald-500/20 bg-emerald-500/5' :
                      status === 'Studying' ? 'border-accent-primary/25 bg-accent-primary/5' : 'border-navy-700/25'
                    }`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="badge-slate text-xs">{res.type}</span>
                            {res.difficulty && <span className="badge-slate text-xs">{res.difficulty}</span>}
                            {isRequired && <span className="badge-slate text-xs">Required</span>}
                          </div>
                          <span className={`text-[12px] font-bold px-2.5 py-0.5 rounded-full border ${
                            status === 'Studied' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                            status === 'Studying' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20 animate-pulse' :
                            'bg-navy-900 text-slate-500 border-navy-700'
                          }`}>
                            {status}
                          </span>
                        </div>

                        <h4 className="font-bold text-white text-base leading-snug">{res.title}</h4>

                        {/* Time / Data estimates */}
                        {(res.timeEstimate || res.dataEstimate) && (
                          <div className="flex items-center gap-3 text-[13px] text-slate-450 font-medium">
                            {res.timeEstimate && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{res.timeEstimate}</span>}
                            {res.dataEstimate && <span className="flex items-center gap-1"><Database className="w-3.5 h-3.5" />{res.dataEstimate}</span>}
                          </div>
                        )}

                        {res.whatToExpect && (
                          <p className="text-[14px] text-slate-400 leading-relaxed line-clamp-2">{res.whatToExpect}</p>
                        )}

                        {res.missionObjective && (
                          <div className="bg-navy-900 border border-navy-750 rounded-xl p-3 text-[13px] text-slate-400">
                            <span className="font-bold text-accent-primary">Goal: </span>
                            {res.missionObjective}
                          </div>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t border-navy-750">
                        <a
                          href={res.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary py-2 px-2 text-[13px] text-center flex items-center justify-center gap-1"
                        >
                          <ExternalLink className="w-3.5 h-3.5" /> Open Resource
                        </a>

                        {status === 'Not Started' && (
                          <button
                            onClick={() => updateResourceStatus(res.title, 'Studying')}
                            className="btn-secondary py-2 text-[13px] text-amber-500 border-amber-500/20 hover:bg-amber-500/10"
                          >
                            Start Studying
                          </button>
                        )}
                        {status === 'Studying' && (
                          <button
                            onClick={() => updateResourceStatus(res.title, 'Studied')}
                            className="btn-primary py-2 text-[13px]"
                          >
                            Mark Studied
                          </button>
                        )}
                        {status === 'Studied' && (
                          <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl py-2 text-[13px] text-center flex items-center justify-center gap-1 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Studied
                          </div>
                        )}

                        {/* Span full width — Open + Take Note */}
                        <button
                          onClick={() => handleTakeNote(res)}
                          className="col-span-2 btn-secondary py-2 text-[13px] text-slate-400 flex items-center justify-center gap-1"
                        >
                          <FileText className="w-3.5 h-3.5" /> Open & Take Note
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* SKILL CHECK TAB */}
        {activeTab === 'skillcheck' && (
          <div className="space-y-4">
            {!stepStatus.skillCheckUnlocked ? (
              <InlineLockCard
                title="Skill Check is locked"
                message="Complete all required study resources first."
                missingLabel="Study all required resources first (Step 1)."
                nextActionLabel="Go to Study Resources"
                onNextAction={() => setActiveTab('resources')}
              />
            ) : (
              <div className="card border-accent-primary/20">
                <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">Step 2: Readiness Skill Check</h3>
                <p className="text-xs text-slate-400 mb-4">Complete required resources to activate this skill checkpoint.</p>

                {stepStatus.skillCheckDone ? (
                  <div className="bg-accent-primary/5 border border-accent-primary/25 rounded-xl p-4 text-xs text-accent-primary flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>Skill check confirmed. Confidence level: {skillChecks[week.weekNumber]?.confidence || 3}/5. Practicals are now unlocked.</span>
                  </div>
                ) : (
                  <form onSubmit={handleSaveSkillCheck} className="space-y-4">
                    {(week.skillCheck?.questions || [week.checkpoint]).filter(Boolean).map((q, qi) => (
                      <div key={qi} className="space-y-2 p-3 bg-navy-800 border border-navy-450 rounded-xl">
                        <label className="text-xs font-bold text-white block">Q{qi + 1}: "{q}"</label>
                        {qi === 0 && (
                          <textarea
                            rows={4}
                            value={skillAns}
                            onChange={(e) => setSkillAns(e.target.value)}
                            placeholder="Explain your understanding in your own words, or log the files you created to prove mastery."
                            className="input-base w-full text-xs"
                            required
                          />
                        )}
                      </div>
                    ))}

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs text-slate-400 block">Confidence Level (1–5)</label>
                        <input
                          type="range" min="1" max="5" value={skillConf}
                          onChange={(e) => setSkillConf(Number(e.target.value))}
                          className="w-full accent-accent-primary"
                        />
                        <div className="flex justify-between text-[13px] text-slate-500 font-mono mt-0.5">
                          <span>1: Guessing</span><span>3: Decent</span><span>5: Confident</span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-end justify-end">
                        {skillCheckSaved && <span className="text-xs text-accent-primary font-semibold">Saved!</span>}
                        <button type="submit" className="btn-primary py-2.5 px-6 text-xs">
                          Confirm Readiness
                        </button>
                      </div>
                    </div>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* PRACTICALS TAB */}
        {activeTab === 'practicals' && (
          <div className="space-y-4">
            {!stepStatus.practicalsUnlocked ? (
              <InlineLockCard
                title="Practical Missions are locked"
                message="Complete the Skill Check before building."
                missingLabel="Complete the Skill Check (Step 2)."
                nextActionLabel="Go to Skill Check"
                onNextAction={() => setActiveTab('skillcheck')}
              />
            ) : (
              <>
                <div className="card flex items-center justify-between border-navy-400">
                  <div>
                    <h3 className="font-bold text-white text-sm">Step 3: Practical Mission Builds</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Build real projects in your VS Code workspace.</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold ${stepStatus.practicalsDone ? 'badge-blue' : 'badge-slate'}`}>
                    {stepStatus.practicalsDone ? '✓ Builds Complete' : 'Builds Pending'}
                  </span>
                </div>

                {!Array.isArray(week.practicalMissions) || week.practicalMissions.length === 0 ? (
                  <div className="card text-center py-8">
                    <Target className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-xs text-slate-500">No standalone practical missions for this week. Use the Tasks checklist.</p>
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {week.practicalMissions.map((m) => {
                      const missionRecord = practicalMissions[m.missionId];
                      const missionStatus = missionRecord?.status || 'Available';
                      const isReq = missionRequiresEvidence(m);

                      return (
                        <div key={m.missionId} className={`card flex flex-col justify-between gap-4 ${
                          missionStatus === 'Completed' ? 'border-accent-primary/25 bg-accent-primary/5' :
                          missionStatus === 'In Progress' ? 'border-amber-500/20' : 'border-navy-400'
                        }`}>
                          <div className="space-y-2">
                            <div className="flex justify-between items-start flex-wrap gap-2">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                {isReq && <span className="badge-slate text-xs">Required</span>}
                                {m.commanderMode && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-xs px-1.5 py-0.5 rounded">Commander</span>}
                              </div>
                              <span className={`text-[13px] px-2 py-0.5 rounded-full font-bold border ${STATUS_COLORS[missionStatus] || 'badge-slate'}`}>
                                {missionStatus}
                              </span>
                            </div>

                            <h4 className="font-bold text-white text-sm">{m.title}</h4>
                            <p className="text-xs text-slate-600 font-mono">Ref: {m.missionId}</p>

                            <div className="flex items-center gap-3 text-[13px] text-slate-500 flex-wrap">
                              {m.skillFocus && <span> {m.skillFocus}</span>}
                              {m.timeEstimate && <span>⏱ {m.timeEstimate}</span>}
                              {m.difficulty && <span className="capitalize">{m.difficulty}</span>}
                            </div>

                            {m.elliotRelevance && (
                              <p className="text-[13px] text-accent-cyan/80 italic line-clamp-2">"{m.elliotRelevance}"</p>
                            )}
                          </div>

                          <button
                            onClick={() => navigate(`/mission/${m.missionId}`)}
                            className="btn-primary py-2 text-xs text-center font-bold"
                          >
                            {missionStatus === 'Completed' ? '✓ View Details' : 'Open Mission Workspace →'}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* PROOF TAB */}
        {activeTab === 'proof' && (
          <div className="space-y-4">
            {!stepStatus.proofUnlocked ? (
              <InlineLockCard
                title="Proof of Work is locked"
                message="Complete all required practical missions first."
                missingLabel="Complete all required practical missions (Step 3)."
                nextActionLabel="Go to Practical Missions"
                onNextAction={() => setActiveTab('practicals')}
              />
            ) : (
              <div className="card border-navy-400">
                <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">Step 4: Submission Evidence</h3>
                <p className="text-xs text-slate-500 mb-4">Submit GitHub repository evidence to verify real-world build completion.</p>

                <form onSubmit={handleSaveProof} className="space-y-3">
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">GitHub Repository Link *</label>
                    <input
                      type="url" placeholder="https://github.com/..."
                      value={proofLocal.githubRepoLink}
                      onChange={(e) => setProofLocal(p => ({ ...p, githubRepoLink: e.target.value }))}
                      className="input-base w-full text-sm font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">GitHub Commit Link *</label>
                    <input
                      type="url" placeholder="https://github.com/.../commit/..."
                      value={proofLocal.githubCommitLink}
                      onChange={(e) => setProofLocal(p => ({ ...p, githubCommitLink: e.target.value }))}
                      className="input-base w-full text-sm font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 mb-1 block">Screenshot / Note Reference</label>
                    <input
                      type="text" placeholder="e.g. screenshot saved to ~/Desktop/week7-complete.png"
                      value={proofLocal.screenshotNote}
                      onChange={(e) => setProofLocal(p => ({ ...p, screenshotNote: e.target.value }))}
                      className="input-base w-full text-sm"
                    />
                  </div>

                  <div className="grid sm:grid-cols-2 gap-2 pt-1">
                    {[
                      { key: 'readmeCompleted', label: 'README completed' },
                      { key: 'reflectionCompleted', label: 'Reflection written' },
                    ].map(({ key, label }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setProofLocal(p => ({ ...p, [key]: !p[key] }))}
                        className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                          proofLocal[key]
                            ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                            : 'bg-navy-800 border-navy-400 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${proofLocal[key] ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'}`}>
                          {proofLocal[key] && <CheckCircle2 className="w-3 h-3 text-accent-primary" />}
                        </div>
                        {label}
                      </button>
                    ))}
                  </div>

                  <div className="flex justify-end gap-3 items-center pt-2 border-t border-navy-400/50">
                    {proofSaved && <span className="text-xs text-accent-primary font-semibold">Proof Saved ✓</span>}
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-6 text-xs"
                    >
                      Submit Proof
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* REFLECTION TAB */}
        {activeTab === 'reflection' && (
          <div className="space-y-4">
            {!stepStatus.reflectionUnlocked ? (
              <InlineLockCard
                title="Reflection is locked"
                message="Submit your proof of work first."
                missingLabel="Submit proof of work (Step 4)."
                nextActionLabel="Go to Proof of Work"
                onNextAction={() => setActiveTab('proof')}
              />
            ) : (
              <div className="card border-navy-400">
                <h3 className="font-bold text-white text-sm mb-1 uppercase tracking-wide">Step 5: Operational Reflection</h3>
                <p className="text-xs text-slate-500 mb-4">Cement your understanding by articulating what you built and learned.</p>

                <form onSubmit={handleSaveReflection} className="space-y-4">
                  <textarea
                    rows={5}
                    value={refAns}
                    onChange={(e) => setRefAns(e.target.value)}
                    placeholder="What was the most important concept you learned this week? How does this skill push you closer to building Elliot V1?"
                    className="input-base w-full text-sm"
                    required
                  />
                  <div className="flex justify-end gap-2 items-center">
                    {reflectionSaved && <span className="text-xs text-accent-primary font-semibold">Reflection saved!</span>}
                    <button
                      type="submit"
                      className="btn-primary py-2.5 px-6 text-xs"
                    >
                      Save Reflection
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}

        {/* UNLOCK NEXT WEEK TAB (Step 6) */}
        {activeTab === 'unlock' && (
          <div className="space-y-4">
            {!stepStatus.weekCompleteUnlocked ? (
              <InlineLockCard
                title="Unlock Next Week is locked"
                message="Complete your weekly reflection first."
                missingLabel="Save reflection (Step 5)."
                nextActionLabel="Go to Reflection"
                onNextAction={() => setActiveTab('reflection')}
              />
            ) : (
              <div className="card text-center py-8 space-y-4 border-accent-primary/20 bg-accent-primary/5">
                {!isComplete ? (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-accent-primary mx-auto animate-bounce" />
                    <h3 className="font-bold text-white text-base">Step 6: Unlock Week {week.weekNumber + 1}</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      All criteria have been successfully met! You are ready to close this week's operations and unlock the next phase.
                    </p>
                    <button
                      onClick={handleMarkWeekComplete}
                      className="btn-primary py-3 px-8 text-xs font-bold shadow-primary-glow max-w-xs mx-auto flex items-center justify-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Complete Week {week.weekNumber}
                    </button>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-12 h-12 text-blue-400 mx-auto" />
                    <h3 className="font-bold text-white text-base">Week Completed</h3>
                    <p className="text-xs text-slate-400">
                      Operations for Week {week.weekNumber} are fully complete. Future content is unlocked.
                    </p>
                    {selectedWeekNum < allWeeks.length && (
                      <button
                        onClick={goToNext}
                        className="btn-primary py-3 px-8 text-xs font-bold max-w-xs mx-auto"
                      >
                        Advance to Week {selectedWeekNum + 1}
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* ALL TASKS TAB */}
        {activeTab === 'tasks' && (
          <div className="card">
            <h3 className="text-xs font-bold text-white mb-4 uppercase tracking-wider">Weekly Task Checklist</h3>
            {!Array.isArray(week.tasks) || week.tasks.length === 0 ? (
              <p className="text-xs text-slate-500">No tasks listed for this week.</p>
            ) : (
              <div className="space-y-2">
                {week.tasks.map((task, idx) => {
                  const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                  const taskStr = typeof task === 'string' ? task : (task.text || task.title || String(task));
                  const isCommander = taskStr.toLowerCase().includes('[commander]') || taskStr.toLowerCase().includes('(optional)');

                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                      className={`w-full flex items-center gap-3 p-3.5 rounded-xl border text-left transition-all ${
                        done
                          ? 'bg-accent-primary/5 border-accent-primary/20 text-slate-500'
                          : 'bg-navy-800 border-navy-450 hover:border-navy-300 text-white'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${done ? 'border-accent-primary bg-accent-primary/25' : 'border-navy-300'}`}>
                        {done && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className={`text-xs ${done ? 'line-through' : ''}`}>{taskStr}</span>
                        {isCommander && <span className="ml-2 text-xs text-purple-400 font-bold">[Commander Mode]</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
      </>
      )}
    </PageShell>
  );
}
