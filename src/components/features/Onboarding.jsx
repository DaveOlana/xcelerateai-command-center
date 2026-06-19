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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/95 backdrop-blur-md overflow-y-auto">
      <div className="w-full max-w-5xl my-8 space-y-8 animate-fade-in">
        
        {/* Strong Welcome Hero Section */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="flex justify-center mb-1">
            <img src="/xcelerate-logo.png" alt="XcelerateAI Logo" className="h-12 sm:h-16 object-contain" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Welcome to XcelerateAI Command Center
          </h1>
          <p className="text-slate-400 text-base sm:text-lg leading-relaxed font-medium">
            Set up your cockpit, load your roadmap, and begin building Elliot V1.
          </p>
        </div>

        {/* Setup Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6">
          
          {/* Card 1: Set Your Mission Start */}
          <div className="card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-accent-primary/10 border border-accent-primary/20 text-accent-primary">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-450 border-emerald-500/20">
                  Configured
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Set Your Mission Start</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mt-1">
                  Choose your bootcamp start date and weekly learning rhythm.
                </p>
              </div>

              {/* Form Input fields */}
              <div className="space-y-3.5 pt-2">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="input-base w-full text-sm font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-450 uppercase tracking-wider">Target Pace</label>
                  <select
                    value={hours}
                    onChange={(e) => setHours(e.target.value)}
                    className="input-base w-full text-sm font-semibold"
                  >
                    <option value="15-20">15-20 Hours / Week</option>
                    <option value="20-25">20-25 Hours / Week</option>
                    <option value="25-30">25-30 Hours / Week</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="pt-2 border-t border-navy-700/30">
              <p className="text-[12px] text-slate-450 text-center font-medium">Auto-saves rhythm parameters</p>
            </div>
          </div>

          {/* Card 2: Load Your Roadmap */}
          <div className="card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">
                  <Upload className="w-5 h-5" />
                </div>
                {roadmapStatus === 'loaded' ? (
                  <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-450 border-emerald-500/20">
                    Roadmap Active
                  </span>
                ) : (
                  <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/20">
                    No Roadmap
                  </span>
                )}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Load Your Roadmap</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mt-1">
                  Import a structured JSON roadmap or use the default XcelerateAI bootcamp path.
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleUseSample}
                  className={`w-full py-2.5 px-4 rounded-xl border text-xs font-bold transition-all ${
                    roadmapStatus === 'loaded' && !settings.usingCustomRoadmap
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-450'
                      : 'bg-navy-900 border-navy-700 hover:border-navy-600 text-white'
                  }`}
                >
                  {roadmapStatus === 'loaded' && !settings.usingCustomRoadmap ? '✓ Using Sample Roadmap' : 'Use Default (Sample)'}
                </button>
                <button
                  onClick={handleUploadCustom}
                  className="w-full btn-secondary py-2.5 text-xs font-bold text-accent-cyan border-accent-cyan/20 hover:bg-accent-cyan/5"
                >
                  Upload Custom JSON
                </button>
              </div>
            </div>
            
            <div className="pt-2 border-t border-navy-700/30">
              <p className="text-[12px] text-slate-450 text-center font-medium">
                {settings.usingCustomRoadmap ? 'Custom roadmap active' : 'Sample roadmap initialized'}
              </p>
            </div>
          </div>

          {/* Card 3: Prepare Your Cockpit */}
          <div className="card flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400">
                  <Shield className="w-5 h-5" />
                </div>
                <span className="text-[12px] font-bold px-2.5 py-0.5 rounded-full border bg-navy-900 text-slate-400 border-navy-700">
                  Ready to Boot
                </span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Prepare Your Cockpit</h3>
                <p className="text-slate-400 text-[13px] leading-relaxed mt-1">
                  Confirm your setup, backup options, and daily execution flow.
                </p>
              </div>

              {/* Status summary list */}
              <div className="bg-navy-900 border border-navy-750/30 rounded-xl p-3.5 space-y-2.5 text-xs text-slate-400 font-medium">
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
                  <span className="text-accent-primary font-bold truncate max-w-[120px]">
                    {roadmap?.bootcampTitle || 'Sample Path'}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={handleInitializeCockpit}
              className="btn-primary w-full py-3 text-xs font-bold shadow-primary-glow"
            >
              Initialize Cockpit
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
