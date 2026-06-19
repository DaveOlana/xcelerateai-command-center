import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Play, HelpCircle,
  FileText, Clipboard, Settings, ChevronRight, CheckSquare,
  BookOpen, Terminal, Code, ShieldAlert, Sparkles, MessageSquare,
  X, Coffee
} from 'lucide-react';
import { PageShell, PageHeader, SectionCard, CommandButton, SecondaryButton, StatusBadge, InfoPill } from '../components/common/UIComponents';

export default function PracticalMissionView() {
  const { missionId } = useParams();
  const navigate = useNavigate();
  const {
    roadmap,
    practicalMissions,
    startPracticalMission,
    updatePracticalMissionProof,
    updatePracticalMissionReflection,
    completePracticalMission,
    togglePracticalMissionTask,
    addBlocker,
    settings
  } = useApp();

  const [activeTab, setActiveTab] = useState('brief');
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerError, setBlockerError] = useState('');
  const [blockerTried, setBlockerTried] = useState('');
  const [savedReflectionIdx, setSavedReflectionIdx] = useState(null);

  // Find mission details inside roadmap
  const missionData = useMemo(() => {
    if (!roadmap?.months) return null;
    for (const month of roadmap.months) {
      for (const week of month.weeks || []) {
        // Find inside practicalMissions array
        const found = week.practicalMissions?.find((m) => m.missionId === missionId);
        if (found) {
          return { mission: found, week, month };
        }
        // Fallback checks (e.g. check nested fullMission or other custom arrays if any)
      }
    }
    return null;
  }, [roadmap, missionId]);

  const progressRecord = practicalMissions[missionId] || {
    status: 'Available',
    proof: {
      githubRepoLink: '',
      githubCommitLink: '',
      screenshotNote: '',
      readmeCompleted: false,
      testCasesPassed: false,
      reflectionWritten: '',
      demoVideoLink: '',
    },
    reflections: {},
    completedSteps: [],
  };

  if (!missionData) {
    return (
      <div className="card text-center py-12">
        <AlertTriangle className="w-12 h-12 text-slate-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-white">Mission Not Found</h2>
        <p className="text-xs text-slate-500 mt-1">This practical mission reference ID could not be matched.</p>
        <button onClick={() => navigate('/missions')} className="btn-secondary text-sm mt-4 inline-flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Weekly Missions
        </button>
      </div>
    );
  }

  const { mission, week, month } = missionData;

  // Prerequisites Lock check (Option A1)
  const isLocked = useMemo(() => {
    if (settings.manualOverrideEnabled) return false;
    // Verify if week is locked
    if (week.weekNumber > 1) {
      // Must have previous week complete
      const previousWeekComplete = settings.activeWeek >= week.weekNumber || settings.activeWeek > week.weekNumber;
      // Wait, is the week number higher than current settings.activeWeek?
      if (week.weekNumber > settings.activeWeek) {
        return true;
      }
    }
    return false;
  }, [week.weekNumber, settings.activeWeek, settings.manualOverrideEnabled]);

  // If locked, render the dark glass modal popup overlay immediately
  const handleBackToCurrent = () => {
    navigate('/missions');
  };

  const handleStartMission = () => {
    startPracticalMission(missionId);
  };

  const handleToggleStep = (index) => {
    togglePracticalMissionTask(missionId, index);
  };

  const handleProofChange = (field, value) => {
    updatePracticalMissionProof(missionId, field, value);
  };

  const handleReflectionChange = (qIdx, value) => {
    updatePracticalMissionReflection(missionId, qIdx, value);
  };

  const handleReflectionSave = (qIdx) => {
    setSavedReflectionIdx(qIdx);
    setTimeout(() => setSavedReflectionIdx(null), 2000);
  };

  const isProofFormComplete = () => {
    const p = progressRecord.proof;
    return p.githubRepoLink && p.githubCommitLink && p.readmeCompleted && p.testCasesPassed;
  };

  const handleComplete = () => {
    // Evidence checking: hybrid approach B1 + B2
    const requiresProof = mission.required || mission.evidenceRequired || mission.proofOfWork?.length > 0 ||
                          ['Boss Mission', 'Main Build', 'Final Project', 'Assessment'].includes(mission.difficulty);
    
    if (requiresProof && !isProofFormComplete()) {
      alert('Proof incomplete. Add the required evidence (GitHub repository, commit link, README check, and tests checked) before marking this complete.');
      return;
    }
    completePracticalMission(missionId);
  };

  // Blocker trigger
  const handleLogBlocker = (e) => {
    e.preventDefault();
    if (!blockerTitle) return;
    addBlocker({
      title: blockerTitle,
      weekNumber: week.weekNumber,
      missionTitle: mission.title,
      skillArea: mission.skillFocus || 'DOM Events',
      whatTryingToDo: `Build practical mission: ${mission.title}`,
      whatWentWrong: `Stuck during build. Details: ${blockerTried}`,
      errorMessage: blockerError,
      whatAlreadyTried: blockerTried,
    });
    setBlockerTitle('');
    setBlockerError('');
    setBlockerTried('');
    setShowBlockerModal(false);
    alert('Blocker logged successfully! You can find it on the Dashboard and Blockers page.');
  };

  // Ask Lemont helper prompt prefill
  const copyLemontPrompt = () => {
    const p = `I am on Week ${week.weekNumber}, Mission "${mission.title}" (Difficulty: ${mission.difficulty}).
I am trying to build: ${mission.title}.
The scenario is: ${mission.scenario}
I created these files: ${(mission.filesToCreate || []).join(', ')}.
The error I got is: [Insert stack trace or behavior error here]
I have tried: [Insert steps tried here]
Please help me debug this without giving me the full answer immediately.`;
    navigator.clipboard.writeText(p);
    alert('Ask Lemont debug prompt copied to clipboard!');
  };

  // Helper to get unknown JSON fields
  const knownFields = [
    'missionId', 'title', 'skillFocus', 'difficulty', 'timeEstimate', 'dataEstimate',
    'elliotRelevance', 'scenario', 'filesToCreate', 'conceptsUsed', 'stepByStepInstructions',
    'requiredFeatures', 'rules', 'testCases', 'debuggingDrills', 'doneMeansDone',
    'proofOfWork', 'githubCommitMessage', 'readmePrompt', 'reflectionQuestions', 'commanderMode'
  ];

  const unknownFields = useMemo(() => {
    const fields = {};
    Object.keys(mission).forEach((key) => {
      if (!knownFields.includes(key) && typeof mission[key] !== 'function') {
        fields[key] = mission[key];
      }
    });
    return fields;
  }, [mission]);

  // Status visual badge styling
  const statusColors = {
    Locked: 'badge-slate',
    Available: 'bg-navy-600 text-slate-400 border border-navy-400',
    'In Progress': 'bg-amber-500/10 text-amber-400 border border-amber-500/25 animate-pulse',
    Blocked: 'bg-red-500/10 text-red-400 border border-red-500/25 animate-glow-pulse',
    Submitted: 'bg-blue-500/10 text-blue-400 border border-blue-500/25',
    Completed: 'badge-blue',
  };

  return (
    <PageShell>
      {/* Locked Alert Modal Backdrop (Option A1) */}
      {isLocked && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-navy-850/90 border border-navy-500/50 rounded-2xl w-full max-w-lg p-8 animate-scale-in text-center shadow-card relative backdrop-blur-md">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert className="w-8 h-8 text-red-400" />
            </div>

            <h2 className="text-xl font-bold text-white uppercase tracking-wider font-mono"> Coordinates Locked</h2>
            <p className="text-xs text-accent-primary font-bold uppercase tracking-wider font-mono mt-1">
              Prerequisite Missing
            </p>

            <div className="bg-navy-950/80 border border-navy-500/30 rounded-xl p-4 my-6 text-left space-y-3">
              <p className="text-xs text-slate-400">
                You cannot inspect <span className="text-white font-bold">"{mission.title}"</span> yet. Access to future coordinates is blocked until previous checkpoints are completed.
              </p>
              <div className="border-t border-navy-450/40 pt-3 flex flex-col gap-1.5">
                <span className="text-[13px] text-slate-550 uppercase tracking-wider font-bold">Prerequisites Required:</span>
                <div className="flex items-center gap-2 text-xs text-amber-300">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>Complete Week {week.weekNumber - 1} required deliverables and proof of work.</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleBackToCurrent}
                className="bg-accent-primary text-navy-900 hover:bg-accent-primary-dim font-bold flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all shadow-primary-glow"
              >
                Go to Active Week ({settings.activeWeek})
              </button>
              <Link
                to="/settings"
                className="bg-navy-700/80 border border-navy-450 text-slate-350 hover:text-white hover:border-accent-primary/30 px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
              >
                <Settings className="w-4 h-4" /> Override Locks
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Back button */}
      <div className="flex items-center gap-2 no-print">
        <Link to="/missions" className="text-slate-400 hover:text-accent-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider font-mono">
          <ArrowLeft className="w-4 h-4" /> BACK TO WEEKLY MISSIONS
        </Link>
      </div>

      {/* Header Info */}
      <PageHeader
        title={mission.title}
        subtitle={
          <div className="flex items-center gap-2 flex-wrap mt-1">
            <span className="text-[13px] text-slate-500 font-mono">ID: {mission.missionId}</span>
            <span className="badge-slate text-[13px]">Week {week.weekNumber}</span>
            <span className="text-slate-400 text-xs">
              Skill focus: <span className="text-accent-primary font-semibold">{mission.skillFocus}</span> · Difficulty: <span className="text-slate-300 font-semibold">{mission.difficulty}</span>
            </span>
            <StatusBadge status={progressRecord.status} />
          </div>
        }
        actions={
          <div className="flex items-center gap-2">
            {progressRecord.status === 'Available' ? (
              <CommandButton onClick={handleStartMission}>
                <Play className="w-4 h-4 fill-navy-900" /> Start Mission
              </CommandButton>
            ) : progressRecord.status === 'Completed' ? (
              <span className="badge-blue py-2 px-3 text-xs font-bold uppercase border border-accent-primary/20">
                <CheckCircle2 className="w-4 h-4" /> Completed
              </span>
            ) : (
              <CommandButton onClick={handleComplete}>
                <CheckCircle2 className="w-4 h-4" /> Mark Complete
              </CommandButton>
            )}

            <button
              onClick={() => setShowBlockerModal(true)}
              className="bg-red-500/15 hover:bg-red-500/25 border border-red-500/30 text-red-400 font-bold px-4 py-2.5 rounded-xl transition-all duration-200 text-xs uppercase tracking-wider flex items-center gap-1.5"
            >
              I'm Blocked
            </button>
          </div>
        }
      />

      {/* Estimation statistics banner */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card py-3 px-4 text-center">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">Estimated Time</p>
          <p className="text-lg font-bold text-white mt-0.5">{mission.timeEstimate || '1-2 Hours'}</p>
        </div>
        <div className="card py-3 px-4 text-center">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">Estimated Data</p>
          <p className="text-lg font-bold text-accent-cyan mt-0.5">{mission.dataEstimate || '50MB'}</p>
        </div>
        <div className="card py-3 px-4 text-center">
          <p className="text-[13px] text-slate-500 font-semibold uppercase tracking-wider">Status Index</p>
          <p className="text-lg font-bold text-accent-primary mt-0.5">{progressRecord.status}</p>
        </div>
      </div>

      {/* Workspace Tabs Selector */}
      <div className="flex border-b border-navy-400 no-print">
        {[
          { id: 'brief', label: 'Brief', icon: FileText },
          { id: 'steps', label: 'Build Steps', icon: Code },
          { id: 'tests', label: 'Tests', icon: Terminal },
          { id: 'debug', label: 'Debug', icon: ShieldAlert },
          { id: 'proof', label: 'Proof', icon: CheckSquare },
          { id: 'reflection', label: 'Reflection', icon: MessageSquare },
        ].map((tab) => {
          const active = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold border-b-2 transition-all ${
                active
                  ? 'border-accent-primary text-accent-primary bg-accent-primary/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Workspaces */}
      <div className="space-y-6">
        {/* Brief Tab */}
        {activeTab === 'brief' && (
          <div className="space-y-5">
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Mission Scenario</h3>
              <p className="text-sm text-slate-300 leading-relaxed">{mission.scenario || 'No scenario documented.'}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Elliot Relevance</h3>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{mission.elliotRelevance || 'This milestone introduces skills that form core foundations of Elliot\'s logic layers.'}"
                </p>
              </div>

              <div className="card">
                <h3 className="text-sm font-bold text-white mb-2 uppercase tracking-wide">Concepts Used</h3>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(mission.conceptsUsed || ['Vanilla JavaScript', 'Coding Structure']).map((c, idx) => (
                    <span key={idx} className="badge-slate text-[13px] font-mono">{c}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Folder Structure */}
            {mission.filesToCreate?.length > 0 && (
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">Files to Create</h3>
                <div className="bg-navy-950 font-mono text-xs text-slate-300 rounded-lg p-4 border border-navy-400">
                  <p className="text-slate-500">// project-directory/</p>
                  {mission.filesToCreate.map((f, idx) => (
                    <p key={idx} className="flex items-center gap-1.5 mt-1">
                      <span className="text-slate-500">├──</span>
                      <span className="text-accent-cyan font-semibold">{f}</span>
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Done Means Done (Requirement 7) */}
            {mission.doneMeansDone && (Array.isArray(mission.doneMeansDone) ? mission.doneMeansDone.length > 0 : !!mission.doneMeansDone) && (
              <div className="card border-blue-500/20 bg-blue-500/5">
                <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide">✓ Done Means Done Checklist</h3>
                <div className="space-y-2">
                  {Array.isArray(mission.doneMeansDone) ? (
                    mission.doneMeansDone.map((item, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-blue-400 mt-0.5">▪</span>
                        <span>{item}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">{mission.doneMeansDone}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Steps Tab */}
        {activeTab === 'steps' && (
          <div className="space-y-5">
            {/* Step-by-Step Instructions */}
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Step-by-Step Instructions</h3>
              <div className="space-y-3">
                {(mission.stepByStepInstructions?.length > 0
                  ? mission.stepByStepInstructions
                  : ['Review the tasks inside TodaysFocus page.', 'Create directory structures and test files.', 'Verify inputs and logs in terminal.']
                ).map((step, idx) => {
                  const checked = progressRecord.completedSteps.includes(idx);
                  return (
                    <button
                      key={idx}
                      onClick={() => handleToggleStep(idx)}
                      className={`w-full flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                        checked ? 'bg-accent-primary/5 border-accent-primary/20' : 'bg-navy-800 border-navy-400 hover:border-navy-300'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded border flex-shrink-0 mt-0.5 flex items-center justify-center ${
                        checked ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'
                      }`}>
                        {checked && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                      </div>
                      <div className="text-xs">
                        <span className={`font-mono font-bold mr-1.5 ${checked ? 'text-accent-primary' : 'text-slate-500'}`}>Step {idx + 1}:</span>
                        <span className={checked ? 'line-through text-slate-500' : 'text-slate-300'}>{step}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Rules / Constraints */}
            {mission.rules?.length > 0 && (
              <div className="card border-red-500/20 bg-red-500/5">
                <div className="flex items-center gap-1.5 mb-3">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wide">Rules & Constraints</h3>
                </div>
                <ul className="space-y-1.5 text-xs text-red-300/80 list-disc list-inside">
                  {mission.rules.map((rule, idx) => (
                    <li key={idx} className="leading-relaxed">{rule}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Commander Mode Stretch Objectives (Requirement 7) */}
            {mission.commanderMode && (Array.isArray(mission.commanderMode) ? mission.commanderMode.length > 0 : !!mission.commanderMode) && (
              <div className="card border-purple-500/20 bg-purple-500/5 mt-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wide">Commander Mode (Optional Stretch Goals)</h3>
                </div>
                <div className="space-y-2.5">
                  {Array.isArray(mission.commanderMode) ? (
                    mission.commanderMode.map((goal, idx) => (
                      <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                        <span className="text-purple-400 mt-0.5">★</span>
                        <span>{goal}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed">{mission.commanderMode}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tests Tab */}
        {activeTab === 'tests' && (
          <div className="space-y-5">
            <div className="card">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Test Cases Verification</h3>
              {mission.testCases?.length > 0 ? (
                <div className="space-y-3">
                  {mission.testCases.map((tc, idx) => (
                    <div key={idx} className="p-4 bg-navy-800 border border-navy-400 rounded-xl space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-[13px] font-mono font-semibold uppercase bg-navy-600 px-2 py-0.5 rounded text-accent-cyan">
                          Case {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                          <span>Action:</span>
                          <span className="text-white font-semibold">{tc.action}</span>
                        </div>
                      </div>
                      <div className="bg-navy-950 border border-navy-400/50 rounded-lg p-2.5 text-xs text-slate-300 font-mono leading-relaxed">
                        <span className="text-slate-500">// Expected Output:</span>
                        <p className="mt-0.5 text-accent-primary font-semibold">{tc.expectedResult}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-navy-800 border border-navy-400 rounded-xl text-center py-8">
                  <Terminal className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No automated test cases configured. Perform manual testing checks.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Debug Tab */}
        {activeTab === 'debug' && (
          <div className="space-y-5">
            {/* Common Errors & Debugging Drills */}
            {mission.debuggingDrills?.length > 0 ? (
              <div className="card">
                <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-wide">Debugging Exercises</h3>
                <div className="space-y-3">
                  {mission.debuggingDrills.map((drill, idx) => (
                    <div key={idx} className="p-3 bg-navy-800 border border-navy-400 rounded-xl text-xs text-slate-300">
                      <p className="font-semibold text-amber-400 mb-1">Drill {idx + 1}:</p>
                      <p className="leading-relaxed">{drill}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="card text-center py-8">
                <HelpCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-xs text-slate-500">No debugging drills set for this mission.</p>
              </div>
            )}

            {/* Mentor generation panel */}
            <div className="card border-dashed">
              <h3 className="text-sm font-bold text-white mb-2">Stuck in code?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Ask Lemont using our prompt generator. He will guide you logically without spoiling solutions.
              </p>
              <button
                onClick={copyLemontPrompt}
                className="btn-secondary text-xs flex items-center gap-1.5 border-accent-primary/20 text-accent-primary bg-accent-primary/5"
              >
                <Clipboard className="w-3.5 h-3.5" /> Copy Lemont Debug Request
              </button>
            </div>
          </div>
        )}

        {/* Proof Tab */}
        {activeTab === 'proof' && (
          <div className="space-y-5">
            {/* Submit proof of work */}
            <div className="card space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Proof of Build Submission</h3>
              <p className="text-xs text-slate-400">Provide repository and commit links to complete this mission.</p>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400">GitHub Repository Link *</label>
                  <input
                    type="url"
                    placeholder="https://github.com/..."
                    value={progressRecord.proof.githubRepoLink || ''}
                    onChange={(e) => handleProofChange('githubRepoLink', e.target.value)}
                    className="input-base w-full text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">GitHub Commit Link *</label>
                  <input
                    type="url"
                    placeholder="https://github.com/.../commit/..."
                    value={progressRecord.proof.githubCommitLink || ''}
                    onChange={(e) => handleProofChange('githubCommitLink', e.target.value)}
                    className="input-base w-full text-sm font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Screenshot Path / Attachment reference</label>
                  <input
                    type="text"
                    placeholder="e.g. C:/Users/HP/Screenshots/board-complete.png"
                    value={progressRecord.proof.screenshotNote || ''}
                    onChange={(e) => handleProofChange('screenshotNote', e.target.value)}
                    className="input-base w-full text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400">Demo Video Link (Optional)</label>
                  <input
                    type="url"
                    placeholder="https://loom.com/share/..."
                    value={progressRecord.proof.demoVideoLink || ''}
                    onChange={(e) => handleProofChange('demoVideoLink', e.target.value)}
                    className="input-base w-full text-sm font-mono"
                  />
                </div>

                {/* Checklist options */}
                <div className="grid sm:grid-cols-2 gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => handleProofChange('readmeCompleted', !progressRecord.proof.readmeCompleted)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                      progressRecord.proof.readmeCompleted
                        ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                        : 'bg-navy-800 border-navy-400 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      progressRecord.proof.readmeCompleted ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'
                    }`}>
                      {progressRecord.proof.readmeCompleted && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                    </div>
                    <span>README Prompt completed</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleProofChange('testCasesPassed', !progressRecord.proof.testCasesPassed)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border text-left text-xs font-semibold transition-all ${
                      progressRecord.proof.testCasesPassed
                        ? 'bg-accent-primary/10 border-accent-primary/25 text-white'
                        : 'bg-navy-800 border-navy-400 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 ${
                      progressRecord.proof.testCasesPassed ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300'
                    }`}>
                      {progressRecord.proof.testCasesPassed && <CheckCircle2 className="w-3.5 h-3.5 text-accent-primary" />}
                    </div>
                    <span>All Test Cases verified passing</span>
                  </button>
                </div>
              </div>

              {/* Commit messages prompt guides */}
              {mission.githubCommitMessage && (
                <div className="bg-navy-950 border border-navy-400 rounded-lg p-3.5 space-y-2 mt-3">
                  <span className="text-[13px] text-slate-500 uppercase tracking-wider font-bold">Recommended Git Commit Message:</span>
                  <div className="flex items-center justify-between gap-3 bg-navy-900 border border-navy-400 rounded px-3 py-2 text-xs font-mono text-white">
                    <span>{mission.githubCommitMessage}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(mission.githubCommitMessage);
                        alert('Commit message copied!');
                      }}
                      className="text-slate-500 hover:text-accent-primary"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Reflection Tab */}
        {activeTab === 'reflection' && (
          <div className="space-y-5">
            <div className="card space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wide">Mission Reflection</h3>
              <p className="text-xs text-slate-400">Complete reflection questions to cement your study experiences.</p>

              {(mission.reflectionQuestions?.length > 0
                ? mission.reflectionQuestions
                : ['What was the most challenging part of this mission?', 'How does this structure help build Elliot?']
              ).map((q, qIdx) => (
                <div key={qIdx} className="space-y-2 p-3 bg-navy-800 border border-navy-400 rounded-xl">
                  <label className="text-xs font-bold text-white block">Q{qIdx + 1}: {q}</label>
                  <textarea
                    rows={3}
                    value={progressRecord.reflections[qIdx] || ''}
                    onChange={(e) => handleReflectionChange(qIdx, e.target.value)}
                    placeholder="Type your reflection answer here..."
                    className="input-base w-full text-xs resize-none"
                  />
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-[13px] text-slate-500">Required reflections</span>
                    <button
                      type="button"
                      onClick={() => handleReflectionSave(qIdx)}
                      className="text-[13px] font-semibold text-accent-primary hover:underline"
                    >
                      {savedReflectionIdx === qIdx ? 'Saved ✓' : 'Save Answer'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Unknown JSON Fields - Accordion (Requirement 11) */}
      {Object.keys(unknownFields).length > 0 && (
        <div className="card">
          <details className="group">
            <summary className="flex items-center justify-between font-bold text-white text-xs cursor-pointer select-none">
              <span>ADDITIONAL MISSION DATA</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 border-t border-navy-400/50 pt-3 space-y-3">
              {Object.entries(unknownFields).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="font-bold text-slate-400 block uppercase tracking-wider">{key}:</span>
                  {typeof val === 'object' ? (
                    <pre className="bg-navy-950 font-mono text-[13px] text-slate-300 rounded p-2 overflow-x-auto mt-1 max-w-full">
                      <code>{JSON.stringify(val, null, 2)}</code>
                    </pre>
                  ) : (
                    <p className="text-slate-300 mt-0.5">{val.toString()}</p>
                  )}
                </div>
              ))}
            </div>
          </details>
        </div>
      )}

      {/* Blocker Modal */}
      {showBlockerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="card w-full max-w-md bg-navy-800 border border-navy-400 animate-scale-in">
            <div className="flex items-center justify-between mb-4 border-b border-navy-400/50 pb-2">
              <h2 className="text-lg font-bold text-white">Log Mission Blocker</h2>
              <button onClick={() => setShowBlockerModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLogBlocker} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Blocker Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. DOM addEventListener syntax error"
                  value={blockerTitle}
                  onChange={(e) => setBlockerTitle(e.target.value)}
                  className="input-base w-full text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">Error Trace (Optional)</label>
                <textarea
                  rows={3}
                  placeholder="Paste error logs here..."
                  value={blockerError}
                  onChange={(e) => setBlockerError(e.target.value)}
                  className="input-base w-full text-xs font-mono text-red-300 resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1">What did you try already?</label>
                <textarea
                  rows={3}
                  placeholder="Steps taken to debug..."
                  value={blockerTried}
                  onChange={(e) => setBlockerTried(e.target.value)}
                  className="input-base w-full text-sm resize-none"
                />
              </div>

              <div className="flex gap-2 justify-end pt-2 border-t border-navy-400/50">
                <button
                  type="button"
                  onClick={() => setShowBlockerModal(false)}
                  className="btn-secondary text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm"
                >
                  Create Blocker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageShell>
  );
}
