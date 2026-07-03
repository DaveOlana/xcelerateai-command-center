import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChevronLeft, ChevronRight, CheckCircle2, Circle, ExternalLink,
  Printer, BookOpen, Target, Lock, ShieldAlert, Play, Pause,
  Coffee, ChevronRight as ChevronRightIcon, AlertTriangle, FileText,
  Zap, Clock, Database, Clipboard, CheckSquare, ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  getWeekStepStatus, getUnknownWeekFields, isWeekAccessible,
  getRequiredResources, missionRequiresEvidence
} from '../utils/unlockChecker';
import { cleanDifficultyLabel } from '../utils/safeRender';

import { PageShell, PageHeader, SectionCard, StatCard, ProgressBar, StatusBadge, LockWarningCard, EmptyState } from '../components/common/UIComponents';
import StatusBanner from '../components/ui/StatusBanner';
import InlineStatus from '../components/ui/InlineStatus';
import LoadingIndicator from '../components/ui/LoadingIndicator';

// Collapsible helper component for supporting details sidebar
function CollapsibleSection({ title, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className="card p-0 bg-transparent border-none shadow-none rounded-none overflow-hidden transition-all duration-200 border-b border-navy-700/30">
      <button
        onClick={() => setIsOpen(!isOpen)}
        type="button"
        className="w-full flex items-center justify-between py-4 text-[11px] font-bold text-slate-400 uppercase tracking-widest hover:text-white text-left transition-colors"
      >
        <span>{title}</span>
        <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${isOpen ? '' : '-rotate-90'}`} />
      </button>
      {isOpen && (
        <div className="pb-5 pt-1 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

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
    timerHistory, blockers, notes,
  } = useApp();

  const navigate = useNavigate();

  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;

  const allWeeks = useMemo(() => {
    const list = [];
    roadmap?.months?.forEach((m) => {
      m.weeks?.forEach((w) => list.push({ week: w, month: m }));
    });
    return list;
  }, [roadmap]);

  const [selectedWeekNum, setSelectedWeekNum] = useState(settings.activeWeek);
  const currentEntry = allWeeks.find((e) => e.week.weekNumber === selectedWeekNum);

  // Sync/setup step states helper
  const getInitialStep = React.useCallback((status, isDone) => {
    if (!status.resourcesDone) return 'resources';
    if (!status.skillCheckDone) return 'skillcheck';
    if (!status.practicalsDone) return 'practicals';
    if (!status.proofDone) return 'proof';
    if (!status.reflectionDone) return 'reflection';
    return 'unlock';
  }, []);

  const [activeTab, setActiveTab] = useState('resources');

  // Skill check local states
  const [skillAns, setSkillAns] = useState('');
  const [skillConf, setSkillConf] = useState(3);

  // Loading & Feedback States
  const [completeError, setCompleteError] = useState('');
  const [isMarking, setIsMarking] = useState(false);
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
    const { week, month } = currentEntry;
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

    // Sync active step tab on load or week change
    const nextStatus = getWeekStepStatus({
      week, weekNum: week.weekNumber, monthNum: month.monthNumber,
      progress, resourcesStatus, skillChecks, practicalMissions,
      weekProofs, weekReflections, settings,
    });
    const weekDone = isWeekComplete(week.weekNumber);
    setActiveTab(getInitialStep(nextStatus, weekDone));
  }, [selectedWeekNum, currentEntry, progress, resourcesStatus, skillChecks, practicalMissions, weekProofs, weekReflections, settings, getInitialStep]);

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
  // Use the unified tasks array (includes practicalMissions merged in by normalizeWeek)
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
  // Support both scheduledSessions (new) and sessions (legacy)
  const sessions = week.scheduledSessions || week.sessions || [];

  // Safely extract skill check questions — may be:
  //   - An array of { id, question, expectedConcepts } (new schema)
  //   - An array of plain strings
  //   - A single string (old checkpoint)
  //   - An object with { prompt } (old schema)
  const skillCheckQuestions = Array.isArray(week.skillCheck)
    ? week.skillCheck
    : week.skillCheck
    ? [week.skillCheck]
    : Array.isArray(week.checkpoint)
    ? week.checkpoint
    : week.checkpoint
    ? [{ question: typeof week.checkpoint === 'string' ? week.checkpoint : (week.checkpoint?.prompt || '') }]
    : [];

  // Legacy single checkpoint text (for old overview card)
  const checkpointText = skillCheckQuestions.length > 0
    ? (typeof skillCheckQuestions[0] === 'string'
        ? skillCheckQuestions[0]
        : skillCheckQuestions[0]?.question || skillCheckQuestions[0]?.prompt || null)
    : null;

  // --- Handlers ---
  const handleMarkWeekComplete = () => {
    setCompleteError('');
    if (!settings.manualOverrideEnabled) {
      if (!stepStatus.resourcesDone && Array.isArray(requiredResources) && requiredResources.length > 0) {
        setCompleteError('Study all required resources before completing this week.');
        return;
      }
      if (week.checkpoint && !stepStatus.skillCheckDone) {
        setCompleteError('Complete the Skill Check before marking this week complete.');
        return;
      }
      if (!stepStatus.practicalsDone && Array.isArray(week.practicalMissions) && week.practicalMissions.length > 0) {
        setCompleteError('Complete all required practical missions before completing this week.');
        return;
      }
      if (!stepStatus.proofDone) {
        setCompleteError('Submit proof of work (GitHub links + checklist) before completing this week.');
        return;
      }
      if (!stepStatus.reflectionDone) {
        setCompleteError('Write your weekly reflection before completing this week.');
        return;
      }
    }
    setIsMarking(true);
    setTimeout(() => {
      markWeekComplete(week.weekNumber);
      setIsMarking(false);
    }, 600);
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

  const getStepStatusDetails = (stepId) => {
    const isActive = activeTab === stepId;
    let isCompleted = false;
    let isLocked = false;

    switch (stepId) {
      case 'resources':
        isCompleted = stepStatus.resourcesDone;
        isLocked = false;
        break;
      case 'skillcheck':
        isCompleted = stepStatus.skillCheckDone;
        isLocked = !stepStatus.skillCheckUnlocked;
        break;
      case 'practicals':
        isCompleted = stepStatus.practicalsDone;
        isLocked = !stepStatus.practicalsUnlocked;
        break;
      case 'proof':
        isCompleted = stepStatus.proofDone;
        isLocked = !stepStatus.proofUnlocked;
        break;
      case 'reflection':
        isCompleted = stepStatus.reflectionDone;
        isLocked = !stepStatus.reflectionUnlocked;
        break;
      case 'unlock':
        isCompleted = isComplete;
        isLocked = !stepStatus.weekCompleteUnlocked;
        break;
      default:
        break;
    }

    if (isActive) return 'active';
    if (isCompleted) return 'completed';
    if (isLocked) return 'locked';
    
    // Check needs attention
    if (stepId === 'practicals') {
      const activeBlockers = blockers.filter(b => b.weekNumber === week.weekNumber && b.status !== 'Solved');
      if (activeBlockers.length > 0) return 'needs_attention';
    }

    return 'available';
  };

  const steps = [
    { id: 'resources', label: 'Study', icon: BookOpen },
    { id: 'skillcheck', label: 'Skill Check', icon: CheckSquare },
    { id: 'practicals', label: 'Build', icon: Target },
    { id: 'proof', label: 'Proof', icon: FileText },
    { id: 'reflection', label: 'Reflect', icon: Zap },
    { id: 'unlock', label: 'Unlock', icon: CheckCircle2 },
  ];

  return (
    <PageShell className="relative">
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
                className="bg-navy-700/80 border border-navy-450 text-slate-350 font-bold py-2 rounded-xl hover:text-white transition-all text-xs uppercase tracking-wider"
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
            className="bg-navy-700/80 border border-navy-450 text-slate-300 font-bold px-4 py-2 rounded-xl hover:text-white hover:border-accent-primary/30 transition-all text-[13px] uppercase tracking-wider active:scale-95 flex items-center gap-1.5 no-print"
          >
            <Printer className="w-3.5 h-3.5" /> Print Week Checklist
          </button>
        }
      />

      {/* ── WEEK QUICK SELECTOR ── */}
      <div className="flex items-center gap-3 no-print mb-6">
        <button onClick={goToPrev} disabled={selectedWeekNum <= 1} className="btn-secondary p-2 disabled:opacity-40">
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex-1 overflow-x-auto no-scrollbar">
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
                      : 'bg-navy-700 text-slate-400 border-navy-450 hover:border-navy-300'
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
          {/* ── WEEK HEADER ── */}
          <div className="card mb-6">
            <div className="flex items-start justify-between gap-4 flex-wrap mb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap mb-2">
                  {isComplete ? (
                    <span className="badge-green">Completed</span>
                  ) : (
                    <span className="badge-slate">In Progress</span>
                  )}
                  <span className="text-xs text-slate-450 font-medium">Week {selectedWeekNum} of {allWeeks.length}</span>
                </div>
                <h2 className="text-xl font-bold text-white">{week.title}</h2>
                <p className="text-[13px] text-slate-450 font-medium mt-1">Ref: W{String(week.weekNumber).padStart(2, '0')} · Month {month.monthNumber}</p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-2xl font-bold text-accent-primary">{taskPercent}%</p>
                <p className="text-xs text-slate-500">{doneTasksCount}/{totalTasksCount} tasks complete</p>
              </div>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${taskPercent}%` }} />
            </div>

            {/* Briefing Outcome of the Week */}
            {week.briefing && (
              <div className="mt-4 pt-4 border-t border-navy-700/40">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Week Briefing</span>
                <p className="text-xs text-slate-300 leading-relaxed">{week.briefing}</p>
              </div>
            )}
          </div>

          {/* ── STAGE PROGRESS STEPPER ── */}
          <div className="w-full bg-navy-850 border border-navy-700/20 rounded-2xl p-4 no-print mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Learning Stage Stepper</span>
              <div className="flex items-center gap-1.5 overflow-x-auto pb-2 md:pb-0 no-scrollbar w-full md:w-auto">
                {steps.map((s, idx) => {
                  const stepStatusVal = getStepStatusDetails(s.id);
                  const Icon = s.icon;
                  
                  let statusStyle = "";
                  let iconColor = "";
                  let isClickable = true;

                  if (stepStatusVal === 'active') {
                    statusStyle = "bg-brand-amber/15 border-brand-amber text-white shadow-brand-amber/5";
                    iconColor = "text-brand-amber";
                  } else if (stepStatusVal === 'completed') {
                    statusStyle = "bg-emerald-500/10 border-emerald-500/30 text-emerald-450 hover:bg-emerald-500/20";
                    iconColor = "text-emerald-400";
                  } else if (stepStatusVal === 'needs_attention') {
                    statusStyle = "bg-brand-red/10 border-brand-red/35 text-brand-red animate-pulse";
                    iconColor = "text-brand-red";
                  } else if (stepStatusVal === 'locked') {
                    statusStyle = "bg-navy-900 border-navy-800 text-slate-650 cursor-not-allowed opacity-55";
                    iconColor = "text-slate-650";
                    isClickable = false;
                  } else {
                    // available
                    statusStyle = "bg-navy-800 border-navy-650 text-slate-350 hover:border-navy-500 hover:text-white";
                    iconColor = "text-slate-400";
                  }

                  return (
                    <React.Fragment key={s.id}>
                      <button
                        disabled={!isClickable && !settings.manualOverrideEnabled}
                        onClick={() => setActiveTab(s.id)}
                        className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold border transition-all whitespace-nowrap active:scale-95 ${statusStyle}`}
                      >
                        {stepStatusVal === 'completed' ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
                        )}
                        <span>{s.label}</span>
                      </button>
                      {idx < steps.length - 1 && (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-700 flex-shrink-0 hidden md:block" />
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── MAIN CONTENT GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Active Stage Panel (Left Column) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* STUDY STAGE */}
              {activeTab === 'resources' && (
                <div className="card space-y-4">
                  <div className="flex justify-between items-start gap-4 flex-wrap border-b border-navy-700/30 pb-4">
                    <div>
                      <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 1</span>
                      <h3 className="text-base font-bold text-white mt-1">Study Core Resources</h3>
                      <p className="text-xs text-slate-400 mt-1">Review the following reference materials to prepare for the skill checks and practical builds.</p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                      stepStatus.resourcesDone ? 'bg-emerald-500/10 text-emerald-455 border-emerald-500/25' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20 animate-pulse'
                    }`}>
                      {stepStatus.resourcesDone ? 'All Studied' : 'Study Pending'}
                    </span>
                  </div>

                  {(() => {
                    const weekResources =
                      Array.isArray(week.studyResources) && week.studyResources.length > 0
                        ? week.studyResources
                        : Array.isArray(week.resources) && week.resources.length > 0
                        ? week.resources
                        : [];

                    const hasSkillCheck = skillCheckQuestions.length > 0;
                    const hasStudyResources = weekResources.length > 0;

                    return (
                      <div className="space-y-4">
                        {hasSkillCheck && !hasStudyResources && (
                          <div className="p-4 bg-brand-amber/5 border border-brand-amber/20 rounded-xl text-xs text-brand-amber flex items-start gap-2.5">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            <span>This Skill Check may reference material not covered by supplied Study Resources.</span>
                          </div>
                        )}

                        {weekResources.length === 0 ? (
                          <div className="p-6 bg-navy-850 rounded-2xl border border-navy-700/20 text-center">
                            <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                            <p className="text-xs text-slate-400 font-medium">No Study Resources were supplied for this week.</p>
                          </div>
                        ) : (
                          <div className="grid md:grid-cols-2 gap-4">
                            {weekResources.map((res, idx) => {
                              const status = resourcesStatus[res.title] || 'Not Started';
                              const isRequired = requiredResources.some(r => r.title === res.title);
                              const teachesTags = Array.isArray(res.teaches) ? res.teaches : [];
                              const timeLabel = res.estimatedTime || res.timeEstimate || null;
                              const purposeText = res.purpose || res.whatToExpect || null;

                              return (
                                <div key={idx} className={`bg-navy-850/40 p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-200 ${
                                  status === 'Studied' ? 'border-emerald-500/20 bg-emerald-500/5' :
                                  status === 'Studying' ? 'border-accent-primary/25 bg-accent-primary/5' : 'border-navy-700/20'
                                }`}>
                                  <div className="space-y-3">
                                    <div className="flex items-center justify-between gap-2 flex-wrap">
                                      <div className="flex items-center gap-1.5 flex-wrap">
                                        <span className="bg-navy-900 text-[10px] text-slate-400 font-bold border border-navy-750 px-2 py-0.5 rounded uppercase tracking-wider">{res.type || 'Resource'}</span>
                                        {res.difficulty && <span className="bg-navy-900 text-[10px] text-slate-450 font-bold border border-navy-750 px-2 py-0.5 rounded capitalize">{cleanDifficultyLabel(res.difficulty)}</span>}
                                        {isRequired && <span className="bg-accent-primary/10 text-[10px] text-accent-primary font-bold border border-accent-primary/25 px-2 py-0.5 rounded">Required</span>}
                                      </div>
                                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                                        status === 'Studied' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        status === 'Studying' ? 'bg-accent-primary/10 text-accent-primary border-accent-primary/20 animate-pulse' :
                                        'bg-navy-900 text-slate-500 border-navy-750'
                                      }`}>
                                        {status}
                                      </span>
                                    </div>

                                    <h4 className="font-bold text-white text-[15px] leading-snug">{res.title}</h4>
                                    
                                    {timeLabel && (
                                      <p className="text-xs text-slate-450 font-medium flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {timeLabel}
                                      </p>
                                    )}

                                    {purposeText && (
                                      <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">{purposeText}</p>
                                    )}

                                    {teachesTags.length > 0 && (
                                      <div className="flex flex-wrap gap-1.5 pt-1">
                                        {teachesTags.map((tag, ti) => (
                                          <span key={ti} className="text-[10px] font-semibold px-2 py-0.5 bg-accent-primary/5 text-accent-primary/80 border border-accent-primary/15 rounded">
                                            {tag}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>

                                  <div className="grid grid-cols-2 gap-2 pt-3 border-t border-navy-800/40">
                                    <a
                                      href={res.url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="btn-secondary py-2 px-2 text-xs text-center flex items-center justify-center gap-1 font-bold"
                                    >
                                      <ExternalLink className="w-3.5 h-3.5" /> Link
                                    </a>

                                    {status === 'Not Started' && (
                                      <button
                                        onClick={() => updateResourceStatus(res.title, 'Studying')}
                                        className="btn-secondary py-2 text-xs text-brand-amber border-brand-amber/20 hover:bg-brand-amber/5 font-bold"
                                      >
                                        Study
                                      </button>
                                    )}
                                    {status === 'Studying' && (
                                      <button
                                        onClick={() => updateResourceStatus(res.title, 'Studied')}
                                        className="btn-primary py-2 text-xs font-bold"
                                      >
                                        Mark Done
                                      </button>
                                    )}
                                    {status === 'Studied' && (
                                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl py-2 text-xs text-center flex items-center justify-center gap-1 font-bold">
                                        <CheckCircle2 className="w-3.5 h-3.5" /> Done
                                      </div>
                                    )}

                                    <button
                                      onClick={() => handleTakeNote(res)}
                                      className="col-span-2 btn-secondary py-1.5 text-xs text-slate-400 hover:text-white flex items-center justify-center gap-1"
                                    >
                                      <FileText className="w-3.5 h-3.5" /> Add Note
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SKILL CHECK STAGE */}
              {activeTab === 'skillcheck' && (
                <div className="card space-y-4">
                  <div className="border-b border-navy-700/30 pb-4">
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 2</span>
                    <h3 className="text-base font-bold text-white mt-1">Readiness Skill Check</h3>
                    <p className="text-xs text-slate-400 mt-1">Self-assess your understanding of this week's subjects before diving into project work.</p>
                  </div>

                  {!stepStatus.skillCheckUnlocked ? (
                    <InlineLockCard
                      title="Skill Check Locked"
                      message="Study the required week resources first to unlock this readiness check."
                      missingLabel="Required Study Resources pending completion."
                      nextActionLabel="Go to Study Stage"
                      onNextAction={() => setActiveTab('resources')}
                    />
                  ) : (
                    <div className="space-y-4">
                      {/* Honesty Fallback Warnings */}
                      {skillCheckQuestions.length === 0 ? (
                        <div className="p-6 bg-navy-850 rounded-2xl border border-navy-700/20 text-center">
                          <CheckSquare className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-medium">No skill check was supplied for this week.</p>
                          <button
                            onClick={() => {
                              submitSkillCheck(week.weekNumber, { explanation: 'Self-confirmed readiness' }, 5, true);
                              setSkillCheckSaved(true);
                            }}
                            className="btn-primary py-2 px-5 text-xs font-bold mt-4"
                          >
                            Confirm Readiness
                          </button>
                        </div>
                      ) : (
                        <form onSubmit={handleSaveSkillCheck} className="space-y-5">
                          <div className="p-4 bg-navy-800 border border-navy-700/30 rounded-xl text-xs text-slate-450 leading-relaxed">
                            <p className="font-bold text-slate-350">Notice:</p>
                            <p className="mt-1">Answer in your own words. Automated answer validation is not available yet.</p>
                          </div>

                          {/* Reverse Skill Check Resources Check Warning */}
                          {(!week.studyResources || week.studyResources.length === 0) && (
                            <div className="p-4 bg-brand-amber/5 border border-brand-amber/20 rounded-xl text-xs text-brand-amber flex items-start gap-2.5">
                              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                              <span>This Skill Check may reference material not covered by supplied Study Resources.</span>
                            </div>
                          )}

                          {skillCheckQuestions.filter(Boolean).map((q, qi) => {
                            const questionText = typeof q === 'string' ? q : (q?.question || q?.prompt || q?.text || '');
                            const answerType = typeof q === 'object' ? (q?.answerType || 'text') : 'text';
                            const qOptions = typeof q === 'object' && Array.isArray(q?.options) ? q.options : [];
                            const isFirstQ = qi === 0;

                            return (
                              <div key={qi} className="p-4 bg-navy-850/50 border border-navy-750 rounded-2xl space-y-3">
                                <label className="text-xs font-bold text-white block">Q{qi + 1}: {questionText}</label>

                                {typeof q === 'object' && Array.isArray(q?.expectedConcepts) && q.expectedConcepts.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pb-1">
                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mr-1 mt-0.5">Focus:</span>
                                    {q.expectedConcepts.map((concept, ci) => (
                                      <span key={ci} className="text-[10px] px-2 py-0.5 bg-navy-800 border border-navy-700 text-slate-450 rounded font-semibold">{concept}</span>
                                    ))}
                                  </div>
                                )}

                                {isFirstQ && answerType === 'multiple_choice' && qOptions.length > 0 ? (
                                  <div className="space-y-2 pt-1">
                                    {qOptions.map((opt, oi) => {
                                      const optLabel = typeof opt === 'string' ? opt : (opt?.label || opt?.text || opt?.value || String(oi));
                                      const optValue = typeof opt === 'string' ? opt : (opt?.value || opt?.label || String(oi));
                                      return (
                                        <label key={oi} className="flex items-center gap-2.5 text-xs text-slate-350 cursor-pointer hover:text-white transition-colors">
                                          <input
                                            type="radio"
                                            name={`skill-q-${qi}`}
                                            value={optValue}
                                            checked={skillAns === optValue}
                                            onChange={(e) => setSkillAns(e.target.value)}
                                            className="accent-accent-primary flex-shrink-0"
                                          />
                                          {optLabel}
                                        </label>
                                      );
                                    })}
                                  </div>
                                ) : isFirstQ ? (
                                  <textarea
                                    rows={4}
                                    value={skillAns}
                                    onChange={(e) => setSkillAns(e.target.value)}
                                    placeholder="Explain your understanding or document findings..."
                                    className="input-base w-full text-xs"
                                    required
                                  />
                                ) : null}
                              </div>
                            );
                          })}

                          <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-navy-750">
                            <div>
                              <label className="text-[11px] font-bold text-slate-450 uppercase tracking-widest block mb-1">Confidence (1–5)</label>
                              <input
                                type="range" min="1" max="5" value={skillConf}
                                onChange={(e) => setSkillConf(Number(e.target.value))}
                                className="w-full accent-accent-primary"
                              />
                              <div className="flex justify-between text-[11px] font-mono text-slate-500 mt-1">
                                <span>1: Guessing</span><span>3: Moderate</span><span>5: Decent Mastery</span>
                              </div>
                            </div>

                            <div className="flex gap-3 items-center justify-end">
                              {skillCheckSaved && <span className="text-xs text-accent-primary font-bold">Progress Saved</span>}
                              <button type="submit" className="btn-primary py-2.5 px-6 text-xs font-bold">
                                Save readiness
                              </button>
                            </div>
                          </div>
                        </form>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* BUILD STAGE */}
              {activeTab === 'practicals' && (
                <div className="card space-y-4">
                  <div className="flex justify-between items-start gap-4 flex-wrap border-b border-navy-700/30 pb-4">
                    <div>
                      <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 3</span>
                      <h3 className="text-base font-bold text-white mt-1">Practical Mission Builds</h3>
                      <p className="text-xs text-slate-400 mt-1">Write code and verify features locally within your workspace.</p>
                    </div>
                    <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${
                      stepStatus.practicalsDone ? 'bg-emerald-500/10 text-emerald-450 border-emerald-500/25' : 'bg-brand-amber/10 text-brand-amber border-brand-amber/20 animate-pulse'
                    }`}>
                      {stepStatus.practicalsDone ? 'Builds Complete' : 'Builds Pending'}
                    </span>
                  </div>

                  {!stepStatus.practicalsUnlocked ? (
                    <InlineLockCard
                      title="Build Stage Locked"
                      message="Complete the Skill Check first to verify readiness."
                      missingLabel="Readiness Skill Check pending completion."
                      nextActionLabel="Go to Skill Check"
                      onNextAction={() => setActiveTab('skillcheck')}
                    />
                  ) : (
                    <div className="space-y-4">
                      {!Array.isArray(week.practicalMissions) || week.practicalMissions.length === 0 ? (
                        <div className="p-6 bg-navy-850 rounded-2xl border border-navy-700/20 text-center">
                          <Target className="w-8 h-8 text-slate-650 mx-auto mb-2" />
                          <p className="text-xs text-slate-400 font-medium">No practical mission was supplied for this stage.</p>
                        </div>
                      ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                          {week.practicalMissions.map((m) => {
                            const missionRecord = practicalMissions[m.missionId];
                            const missionStatus = missionRecord?.status || 'Available';
                            const isReq = missionRequiresEvidence(m);

                            return (
                              <div key={m.missionId} className={`bg-navy-850/40 p-5 rounded-2xl border flex flex-col justify-between gap-4 transition-all duration-200 ${
                                missionStatus === 'Completed' ? 'border-accent-primary/25 bg-accent-primary/5' :
                                missionStatus === 'In Progress' ? 'border-brand-amber/20 bg-brand-amber/5' : 'border-navy-700/20'
                              }`}>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-start gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {isReq && <span className="bg-navy-900 text-[10px] text-slate-450 border border-navy-750 px-2 py-0.5 rounded font-bold uppercase tracking-wider">Required</span>}
                                      {m.commanderMode && <span className="bg-purple-500/10 text-purple-400 border border-purple-500/20 text-[10px] px-2 py-0.5 rounded font-bold">Commander</span>}
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${STATUS_COLORS[missionStatus] || 'badge-slate'}`}>
                                      {missionStatus}
                                    </span>
                                  </div>

                                  <h4 className="font-bold text-white text-sm leading-snug">{m.title}</h4>
                                  <p className="text-[10px] text-slate-500 font-mono">ID: {m.missionId}</p>

                                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-medium pt-1">
                                    {m.skillFocus && (
                                      <span className="flex items-center gap-1">
                                        <Target className="w-3.5 h-3.5 text-slate-500" /> {m.skillFocus}
                                      </span>
                                    )}
                                    {m.timeEstimate && (
                                      <span className="flex items-center gap-1">
                                        <Clock className="w-3.5 h-3.5 text-slate-500" /> {m.timeEstimate}
                                      </span>
                                    )}
                                    {m.difficulty && <span className="capitalize">{cleanDifficultyLabel(m.difficulty)}</span>}
                                  </div>

                                  {m.elliotRelevance && (
                                    <p className="text-[12px] text-accent-cyan/85 italic leading-relaxed pt-1">"{m.elliotRelevance}"</p>
                                  )}
                                </div>

                                <button
                                  onClick={() => navigate(`/mission/${m.missionId}`)}
                                  className="w-full btn-primary py-2.5 text-xs text-center font-bold"
                                >
                                  {missionStatus === 'Completed' ? 'View Workspace Details' : 'Open Workspace'}
                                </button>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* PROOF STAGE */}
              {activeTab === 'proof' && (
                <div className="card space-y-4">
                  <div className="border-b border-navy-700/30 pb-4">
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 4</span>
                    <h3 className="text-base font-bold text-white mt-1">Submission Evidence</h3>
                    <p className="text-xs text-slate-400 mt-1">Submit links to your GitHub repository and commits to verify build milestones.</p>
                  </div>

                  {!stepStatus.proofUnlocked ? (
                    <InlineLockCard
                      title="Proof of Work Locked"
                      message="Complete all practical missions to unlock the submission step."
                      missingLabel="Required practical build missions pending completion."
                      nextActionLabel="Go to Build Stage"
                      onNextAction={() => setActiveTab('practicals')}
                    />
                  ) : (
                    <div>
                      {(() => {
                        const delivers = week.deliverable || null;
                        const requiresProof = true; // Always show submission inputs in the stepper tab

                        return (
                          <form onSubmit={handleSaveProof} className="space-y-4">
                            {delivers && (
                              <div className="p-4 bg-navy-800 border border-navy-700/30 rounded-xl text-xs text-slate-350">
                                <p className="font-bold text-white uppercase tracking-wider text-[10px] mb-1">Expected Deliverable:</p>
                                <p className="italic">"{delivers}"</p>
                              </div>
                            )}

                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">GitHub Repository Link *</label>
                              <input
                                type="url" placeholder="https://github.com/username/project"
                                value={proofLocal.githubRepoLink}
                                onChange={(e) => setProofLocal(p => ({ ...p, githubRepoLink: e.target.value }))}
                                className="input-base w-full text-xs font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">GitHub Commit Link *</label>
                              <input
                                type="url" placeholder="https://github.com/username/project/commit/abcdef..."
                                value={proofLocal.githubCommitLink}
                                onChange={(e) => setProofLocal(p => ({ ...p, githubCommitLink: e.target.value }))}
                                className="input-base w-full text-xs font-mono"
                                required
                              />
                            </div>

                            <div>
                              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest block mb-1">Screenshot / Location Reference</label>
                              <input
                                type="text" placeholder="e.g. screenshot saved to ~/Desktop/week-checkpoint.png"
                                value={proofLocal.screenshotNote}
                                onChange={(e) => setProofLocal(p => ({ ...p, screenshotNote: e.target.value }))}
                                className="input-base w-full text-xs"
                              />
                            </div>

                            <div className="grid sm:grid-cols-2 gap-3 pt-2">
                              {[
                                { key: 'readmeCompleted', label: 'README updated with description' },
                                { key: 'reflectionCompleted', label: 'Completed checklist verification' },
                              ].map(({ key, label }) => (
                                <button
                                  key={key}
                                  type="button"
                                  onClick={() => setProofLocal(p => ({ ...p, [key]: !p[key] }))}
                                  className={`flex items-center gap-3 p-3.5 rounded-xl border text-left text-xs font-bold transition-all ${
                                    proofLocal[key]
                                      ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                                      : 'bg-navy-800 border-navy-700/40 text-slate-400 hover:text-white'
                                  }`}
                                >
                                  <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${proofLocal[key] ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-500'}`}>
                                    {proofLocal[key] && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                                  </div>
                                  <span>{label}</span>
                                </button>
                              ))}
                            </div>

                            <div className="flex justify-end gap-3 items-center pt-4 border-t border-navy-750">
                              {proofSaved && <span className="text-xs text-accent-primary font-bold">Proof Submitted</span>}
                              <button
                                type="submit"
                                className="btn-primary py-2.5 px-6 text-xs font-bold"
                              >
                                Submit Proof
                              </button>
                            </div>
                          </form>
                        );
                      })()}
                    </div>
                  )}
                </div>
              )}

              {/* REFLECTION STAGE */}
              {activeTab === 'reflection' && (
                <div className="card space-y-4">
                  <div className="border-b border-navy-700/30 pb-4">
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 5</span>
                    <h3 className="text-base font-bold text-white mt-1">Operational Reflection</h3>
                    <p className="text-xs text-slate-400 mt-1">Solidify concepts by summarizing challenges met and outcomes achieved.</p>
                  </div>

                  {!stepStatus.reflectionUnlocked ? (
                    <InlineLockCard
                      title="Reflection Locked"
                      message="Submit proof of work links first before writing your reflection."
                      missingLabel="Proof of Work submission pending."
                      nextActionLabel="Go to Proof Stage"
                      onNextAction={() => setActiveTab('proof')}
                    />
                  ) : (
                    <div className="space-y-4">
                      {week.reflectionPrompts && week.reflectionPrompts.length > 0 && (
                        <div className="bg-navy-850 p-4 rounded-xl border border-navy-700/30">
                          <h4 className="text-xs font-bold text-accent-cyan uppercase tracking-wider mb-2">Prompt Questions:</h4>
                          <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                            {week.reflectionPrompts.map((p, idx) => (
                              <li key={idx}>{p}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <form onSubmit={handleSaveReflection} className="space-y-4">
                        <textarea
                          rows={5}
                          value={refAns}
                          onChange={(e) => setRefAns(e.target.value)}
                          placeholder="What did you build? What was challenging? What will you study next?"
                          className="input-base w-full text-xs"
                          required
                        />

                        <div className="flex justify-end gap-3 items-center pt-2">
                          {reflectionSaved && <span className="text-xs text-accent-primary font-bold">Reflection Saved</span>}
                          <button
                            type="submit"
                            className="btn-primary py-2.5 px-6 text-xs font-bold"
                          >
                            Save Reflection
                          </button>
                        </div>
                      </form>
                    </div>
                  )}
                </div>
              )}

              {/* UNLOCK STAGE */}
              {activeTab === 'unlock' && (
                <div className="card space-y-4">
                  <div className="border-b border-navy-700/30 pb-4">
                    <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Stage 6</span>
                    <h3 className="text-base font-bold text-white mt-1">Unlock Next Week</h3>
                    <p className="text-xs text-slate-400 mt-1">Complete operations for the active week and advance to the next set of goals.</p>
                  </div>

                  {!stepStatus.weekCompleteUnlocked ? (
                    <InlineLockCard
                      title="Unlock Stage Locked"
                      message="Complete your weekly reflection first to proceed."
                      missingLabel="Weekly Reflection pending completion."
                      nextActionLabel="Go to Reflection Stage"
                      onNextAction={() => setActiveTab('reflection')}
                    />
                  ) : (
                    <div className="text-center py-6 space-y-5">
                      {!isComplete ? (
                        <>
                          <div className="w-14 h-14 bg-accent-primary/10 border border-accent-primary/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-7 h-7 text-accent-primary" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">All Requirements Met!</h3>
                            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mt-2">
                              Great work! You have finished studying, completed check questions, built milestones, submitted links, and saved your reflections.
                            </p>
                          </div>
                          <button
                            onClick={handleMarkWeekComplete}
                            disabled={isMarking}
                            className="btn-primary py-3 px-8 text-xs font-bold max-w-xs mx-auto flex items-center justify-center gap-1.5 disabled:opacity-50"
                          >
                            {isMarking ? (
                              <LoadingIndicator label="Marking complete..." size="sm" />
                            ) : (
                              <>
                                <CheckCircle2 className="w-4 h-4" /> Complete Week {week.weekNumber}
                              </>
                            )}
                          </button>
                          {completeError && (
                            <StatusBanner type="error" message={completeError} onClose={() => setCompleteError('')} className="max-w-md mx-auto" />
                          )}
                        </>
                      ) : (
                        <>
                          <div className="w-14 h-14 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
                            <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                          </div>
                          <div>
                            <h3 className="font-bold text-white text-base">Week Completed Successfully</h3>
                            <p className="text-xs text-slate-400 mt-2">
                              Operations for Week {week.weekNumber} are fully verified. All next week milestones are now accessible.
                            </p>
                          </div>
                          <div className="flex gap-3 justify-center pt-2">
                            {selectedWeekNum < allWeeks.length ? (
                              <button
                                onClick={goToNext}
                                className="btn-primary py-2.5 px-6 text-xs font-bold"
                              >
                                Advance to Week {selectedWeekNum + 1}
                              </button>
                            ) : (
                              <button
                                onClick={() => navigate('/')}
                                className="btn-secondary py-2.5 px-6 text-xs font-bold"
                              >
                                Return to Dashboard
                              </button>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Supporting Details Panel (Right Sidebar) */}
            <div className="space-y-6">
              
              {/* Checklist Section */}
              <CollapsibleSection title="All Tasks Checklist">
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
                          className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                            done
                              ? 'bg-accent-primary/5 border-accent-primary/10 text-slate-500'
                              : 'bg-navy-800 border-navy-700/40 hover:border-navy-600 text-white'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 mt-0.5 rounded border flex items-center justify-center flex-shrink-0 ${done ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-500'}`}>
                            {done && <CheckCircle2 className="w-2.5 h-2.5 text-accent-primary" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs leading-normal ${done ? 'line-through text-slate-500' : 'text-slate-350'}`}>{taskStr}</p>
                            {isCommander && <span className="inline-block mt-1 text-[9px] text-purple-400 font-bold uppercase tracking-wider">[Commander Mode]</span>}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </CollapsibleSection>

              {/* Blockers Section */}
              <CollapsibleSection title={`Open Blockers (${blockers.filter(b => b.weekNumber === week.weekNumber && b.status !== 'Solved').length})`} defaultOpen={false}>
                {(() => {
                  const weekBlockers = blockers.filter(b => b.weekNumber === week.weekNumber && b.status !== 'Solved');
                  return (
                    <div className="space-y-3">
                      {weekBlockers.length === 0 ? (
                        <p className="text-xs text-slate-500">No open blockers for this week.</p>
                      ) : (
                        <div className="space-y-2">
                          {weekBlockers.map((b) => (
                            <div key={b.id} className="p-3 bg-red-500/5 border border-red-500/10 rounded-xl text-xs flex justify-between items-center gap-2">
                              <div className="min-w-0 flex-1">
                                <p className="font-bold text-white truncate">{b.title}</p>
                                <p className="text-[10px] text-slate-550 truncate mt-0.5">{b.errorMessage || 'No error logs'}</p>
                              </div>
                              <button onClick={() => navigate('/blockers')} className="text-red-400 hover:text-red-300 font-bold text-[10px] flex-shrink-0">
                                Solve
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate('/today')}
                        className="w-full btn-secondary py-2 text-xs font-bold border-red-500/20 text-red-450 hover:bg-red-500/5 text-center flex items-center justify-center gap-1.5"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" /> Log Blocker
                      </button>
                    </div>
                  );
                })()}
              </CollapsibleSection>

              {/* Deliverables Section */}
              <CollapsibleSection title="Week Objective" defaultOpen={false}>
                <div className="space-y-3 text-xs text-slate-350 leading-relaxed">
                  {week.briefing ? (
                    <p>{week.briefing}</p>
                  ) : (
                    <p className="text-slate-550 italic">No briefing details supplied.</p>
                  )}
                  {week.elliotConnection && (
                    <div className="bg-accent-cyan/5 border border-accent-cyan/10 rounded-xl p-3 mt-2 text-slate-350">
                      <p className="text-accent-cyan font-bold uppercase tracking-wider text-[10px] mb-1">{roadmapShortTitle} Connection</p>
                      <p className="leading-relaxed">{week.elliotConnection}</p>
                    </div>
                  )}
                </div>
              </CollapsibleSection>

              {/* Notes Section */}
              <CollapsibleSection title="Weekly Notes" defaultOpen={false}>
                {(() => {
                  const weekNotes = notes.filter(n => n.linkedWeek === week.weekNumber);
                  return (
                    <div className="space-y-3">
                      {weekNotes.length === 0 ? (
                        <p className="text-xs text-slate-500">No notes written for this week yet.</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                          {weekNotes.map((n, idx) => (
                            <div key={idx} className="p-2.5 bg-navy-800/60 border border-navy-700/30 rounded-xl text-xs">
                              <p className="font-bold text-white truncate">{n.title}</p>
                              <p className="text-slate-450 line-clamp-2 mt-1 leading-normal">{n.content || n.whatILearned}</p>
                            </div>
                          ))}
                        </div>
                      )}
                      <button
                        onClick={() => navigate('/notes')}
                        className="w-full btn-secondary py-2 text-xs font-bold text-slate-450 hover:text-white text-center"
                      >
                        Open Notes Journal
                      </button>
                    </div>
                  );
                })()}
              </CollapsibleSection>

            </div>

          </div>
        </>
      )}
    </PageShell>
  );
}
