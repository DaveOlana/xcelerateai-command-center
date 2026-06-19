import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Calendar, Clock, Upload, Shield, Check, Sparkles } from 'lucide-react';

export default function Onboarding() {
  const { settings, updateSettings, resetToSampleRoadmap, roadmap } = useApp();
  const navigate = useNavigate();

  // Local form states
  const [startDate, setStartDate] = useState(settings.startDate || new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState(settings.weeklyHours || '20-25');
  const [roadmapStatus, setRoadmapStatus] = useState(roadmap ? 'loaded' : 'pending');

  if (settings.onboardingCompleted) return null;

  const handleUseSample = () => {
    resetToSampleRoadmap();
    setRoadmapStatus('loaded');
  };

  const handleUploadCustom = () => {
    // Save current parameters, set setup completed partially, and navigate to import page
    updateSettings({
      startDate,
      weeklyHours: hours,
    });
    navigate('/import');
  };

  const handleInitializeCockpit = () => {
    // Ensure a roadmap is loaded (fallback to sample if none exists)
    if (!roadmap || !roadmap.months || roadmap.months.length === 0) {
      resetToSampleRoadmap();
    }
    
    // Complete setup wizard
    updateSettings({
      startDate,
      weeklyHours: hours,
      onboardingCompleted: true,
    });
    
    localStorage.setItem('xai_setup_completed_v1', 'true');
    localStorage.setItem('xai_onboarding_seen_v1', 'false'); // ready to trigger guided tour
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-navy-950/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl my-0 space-y-4 sm:space-y-5 animate-fade-in">
        
        {/* Strong Welcome Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div className="flex justify-center">
            <img src="/xcelerate-logo.png" alt="XcelerateAI Logo" className="h-16 sm:h-24 md:h-28 max-w-full object-contain" />
          </div>
          <h2 className="text-[12px] sm:text-[14px] font-bold text-slate-450 uppercase tracking-[0.25em] select-none">
            Welcome to XcelerateAI Command Center
          </h2>
        </div>

        {/* Setup Cards Grid */}
        <div className="grid md:grid-cols-3 gap-5">
          
          {/* Card 1: Set Your Mission Start */}
          <div className="card flex flex-col justify-between p-5 sm:p-6 space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
                  <Calendar className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-450 border-emerald-500/20">
                  Configured
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Set Your Mission Start</h3>
                <p className="text-slate-450 text-xs leading-relaxed mt-0.5">
                  Choose your bootcamp start date and weekly learning rhythm.
                </p>
              </div>

              {/* Form Input fields */}
              <div className="space-y-2.5 pt-1">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-base py-1.5 px-3 w-full text-xs font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-450 uppercase tracking-wider">Target Pace</label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="input-base py-1.5 px-3 w-full text-xs font-semibold"
                  >
                    <option value="15-20">15-20 Hours / Week</option>
                    <option value="20-25">20-25 Hours / Week</option>
                    <option value="25-30">25-30 Hours / Week</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-navy-700/30">
              <p className="text-[11px] text-slate-450 text-center font-medium">Auto-saves rhythm parameters</p>
            </div>
          </div>

          {/* Card 2: Load Your Roadmap */}
          <div className="card flex flex-col justify-between p-5 sm:p-6 space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <Upload className="w-4.5 h-4.5" />
                </div>
                {roadmapStatus === 'loaded' ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-450 border-emerald-500/20">
                    Roadmap Active
                  </span>
                ) : (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
                    No Roadmap
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Load Your Roadmap</h3>
                <p className="text-slate-450 text-xs leading-relaxed mt-0.5">
                  Import a structured JSON roadmap or use the default XcelerateAI bootcamp path.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                <button
                  onClick={handleUseSample}
                  className={`w-full py-2 px-3 rounded-xl border text-[11px] font-bold transition-all ${
                    roadmapStatus === 'loaded' && !settings.usingCustomRoadmap
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-450'
                      : 'bg-navy-900 border-navy-700 hover:border-navy-600 text-white'
                  }`}
                >
                  {roadmapStatus === 'loaded' && !settings.usingCustomRoadmap ? '✓ Using Sample Roadmap' : 'Use Default (Sample)'}
                </button>
                <button
                  onClick={handleUploadCustom}
                  className="w-full btn-secondary py-2 text-[11px] font-bold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5"
                >
                  Upload Custom JSON
                </button>
              </div>
            </div>
            
            <div className="pt-2 border-t border-navy-700/30">
              <p className="text-[11px] text-slate-450 text-center font-medium">
                {settings.usingCustomRoadmap ? 'Custom roadmap active' : 'Sample roadmap initialized'}
              </p>
            </div>
          </div>

          {/* Card 3: Prepare Your Cockpit */}
          <div className="card flex flex-col justify-between p-5 sm:p-6 space-y-4">
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Shield className="w-4.5 h-4.5" />
                </div>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full border bg-navy-900 text-slate-400 border-navy-700">
                  Ready to Boot
                </span>
              </div>
              <div>
                <h3 className="text-base font-bold text-white leading-tight">Prepare Your Cockpit</h3>
                <p className="text-slate-450 text-xs leading-relaxed mt-0.5">
                  Confirm your setup, backup options, and daily execution flow.
                </p>
              </div>

              {/* Status summary list */}
              <div className="bg-navy-900 border border-navy-750/30 rounded-xl p-2.5 space-y-2 text-[11px] text-slate-400 font-medium">
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="text-white font-semibold">{startDate}</span>
                </div>
                <div className="flex justify-between">
                  <span>Weekly Pace:</span>
                  <span className="text-white font-semibold">{hours} Hours</span>
                </div>
                <div className="flex justify-between">
                  <span>Roadmap:</span>
                  <span className="text-accent-primary font-bold truncate max-w-[110px]">
                    {roadmap?.bootcampTitle || 'Sample Path'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleInitializeCockpit}
              className="btn-primary w-full py-2.5 text-xs font-bold shadow-primary-glow"
            >
              Initialize Cockpit
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
