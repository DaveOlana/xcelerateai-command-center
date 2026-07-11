import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { validateRoadmapJSON } from '../../utils/jsonValidator';
import { 
  Calendar, Clock, Upload, Shield, Check, Sparkles, User, FileJson, 
  ArrowLeft, ArrowRight, X, Layout, Target, BookOpen, Coffee, Award, 
  FileText, CheckSquare, Zap, BarChart2, CheckCircle2, ChevronRight, Play
} from 'lucide-react';
import StatusBanner from '../ui/StatusBanner';

export default function Onboarding() {
  const { 
    settings, 
    updateSettings, 
    resetToSampleRoadmap, 
    roadmap, 
    importRoadmap,
    onboardingCompleted,
    completeOnboarding,
    userProfile
  } = useApp();
  const navigate = useNavigate();



  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 10;

  // Step 2 form states
  const [userName, setUserName] = useState(userProfile?.name || '');
  const [userDisplayName, setUserDisplayName] = useState(userProfile?.displayName || '');
  const [step2Error, setStep2Error] = useState('');

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

  // Sync profile details if previously completed
  useEffect(() => {
    if (userProfile?.name && !userName) {
      setUserName(userProfile.name);
    }
    if (userProfile?.displayName && !userDisplayName) {
      setUserDisplayName(userProfile.displayName);
    }
  }, [userProfile, userName, userDisplayName]);

  const handleNext = () => {
    if (currentStep === 2 && !userName.trim()) {
      setStep2Error('Please enter your name to personalize your mission cockpit.');
      return;
    }
    setStep2Error('');
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
    const isReplay = localStorage.getItem('xai_setup_completed_v1') === 'true';
    if (!isReplay) {
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
    } else {
      // Replay mode: just mark completed, never touch profile or reset roadmap
      completeOnboarding(undefined, undefined);
    }

    localStorage.setItem('xai_setup_completed_v1', 'true');
    localStorage.setItem('xai_onboarding_seen_v1', 'false'); // Tour is ready
    navigate('/');
  };

  // If already onboardingCompleted in context, don't show the wizard
  if (onboardingCompleted) return null;

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

            {/* Stepper indicator with vertical timeline track */}
            <div className="hidden md:block relative pl-1">
              {/* Vertical line connector track */}
              <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-navy-800/40" />
              
              <div className="space-y-4 relative z-10">
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
                        ? 'text-accent-cyan' 
                        : currentStep > s 
                        ? 'text-emerald-450' 
                        : 'text-slate-500'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-mono font-bold transition-all duration-300 ${
                      currentStep === s 
                        ? 'border-accent-cyan bg-navy-950 text-accent-cyan shadow-cyan-glow scale-110' 
                        : currentStep > s 
                        ? 'border-emerald-500 bg-emerald-550/20 text-emerald-450' 
                        : 'border-navy-750 bg-navy-900 text-slate-600'
                    }`}>
                      {currentStep > s ? <Check className="w-3 h-3 text-emerald-450" /> : s}
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simple step string */}
          <div className="flex justify-between items-center text-xs font-semibold text-slate-550 border-t border-navy-850 pt-4">
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
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto md:mx-0 shadow-lg">
                  <img src="/xcelerate-icon.png" alt="XcelerateAI" className="w-6 h-6 object-contain" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-extrabold text-white tracking-tight">Welcome to XcelerateAI</h2>
                  <p className="text-[14px] text-slate-400 leading-relaxed">
                    XcelerateAI Command Center is a personalized dashboard designed to turn static roadmaps (JSON profiles) into interactive, mission-based learn-by-doing cockpits.
                  </p>
                  <p className="text-[12px] text-slate-500 leading-relaxed italic">
                    Let's configure your console parameters, callsign, and initial study rhythm.
                  </p>
                </div>
              </div>
            )}

            {/* STEP 2: SET IDENTITY */}
            {currentStep === 2 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Set Your Callsign Identity</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    How should the Command Center greet you during operational sessions?
                  </p>
                </div>
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Full Callsign / Name *</label>
                    <input 
                      type="text"
                      placeholder="e.g. Tolu, Jane, Marvelous"
                      value={userName}
                      onChange={(e) => {
                        setUserName(e.target.value);
                        if (!userDisplayName) setUserDisplayName(e.target.value);
                      }}
                      className="input-base w-full text-[14px] font-semibold text-white bg-navy-950 border-navy-800 focus:border-accent-primary"
                      autoFocus
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1.5">Display Title Callsign (Optional)</label>
                    <input 
                      type="text"
                      placeholder="e.g. Commander Jane, Explorer Jane"
                      value={userDisplayName}
                      onChange={(e) => setUserDisplayName(e.target.value)}
                      className="input-base w-full text-[14px] font-semibold text-white bg-navy-950 border-navy-800 focus:border-accent-primary"
                    />
                  </div>
                  {step2Error && (
                    <StatusBanner type="error" message={step2Error} onClose={() => setStep2Error('')} />
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: ROADMAP SELECT */}
            {currentStep === 3 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <FileJson className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Load Your Learning Roadmap</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Select a built-in curriculum roadmap or upload your custom course file.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 pt-2">
                  <button 
                    onClick={handleSelectSample}
                    className={`p-5 rounded-xl border flex flex-col justify-between text-left transition-all ${
                      roadmapSource === 'sample' 
                        ? 'border-accent-primary bg-navy-850/80 ring-1 ring-accent-primary/20 shadow-md' 
                        : 'border-navy-800 hover:border-navy-700 bg-navy-900/30 hover:bg-navy-850/20'
                    }`}
                  >
                    <span className="text-[11px] font-bold text-white uppercase tracking-widest">Default Sample</span>
                    <span className="text-[12px] text-slate-400 leading-relaxed mt-4">Load the default JavaScript Mobile Ops Bootcamp.</span>
                  </button>

                  <div 
                    onDrop={handleDrop}
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onClick={() => document.getElementById('onboard-upload').click()}
                    className={`p-5 rounded-xl border border-dashed flex flex-col justify-between text-left cursor-pointer transition-all ${
                      dragOver 
                        ? 'border-accent-primary bg-accent-primary/5' 
                        : roadmapSource === 'custom'
                        ? 'border-accent-primary bg-navy-850/80 ring-1 ring-accent-primary/20 shadow-md'
                        : 'border-navy-800 hover:border-navy-700 bg-navy-900/30 hover:bg-navy-850/20'
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
                      <span className="text-[11px] font-bold text-white uppercase tracking-widest">
                        {roadmapSource === 'custom' ? 'Custom JSON Loaded' : 'Upload custom'}
                      </span>
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                    <span className="text-[12px] text-slate-400 leading-relaxed mt-4">
                      {roadmapSource === 'custom' && pendingRoadmap
                        ? `Loaded: ${pendingRoadmap.title || 'Roadmap'}`
                        : 'Drag & drop your custom roadmap-data.json here.'}
                    </span>
                  </div>
                </div>

                {uploadError && (
                  <StatusBanner type="error" message={uploadError} onClose={() => setUploadError('')} />
                )}
              </div>
            )}

            {/* STEP 4: ROADMAP SUMMARY */}
            {currentStep === 4 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Verify Active Curriculum</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    We parsed the following metrics from your roadmap configuration:
                  </p>
                </div>

                {pendingRoadmap ? (
                  <div className="space-y-4 pt-2">
                    <div className="bg-navy-950 p-4 border border-navy-850 rounded-xl">
                      <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Active Bootcamp</p>
                      <h4 className="text-sm font-bold text-slate-200 leading-snug mt-1">{pendingRoadmap.title || pendingRoadmap.bootcampTitle || 'Imported Roadmap'}</h4>
                    </div>

                    <div className="grid grid-cols-3 gap-2 sm:gap-3">
                      {[
                        { label: 'Months', val: pendingRoadmap.months?.length || 0 },
                        { label: 'Weeks', val: pendingRoadmap.weeks?.length || 0 },
                        { label: 'Resources', val: pendingRoadmap.studyResources?.length || pendingRoadmap.weeks?.reduce((acc, w) => acc + (w.studyResources?.length || 0), 0) || 0 },
                        { label: 'Missions', val: pendingRoadmap.weeks?.reduce((acc, w) => acc + (w.practicalMissions?.length || 0), 0) || 0 },
                        { label: 'Projects', val: pendingRoadmap.projects?.length || 0 },
                        { label: 'Readiness', val: pendingRoadmap.readinessCategories?.length || 0 }
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-navy-950/40 rounded-xl p-3 text-center border border-navy-850">
                          <p className="text-xl font-mono font-medium text-slate-100">{val}</p>
                          <p className="text-[9px] font-semibold text-slate-500 mt-1 uppercase tracking-widest leading-none">{label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="text-[13px] text-slate-500 italic py-4 text-center">No roadmap statistics parsed.</p>
                )}
              </div>
            )}

            {/* STEP 5: THE DASHBOARD */}
            {currentStep === 5 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Layout className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">The Console Dashboard</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Your command deck provides live telemetry on your learning milestones, streaks, active weeks, and dynamic readiness tracks.
                  </p>
                </div>

                {/* Dashboard mock diagram */}
                <div className="bg-navy-950 p-4 border border-navy-850 rounded-xl space-y-3 font-mono text-[10px] text-slate-500 select-none">
                  <div className="flex justify-between items-center border-b border-navy-850 pb-2">
                    <span className="text-slate-350 font-semibold tracking-wider">COCKPIT CONSOLE</span>
                    <span className="text-[9px] text-accent-cyan bg-accent-cyan/10 border border-accent-cyan/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">LIVE TELEMETRY</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="border border-navy-850 p-2.5 rounded-lg bg-navy-900/60">
                      <p className="text-slate-500 font-semibold tracking-wider text-[9px]">STREAK</p>
                      <p className="text-slate-100 text-xs font-semibold mt-1">3 DAYS</p>
                    </div>
                    <div className="border border-navy-850 p-2.5 rounded-lg bg-navy-900/60">
                      <p className="text-slate-500 font-semibold tracking-wider text-[9px]">PROGRESS</p>
                      <p className="text-slate-100 text-xs font-semibold mt-1">18%</p>
                    </div>
                    <div className="border border-navy-850 p-2.5 rounded-lg bg-navy-900/60">
                      <p className="text-slate-500 font-semibold tracking-wider text-[9px]">READINESS</p>
                      <p className="text-accent-cyan text-xs font-semibold mt-1">READY</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: WEEKLY MISSIONS */}
            {currentStep === 6 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Structured Weekly Missions</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Each week progresses through a 6-stage operational pipeline designed for cognitive retention and proof:
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2.5 text-[10px] font-semibold text-slate-400">
                  {[
                    { title: '1. Study', desc: 'Resources & slides' },
                    { title: '2. Quiz', desc: 'Confidence checkpoint' },
                    { title: '3. Build', desc: 'Hands-on mission task' },
                    { title: '4. Proof', desc: 'Link commits & screens' },
                    { title: '5. Reflect', desc: 'Consolidate learnings' },
                    { title: '6. Unlock', desc: 'Advance to next week' }
                  ].map(({ title, desc }) => (
                    <div key={title} className="bg-navy-950 p-3 rounded-xl border border-navy-850">
                      <span className="text-slate-200 font-semibold block">{title}</span>
                      <span className="text-[9px] text-slate-500 block mt-1 leading-tight font-normal">{desc}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 7: TODAY'S FOCUS */}
            {currentStep === 7 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Today's Focus Cockpit</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    A distraction-free interface built to keep you centered. Focus Mode displays only the immediate next study resources, top priority checklist items, and the session timer.
                  </p>
                </div>

                <div className="bg-navy-950 border border-navy-850 rounded-xl p-4 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full border border-slate-700 bg-navy-900 flex items-center justify-center text-[11px] font-bold text-white font-mono shrink-0">
                    25:00
                  </div>
                  <div>
                    <span className="text-[9px] text-accent-primary bg-accent-primary/10 border border-accent-primary/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">ACTIVE BLOCK</span>
                    <h4 className="text-xs font-semibold text-slate-250 mt-1.5">Study Core Architecture Modules</h4>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 8: THE TIMER */}
            {currentStep === 8 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Rhythm & Timeboxing</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Set focus blocks and break periods to track study sessions. The console integrates dynamic scheduled sessions configured by your roadmap to manage your day.
                  </p>
                </div>

                <div className="bg-navy-950 p-4 border border-navy-850 rounded-xl space-y-2 text-xs text-slate-400">
                  <div className="flex justify-between border-b border-navy-850 pb-2">
                    <span className="font-semibold text-slate-350">Dynamic Session Rhythm</span>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Estimated</span>
                  </div>
                  <div className="flex justify-between text-[11px] pt-1">
                    <span className="text-slate-300">Study Resources block</span>
                    <span className="font-mono text-slate-500">120 Minutes</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-300">Practical Build Tasks</span>
                    <span className="font-mono text-slate-500">180 Minutes</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 9: PROOF OF WORK */}
            {currentStep === 9 && (
              <div className="space-y-4 animate-slide-up">
                <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-slate-350" />
                </div>
                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-white tracking-tight">Operational Proof of Work</h2>
                  <p className="text-[13px] text-slate-400 leading-relaxed">
                    Prove your weekly outcomes. To unlock the next week's timeline, you must document and save:
                  </p>
                </div>

                <div className="space-y-2.5 pt-1.5 text-xs text-slate-400">
                  <div className="flex items-center gap-3 bg-navy-950/60 p-3.5 rounded-xl border border-navy-850">
                    <Check className="w-4 h-4 text-emerald-450 flex-shrink-0" />
                    <span className="text-slate-300">Github repository connection and commit links.</span>
                  </div>
                  <div className="flex items-center gap-3 bg-navy-950/60 p-3.5 rounded-xl border border-navy-850">
                    <Check className="w-4 h-4 text-emerald-450 flex-shrink-0" />
                    <span className="text-slate-300">Screenshots or notes validating structural deliverables.</span>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 10: LAUNCH */}
            {currentStep === 10 && (
              <div className="space-y-5 animate-slide-up text-center">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mx-auto shadow-sm">
                  <Zap className="w-8 h-8 text-slate-200" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white tracking-tight">System Ready to Boot</h2>
                  <p className="text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
                    Onboarding setup complete. Welcome back, <span className="text-slate-200 font-bold">{userName || 'Operator'}</span>. Your mission cockpit is online.
                  </p>
                </div>
                <div className="pt-2">
                  <button 
                    onClick={handleFinish} 
                    className="btn-primary w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2 max-w-sm mx-auto shadow-lg"
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
