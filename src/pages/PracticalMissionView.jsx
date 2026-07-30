import React, { useState, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import {
  ArrowLeft, CheckCircle2, AlertTriangle, Play, HelpCircle,
  FileText, Clipboard, Settings, ChevronRight, CheckSquare,
  BookOpen, Terminal, Code, ShieldAlert, Sparkles, MessageSquare,
  X, Coffee, Check, Lightbulb, Compass
} from 'lucide-react';
import { PageShell, PageHeader, CommandButton, StatusBadge } from '../components/common/UIComponents';
import StatusBanner from '../components/ui/StatusBanner';
import LoadingIndicator from '../components/ui/LoadingIndicator';

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

  const roadmapTitle = roadmap?.title || roadmap?.bootcampTitle || 'Active Roadmap';
  const roadmapShortTitle = roadmap?.shortTitle || roadmapTitle;
  const mentorName = settings?.mentorName || roadmap?.mentorLabel || 'Mentor';

  const [activeTab, setActiveTab] = useState('brief');
  const [showBlockerModal, setShowBlockerModal] = useState(false);
  const [blockerTitle, setBlockerTitle] = useState('');
  const [blockerError, setBlockerError] = useState('');
  const [blockerTried, setBlockerTried] = useState('');
  const [savedReflectionIdx, setSavedReflectionIdx] = useState(null);

  // Loading & Feedback States
  const [copiedMentorPrompt, setCopiedMentorPrompt] = useState(false);
  const [copiedScopePrompt, setCopiedScopePrompt] = useState(false);
  const [copiedCommitMsg, setCopiedCommitMsg] = useState(false);
  const [missionFeedback, setMissionFeedback] = useState(null); // { type, text }
  const [isCompleting, setIsCompleting] = useState(false);

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

  const progressRecord = useMemo(() => {
    const existing = practicalMissions[missionId] || {};
    return {
      status: existing.status || 'Available',
      proof: {
        githubRepoLink: '',
        githubCommitLink: '',
        screenshotNote: '',
        readmeCompleted: false,
        testCasesPassed: false,
        reflectionWritten: '',
        demoVideoLink: '',
        ...(existing.proof || {}),
      },
      reflections: existing.reflections || {},
      completedSteps: existing.completedSteps || [],
    };
  }, [practicalMissions, missionId]);

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
    setMissionFeedback(null);
    const requiresProof = mission.required || mission.evidenceRequired || mission.proofOfWork?.length > 0 ||
                          ['Boss Mission', 'Main Build', 'Final Project', 'Assessment'].includes(mission.difficulty);
    
    if (requiresProof && !isProofFormComplete()) {
      setMissionFeedback({
        type: 'error',
        text: 'Proof incomplete. Add the required evidence (GitHub repository, commit link, README check, and tests checked) before marking this complete.'
      });
      return;
    }
    setIsCompleting(true);
    setTimeout(() => {
      completePracticalMission(missionId);
      setIsCompleting(false);
    }, 750);
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
    setMissionFeedback({ type: 'warning', text: 'Blocker logged successfully! You can find it on the Dashboard and Blockers page.' });
    setTimeout(() => setMissionFeedback(null), 4000);
  };

  // Ask Mentor helper prompt prefill
  const copyMentorPrompt = () => {
    const p = `I am on Week ${week.weekNumber}, Mission "${mission.title}" (Difficulty: ${mission.difficulty}).
I am trying to build: ${mission.title}.
The scenario is: ${mission.scenario}
I created these files: ${(mission.filesToCreate || []).join(', ')}.
The error I got is: [Insert stack trace or behavior error here]
I have tried: [Insert steps tried here]
Please help me debug this without giving me the full answer immediately.`;
    navigator.clipboard.writeText(p);
    setCopiedMentorPrompt(true);
    setTimeout(() => setCopiedMentorPrompt(false), 3000);
  };

  // Pre-build scope prompt (fires BEFORE any code is written, when the learner
  // is unsure what is actually being asked - not when they already have an error).
  // Prefers an authored scopePromptTemplate; otherwise composes an equivalent
  // from the mission's own reconciled scope fields.
  const copyScopePrompt = () => {
    const concepts = (mission.conceptsUsed || []).join(', ');
    const features = (mission.requiredFeatures || []).map((f) => `- ${f}`).join('\n');
    const p =
      mission.scopePromptTemplate ||
      `I am on Week ${week.weekNumber}, Mission "${mission.title}" of my bootcamp.

Here is what the mission asks for:
${features}

The concepts this mission is meant to exercise are: ${concepts || 'see the required features above'}.
${mission.approachOutline ? `\nThe intended approach is:\n${mission.approachOutline}\n` : ''}
I have not written any code yet. I want to understand what is being asked before I start.

Please help me understand the requirements and plan my approach. Stay strictly within the concepts listed above, even if a more complete or more advanced solution occurs to you - going beyond that scope makes this harder for me to learn from, not easier. Do not write the solution for me.`;
    navigator.clipboard.writeText(p);
    setCopiedScopePrompt(true);
    setTimeout(() => setCopiedScopePrompt(false), 3000);
  };

  // Fields that have a dedicated, first-class place in the UI. Anything NOT
  // listed here falls through to the "Additional Mission Data" accordion, so
  // every field we render properly must be registered here or it renders twice.
  const knownFields = [
    'missionId', 'title', 'skillFocus', 'difficulty', 'timeEstimate', 'dataEstimate',
    'elliotRelevance', 'scenario', 'filesToCreate', 'conceptsUsed', 'stepByStepInstructions',
    'requiredFeatures', 'rules', 'testCases', 'debuggingDrills', 'doneMeansDone',
    'proofOfWork', 'githubCommitMessage', 'readmePrompt', 'reflectionQuestions', 'commanderMode',
    // Curriculum enrichment fields - each now rendered in Brief / Debug / Deeper
    'background', 'approachOutline', 'scopeNote', 'hints', 'commonMistakes',
    'debuggingChecklist', 'thinkingPrompts', 'stretchChallenge', 'realWorldApplications',
    'relatedConcepts', 'futureConcepts', 'commanderNotes', 'careerInsight', 'badges',
    'helpPromptTemplate', 'scopePromptTemplate',
    // Structural / display metadata the learner does not need surfaced raw
    'missionNumber', 'displayLabel', 'statusDefault', 'required', 'filesToCreateText',
    'completionPolicy', 'missionType', 'evidenceRequired',
  ];

  // Human-readable labels for any field that still reaches the accordion.
  // The app's own compatibility contract states internal IDs are for software
  // and friendly labels are for people - raw keys must never reach the screen.
  const FIELD_LABELS = {
    approachOutline: 'Approach Outline',
    background: 'Background',
    careerInsight: 'Career Insight',
    commanderNotes: 'Commander Notes',
    commonMistakes: 'Common Mistakes',
    debuggingChecklist: 'Debugging Checklist',
    futureConcepts: 'What This Unlocks Later',
    helpPromptTemplate: 'Help Prompt',
    hints: 'Hints',
    realWorldApplications: 'Real-World Applications',
    relatedConcepts: 'Related Concepts',
    scopeNote: 'Scope Note',
    scopePromptTemplate: 'Scope Prompt',
    stretchChallenge: 'Stretch Challenge',
    thinkingPrompts: 'Thinking Prompts',
  };

  const labelForField = (key) =>
    FIELD_LABELS[key] ||
    key
      .replace(/([A-Z])/g, ' $1')
      .replace(/[_-]+/g, ' ')
      .replace(/^./, (c) => c.toUpperCase())
      .trim();

  // Small helper so every enrichment block renders consistently whether the
  // authored value is a string or an array of strings.
  const renderFieldBody = (val, tone = 'text-slate-300') => {
    if (Array.isArray(val)) {
      return (
        <ul className="space-y-2">
          {val.map((item, idx) => (
            <li key={idx} className={`text-xs leading-relaxed flex gap-2 ${tone}`}>
              <span className="text-slate-600 select-none">–</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    }
    return <p className={`text-xs leading-relaxed whitespace-pre-line ${tone}`}>{val}</p>;
  };

  // Renders one enrichment section, or nothing at all when the field is empty.
  // Absence of authored content should be invisible, never an empty-state box.
  const EnrichmentCard = ({ field, title, icon: Icon, accent = 'text-white', border = '' }) => {
    const val = mission[field];
    if (!val || (Array.isArray(val) && val.length === 0)) return null;
    return (
      <div className={`card ${border}`}>
        <h3 className={`text-sm font-bold ${accent} mb-3 uppercase tracking-wide flex items-center gap-1.5`}>
          {Icon && <Icon className="w-4 h-4" aria-hidden="true" />}
          {title || labelForField(field)}
        </h3>
        {renderFieldBody(val)}
      </div>
    );
  };

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

            <h2 className="text-xl font-bold text-white uppercase tracking-wider"> Coordinates Locked</h2>
            <p className="text-xs text-accent-primary font-bold uppercase tracking-wider mt-1">
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
        <Link to="/missions" className="text-slate-400 hover:text-accent-primary transition-colors flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider">
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
            ) : isCompleting ? (
              <LoadingIndicator label="Marking complete..." size="sm" />
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

      {missionFeedback && (
        <StatusBanner type={missionFeedback.type} message={missionFeedback.text} onClose={() => setMissionFeedback(null)} className="mb-4" />
      )}

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
          { id: 'debug', label: 'If Stuck', icon: ShieldAlert },
          { id: 'deeper', label: 'Going Deeper', icon: Compass },
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
                <h3 className="text-sm font-bold text-white mb-3 uppercase tracking-wide">{roadmapShortTitle} Relevance</h3>
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{mission.elliotRelevance || `This milestone introduces skills that form core foundations of ${roadmapShortTitle}'s logic layers.`}"
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

            {/* --- Before You Build (curriculum enrichment) --- */}
            {(mission.background || mission.approachOutline || mission.scopeNote) && (
              <div className="pt-1">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
                  Before You Build
                </p>
                <div className="space-y-5">
                  <EnrichmentCard field="background" title="Background" icon={BookOpen} />
                  <EnrichmentCard
                    field="approachOutline"
                    title="Approach Outline"
                    icon={Compass}
                    accent="text-accent-primary"
                    border="border-accent-primary/20 bg-accent-primary/5"
                  />
                  <EnrichmentCard
                    field="scopeNote"
                    title="Scope Note"
                    icon={AlertTriangle}
                    accent="text-amber-400"
                    border="border-amber-500/20 bg-amber-500/5"
                  />
                </div>
              </div>
            )}

            {/* Pre-build scope prompt (B3) - available before any code exists */}
            <div className="card border-dashed">
              <h3 className="text-sm font-bold text-white mb-2">Not sure what's being asked?</h3>
              <p className="text-xs text-slate-500 mb-4">
                Copy a prompt that explains this mission's scope to any AI, and instructs it to stay
                inside that scope instead of handing you a bigger solution than the mission needs.
              </p>
              <button
                onClick={copyScopePrompt}
                className="btn-secondary text-xs flex items-center gap-1.5 border-accent-primary/20 text-accent-primary bg-accent-primary/5"
              >
                <Clipboard className="w-3.5 h-3.5" aria-hidden="true" />
                {copiedScopePrompt ? 'Copied!' : 'Copy Scope Prompt'}
              </button>
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
                <h3 className="text-sm font-bold text-blue-400 mb-2 uppercase tracking-wide flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-blue-450" /> Done Means Done Checklist
                </h3>
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
                  const checked = (Array.isArray(progressRecord.completedSteps) ? progressRecord.completedSteps : []).includes(idx);
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

            {/* Commander Mode now lives in the "Going Deeper" tab, grouped with
                the other optional extension material rather than sitting inside
                the required build steps. */}
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
                        <span className="text-[13px] font-semibold uppercase bg-navy-600 px-2 py-0.5 rounded text-accent-cyan">
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
            {/* --- If You Get Stuck (curriculum enrichment) --- */}
            {(mission.hints || mission.commonMistakes || mission.debuggingChecklist) && (
              <div>
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em] mb-3">
                  If You Get Stuck
                </p>
                <div className="space-y-5">
                  <EnrichmentCard
                    field="hints"
                    title="Hints"
                    icon={Lightbulb}
                    accent="text-amber-400"
                    border="border-amber-500/20 bg-amber-500/5"
                  />
                  <EnrichmentCard field="commonMistakes" title="Common Mistakes" icon={AlertTriangle} />
                  <EnrichmentCard field="debuggingChecklist" title="Debugging Checklist" icon={CheckSquare} />
                </div>
              </div>
            )}

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
                Ask {mentorName} using our prompt generator. They will guide you logically without spoiling solutions.
              </p>
              <button
                onClick={copyMentorPrompt}
                className="btn-secondary text-xs flex items-center gap-1.5 border-accent-primary/20 text-accent-primary bg-accent-primary/5"
              >
                <Clipboard className="w-3.5 h-3.5" /> {copiedMentorPrompt ? 'Copied!' : `Copy ${mentorName} Debug Request`}
              </button>
            </div>
          </div>
        )}

        {/* Going Deeper Tab */}
        {activeTab === 'deeper' && (
          <div className="space-y-5">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-[0.14em]">
              Going Deeper
            </p>
            <p className="text-xs text-slate-500 -mt-2">
              Optional. None of this blocks mission completion — it is here for when you want more
              than the minimum.
            </p>

            <EnrichmentCard
              field="stretchChallenge"
              title="Stretch Challenge"
              icon={Sparkles}
              accent="text-purple-400"
              border="border-purple-500/20 bg-purple-500/5"
            />
            <EnrichmentCard field="thinkingPrompts" title="Thinking Prompts" icon={HelpCircle} />
            <EnrichmentCard field="realWorldApplications" title="Real-World Applications" icon={Compass} />
            <EnrichmentCard field="careerInsight" title="Career Insight" icon={Sparkles} />
            <EnrichmentCard field="relatedConcepts" title="Related Concepts" icon={BookOpen} />
            <EnrichmentCard field="futureConcepts" title="What This Unlocks Later" icon={ChevronRight} />
            <EnrichmentCard
              field="commanderNotes"
              title="Commander Notes"
              icon={MessageSquare}
              accent="text-accent-primary"
              border="border-accent-primary/20 bg-accent-primary/5"
            />

            {/* Commander Mode - a general challenge mode that applies to every
                mission, deliberately not mission-specific. Mission-specific
                extension lives in Stretch Challenge above. */}
            {mission.commanderMode?.length > 0 && (
              <div className="card border-purple-500/20 bg-purple-500/5">
                <h3 className="text-sm font-bold text-purple-400 mb-1 uppercase tracking-wide flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" aria-hidden="true" />
                  Commander Mode
                </h3>
                <p className="text-[11px] text-slate-500 mb-3">
                  A standing challenge mode that applies to every mission in the bootcamp — not
                  specific guidance for this one.
                </p>
                <ul className="space-y-2">
                  {mission.commanderMode.map((item, idx) => (
                    <li key={idx} className="text-xs leading-relaxed text-slate-300 flex gap-2">
                      <span className="text-purple-400/60 select-none">–</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {!mission.stretchChallenge &&
              !mission.thinkingPrompts &&
              !mission.realWorldApplications &&
              !mission.relatedConcepts &&
              !mission.futureConcepts &&
              !mission.commanderNotes &&
              !mission.commanderMode?.length && (
                <div className="card text-center py-8">
                  <Compass className="w-8 h-8 text-slate-600 mx-auto mb-2" aria-hidden="true" />
                  <p className="text-xs text-slate-500">
                    No extension material authored for this mission yet.
                  </p>
                </div>
              )}
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
                        setCopiedCommitMsg(true);
                        setTimeout(() => setCopiedCommitMsg(false), 3000);
                      }}
                      className="text-slate-500 hover:text-accent-primary"
                    >
                      {copiedCommitMsg ? 'Copied!' : 'Copy'}
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
                : ['What was the most challenging part of this mission?', `How does this structure help build ${roadmapShortTitle}?`]
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
                      {savedReflectionIdx === qIdx ? 'Saved' : 'Save Answer'}
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
              <span>Additional Mission Data</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
            </summary>
            <div className="mt-4 border-t border-navy-400/50 pt-3 space-y-3">
              {Object.entries(unknownFields).map(([key, val]) => (
                <div key={key} className="text-xs">
                  <span className="font-bold text-slate-400 block tracking-wide">{labelForField(key)}</span>
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
