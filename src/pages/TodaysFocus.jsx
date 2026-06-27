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
    resourcesStatus,
    weekProofs,
    weekReflections,
    skillChecks,
    progress
  } = useApp();

  const mentorName = settings?.mentorName || roadmap?.mentorLabel || 'Mentor';
  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;

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

  // Active roadmap week details
  const activeData = getActiveWeekData(roadmap, settings.activeWeek);

  const activeWeekBlockers = blockers.filter(
    (b) => b.weekNumber === settings.activeWeek && b.status !== 'Solved'
  );

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

  if (!activeData) {
    return (
      <PageShell>
        <EmptyState
          message="No Active Operations Found"
          submessage="Please go to the roadmap loader to import your mission timeline."
          icon={AlertCircle}
          actionText="Load Custom JSON"
          onActionClick={() => navigate('/import')}
        />
      </PageShell>
    );
  }

  const { week, month } = activeData;

  // Key targets: first 3 incomplete tasks
  const focusTasks = (week.tasks || []).slice(0, 3);
  const mainResource = week.resources?.[0];

  const handleSaveQuickNote = (e) => {
    e.preventDefault();
    if (!quickNote) return;
    addNote({
      title: `Daily Note — Week ${week.weekNumber}`,
      type: 'Session Note',
      linkedItem: `Week ${week.weekNumber}`,
      content: quickNote,
      whatILearned: quickNote,
      whatConfusedMe: 'None logged.',
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
      weekNumber: week.weekNumber,
      skillArea: 'General Focus',
      whatTryingToDo: 'Daily study exercises',
      whatWentWrong: blockerTried,
      errorMessage: blockerError,
      whatAlreadyTried: blockerTried,
    });
    setBlockerTitle('');
    setBlockerError('');
    setBlockerTried('');
    setShowBlockerModal(false);
    alert('Blocker logged. Your progress status indicator is now flagged as blocked.');
  };

  // Ask Mentor Helper Generator
  const copyMentorHelpPrompt = () => {
    const activeBlocker = activeWeekBlockers[0] || blockers[0];
    const recentNote = notes?.[0]?.content || notes?.[0]?.whatLearned || "None recorded yet";
    const currentMission = week.practicalMissions?.[0];
    const missionTitle = currentMission ? currentMission.title : week.title;
    
    const filesToCreate = currentMission?.filesToCreate || currentMission?.files || week.files || ["Not specified"];
    const filesStr = Array.isArray(filesToCreate) ? filesToCreate.join(', ') : String(filesToCreate);
    
    const errorStr = activeBlocker?.errorMessage || activeBlocker?.title || "No active error logged";
    const triedStr = activeBlocker?.whatAlreadyTried || activeBlocker?.whatWentWrong || "Reviewed documentation and code logs";
    const noteText = recentNote !== "None recorded yet" ? `Recent note: "${recentNote}"` : "";

    const promptText = `I am on Week ${week.weekNumber}, Mission "${missionTitle}" of the ${roadmapTitle}. I am trying to build "${week.deliverable || "this week's milestones"}". I created these files: ${filesStr}. The error I got is: ${errorStr}. I have tried: ${triedStr}. ${noteText} Please help me debug this without giving me the full answer immediately.`;
    
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
      linkedWeek: week.weekNumber,
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
  };  return (
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
            <span className={`w-2 h-2 rounded-full ${sessionState === 'during' ? 'bg-accent-primary animate-pulse' : 'bg-slate-500'}`} />
            <span className="text-xs text-slate-400 font-bold tracking-widest uppercase">
              {sessionState === 'during' ? 'Focus Mode Active' : sessionState === 'after' ? 'Session Completed' : 'Session Preparation'}
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {sessionState === 'during' ? 'Focusing...' : sessionState === 'after' ? 'Review & Reflect' : 'Daily Focus Cockpit'}
          </h1>
          {sessionState !== 'during' && (
            <p className="text-slate-400 text-sm mt-2">
              {userProfile?.displayName || userProfile?.name || 'Operator'}, today's focus is waiting. Week {week.weekNumber} Operations · {week.title}
            </p>
          )}
        </div>
        {/* Segmented Cockpit Switch Control */}
        {sessionState === 'before' && (
          <div className="flex items-center bg-navy-900 border border-navy-800 p-1 rounded-2xl self-stretch sm:self-auto justify-center">
            <button
              onClick={() => {
                setMode('command');
                localStorage.setItem('xai_today_focus_mode', 'command');
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'command'
                  ? 'bg-brand-blue text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Command Mode
            </button>
            <button
              onClick={() => {
                setMode('focus');
                localStorage.setItem('xai_today_focus_mode', 'focus');
              }}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all ${
                mode === 'focus'
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
      {sessionState === 'before' && (
        mode === 'command' ? (
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
        )
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

          {/* Active resource and quick targets */}
          <div className="card space-y-4">
            <div>
              <span className="text-[10px] text-accent-cyan font-bold uppercase tracking-widest block">Active Resource Reference</span>
              {mainResource ? (
                <div className="flex justify-between items-center gap-4 bg-navy-900 border border-navy-800 p-4 rounded-xl mt-2">
                  <p className="text-xs text-white font-bold truncate flex-1">{mainResource.title}</p>
                  <a
                    href={mainResource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-lg bg-accent-cyan text-navy-900 text-xs font-bold whitespace-nowrap hover:bg-accent-cyan/90 transition-all flex items-center gap-1"
                  >
                    Open Link <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic mt-1">No resource reference was supplied for this session.</p>
              )}
            </div>

            <div className="pt-2 border-t border-navy-800/40">
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-2">Priority Checklist</span>
              <div className="space-y-2">
                {focusTasks.slice(0, 3).map((task, idx) => {
                  const done = isTaskComplete(month.monthNumber, week.weekNumber, idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => toggleTask(month.monthNumber, week.weekNumber, idx)}
                      className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left text-xs transition-all ${
                        done
                          ? 'bg-emerald-500/5 border-emerald-500/10 text-slate-500'
                          : 'bg-navy-800 border-navy-705 text-white hover:border-navy-600'
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
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Barriers & Debugging</span>
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
              <span className="text-[10px] text-slate-450 font-bold uppercase tracking-widest">Recap summary</span>
              <h3 className="text-lg font-bold text-white mt-1">Focus Block Ended</h3>
              <p className="text-xs text-slate-400 mt-1">
                Completed: <span className="font-semibold text-white">"{sessionCompletedSummary?.title || 'Daily Focus'}"</span> · {sessionCompletedSummary?.durationMinutes || 45} minutes block.
              </p>
            </div>
          </div>

          {/* Proof warning reminder if relevant */}
          {week.deliverable && (
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
                className="px-4 py-2 rounded-xl text-xs font-bold bg-brand-amber/15 border border-brand-amber/25 text-brand-amber hover:bg-brand-amber/25 transition-all whitespace-nowrap"
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
              <p className="text-xs text-slate-400 mt-1">Reflect on your study progress to optimize memory retention and log notes in your journal.</p>
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
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block">Alternative Steps</span>
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
