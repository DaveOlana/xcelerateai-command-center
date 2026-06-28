import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { getActiveWeekData } from '../utils/progressCalculator';
import {
  CheckCircle2, Target, BookOpen, AlertCircle, Copy, HelpCircle,
  FileText, Clock, Play, Pause, RotateCcw, Coffee, ShieldAlert,
  ChevronRight, ToggleLeft, ToggleRight, X, Terminal, ExternalLink
} from 'lucide-react';
import { getItemTitle } from '../utils/safeRender';
import { PageShell, SectionCard, InfoPill, StatusBadge, CommandButton, SecondaryButton, EmptyState } from '../components/common/UIComponents';

export default function TodaysFocus() {
  const navigate = useNavigate();
  const {
    roadmap,
    progress,
    settings,
    toggleTask,
    isTaskComplete,
    sessionTimer,
    startTimer,
    pauseTimer,
    resumeTimer,
    startBreakTimer,
    resetTimer,
    acknowledgeExpiredPrompt,
    addBlocker,
    addNote,
    blockers,
    practicalMissions,
    notes,
    userProfile,
    weekProofs,
    weekReflections,
    skillChecks,
  } = useApp();

  const mentorName = settings?.mentorName || roadmap?.mentorLabel || 'Mentor';

  // Three session states: 'before' | 'during' | 'after'
  const [sessionState, setSessionState] = useState('before');
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('xai_today_focus_mode') || 'command';
  });
  const [sessionCompletedSummary, setSessionCompletedSummary] = useState(null);
  const [sessionRefText, setSessionRefText] = useState('');
  const [sessionRefSaved, setSessionRefSaved] = useState(false);
  const [selectedSessionIndex, setSelectedSessionIndex] = useState(0);

  // Quick notes state
  const [quickNote, setQuickNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  // Blocker Modal Form State
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerError, setBlockerError] = useState('');
  const [blockerTried, setBlockerTried] = useState('');

  // Mode Selection State
  const [focusMode, setFocusMode] = useState(() => {
    return localStorage.getItem('xai_today_focus_mode') || 'focus';
  });

  const handleToggleMode = (mode) => {
    setFocusMode(mode);
    localStorage.setItem('xai_today_focus_mode', mode);
  };

  const [selectedFocusBlockId, setSelectedFocusBlockId] = useState(() => {
    return localStorage.getItem('xai_today_focus_selected_block') || '';
  });

  const handleSelectFocusBlock = (id) => {
    setSelectedFocusBlockId(id);
    localStorage.setItem('xai_today_focus_selected_block', id);
  };

  // 1. Determine active week number
  const activeWeekNumber = React.useMemo(() => {
    // Priority 1: Explicit active week from settings or progress
    if (settings?.activeWeek) return Number(settings.activeWeek);
    if (progress?.activeWeek) return Number(progress.activeWeek);

    // Helpers to search all weeks
    const getWeeksFromContainer = (container) => {
      if (!container) return [];
      const fields = ['weeks', 'modules', 'weeklyMissions', 'missions', 'weekly_missions'];
      for (const field of fields) {
        if (Array.isArray(container[field])) return container[field];
      }
      return [];
    };

    const getAllWeeks = (r) => {
      if (!r) return [];
      let wList = getWeeksFromContainer(r);
      if (wList.length > 0) return wList;
      const monthsFields = ['months', 'phases', 'stages', 'quarters'];
      for (const mField of monthsFields) {
        if (Array.isArray(r[mField])) {
          for (const m of r[mField]) {
            const mWeeks = getWeeksFromContainer(m);
            if (mWeeks.length > 0) wList.push(...mWeeks);
          }
        }
      }
      return wList;
    };

    const allWeeks = getAllWeeks(roadmap);

    // Priority 2: Current week from roadmap progress calculation (start date based)
    if (settings?.startDate) {
      const start = new Date(settings.startDate);
      const now = new Date();
      const diffMs = now - start;
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      const bDay = Math.max(0, diffDays + 1);
      const calcWeek = Math.ceil(bDay / 7);
      
      const exists = allWeeks.some(w => {
        const wn = w.weekNumber ?? w.week_number ?? w.number ?? w.id;
        return wn !== undefined && Number(wn) === calcWeek;
      });
      if (exists) return calcWeek;
    }

    // Priority 3: First incomplete week
    if (allWeeks.length > 0) {
      const completedWeeks = progress?.completedWeeks || [];
      const firstIncomplete = allWeeks.find(w => {
        const wn = w.weekNumber ?? w.week_number ?? w.number ?? w.id;
        return wn !== undefined && !completedWeeks.includes(Number(wn));
      });
      if (firstIncomplete) {
        const wn = firstIncomplete.weekNumber ?? firstIncomplete.week_number ?? firstIncomplete.number ?? firstIncomplete.id;
        return Number(wn);
      }
    }

    // Priority 4: First available week as fallback
    if (allWeeks.length > 0) {
      const firstW = allWeeks[0];
      const wn = firstW.weekNumber ?? firstW.week_number ?? firstW.number ?? firstW.id;
      if (wn !== undefined) return Number(wn);
    }

    return null;
  }, [roadmap, progress, settings]);

  // 2. Fetch the active week data
  const activeData = React.useMemo(() => {
    if (!activeWeekNumber) return null;
    return getActiveWeekData(roadmap, activeWeekNumber);
  }, [roadmap, activeWeekNumber]);

  // 3. Build the View Model
  const vm = React.useMemo(() => {
    if (!roadmap) {
      return {
        hasRoadmap: false,
        hasWeek: false,
        emptyStateMessage: "No active roadmap loaded. Import a roadmap to begin."
      };
    }
    if (!activeData || !activeData.week) {
      return {
        hasRoadmap: true,
        hasWeek: false,
        emptyStateMessage: "No active week found for this roadmap."
      };
    }

    const { week, month } = activeData;
    const learnerName = userProfile?.displayName?.trim() || userProfile?.name?.trim() || 'Operator';
    const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
    const roadmapSubtitle = roadmap?.subtitle || roadmap?.description || roadmap?.bootcampDescription || '';
    const activeMonthTitle = month?.title || month?.name || (month?.monthNumber ? `Month ${month.monthNumber}` : '') || 'Month 1';
    const activeWeekTitle = week?.title || week?.name || (activeWeekNumber ? `Week ${activeWeekNumber}` : '') || 'Active Week';
    const activeWeekObjective = week?.objective || week?.briefing || week?.description || 'No objective supplied for this week.';
    const activePhase = week?.phase || month?.phase || '';
    const currentPositionLabel = `Month ${month?.monthNumber || 1} · Week ${activeWeekNumber || 1}`;
    
    // Resolve study resources
    const rawResources = week.resources ?? week.studyResources ?? week.learningResources ?? week.materials ?? week.docs ?? [];
    const studyResources = (Array.isArray(rawResources) ? rawResources : [rawResources])
      .map((res, idx) => {
        if (!res) return null;
        if (typeof res === 'string') {
          return { title: res, url: '', durationMinutes: 45, type: 'Study Resource' };
        }
        return {
          title: res.title || res.name || res.label || `Resource ${idx + 1}`,
          url: res.url || res.link || res.href || '',
          durationMinutes: Number(res.durationMinutes || res.duration || res.time || 45),
          type: res.type || 'Study Resource'
        };
      })
      .filter(r => r && r.title && r.title.trim().toLowerCase() !== 'untitled' && r.title.toLowerCase() !== 'undefined' && r.title.toLowerCase() !== 'null');

    // Resolve build tasks / practical missions
    const rawBuild = week.practicalMissions ?? week.practicalTasks ?? week.buildTasks ?? week.milestones ?? week.tasks ?? week.checklist ?? [];
    const buildTasks = (Array.isArray(rawBuild) ? rawBuild : [rawBuild])
      .map((task, idx) => {
        if (!task) return null;
        if (typeof task === 'string') {
          return { title: task, description: '', filesToCreate: [], idx };
        }
        return {
          title: task.title || task.name || task.label || task.task || task.objective || task.description || `Build Task ${idx + 1}`,
          description: task.description || task.briefing || '',
          filesToCreate: task.filesToCreate || task.files || [],
          idx
        };
      })
      .filter(t => t && t.title && t.title.trim().toLowerCase() !== 'untitled' && t.title.toLowerCase() !== 'undefined' && t.title.toLowerCase() !== 'null');

    // Resolve proof requirement
    const rawProof = week.proof ?? week.proofRequirement ?? week.evidence ?? week.deliverables ?? week.submission ?? week.proofOfWork ?? week.deliverable ?? null;
    const proofRequirement = rawProof ? (
      typeof rawProof === 'string' ? {
        description: rawProof,
        format: 'GitHub Repository and Commit Hash',
        githubRequired: true,
        readmeRequired: true
      } : {
        description: rawProof.description || rawProof.text || rawProof.instructions || rawProof.deliverable || 'Submit proof of completion.',
        format: rawProof.format || rawProof.expectedFormat || 'GitHub Repository and Commit Hash',
        githubRequired: rawProof.githubRequired ?? rawProof.github ?? true,
        readmeRequired: rawProof.readmeRequired ?? rawProof.readme ?? true
      }
    ) : null;

    // Resolve reflection prompt
    const reflectionPrompt = week.reflection ?? week.reflectionPrompt ?? week.journalPrompt ?? week.reviewPrompt ?? roadmap?.reflectionPrompt ?? "What did you learn, what blocked you, and what should you do next?";

    // Time and download estimates
    const timeBudgetEstimate = week.weeklyHours || week.hoursEstimated || "20-25 hours";
    const dataDownloadEstimate = week.downloadEstimate || week.downloadSize || "1-3GB";

    // Build the operational checklist
    const operationalChecklist = [];
    
    // Add raw tasks/milestones
    const rawTasksList = week.tasks || week.checklist || week.buildTasks || week.milestones || [];
    if (Array.isArray(rawTasksList)) {
      rawTasksList.forEach((task, idx) => {
        const title = getItemTitle(task);
        if (title && title.trim().toLowerCase() !== 'untitled' && title.toLowerCase() !== 'undefined' && title.toLowerCase() !== 'null') {
          operationalChecklist.push({
            id: `task-${idx}`,
            title,
            type: 'task',
            originalIndex: idx,
            done: isTaskComplete(month.monthNumber, activeWeekNumber, idx),
            action: 'toggle'
          });
        }
      });
    }

    // Add study resources to checklist
    studyResources.forEach((res, idx) => {
      const done = resourcesStatus?.[res.title] === 'Studied';
      operationalChecklist.push({
        id: `resource-${idx}`,
        title: `Study: ${res.title}`,
        type: 'resource',
        done,
        action: 'navigate',
        path: '/missions'
      });
    });

    // Add skill quiz to checklist
    const hasQuiz = !!(week.skillCheck ?? week.skillChecks ?? week.quiz ?? week.quizQuestion);
    if (hasQuiz) {
      const done = !!skillChecks?.[activeWeekNumber];
      operationalChecklist.push({
        id: 'quiz-task',
        title: 'Complete Skill Check Assessment',
        type: 'quiz',
        done,
        action: 'navigate',
        path: '/missions'
      });
    }

    // Add proof to checklist
    if (proofRequirement) {
      const done = !!(weekProofs?.[activeWeekNumber]?.githubRepoLink && weekProofs?.[activeWeekNumber]?.githubCommitLink && weekProofs?.[activeWeekNumber]?.readmeCompleted);
      operationalChecklist.push({
        id: 'proof-task',
        title: 'Submit Proof of Work',
        type: 'proof',
        done,
        action: 'navigate',
        path: '/proof'
      });
    }

    // Add reflection to checklist
    const doneReflection = !!weekReflections?.[activeWeekNumber];
    operationalChecklist.push({
      id: 'reflection-task',
      title: 'Submit Reflection Journal',
      type: 'reflection',
      done: doneReflection,
      action: 'navigate',
      path: '/missions'
    });

    // Filter out duplicates and invalid titles from operationalChecklist
    const seenTitles = new Set();
    const cleanChecklist = [];
    operationalChecklist.forEach(item => {
      const tClean = item.title?.trim();
      if (!tClean || tClean.toLowerCase() === 'untitled' || tClean.toLowerCase() === 'undefined' || tClean.toLowerCase() === 'null') return;
      if (seenTitles.has(tClean)) return;
      seenTitles.add(tClean);
      cleanChecklist.push(item);
    });

    // Resolve focus blocks dynamically
    const focusBlocks = [];
    
    if (studyResources.length > 0) {
      const totalMins = studyResources.reduce((acc, res) => acc + (res.durationMinutes || 45), 0);
      focusBlocks.push({
        id: 'study-resources',
        title: 'Study Resources Block',
        type: 'Study',
        durationMinutes: totalMins || 45,
        description: `Read and absorb ${studyResources.length} required study resource${studyResources.length > 1 ? 's' : ''}.`,
        sourceData: studyResources
      });
    }

    if (hasQuiz) {
      focusBlocks.push({
        id: 'skill-check',
        title: 'Skill Check Assessment',
        type: 'Skill Check',
        durationMinutes: 20,
        description: 'Validate key concepts from study materials with the automated quiz.',
        sourceData: week.skillCheck ?? week.quiz
      });
    }

    if (buildTasks.length > 0) {
      focusBlocks.push({
        id: 'practical-build',
        title: 'Practical Build Block',
        type: 'Build',
        durationMinutes: 90,
        description: `Implement the week's build tasks (${buildTasks.length} milestone items).`,
        sourceData: buildTasks
      });
    }

    if (proofRequirement) {
      focusBlocks.push({
        id: 'proof-submission',
        title: 'Debug & Submit Proof of Work',
        type: 'Proof',
        durationMinutes: 30,
        description: 'Double check local environment, link GitHub repository and submit verification commit.',
        sourceData: weekProofs?.[activeWeekNumber]
      });
    }

    focusBlocks.push({
      id: 'reflection-review',
      title: 'Reflection & Review',
      type: 'Reflection',
      durationMinutes: 15,
      description: 'Summarize experience, note blockers, and finalize weekly unlock.',
      sourceData: weekReflections?.[activeWeekNumber]
    });

    // Latest note
    let latestNote = [...(notes || [])]
      .filter(n => n.linkedItem === `Week ${activeWeekNumber}` || n.linkedWeek === activeWeekNumber || n.linkedWeek === String(activeWeekNumber))
      .sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];

    if (!latestNote && notes && notes.length > 0) {
      latestNote = [...notes].sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date))[0];
    }

    return {
      hasRoadmap: true,
      hasWeek: true,
      learnerName,
      roadmapTitle,
      roadmapSubtitle,
      activeMonth: month,
      activeMonthTitle,
      activeWeek: week,
      activeWeekNumber,
      activeWeekTitle,
      activeWeekObjective,
      activePhase,
      currentPositionLabel,
      studyResources,
      buildTasks,
      operationalChecklist: cleanChecklist,
      focusBlocks,
      proofRequirement,
      reflectionPrompt,
      timeBudgetEstimate,
      dataDownloadEstimate,
      latestNote
    };
  }, [activeData, activeWeekNumber, roadmap, userProfile, isTaskComplete, resourcesStatus, skillChecks, weekProofs, weekReflections, notes]);

  // Active blockers for this active week
  const activeWeekBlockers = React.useMemo(() => {
    if (!activeWeekNumber) return [];
    return (blockers || []).filter(
      (b) => b.weekNumber === activeWeekNumber && b.status !== 'Solved'
    );
  }, [blockers, activeWeekNumber]);

  // Selected Focus Block
  const selectedFocusBlock = React.useMemo(() => {
    if (!vm.focusBlocks || vm.focusBlocks.length === 0) return null;
    return vm.focusBlocks.find(b => b.id === selectedFocusBlockId) || vm.focusBlocks[0];
  }, [vm.focusBlocks, selectedFocusBlockId]);

  // Select study resource priority selection
  const mainResource = React.useMemo(() => {
    if (!vm.studyResources || vm.studyResources.length === 0) return null;
    const incomplete = vm.studyResources.find(r => resourcesStatus?.[r.title] !== 'Studied');
    if (incomplete) return incomplete;
    const active = vm.studyResources.find(r => resourcesStatus?.[r.title] === 'Studying');
    if (active) return active;
    return vm.studyResources[0];
  }, [vm.studyResources, resourcesStatus]);

  // Incomplete checklist targets for Focus Mode checklist view
  const incompleteFocusTasks = React.useMemo(() => {
    if (!vm.operationalChecklist) return [];
    return vm.operationalChecklist
      .filter(item => !item.done && item.type === 'task')
      .slice(0, 3);
  }, [vm.operationalChecklist]);

  const focusTasks = React.useMemo(() => {
    if (!vm.operationalChecklist) return [];
    return vm.operationalChecklist
      .filter(item => item.type === 'task')
      .slice(0, 3);
  }, [vm.operationalChecklist]);

  // Sync sessionState with timer updates
  useEffect(() => {
    if (sessionTimer.activeSessionId) {
      if (sessionTimer.showExpiredPrompt) {
        setSessionState('after');
        if (!sessionCompletedSummary) {
          setSessionCompletedSummary({
            title: sessionTimer.title,
            type: sessionTimer.type,
            durationMinutes: sessionTimer.durationMinutes,
            timeLeftSeconds: sessionTimer.timeLeftSeconds,
            completed: true
          });
        }
      } else {
        setSessionState('during');
      }
    } else if (sessionState === 'during') {
      setSessionState('before');
    }
  }, [sessionTimer.activeSessionId, sessionTimer.showExpiredPrompt]);

  // Break alert checking
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);

  useEffect(() => {
    if (!sessionTimer.isRunning || sessionTimer.isBreak) return;
    const maxSec = (sessionTimer.maxContinuousMinutes || 75) * 60;
    if (sessionTimer.accumulatedActiveSeconds >= maxSec) {
      setShowBreakPrompt(true);
    }
  }, [sessionTimer.accumulatedActiveSeconds, sessionTimer.isRunning, sessionTimer.isBreak, sessionTimer.maxContinuousMinutes]);

  const handleSaveQuickNote = (e) => {
    e.preventDefault();
    if (!quickNote) return;
    addNote({
      title: `Daily Note — Week ${vm.activeWeekNumber}`,
      type: 'Session Note',
      linkedItem: `Week ${vm.activeWeekNumber}`,
      linkedWeek: vm.activeWeekNumber,
      content: quickNote,
      whatILearned: quickNote,
      whatConfusedMe: 'None logged.',
      roadmapId: roadmap?.id || '',
      roadmapTitle: vm.roadmapTitle,
      selectedFocusBlock: selectedFocusBlock?.title || 'None',
      timestamp: new Date().toISOString()
    });
    setQuickNote('');
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleAddBlockerSubmit = (e) => {
    e.preventDefault();
    if (!blockerTitle) return;
    addBlocker({
      title: blockerTitle,
      weekNumber: vm.activeWeekNumber,
      skillArea: selectedFocusBlock?.type || 'General Focus',
      whatTryingToDo: `Daily focus study/build block: ${selectedFocusBlock?.title || 'None'}`,
      whatWentWrong: blockerTried,
      errorMessage: blockerError,
      whatAlreadyTried: blockerTried,
      roadmapId: roadmap?.id || '',
      roadmapTitle: vm.roadmapTitle,
      selectedFocusBlock: selectedFocusBlock?.title || 'None',
      timestamp: new Date().toISOString()
    });
    setBlockerTitle('');
    setBlockerError('');
    setBlockerTried('');
    setShowBlockerModal(false);
    alert('Blocker logged. Your progress status indicator is now flagged as blocked.');
  };

  // Ask Mentor Helper Generator
  const copyMentorHelpPrompt = () => {
    const activeBlocker = activeWeekBlockers[0] || (blockers || [])[0];
    const recentNote = vm.latestNote?.content || vm.latestNote?.whatLearned || "None recorded yet";
    const currentMission = vm.buildTasks?.[0];
    const missionTitle = currentMission ? currentMission.title : vm.activeWeekTitle;
    
    const filesToCreate = currentMission?.filesToCreate || [];
    const filesStr = filesToCreate.length > 0 ? filesToCreate.join(', ') : "Not specified";
    
    const errorStr = activeBlocker?.errorMessage || activeBlocker?.title || "No active error logged";
    const triedStr = activeBlocker?.whatAlreadyTried || activeBlocker?.whatWentWrong || "Reviewed documentation and code logs";
    const noteText = recentNote !== "None recorded yet" ? `Recent note: "${recentNote}"` : "";

    const promptText = `I am on Week ${vm.activeWeekNumber}, Mission "${missionTitle}" of the ${vm.roadmapTitle}. I am trying to build "${vm.proofRequirement?.description || "this week's milestones"}". I created these files: ${filesStr}. The error I got is: ${errorStr}. I have tried: ${triedStr}. ${noteText} Please help me debug this without giving me the full answer immediately.`;
    
    navigator.clipboard.writeText(promptText);
    alert(`Ask ${mentorName} debug prompt copied to clipboard!`);
  };

  // Timer format helpers
  const minutes = String(Math.floor(sessionTimer.timeLeftSeconds / 60)).padStart(2, '0');
  const seconds = String(sessionTimer.timeLeftSeconds % 60).padStart(2, '0');
  const timerProgress = sessionTimer.durationMinutes > 0 
    ? (sessionTimer.timeLeftSeconds / (sessionTimer.durationMinutes * 60)) * 100 
    : 100;

  const handleEndSessionEarly = () => {
    setSessionCompletedSummary({
      title: sessionTimer.title || 'Focus Session',
      type: sessionTimer.type || 'Focus Session',
      durationMinutes: sessionTimer.durationMinutes,
      timeLeftSeconds: sessionTimer.timeLeftSeconds,
      completed: false
    });
    setSessionState('after');
    pauseTimer();
  };

  const handleSaveAfterSessionReflection = (e) => {
    e.preventDefault();
    if (!sessionRefText) return;
    
    addNote({
      title: `Reflection: ${sessionCompletedSummary?.title || 'Daily Focus'}`,
      noteType: 'session_reflection',
      linkedWeek: vm.activeWeekNumber,
      linkedResource: sessionCompletedSummary?.title || '',
      whatLearned: sessionRefText,
      whatConfused: 'None logged.',
      whatBuilt: 'Completed focus session.',
      date: new Date().toISOString().split('T')[0],
    });

    setSessionRefSaved(true);
    setTimeout(() => {
      setSessionRefText('');
      setSessionRefSaved(false);
      setSessionCompletedSummary(null);
      resetTimer();
      setSessionState('before');
    }, 1500);
  };

  if (!vm.hasRoadmap) {
    return (
      <PageShell>
        <EmptyState
          message="No active roadmap loaded"
          submessage="Import a roadmap to begin."
          icon={AlertCircle}
          actionText="Import Roadmap"
          onActionClick={() => navigate('/import')}
        />
      </PageShell>
    );
  }

  if (!vm.hasWeek) {
    return (
      <PageShell>
        <EmptyState
          message="No active week found for this roadmap"
          submessage="Select a week in Settings or ensure a valid week exists in the loaded roadmap."
          icon={AlertCircle}
          actionText="Open Settings"
          onActionClick={() => navigate('/settings')}
        />
      </PageShell>
    );
  }

  const { week, month } = activeData;

  return (
    <PageShell>
      {/* ── Break Reminder Alert Modal ── */}
      {showBreakPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="card w-full max-w-md bg-navy-850 border border-amber-500/30 animate-scale-in text-center p-6 space-y-4 shadow-amber-glow">
            <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto">
              <Coffee className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white uppercase tracking-wider">Take a Break, Operator</h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                You've been studying for <span className="text-amber-400 font-bold">{Math.floor(sessionTimer.accumulatedActiveSeconds / 60)} minutes</span> continuously. Rest your eyes to optimize long-term memory.
              </p>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <CommandButton
                onClick={() => {
                  startBreakTimer(sessionTimer.recommendedBreakMinutes || 10);
                  setShowBreakPrompt(false);
                }}
                className="w-full bg-accent-cyan hover:bg-accent-cyan-dim"
              >
                Start {sessionTimer.recommendedBreakMinutes || 10} Min Break
              </CommandButton>
              <SecondaryButton onClick={() => setShowBreakPrompt(false)} className="w-full">
                Remind Me in 15 Min
              </SecondaryButton>
            </div>
          </div>
        </div>
      )}

      {/* ── HEADER ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 border-b border-navy-700/50 pb-6 mb-6 no-print">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-blue animate-pulse" />
            <span className="text-[10px] text-brand-blue font-bold tracking-widest uppercase">
              {sessionState === 'during' ? 'Focus Mode Active' : focusMode === 'focus' ? 'Focus Mode Active' : 'Detailed Command Mode'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Daily Focus Cockpit
          </h1>
          {sessionState !== 'during' && (
            <p className="text-slate-400 text-xs mt-2">
              {vm.learnerName}, today's focus is waiting. {vm.currentPositionLabel} Operations · {vm.activeWeekTitle}
            </p>
          )}
        </div>
        {/* Segmented Cockpit Switch Control */}
        {sessionState === 'before' && (
          <div className="flex items-center bg-navy-900 border border-navy-800 p-1 rounded-2xl self-stretch sm:self-auto justify-center">
            <button
              onClick={() => handleToggleMode('command')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                focusMode === 'command'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Command Mode
            </button>
            <button
              onClick={() => handleToggleMode('focus')}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                focusMode === 'focus'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Focus Mode
            </button>
          </div>
        )}
      </div>

      {/* ── STATE 1: BEFORE SESSION ── */}
      {sessionState === 'before' && focusMode === 'command' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {mode === 'command' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Main Configuration Card (2/3 width on desktop) */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Objective briefing */}
              <div className="card">
                <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-widest block mb-1">Today's Objective</span>
                <p className="text-sm text-slate-350 leading-relaxed font-medium">
                  {week.briefing || "Complete this week's lesson resources and test your readiness."}
                </p>
                {week.deliverable && (
                  <div className="bg-navy-900 border border-navy-750 p-4 rounded-xl mt-4">
                    <span className="text-[10px] text-brand-amber font-bold uppercase tracking-widest block mb-1">Proof Requirement</span>
                    <p className="text-xs text-slate-400 italic">"{week.deliverable}"</p>
                  </div>
                )}
              </div>

              {/* Target item / Focus resource */}
              <div className="card space-y-4">
                <div>
                  <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Current Task Target</span>
                  <h3 className="text-base font-bold text-white mt-1">Focus Study Materials</h3>
                </div>

                {mainResource ? (
                  <div className="bg-navy-800/50 border border-navy-700/30 p-5 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <span className="bg-navy-900 text-[10px] text-slate-450 border border-navy-750 px-2 py-0.5 rounded font-bold uppercase tracking-wider">{mainResource.type}</span>
                      <h4 className="font-bold text-white text-[15px] pt-1.5 leading-snug">{mainResource.title}</h4>
                      {mainResource.timeEstimate && (
                        <span className="text-xs text-slate-450 font-medium block mt-1">Estimated duration: {mainResource.timeEstimate}</span>
                      )}
                    </div>
                    <a
                      href={mainResource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-secondary py-2 px-4 text-xs font-bold whitespace-nowrap w-full sm:w-auto text-center"
                    >
                      Preview Resource
                    </a>
                  </div>
                ) : (
                  <div className="p-6 bg-navy-800/30 rounded-xl text-center border border-navy-700/10">
                    <BookOpen className="w-7 h-7 text-slate-650 mx-auto mb-1.5" />
                    <p className="text-xs text-slate-500">No resource was supplied for this focus session.</p>
                  </div>
                )}
              </div>

              {/* Focus Session Trigger and Scheduled Sessions list */}
              <div className="card space-y-4">
                <div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block">Select Focus Block</span>
                  <h3 className="text-base font-bold text-white mt-1">Start Focus Session</h3>
                </div>

                {week.scheduledSessions && week.scheduledSessions.length > 0 ? (
                  <div className="space-y-3">
                    <div className="grid sm:grid-cols-2 gap-3">
                      {week.scheduledSessions.map((session, sidx) => {
                        const title = session.title || session.name || `Focus Block ${sidx + 1}`;
                        const mins = session.durationMinutes || 45;
                        const isSelected = selectedSessionIndex === sidx;

                        return (
                          <button
                            key={sidx}
                            onClick={() => setSelectedSessionIndex(sidx)}
                            className={`p-4 rounded-xl border text-left flex flex-col justify-between gap-3 transition-all ${
                              isSelected
                                ? 'border-accent-primary bg-accent-primary/5 text-white'
                                : 'border-navy-700/30 bg-navy-850/30 text-slate-455 hover:border-navy-600'
                            }`}
                          >
                            <div>
                              <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">{session.type || 'Focus Session'}</span>
                              <span className="font-bold text-xs mt-1 block leading-snug truncate pr-2">{title}</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-slate-500">{mins} minutes</span>
                          </button>
                        );
                      })}
                    </div>

                    {(() => {
                      const sel = week.scheduledSessions[selectedSessionIndex] || week.scheduledSessions[0];
                      return (
                        <button
                          onClick={() => startTimer(
                            sel.sessionId || `session-${selectedSessionIndex}`,
                            sel.type || 'Focus Session',
                            sel.title || 'Focus Session',
                            sel.durationMinutes || 45,
                            75,
                            10
                          )}
                          className="w-full btn-primary py-3.5 text-xs font-bold text-center tracking-wider uppercase flex items-center justify-center gap-2 mt-4"
                        >
                          <Play className="w-3.5 h-3.5 fill-navy-900" /> Begin Focus Session ({sel.durationMinutes || 45}m)
                        </button>
                      );
                    })()}
                  </div>
                ) : (
                  <button
                    onClick={() => startTimer('daily-focus', 'Focus Session', 'Daily Focus Block', 45, 75, 10)}
                    className="w-full btn-primary py-3.5 text-xs font-bold text-center tracking-wider uppercase flex items-center justify-center gap-2 mt-2"
                  >
                    <Play className="w-3.5 h-3.5 fill-navy-900" /> Begin 45m Focus Session
                  </button>
                )}
              </div>

            </div>

            {/* Side Actions Panel (1/3 width on desktop) */}
            <div className="space-y-6">
              
              {/* Targets / Checklist */}
              <div className="card space-y-3">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Priority checklist</span>
                {focusTasks.length === 0 ? (
                  <p className="text-xs text-slate-500 italic">No tasks defined for this week.</p>
                ) : (
                  <div className="space-y-2">
                    {focusTasks.map((task, idx) => {
                      const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                      return (
                        <button
                          key={idx}
                          onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                          className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left text-xs transition-all ${
                            done
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                              : 'bg-navy-800 border-navy-700/40 text-white hover:border-navy-600'
                          }`}
                        >
                          <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${done ? 'border-emerald-500 bg-emerald-500/20' : 'border-navy-500'}`}>
                            {done && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-450" />}
                          </div>
                          <span className={`truncate flex-1 font-medium ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{getItemTitle(task)}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Quick Note capture */}
              <div className="card space-y-3">
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                  <span>Quick Note Capture</span>
                  {noteSaved && <span className="text-emerald-400 font-bold">Saved!</span>}
                </div>
                <form onSubmit={handleSaveQuickNote} className="space-y-3">
                  <textarea
                    rows={3}
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Record ideas, code configurations, or resolved errors..."
                    className="input-base w-full text-xs resize-none"
                    required
                  />
                  <SecondaryButton type="submit" disabled={!quickNote} className="w-full py-2 text-xs font-bold">
                    Save Note to Journal
                  </SecondaryButton>
                </form>
              </div>

              {/* Quick blocker logging */}
              <div className="card space-y-3">
                <div>
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Barriers & Help</span>
                  <p className="text-xs text-slate-400 mt-1 leading-normal">Encountering errors? Log a blocker or generate debugging prompts.</p>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowBlockerModal(true)}
                    className="w-full btn-secondary py-2 text-xs font-bold text-red-400 border-red-500/20 hover:bg-red-500/5 text-center"
                  >
                    Log Blocker
                  </button>
                  <button
                    onClick={copyMentorHelpPrompt}
                    className="w-full btn-secondary py-2 text-xs font-bold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5 text-center"
                  >
                    Ask {mentorName} Debug Prompt
                  </button>
                  <button
                    onClick={() => navigate('/missions')}
                    className="w-full btn-secondary py-2 text-xs font-semibold text-slate-450 hover:text-white text-center"
                  >
                    View Weekly Missions
                  </button>
                </div>
              </div>

            </div>
          </div>
        ) : (
          // Refined Focus Mode sequential flow
          <div className="max-w-2xl mx-auto space-y-6 py-4">
            <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-6 lg:p-7 space-y-6">
              <div className="border-b border-navy-750 pb-4">
                <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-widest block mb-1">Active Journey Path</span>
                <h2 className="text-base font-extrabold text-white">Focus Mode Sequence</h2>
                <p className="text-[12px] text-slate-450 mt-1">Complete your learning flow in order. Keep consistent.</p>
              </div>

              {/* Sequential Steps */}
              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-navy-750">
                {/* Step 1: Study Resources */}
                {(() => {
                  const rawResources = week.resources ?? week.studyResources ?? [];
                  const studyResources = Array.isArray(rawResources) ? rawResources : [rawResources];
                  const incompleteResource = studyResources.find(res => res && res.title && resourcesStatus?.[res.title] !== 'Studied');
                  const stepDone = !incompleteResource;
                  return (
                    <div className="flex gap-4 items-start relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 z-10 ${
                        stepDone ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-455' : 'bg-navy-900 border-navy-700 text-slate-455'
                      }`}>
                        {stepDone ? '✓' : '1'}
                      </div>
                      <div className="space-y-2 flex-1 pt-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Learn: Study Resources</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            stepDone ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-navy-900 text-slate-500'
                          }`}>
                            {stepDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-normal">
                          Read, digest, and complete the curriculum study materials for this week.
                        </p>
                        {studyResources.length > 0 && (
                          <div className="bg-navy-900/60 border border-navy-805 rounded-xl p-3 space-y-2 mt-2">
                            {studyResources.map((res, ri) => {
                              const done = res && res.title && resourcesStatus?.[res.title] === 'Studied';
                              return (
                                <div key={ri} className="flex justify-between items-center text-xs">
                                  <span className={`truncate flex-1 pr-2 ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{res.title}</span>
                                  <span className={`text-[10px] font-bold ${done ? 'text-emerald-455' : 'text-slate-500'}`}>{done ? 'Studied' : 'Pending'}</span>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        <button onClick={() => navigate('/missions')} className="text-xs text-brand-blue hover:text-white font-bold hover:underline transition-all block pt-1">
                          Open Curriculum Library →
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 2: Skill Checkpoints */}
                {(() => {
                  const hasQuiz = !!(week.skillCheck ?? week.skillChecks ?? week.quiz);
                  const quizDone = !!skillChecks?.[week.weekNumber];
                  const stepDone = !hasQuiz || quizDone;
                  return (
                    <div className="flex gap-4 items-start relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 z-10 ${
                        stepDone ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-455' : 'bg-navy-900 border-navy-700 text-slate-455'
                      }`}>
                        {stepDone ? '✓' : '2'}
                      </div>
                      <div className="space-y-2 flex-1 pt-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Validate: Skill Check</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            stepDone ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-navy-900 text-slate-500'
                          }`}>
                            {stepDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-normal">
                          Take the self-assessment Skill Check quiz to test your concept comprehension.
                        </p>
                        <button onClick={() => navigate('/missions')} className="text-xs text-brand-blue hover:text-white font-bold hover:underline transition-all block pt-1">
                          Take Skill Check Assessment →
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 3: Practical Missions */}
                {(() => {
                  const pmList = Array.isArray(week.practicalMissions) ? week.practicalMissions : [];
                  const incompletePM = pmList.find(pm => {
                    const pmId = pm.missionId || pm.id;
                    return practicalMissions?.[pmId]?.status !== 'Completed';
                  });
                  const stepDone = !incompletePM;
                  return (
                    <div className="flex gap-4 items-start relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 z-10 ${
                        stepDone ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-455' : 'bg-navy-900 border-navy-700 text-slate-455'
                      }`}>
                        {stepDone ? '✓' : '3'}
                      </div>
                      <div className="space-y-2 flex-1 pt-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Build: Practical Mission</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            stepDone ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-navy-900 text-slate-500'
                          }`}>
                            {stepDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-normal">
                          Build the core milestones and complete the practical programming tasks.
                        </p>
                        {pmList.length > 0 && (
                          <div className="bg-navy-900/60 border border-navy-805 rounded-xl p-3 space-y-2 mt-2">
                            {pmList.map((pm, pi) => {
                              const pmId = pm.missionId || pm.id;
                              const done = practicalMissions?.[pmId]?.status === 'Completed';
                              return (
                                <div key={pi} className="flex justify-between items-center text-xs">
                                  <span className={`truncate flex-1 pr-2 ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{pm.title || pm.name}</span>
                                  <button onClick={() => navigate(pm.missionId ? `/mission/${pm.missionId}` : '/missions')} className="text-[10px] font-bold text-brand-blue hover:underline">
                                    {done ? 'Review' : 'Build'}
                                  </button>
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* Step 4: Proof of Work */}
                {(() => {
                  const hasProof = !!(week.proof ?? week.proofRequirement ?? week.deliverable);
                  const proofSubmitted = !!(weekProofs?.[week.weekNumber]?.githubRepoLink && weekProofs?.[week.weekNumber]?.githubCommitLink && weekProofs?.[week.weekNumber]?.readmeCompleted);
                  const stepDone = !hasProof || proofSubmitted;
                  return (
                    <div className="flex gap-4 items-start relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 z-10 ${
                        stepDone ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-455' : 'bg-navy-900 border-navy-700 text-slate-455'
                      }`}>
                        {stepDone ? '✓' : '4'}
                      </div>
                      <div className="space-y-2 flex-1 pt-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Prove: Proof of Work</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            stepDone ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-navy-900 text-slate-500'
                          }`}>
                            {stepDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-normal">
                          Submit your GitHub repository and commit URL to verify your week deliverables.
                        </p>
                        <button onClick={() => navigate('/proof')} className="text-xs text-brand-blue hover:text-white font-bold hover:underline transition-all block pt-1">
                          Open Submission Deck →
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* Step 5: Reflection */}
                {(() => {
                  const reflectionDone = !!weekReflections?.[week.weekNumber];
                  const stepDone = reflectionDone;
                  return (
                    <div className="flex gap-4 items-start relative">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 z-10 ${
                        stepDone ? 'bg-emerald-500/10 border-emerald-500/35 text-emerald-455' : 'bg-navy-900 border-navy-700 text-slate-455'
                      }`}>
                        {stepDone ? '✓' : '5'}
                      </div>
                      <div className="space-y-2 flex-1 pt-0.5 min-w-0">
                        <div className="flex justify-between items-center gap-2">
                          <h4 className="text-xs font-bold text-white uppercase tracking-wider font-semibold">Reflect: Learning Journal</h4>
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            stepDone ? 'bg-emerald-500/10 text-emerald-455 border border-emerald-500/20' : 'bg-navy-900 text-slate-500'
                          }`}>
                            {stepDone ? 'Completed' : 'Pending'}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-400 leading-normal">
                          Document key take-aways and log a journal entry of what you built.
                        </p>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Start Timer anyway section */}
              <div className="pt-6 border-t border-navy-750 text-center">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Need a Focus Block?</span>
                <button
                  onClick={() => startTimer('daily-focus', 'Focus Session', 'Daily Focus Block', 45, 75, 10)}
                  className="w-full btn-primary py-3.5 text-xs font-bold text-center tracking-wider uppercase flex items-center justify-center gap-2"
                >
                  <Play className="w-3.5 h-3.5 fill-navy-900" /> Begin 45m Focus Session
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    )}

      {/* ── STATE 1: BEFORE SESSION (Focus Mode View) ── */}
      {sessionState === 'before' && focusMode === 'focus' && (
        <div className="max-w-4xl mx-auto space-y-12">
          {/* Phase 1: Learn */}
          <div className="space-y-5">
            <div className="flex items-center gap-4.5">
              <div className="w-9 h-9 rounded-full border-2 border-brand-cyan/50 text-brand-cyan text-sm font-black flex items-center justify-center flex-shrink-0 font-mono shadow-[0_0_15px_rgba(34,211,238,0.12)]">
                1
              </div>
              <div className="space-y-0.5">
                <span className="text-xs lg:text-[13px] text-brand-cyan font-extrabold uppercase tracking-wider block">Phase 1: Learn</span>
                <h3 className="text-xl lg:text-2xl font-black text-white mt-1 leading-tight">Study Daily Focus Materials</h3>
              </div>
            </div>

            {mainResource ? (
              <div className="bg-navy-900/30 border border-navy-800/80 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ml-12 lg:ml-[3.25rem]">
                <div className="space-y-2.5">
                  <span className="bg-navy-800 text-[11px] text-slate-350 border border-navy-700/50 px-3.5 py-1.5 rounded font-extrabold uppercase tracking-wider">
                    {mainResource.type || 'Official Docs'}
                  </span>
                  <h4 className="font-extrabold text-white text-lg lg:text-xl leading-snug">{mainResource.title}</h4>
                </div>
                {mainResource.url && (
                  <a
                    href={mainResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-xl bg-brand-blue text-white text-sm font-extrabold whitespace-nowrap hover:bg-brand-blue/90 transition-all flex items-center gap-2 justify-center w-full sm:w-auto shadow-md"
                  >
                    Open Resource
                  </a>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-550 italic ml-12 lg:ml-[3.25rem]">No study resource supplied for this week.</p>
            )}
          </div>

          {/* Phase 2: Build */}
          <div className="space-y-5">
            <div className="flex items-center gap-4.5">
              <div className="w-9 h-9 rounded-full border-2 border-brand-cyan/50 text-brand-cyan text-sm font-black flex items-center justify-center flex-shrink-0 font-mono shadow-[0_0_15px_rgba(34,211,238,0.12)]">
                2
              </div>
              <div className="space-y-0.5">
                <span className="text-xs lg:text-[13px] text-brand-cyan font-extrabold uppercase tracking-wider block">Phase 2: Build</span>
                <h3 className="text-xl lg:text-2xl font-black text-white mt-1 leading-tight">Milestone Checklist & Focus Timer</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ml-12 lg:ml-[3.25rem]">
              {/* Left side: Checklist and Build Tasks */}
              <div className="lg:col-span-2 space-y-6">
                <div>
                  <span className="text-xs text-slate-555 font-extrabold uppercase tracking-wider block mb-1.5">Daily Priority Checklist</span>
                  {incompleteFocusTasks.length === 0 ? (
                    <div className="p-5 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl text-sm text-slate-400 font-medium">
                      All priority checklist items completed! Ready for the next phase.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {incompleteFocusTasks.map(({ id, title, originalIndex }) => (
                        <button
                          key={id}
                          onClick={() => toggleTask(month.monthNumber, week.weekNumber, originalIndex)}
                          className="w-full flex items-center justify-between gap-4 p-5 bg-navy-900/30 border border-navy-800/80 hover:border-navy-700/60 text-white rounded-2xl text-left transition-all hover:bg-navy-900/40 animate-fade-in"
                        >
                          <div className="flex items-center gap-3.5">
                            <div className="w-4.5 h-4.5 rounded border border-navy-500 flex items-center justify-center flex-shrink-0" />
                            <span className="font-bold text-slate-200 text-sm lg:text-[15px]">{title}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Practical Mission / Build Tasks */}
                {vm.buildTasks && vm.buildTasks.length > 0 ? (
                  <div className="pt-4 border-t border-navy-800/40">
                    <span className="text-xs text-slate-555 font-extrabold uppercase tracking-wider block mb-2.5">Build Task Details</span>
                    <div className="space-y-3">
                      {vm.buildTasks.map((bt, btIdx) => (
                        <div key={btIdx} className="bg-navy-950/20 border border-navy-850 p-4 rounded-xl space-y-2">
                          <h5 className="text-sm font-bold text-white">{bt.title}</h5>
                          {bt.description && (
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">{bt.description}</p>
                          )}
                          {bt.filesToCreate && bt.filesToCreate.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 pt-1">
                              {bt.filesToCreate.map((f, fIdx) => (
                                <span key={fIdx} className="text-[10px] font-mono bg-navy-900 border border-navy-800 text-brand-cyan px-2 py-0.5 rounded">
                                  {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-navy-800/40">
                    <span className="text-xs text-slate-555 font-extrabold uppercase tracking-wider block mb-2">Build Task Details</span>
                    <p className="text-xs text-slate-550 italic">No build task supplied for this week.</p>
                  </div>
                )}
              </div>

              {/* Right side: Start Focus Block */}
              <div className="lg:col-span-1 bg-navy-900/30 border border-navy-800/80 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-sm">
                <div>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block text-center border-b border-navy-800/40 pb-3 mb-4">
                    Focus Blocks
                  </span>
                  
                  {vm.focusBlocks && vm.focusBlocks.length > 0 ? (
                    <div className="space-y-2">
                      {vm.focusBlocks.map((block) => {
                        const isSelected = selectedFocusBlock?.id === block.id;
                        return (
                          <button
                            key={block.id}
                            onClick={() => handleSelectFocusBlock(block.id)}
                            className={`w-full flex justify-between items-center p-3.5 border text-left rounded-xl transition-all font-bold text-xs ${
                              isSelected
                                ? 'bg-brand-blue/10 border-brand-blue text-white shadow-blue-glow'
                                : 'bg-navy-950/20 border-navy-800 hover:border-navy-700 text-slate-300 hover:bg-navy-950/30'
                            }`}
                          >
                            <span className="truncate pr-2">{block.title}</span>
                            <span className="text-xs font-mono font-bold text-slate-400 flex-shrink-0">{block.durationMinutes}m</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-550 italic text-center">No focus blocks available.</p>
                  )}

                  {selectedFocusBlock && (
                    <button
                      onClick={() => {
                        startTimer(
                          selectedFocusBlock.id,
                          selectedFocusBlock.type,
                          selectedFocusBlock.title,
                          selectedFocusBlock.durationMinutes,
                          75,
                          10
                        );
                      }}
                      className="w-full mt-4 btn-primary py-3.5 text-sm font-bold text-center uppercase tracking-wider flex items-center justify-center gap-2 active:scale-[0.98]"
                    >
                      <Play className="w-3.5 h-3.5 fill-navy-900" /> Begin {selectedFocusBlock.durationMinutes}m Session
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Phase 3: Prove */}
          <div className="space-y-5">
            <div className="flex items-center gap-4.5">
              <div className="w-9 h-9 rounded-full border-2 border-brand-cyan/50 text-brand-cyan text-sm font-black flex items-center justify-center flex-shrink-0 font-mono shadow-[0_0_15px_rgba(34,211,238,0.12)]">
                3
              </div>
              <div className="space-y-0.5">
                <span className="text-xs lg:text-[13px] text-brand-cyan font-extrabold uppercase tracking-wider block">Phase 3: Prove</span>
                <h3 className="text-xl lg:text-2xl font-black text-white mt-1 leading-tight">Validate Learning Results</h3>
              </div>
            </div>

            {vm.proofRequirement ? (
              <div className="bg-navy-900/30 border border-navy-800/80 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ml-12 lg:ml-[3.25rem]">
                <div className="space-y-2.5 max-w-xl">
                  <span className="text-xs text-brand-amber font-extrabold uppercase tracking-wider block">Deliverable Instructions</span>
                  <p className="text-slate-200 text-sm lg:text-[15px] font-bold leading-relaxed font-mono">"{vm.proofRequirement.description}"</p>
                  <div className="flex flex-wrap gap-4 pt-1.5 text-xs text-slate-400 font-semibold">
                    {vm.proofRequirement.format && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-amber" />
                        Format: {vm.proofRequirement.format}
                      </span>
                    )}
                    {vm.proofRequirement.githubRequired && (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-brand-cyan" />
                        GitHub Commit Required
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => navigate('/proof')}
                  className="px-6 py-3.5 rounded-xl text-sm font-black bg-brand-amber text-navy-900 hover:bg-brand-amber/90 transition-all whitespace-nowrap w-full sm:w-auto text-center active:scale-[0.98]"
                >
                  Submit Proof
                </button>
              </div>
            ) : (
              <div className="ml-12 lg:ml-[3.25rem] space-y-3 bg-navy-900/10 border border-navy-850 p-6 rounded-2xl">
                <p className="text-xs text-slate-500 italic">No proof requirement supplied for this stage.</p>
                <button
                  onClick={() => navigate('/proof')}
                  className="px-4 py-2 rounded-lg text-xs font-bold bg-navy-800 border border-navy-700 text-slate-400 hover:text-white"
                >
                  Submit Proof (Optional)
                </button>
              </div>
            )}
          </div>

          {/* Phase 4: Reflect */}
          <div className="space-y-5">
            <div className="flex items-center gap-4.5">
              <div className="w-9 h-9 rounded-full border-2 border-brand-cyan/50 text-brand-cyan text-sm font-black flex items-center justify-center flex-shrink-0 font-mono shadow-[0_0_15px_rgba(34,211,238,0.12)]">
                4
              </div>
              <div className="space-y-0.5">
                <span className="text-xs lg:text-[13px] text-brand-cyan font-extrabold uppercase tracking-wider block">Phase 4: Reflect</span>
                <h3 className="text-xl lg:text-2xl font-black text-white mt-1 leading-tight">Document Experience & Capture Notes</h3>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 ml-12 lg:ml-[3.25rem]">
              {/* Note capture */}
              <div className="lg:col-span-2 card space-y-4 bg-navy-900/30 border border-navy-800/80 p-6">
                <div className="flex justify-between items-center text-xs text-slate-555 font-bold uppercase tracking-wider">
                  <span>Quick Note Capture</span>
                  {noteSaved && <span className="text-emerald-400 font-bold">Saved!</span>}
                </div>
                
                <div className="bg-navy-950/40 border border-navy-900/60 p-4 rounded-xl space-y-1">
                  <span className="text-[10px] text-brand-cyan font-bold uppercase tracking-wider block">Reflection Prompt</span>
                  <p className="text-xs text-slate-350 font-medium leading-relaxed">
                    "{vm.reflectionPrompt}"
                  </p>
                </div>

                <form onSubmit={handleSaveQuickNote} className="space-y-4">
                  <textarea
                    rows={4}
                    value={quickNote}
                    onChange={(e) => setQuickNote(e.target.value)}
                    placeholder="Record study progress, details, or resolved errors..."
                    className="input-base w-full text-sm p-4 font-medium resize-none bg-navy-950/40"
                    required
                  />
                  <SecondaryButton type="submit" disabled={!quickNote} className="w-full py-3 text-sm font-black">
                    Save Note
                  </SecondaryButton>
                </form>
              </div>

              {/* Blocker & Help & Latest Note */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-navy-900/30 border border-navy-800/80 rounded-2xl p-6 space-y-4 shadow-sm">
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block text-center border-b border-navy-800/40 pb-3">
                    Barriers & Help
                  </span>
                  <div className="space-y-3">
                    <button
                      onClick={() => setShowBlockerModal(true)}
                      className="w-full btn-secondary py-3 text-xs lg:text-sm font-extrabold text-red-400 border-red-500/20 hover:bg-red-500/5 text-center"
                    >
                      Log Blocker
                    </button>
                    <button
                      onClick={copyMentorHelpPrompt}
                      className="w-full btn-secondary py-3 text-xs lg:text-sm font-extrabold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5 text-center"
                    >
                      Ask {mentorName} Prompt
                    </button>
                  </div>
                </div>

                {vm.latestNote && (
                  <div className="bg-navy-900/30 border border-navy-800/80 rounded-2xl p-6 space-y-3 shadow-sm">
                    <span className="text-[10px] text-slate-550 font-bold uppercase tracking-wider block border-b border-navy-800/40 pb-2">
                      Latest Note
                    </span>
                    <div className="space-y-1 text-xs">
                      <p className="font-bold text-brand-violet truncate">{vm.latestNote.title}</p>
                      <p className="text-[11px] text-slate-400 leading-normal line-clamp-3">
                        {vm.latestNote.content || vm.latestNote.whatLearned || vm.latestNote.whatILearned}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── STATE 1: BEFORE SESSION (Command Mode View) ── */}
      {sessionState === 'before' && focusMode === 'command' && (
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Week Operational Overview Card */}
          <div className="card space-y-5 bg-navy-900/30 border border-navy-800/80">
            <div>
              <h3 className="text-base font-bold text-white">Week Operational Overview</h3>
              <p className="text-xs text-slate-550 mt-1">Objective metrics parsed from active JSON roadmap.</p>
            </div>
            
            <div className="bg-navy-950/40 border border-navy-900/60 p-5 rounded-2xl space-y-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Objective</span>
                <p className="text-sm text-slate-300 font-medium">
                  {vm.activeWeekObjective}
                </p>
              </div>

              {vm.proofRequirement && (
                <div className="space-y-1 pt-1.5">
                  <span className="text-[10px] text-slate-455 font-bold uppercase tracking-wider block">Deliverable Detail</span>
                  <p className="text-xs text-slate-400 italic">
                    "{vm.proofRequirement.description}"
                  </p>
                </div>
              )}
            </div>

            {/* Time budget and data download metrics */}
            <div className="grid grid-cols-2 gap-6 pt-3 text-xs border-t border-navy-800/60">
              <div>
                <span className="text-slate-550 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Time Budget Estimate</span>
                <span className="font-bold text-accent-cyan text-sm">
                  {vm.timeBudgetEstimate}
                </span>
              </div>
              <div>
                <span className="text-slate-550 font-bold block mb-1.5 uppercase tracking-wider text-[10px]">Data Download Estimate</span>
                <span className="font-bold text-accent-cyan text-sm">
                  {vm.dataDownloadEstimate}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Checklist */}
            <div className="lg:col-span-2 card space-y-4 bg-navy-900/30 border border-navy-800/80">
              <div>
                <h3 className="text-base font-bold text-white">Complete Operational Checklist</h3>
              </div>

              {vm.operationalChecklist.length === 0 ? (
                <p className="text-xs text-slate-550 italic">No operational checklist supplied for this week.</p>
              ) : (
                <div className="space-y-2">
                  {vm.operationalChecklist.map((item) => {
                    const done = item.done;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (item.action === 'toggle') {
                            toggleTask(month.monthNumber, week.weekNumber, item.originalIndex);
                          } else if (item.action === 'navigate') {
                            navigate(item.path);
                          }
                        }}
                        className={`w-full flex items-center gap-3.5 p-4 rounded-xl border text-left text-xs transition-all ${
                          done
                            ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                            : 'bg-navy-800 border-navy-700/40 text-white hover:border-navy-600'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${done ? 'border-emerald-500 bg-emerald-500/20' : 'border-navy-500'}`}>
                          {done && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-450" />}
                        </div>
                        <span className={`truncate flex-1 font-medium ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item.title}</span>
                        {item.type !== 'task' && (
                          <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-navy-950/40 text-slate-400 border border-navy-800">
                            {item.type}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Blockers / Barriers / Tools */}
            <div className="lg:col-span-1 space-y-6">
              <div className="card space-y-4 bg-navy-900/30 border border-navy-800/80">
                <div>
                  <h3 className="text-base font-bold text-white">Logged Operational Barriers</h3>
                </div>
                
                {activeWeekBlockers.length > 0 ? (
                  <div className="space-y-2">
                    {activeWeekBlockers.map((blocker, bidx) => (
                      <div key={bidx} className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl text-xs space-y-1">
                        <p className="font-bold text-red-400 truncate">{blocker.title}</p>
                        <p className="text-[10px] text-slate-450 line-clamp-2">{blocker.errorMessage || blocker.whatWentWrong}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 italic">No open progress blockers logged for this week.</p>
                )}

                <div className="pt-2 border-t border-navy-800/60">
                  <button
                    onClick={() => setShowBlockerModal(true)}
                    className="w-full btn-secondary py-2 text-xs font-bold text-red-400 border-red-500/20 hover:bg-red-500/5 text-center"
                  >
                    Log Blocker
                  </button>
                </div>
              </div>

              {/* Syllabus Resources */}
              <div className="card space-y-4 bg-navy-900/30 border border-navy-800/80">
                <div>
                  <h3 className="text-base font-bold text-white">Syllabus Resources</h3>
                </div>

                {vm.studyResources && vm.studyResources.length > 0 ? (
                  <div className="space-y-2">
                    {vm.studyResources.map((resource, resIdx) => (
                      <div key={resIdx} className="bg-navy-805/40 border border-navy-800 p-3 rounded-xl flex justify-between items-center gap-3 text-xs">
                        <span className="font-semibold text-slate-350 truncate">{resource.title}</span>
                        {resource.url && (
                          <a
                            href={resource.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-brand-blue font-bold hover:underline whitespace-nowrap text-[11px]"
                          >
                            Link
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 italic">No study resource supplied for this week.</p>
                )}
              </div>
            </div>
          </div>
          </div>
        )}

      {/* ── STATE 2: DURING SESSION ── */}
      {sessionState === 'during' && (
        <div className="max-w-2xl mx-auto space-y-8 py-4">
          
          {/* Centered Timer Dashboard */}
          <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-8 flex flex-col items-center justify-center text-center space-y-6">
            <span className="bg-accent-primary/10 text-accent-primary border border-accent-primary/20 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider animate-pulse">
              {sessionTimer.type || 'Focus Block'} Active
            </span>
            <h2 className="font-extrabold text-white text-xl leading-snug">{sessionTimer.title || 'Daily Focus'}</h2>

            <div className="relative w-48 h-48">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 128 128">
                <circle cx="64" cy="64" r="54" fill="none" stroke="#0F1326" strokeWidth="4.5" />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke={sessionTimer.isBreak ? '#22D3EE' : '#F59E0B'}
                  strokeWidth="4.5"
                  strokeDasharray={2 * Math.PI * 54}
                  strokeDashoffset={2 * Math.PI * 54 - (timerProgress / 100) * 2 * Math.PI * 54}
                  strokeLinecap="round"
                  className="transition-all duration-1000"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-4xl font-mono font-bold text-white tracking-tight tabular-nums">{minutes}:{seconds}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1.5 font-bold font-mono">
                  {sessionTimer.isBreak ? 'Break Time' : 'Time Remaining'}
                </p>
              </div>
            </div>

            {/* Timer Controls */}
            <div className="flex gap-3 items-center justify-center w-full max-w-xs">
              {sessionTimer.isRunning ? (
                <button
                  onClick={pauseTimer}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-brand-amber/15 border border-brand-amber/30 text-brand-amber hover:bg-brand-amber/25 text-xs font-bold transition-all active:scale-95"
                >
                  Pause Session
                </button>
              ) : (
                <button
                  onClick={resumeTimer}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary hover:bg-accent-primary/20 text-xs font-bold transition-all active:scale-95"
                >
                  Resume Session
                </button>
              )}
              <button
                onClick={handleEndSessionEarly}
                className="flex-1 px-4 py-2.5 rounded-xl bg-navy-800 border border-navy-700 text-slate-350 hover:bg-navy-750 hover:text-white text-xs font-bold transition-all active:scale-95"
              >
                End Session
              </button>
            </div>
          </div>

          {/* Active target display based on session category */}
          <div className="card space-y-4">
            <div>
              <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-widest block">Active Session Focus</span>
              
              {/* Study Session */}
              {sessionTimer.activeSessionId === 'study-resources' && (
                <div>
                  {mainResource ? (
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-navy-900 border border-navy-800 p-4 rounded-xl mt-2">
                      <div className="space-y-1">
                        <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded bg-navy-950/40 text-slate-400 border border-navy-800">
                          {mainResource.type || 'Study Resource'}
                        </span>
                        <p className="text-xs text-white font-bold truncate mt-1">{mainResource.title}</p>
                      </div>
                      {mainResource.url && (
                        <a
                          href={mainResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-accent-cyan text-navy-900 text-xs font-bold whitespace-nowrap hover:bg-accent-cyan/90 transition-all flex items-center gap-1 w-full sm:w-auto justify-center"
                        >
                          Open Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-550 italic mt-1">No study resource supplied for this week.</p>
                  )}
                </div>
              )}

              {/* Build Session */}
              {sessionTimer.activeSessionId === 'practical-build' && (
                <div>
                  {vm.buildTasks && vm.buildTasks.length > 0 ? (
                    <div className="space-y-2 mt-2">
                      {vm.buildTasks.slice(0, 2).map((bt, btIdx) => (
                        <div key={btIdx} className="bg-navy-900 border border-navy-800 p-3 rounded-xl">
                          <p className="text-xs text-white font-bold">{bt.title}</p>
                          {bt.description && <p className="text-[10px] text-slate-400 mt-1">{bt.description}</p>}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-555 italic mt-1">No build task supplied for this week.</p>
                  )}
                </div>
              )}

              {/* Proof Session */}
              {sessionTimer.activeSessionId === 'proof-submission' && (
                <div>
                  {vm.proofRequirement ? (
                    <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl mt-2 space-y-2">
                      <p className="text-xs text-white font-medium leading-relaxed">"{vm.proofRequirement.description}"</p>
                      <button
                        onClick={() => navigate('/proof')}
                        className="px-3.5 py-1.5 rounded-lg bg-brand-amber text-navy-900 text-xs font-bold hover:bg-brand-amber/90 transition-all"
                      >
                        Submit Proof
                      </button>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-550 italic mt-1">No proof requirement supplied for this stage.</p>
                  )}
                </div>
              )}

              {/* Reflection Session */}
              {sessionTimer.activeSessionId === 'reflection-review' && (
                <div className="bg-navy-900 border border-navy-800 p-4 rounded-xl mt-2">
                  <p className="text-xs text-slate-300 font-semibold leading-relaxed">
                    "{vm.reflectionPrompt}"
                  </p>
                </div>
              )}

              {/* Default/Other Session */}
              {!['study-resources', 'practical-build', 'proof-submission', 'reflection-review'].includes(sessionTimer.activeSessionId) && (
                <div>
                  {mainResource ? (
                    <div className="flex justify-between items-center gap-4 bg-navy-900 border border-navy-800 p-4 rounded-xl mt-2">
                      <p className="text-xs text-white font-bold truncate flex-1">{mainResource.title}</p>
                      {mainResource.url && (
                        <a
                          href={mainResource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3.5 py-1.5 rounded-lg bg-accent-cyan text-navy-900 text-xs font-bold whitespace-nowrap hover:bg-accent-cyan/90 transition-all flex items-center gap-1"
                        >
                          Open Link <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic mt-1">No resource reference was supplied for this session.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-navy-800/40">
            <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block mb-2">Priority Checklist</span>
            <div className="space-y-2">
              {focusTasks.length === 0 ? (
                <p className="text-xs text-slate-550 italic">No checklist targets defined for this week.</p>
              ) : (
                focusTasks.map((item) => {
                  const done = item.done;
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, item.originalIndex)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left text-xs transition-all ${
                        done
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                          : 'bg-navy-800 border-navy-705 text-white hover:border-navy-600'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center flex-shrink-0 ${done ? 'border-emerald-500 bg-emerald-500/20' : 'border-navy-500'}`}>
                        {done && <CheckCircle2 className="w-2.5 h-2.5 text-emerald-450" />}
                      </div>
                      <span className={`truncate flex-1 font-medium ${done ? 'line-through text-slate-500' : 'text-slate-300'}`}>{item.title}</span>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Quick Actions (Note / Blocker) during session */}
          <div className="grid sm:grid-cols-2 gap-4">
          <div className="card space-y-3">
            <div className="flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <span>Quick Note Capture</span>
              {noteSaved && <span className="text-emerald-400 font-bold">Saved!</span>}
            </div>
            <form onSubmit={handleSaveQuickNote} className="space-y-3">
              <textarea
                rows={2}
                value={quickNote}
                onChange={(e) => setQuickNote(e.target.value)}
                placeholder="Jot down details, errors, or ideas..."
                className="input-base w-full text-xs resize-none"
                required
              />
              <button type="submit" disabled={!quickNote} className="w-full btn-secondary py-2 text-xs font-bold">
                Save Note
              </button>
            </form>
          </div>

          <div className="card flex flex-col justify-between gap-3">
            <div>
              <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block">Barriers & Debugging</span>
              <p className="text-xs text-slate-400 mt-1.5 leading-normal">Blocked by a compile error? Log it to flag your week progress or get help prompts.</p>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => setShowBlockerModal(true)}
                className="w-full btn-secondary py-2 text-xs font-bold text-red-400 border-red-500/20 hover:bg-red-500/5 text-center"
              >
                Log Blocker
              </button>
              <button
                onClick={copyMentorHelpPrompt}
                className="w-full btn-secondary py-2 text-xs font-bold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5 text-center"
              >
                Ask {mentorName} Prompt
              </button>
            </div>
          </div>
        </div>

      </div>
    )}

    {/* ── STATE 3: AFTER SESSION ── */}
    {sessionState === 'after' && (
      <div className="max-w-2xl mx-auto space-y-6 py-4">
        
        {/* Summary Panel */}
        <div className="bg-navy-850 border border-navy-700/20 rounded-3xl p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-400" />
          </div>
          <div>
            <span className="text-[10px] text-slate-455 font-bold uppercase tracking-widest">Recap summary</span>
            <h3 className="text-lg font-bold text-white mt-1">Focus Block Ended</h3>
            <p className="text-xs text-slate-400 mt-1">
              Completed: <span className="font-semibold text-white">"{sessionCompletedSummary?.title || 'Daily Focus'}"</span> · {sessionCompletedSummary?.durationMinutes || 45} minutes block.
            </p>
          </div>
        </div>

        {/* Proof warning reminder if relevant */}
        {vm.proofRequirement && (
          <div className="p-4 bg-brand-amber/5 border border-brand-amber/20 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-brand-amber flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-white uppercase tracking-wider">Proof of Work Suggested</p>
                <p className="text-xs text-slate-400 mt-0.5">Please submit a GitHub commit and repository links under Weekly Missions once build is validated.</p>
              </div>
            </div>
            <button
              onClick={() => {
                resetTimer();
                navigate('/missions');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-amber/15 border border-brand-amber/25 text-brand-amber hover:bg-brand-amber/25 transition-all whitespace-nowrap active:scale-[0.98]"
            >
              Go to Proof
            </button>
          </div>
        )}

        {/* Reflection Prompt Form */}
        <div className="card space-y-4">
          <div>
            <span className="text-[10px] text-accent-primary font-bold uppercase tracking-widest block">Session Reflection</span>
            <h3 className="text-base font-bold text-white mt-1">Log What You Learned</h3>
            <p className="text-xs text-slate-400 mt-1">
              Reflect on the prompt: <span className="text-brand-cyan font-semibold">"{vm.reflectionPrompt}"</span>
            </p>
          </div>

          <form onSubmit={handleSaveAfterSessionReflection} className="space-y-4">
            <textarea
              rows={4}
              value={sessionRefText}
              onChange={(e) => setSessionRefText(e.target.value)}
              placeholder="What was the most important concept you learned? Any challenges solved?"
              className="input-base w-full text-xs"
              required
            />

            <div className="flex justify-between items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  resetTimer();
                  setSessionState('before');
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-350"
              >
                Skip Reflection
              </button>

              <div className="flex gap-2 items-center">
                {sessionRefSaved && <span className="text-xs text-accent-primary font-bold">Reflection Saved ✓</span>}
                <button
                  type="submit"
                  className="btn-primary py-2 px-6 text-xs font-bold"
                >
                  Save Reflection
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Post-Session Navigation Actions */}
        <div className="card space-y-3">
          <span className="text-[10px] text-slate-550 font-bold uppercase tracking-widest block">Alternative Steps</span>
          <div className="grid sm:grid-cols-3 gap-2">
            <button
              onClick={() => {
                resetTimer();
                navigate('/');
              }}
              className="btn-secondary py-2 text-xs font-bold text-center"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => {
                resetTimer();
                navigate('/missions');
              }}
              className="btn-secondary py-2 text-xs font-bold text-center"
            >
              Go to Weekly Missions
            </button>
            <button
              onClick={() => {
                setSessionRefText('');
                setSessionCompletedSummary(null);
                resetTimer();
                setSessionState('before');
              }}
              className="btn-secondary py-2 text-xs font-bold text-center text-accent-primary border-accent-primary/20 hover:bg-accent-primary/5"
            >
              Start New Session
            </button>
          </div>
        </div>

      </div>
    )}

    {/* Log Blocker Modal overlay */}
    {showBlockerModal && (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <div className="card w-full max-w-md bg-navy-850 border border-navy-700 animate-scale-in">
          <div className="flex items-center justify-between mb-4 border-b border-navy-700 pb-2">
            <h2 className="text-xs font-bold text-white uppercase tracking-widest">Log Active Blocker</h2>
            <button onClick={() => setShowBlockerModal(false)} className="text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleAddBlockerSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">Blocker Error Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. TypeError: Cannot read properties of null"
                value={blockerTitle}
                onChange={(e) => setBlockerTitle(e.target.value)}
                className="input-base w-full text-xs"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">Console Error Stack Logs</label>
              <textarea
                rows={2}
                placeholder="Paste terminal log stack traces here..."
                value={blockerError}
                onChange={(e) => setBlockerError(e.target.value)}
                className="input-base w-full text-xs font-mono text-red-400 bg-navy-900 resize-none"
              />
            </div>

            <div>
              <label className="block text-[12px] font-bold text-slate-450 uppercase tracking-wider mb-1">What did you try already? *</label>
              <textarea
                rows={2}
                required
                placeholder="Explain steps taken before getting blocked..."
                value={blockerTried}
                onChange={(e) => setBlockerTried(e.target.value)}
                className="input-base w-full text-xs resize-none"
              />
            </div>

            <div className="flex gap-2 justify-end pt-3 border-t border-navy-700">
              <SecondaryButton onClick={() => setShowBlockerModal(false)}>
                Cancel
              </SecondaryButton>
              <button type="submit" className="btn-primary py-2.5 px-5 text-xs font-bold">
                Log Blocker
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
  </PageShell>
  );
}
