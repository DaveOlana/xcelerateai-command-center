import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { validateRoadmapJSON } from '../../utils/jsonValidator';
import { 
  Calendar, Clock, Upload, Shield, Check, Sparkles, User, FileJson, 
  ArrowLeft, ArrowRight, X, Layout, Target, BookOpen, Coffee, Award, 
  FileText, CheckSquare, Zap, BarChart2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { PageHeader, SectionCard, ProgressBar } from '../common/UIComponents';

export default function Onboarding() {
  const { 
    settings, 
    updateSettings, 
    resetToSampleRoadmap, 
    roadmap, 
    importRoadmap,
    onboardingCompleted,
    completeOnboarding
  } = useApp();
  const navigate = useNavigate();

  // If already onboardingCompleted in context, don't show the wizard
  if (onboardingCompleted) return null;

  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Step 2 form states
  const [userName, setUserName] = useState('');
  const [userDisplayName, setUserDisplayName] = useState('');

  // Step 3 roadmap upload / selection states
  const [dragOver, setDragOver] = useState(false);
  const [roadmapSource, setRoadmapSource] = useState('sample'); // 'sample' or 'custom'
  const [pendingRoadmap, setPendingRoadmap] = useState(roadmap);
  const [validationResult, setValidationResult] = useState(null);
  const [uploadError, setUploadError] = useState('');

  // Auto-sync pendingRoadmap if roadmap changes (e.g. from context defaults)
  useEffect(() => {
    if (roadmap && !pendingRoadmap) {
      setPendingRoadmap(roadmap);
    }
  }, [roadmap, pendingRoadmap]);

  const handleNext = () => {
    if (currentStep === 2 && !userName.trim()) {
      alert('Please enter your name to personalize your mission cockpit.');
      return;
    }
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    // Skip direct to Step 10
    if (currentStep === 2 && !userName.trim()) {
      // Default to Operator if skipped at Step 2
      setUserName('Operator');
      setUserDisplayName('Operator');
    }
    setCurrentStep(10);
  };

  const handleSelectSample = () => {
    resetToSampleRoadmap();
    setRoadmapSource('sample');
    setUploadError('');
    setValidationResult(null);
    // In AppContext, resetToSampleRoadmap sets context roadmap.
    // We will sync pendingRoadmap in the next render, but let's set it here too
    try {
      // Import template sample
      const sample = require('../../data/sampleRoadmap').sampleRoadmap;
      const res = validateRoadmapJSON(sample);
      if (res.valid) {
        setPendingRoadmap(res.normalizedData);
      }
    } catch (e) {
      // fallback if require fails
      setPendingRoadmap(roadmap);
    }
  };

  const processFile = useCallback((file) => {
    setUploadError('');
    setValidationResult(null);

    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setUploadError('Please upload a .json file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const result = validateRoadmapJSON(data);
        setValidationResult(result);
        if (result.valid) {
          setPendingRoadmap(result.normalizedData);
          setRoadmapSource('custom');
        } else {
          setUploadError(result.errors[0] || 'Validation failed.');
        }
      } catch (err) {
        setUploadError('Invalid JSON file. Please check file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleFinish = () => {
    // 1. Confirm and save the roadmap selection
    if (roadmapSource === 'custom' && pendingRoadmap) {
      importRoadmap(pendingRoadmap);
    } else {
      resetToSampleRoadmap();
    }

    // 2. Complete onboarding with the identity
    const finalName = userName.trim() || 'Operator';
    const finalDisplay = userDisplayName.trim() || finalName;
    completeOnboarding(finalName, finalDisplay);

    localStorage.setItem('xai_setup_completed_v1', 'true');
    localStorage.setItem('xai_onboarding_seen_v1', 'false'); // Tour is ready
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-navy-950/98 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-4xl bg-navy-900 border border-navy-700/60 rounded-3xl shadow-2xl flex flex-col md:flex-row overflow-hidden h-[90vh] md:h-[650px] animate-scale-in">
        
        {/* LEFT PANEL: Progress Tracker & Visual Indicators */}
        <div className="w-full md:w-80 bg-navy-950 p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-navy-800 flex-shrink-0">
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <img src="/xcelerate-icon.png" alt="X" className="w-8 h-8 object-contain" />
              <div>
                <h1 className="text-sm font-black text-white leading-none">XcelerateAI</h1>
                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">Command Center</p>
              </div>
            </div>

            {/* Stepper indicator */}
            <div className="hidden md:block space-y-3.5">
              {[
                { s: 1, label: 'Welcome' },
                { s: 2, label: 'Your Identity' },
                { s: 3, label: 'Select Roadmap' },
                { s: 4, label: 'Confirm Summary' },
                { s: 5, label: 'The Dashboard' },
                { s: 6, label: 'Weekly Missions' },
                { s: 7, label: "Today's Focus" },
                { s: 8, label: 'Timer & Rhythm' },
                { s: 9, label: 'Proof of Work' },
                { s: 10, label: 'Launch' }
              ].map(({ s, label }) => (
                <div 
                  key={s} 
                  className={`flex items-center gap-3 transition-colors ${
                    currentStep === s 
                      ? 'text-accent-primary' 
                      : currentStep > s 
                      ? 'text-emerald-450' 
                      : 'text-slate-650'
                  }`}
                >
                  <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono font-bold transition-all ${
                    currentStep === s 
                      ? 'border-accent-primary bg-accent-primary/10 shadow-primary-glow-sm' 
                      : currentStep > s 
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-450' 
                      : 'border-navy-700 bg-navy-900'
                  }`}>
                    {currentStep > s ? '✓' : s}
                  </div>
                  <span className="text-xs font-semibold tracking-wide">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Simple step string */}
          <div className="flex justify-between items-center text-xs font-mono font-semibold text-slate-550 border-t border-navy-850 pt-4">
            <span>Step {currentStep} of {totalSteps}</span>
            <div className="w-24 h-1.5 bg-navy-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-accent-primary transition-all duration-300 shadow-primary-glow"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Dynamic Step Content */}
        <div className="flex-1 flex flex-col justify-between p-6 sm:p-8 md:p-10 relative overflow-y-auto">
          
          {/* Header Action: Skip button */}
          {currentStep < 10 && (
            <button 
              onClick={handleSkip} 
              className="absolute right-6 top-6 text-xs font-bold text-slate-500 hover:text-white uppercase tracking-wider transition-colors"
            >
              Skip Setup
            </button>
          )}

          <div className="flex-1 flex flex-col justify-center max-w-xl mx-auto w-full my-auto space-y-6">
            
            {/* STEP 1: WELCOME */}
            {currentStep === 1 && (
              <div className="space-y-4 animate-slide-up text-center md:text-left">
                <div className="w-14 h-14 rounded-2xl bg-accent-primary/10 border border-accent-primary/20 flex items-center justify-center mx-auto md:mx-0">
                  <Sparkles className="w-7 h-7 text-accent-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to XcelerateAI</h2>
                  <p className="text-sm text-slate-400 leading-relaxed">
                    XcelerateAI Command Center is a personalized dashboard designed to turn static roadmaps (JSON profiles) into interactive, mission-based learn-by-doing cockpits.
                  </p>
                  <p className="text-xs text-slate-550 leading-relaxed italic">
                    Let's configure your console parameters, callsign, and initial study rhythm.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SET IDENTITY */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                  <User className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Set Your Callsign Identity</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    How should the Command Center greet you during operational sessions?
                  </p>
                </div>
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Full Callsign / Name *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Dave, Marvelous, Tolu"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (!userDisplayName) setUserDisplayName(e.target.value);
                      }}
                      className="input-base w-full text-sm font-semibold text-white"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider block mb-1">Display Title Callsign (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Commander Dave, Explorer Dave"
                      value={userDisplayName}
                      onChange={(e) => setUserDisplayName(e.target.value)}
                      className="input-base w-full text-sm font-semibold text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: ROADMAP SELECT */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-pink-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Load Your Learning Roadmap</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    Select a built-in curriculum roadmap or upload your custom course file.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3.5 pt-2">
                  <button 
                    onClick={handleSelectSample}
                    className={`p-4 rounded-xl border-2 flex flex-col justify-between text-left transition-all ${
                      roadmapSource === 'sample' 
                        ? 'border-accent-primary bg-navy-850/60' 
                        : 'border-navy-700/50 hover:border-navy-600 bg-navy-900/40'
                    }`}
                  >
                    <span className="text-xs font-bold text-white uppercase tracking-wider">Default Sample</span>
                    <span className="text-[10px] text-slate-500 leading-relaxed mt-4">Load Dave's 6-Month JS Mobile Ops Bootcamp.</span>
                  </button>

                  <div 
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById('onboard-upload').click()}
                    className={`p-4 rounded-xl border-2 border-dashed flex flex-col justify-between text-left cursor-pointer transition-all ${
                      dragOver 
                        ? 'border-accent-primary bg-accent-primary/5' 
                        : roadmapSource === 'custom'
                        ? 'border-cyan-400 bg-navy-850/60'
                        : 'border-navy-700/50 hover:border-navy-600 bg-navy-900/40'
                    }`}
                  >
                    <input 
                      id="onboard-upload"
                      type="file"
                      accept=".json"
                      onChange={handleFileInput}
                      className="hidden"
                    />
                    <div className="flex justify-between items-center w-full">
                      <span className="text-xs font-bold text-white uppercase tracking-wider">
                        {roadmapSource === 'custom' ? 'Custom JSON ✓' : 'Upload custom'}
                      </span>
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-[10px] text-slate-500 leading-relaxed mt-4">
                      {roadmapSource === 'custom' && pendingRoadmap
                        ? `Loaded: ${pendingRoadmap.title || 'Roadmap'}`
                        : 'Drag & drop your custom roadmap-data.json here.'}
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <p className="text-red-400 text-[11px] font-semibold bg-red-500/5 border border-red-500/10 rounded-lg p-2.5">
                    ✗ {uploadError}
                  </p>
                )}
              </div>
            )}

            {/* STEP 4: ROADMAP SUMMARY */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Verify Active Curriculum</h2>
                  <p className="text-xs text-slate-400 leading-relaxed mt-0.5">
                    We parsed the following metrics from your roadmap configuration:
                  </p>
                </div>

                {pendingRoadmap ? (
                  <div className="space-y-3 pt-2">
                    <div className="bg-navy-950 p-4 border border-navy-800 rounded-xl">
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Bootcamp</p>
                      <h4 className="text-sm font-bold text-white leading-snug mt-1">{pendingRoadmap.title || pendingRoadmap.bootcampTitle || 'Imported Roadmap'}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { label: 'Months', val: pendingRoadmap.months?.length || 0, color: 'text-accent-primary' },
                        { label: 'Weeks', val: pendingRoadmap.weeks?.length || 0, color: 'text-blue-400' },
                        { label: 'Resources', val: pendingRoadmap.studyResources?.length || pendingRoadmap.weeks?.reduce((acc, w) => acc + (w.studyResources?.length || 0), 0) || 0, color: 'text-amber-400' },
                        { label: 'Missions', val: pendingRoadmap.weeks?.reduce((acc, w) => acc + (w.practicalMissions?.length || 0), 0) || 0, color: 'text-pink-400' },
                        { label: 'Projects', val: pendingRoadmap.projects?.length || 0, color: 'text-emerald-450' },
                        { label: 'Readiness', val: pendingRoadmap.readinessCategories?.length || 0, color: 'text-cyan-455' }
                      ].map(({ label, val, color }) => (
                        <div key={label} className="bg-navy-950/50 rounded-lg p-2.5 text-center border border-navy-800">
                          <p className={`text-base font-black ${color}`}>{val}</p>
                          <p className="text-[9px] font-bold text-slate-550 mt-0.5 uppercase tracking-wide leading-none">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 italic py-4 text-center">No roadmap statistics parsed.</p>
                )}
              </div>
            )}

            {/* STEP 5: THE DASHBOARD */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                  <Layout className="w-6 h-6 text-blue-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">The Console Dashboard</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Your command deck provides live telemetry on your learning milestones, streaks, active weeks, and dynamic readiness tracks.
                  </p>
                </div>

                {/* Dashboard mock diagram */}
                <div className="bg-navy-950 p-4 border border-navy-800 rounded-xl space-y-3 font-mono text-[10px] text-slate-500 select-none">
                  <div className="flex justify-between items-center border-b border-navy-850 pb-2">
                    <span className="text-white font-bold">COCKPIT CONSOLE</span>
                    <span className="badge-slate font-bold">LIVE TELEMETRY</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="border border-navy-800 p-2 rounded bg-navy-900">
                      <p className="text-slate-400 font-bold">STREAK</p>
                      <p className="text-amber-400 text-xs font-bold mt-1">🔥 3 DAYS</p>
                    </div>
                    <div className="border border-navy-800 p-2 rounded bg-navy-900">
                      <p className="text-slate-400 font-bold">PROGRESS</p>
                      <p className="text-blue-400 text-xs font-bold mt-1">📈 18%</p>
                    </div>
                    <div className="border border-navy-800 p-2 rounded bg-navy-900">
                      <p className="text-slate-400 font-bold">READINESS</p>
                      <p className="text-cyan-400 text-xs font-bold mt-1">⚡ READY</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: WEEKLY MISSIONS */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-purple-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Structured Weekly Missions</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Each week progresses through a 6-stage operational pipeline designed for cognitive retention and proof:
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-[10px] font-semibold text-slate-400">
                  {[
                    { title: '1. Study', desc: 'Resources & slides' },
                    { title: '2. Quiz', desc: 'Confidence checkpoint' },
                    { title: '3. Build', desc: 'Hands-on mission task' },
                    { title: '4. Proof', desc: 'Link commits & screens' },
                    { title: '5. Reflect', desc: 'Consolidate learnings' },
                    { title: '6. Unlock', desc: 'Advance to next week' }
                  ].map(({ title, desc }) => (
                    <div key={title} className="bg-navy-950 p-2.5 rounded-lg border border-navy-800">
                      <span className="text-accent-primary font-bold block">{title}</span>
                      <span className="text-[9px] text-slate-500 block mt-0.5 leading-tight">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: TODAY'S FOCUS */}
            {currentStep === 7 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center">
                  <Target className="w-6 h-6 text-pink-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Today's Focus Cockpit</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    A distraction-free interface built to keep you centered. Focus Mode displays only the immediate next study resources, top priority checklist items, and the session timer.
                  </p>
                </div>

                <div className="bg-navy-950 border border-navy-800 rounded-xl p-3 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full border-2 border-accent-primary flex items-center justify-center text-[10px] font-bold text-white font-mono shrink-0">
                    25:00
                  </div>
                  <div>
                    <span className="badge-blue text-[9px]">ACTIVE BLOCK</span>
                    <h4 className="text-xs font-bold text-white mt-1">Study Core Architecture Modules</h4>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: THE TIMER */}
            {currentStep === 8 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-orange-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Rhythm & Timeboxing</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Set focus blocks and break periods to track study sessions. The console integrates dynamic scheduled sessions configured by your roadmap to manage your day.
                  </p>
                </div>

                <div className="bg-navy-950 p-4 border border-navy-800 rounded-xl space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between border-b border-navy-850 pb-2">
                    <span className="font-semibold text-white">Dynamic Session Rhythm</span>
                    <span className="text-accent-primary font-bold">Estimated</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>📖 Study Resources block</span>
                    <span className="font-mono text-slate-500">120 Minutes</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span>🛠 Practical Build Tasks</span>
                    <span className="font-mono text-slate-500">180 Minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: PROOF OF WORK */}
            {currentStep === 9 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Award className="w-6 h-6 text-amber-400" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-xl font-bold text-white tracking-tight">Operational Proof of Work</h2>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Prove your weekly outcomes. To unlock the next week's timeline, you must document and save:
                  </p>
                </div>

                <div className="space-y-2 pt-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-2 bg-navy-950/60 p-2.5 rounded-lg border border-navy-800">
                    <span className="text-accent-cyan font-bold">✓</span>
                    <span>Github repository connection and commit links.</span>
                  </div>
                  <div className="flex items-center gap-2 bg-navy-950/60 p-2.5 rounded-lg border border-navy-800">
                    <span className="text-accent-cyan font-bold">✓</span>
                    <span>Screenshots or notes validating structural deliverables.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: LAUNCH */}
            {currentStep === 10 && (
              <div className="space-y-5 animate-slide-up text-center">
                <div className="w-16 h-16 rounded-2xl bg-accent-primary/15 border-2 border-accent-primary/30 flex items-center justify-center mx-auto shadow-primary-glow">
                  <Zap className="w-8 h-8 text-accent-primary animate-pulse" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">System Ready to Boot</h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Onboarding setup complete. Welcome back, <span className="text-accent-cyan font-bold">{userName || 'Operator'}</span>. Your mission cockpit is online.
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleFinish} 
                    className="btn-primary w-full py-3.5 text-sm font-bold shadow-primary-glow flex items-center justify-center gap-2 max-w-sm mx-auto"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    Enter Command Center
                  </button>
                </div>
              </div>
            )}

          </div>

          {/* Stepper Navigation buttons */}
          <div className="flex justify-between items-center border-t border-navy-850 pt-5 mt-6 shrink-0">
            {currentStep > 1 && currentStep < 10 ? (
              <button 
                onClick={handleBack} 
                className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < 10 && (
              <button 
                onClick={handleNext} 
                className="btn-primary py-2.5 px-6 text-xs font-bold flex items-center gap-1.5"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
