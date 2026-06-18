import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { Shield, Sparkles, Calendar, Clock, Upload, ArrowRight, Check } from 'lucide-react';

export default function Onboarding() {
  const { settings, updateSettings, resetToSampleRoadmap } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);

  // Local form states
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [hours, setHours] = useState('20-25');

  if (settings.onboardingCompleted) return null;

  const handleNext = () => {
    setStep((s) => s + 1);
  };

  const handleConfirmOnboarding = () => {
    updateSettings({
      startDate,
      weeklyHours: hours,
      onboardingCompleted: true,
    });
  };

  const handleUseSample = () => {
    resetToSampleRoadmap();
    handleNext();
  };

  const handleUploadCustom = () => {
    updateSettings({ startDate, weeklyHours: hours, onboardingCompleted: true });
    navigate('/import');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/90 backdrop-blur-md">
      <div className="card w-full max-w-lg bg-gradient-to-b from-navy-800 to-navy-900 border border-navy-400 p-6 sm:p-8 animate-scale-in text-center shadow-primary-glow">

        {/* Step Indicator */}
        <div className="flex justify-center gap-1.5 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                step === i ? 'w-8 bg-accent-primary' : step > i ? 'w-2 bg-accent-primary/40' : 'w-2 bg-navy-600'
              }`}
            />
          ))}
        </div>

        {/* Step 1: Welcome & Mission */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="relative mx-auto w-16 h-16 rounded-full bg-accent-primary/10 border border-accent-primary/30 flex items-center justify-center animate-glow-pulse">
              <Shield className="w-8 h-8 text-accent-primary" />
            </div>
            <h2 className="text-xl font-extrabold text-white">Welcome to XcelerateAI Command Center</h2>
            <p className="text-xs text-accent-primary font-bold tracking-widest uppercase font-mono">
              Bootcamp Operation Dashboard
            </p>
            <div className="bg-navy-950 border border-navy-400 rounded-xl p-4 text-left text-xs text-slate-300 space-y-2.5">
              <p>
                You are entering the mission cockpit for completing the <span className="text-white font-bold">XcelerateAI 6-Month JavaScript Mobile Ops Bootcamp</span>.
              </p>
              <p>Your final boss mission is to design, develop, and assemble:</p>
              <p className="text-accent-cyan font-bold text-center border border-accent-cyan/25 bg-accent-cyan/5 py-1.5 rounded">
                 Elliot V1 Working Product
              </p>
              <p>
                Every module, study resource, checkpoint, and practical mission is structured to make you capable of building Elliot.
              </p>
            </div>
            <button
              onClick={handleNext}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-3"
            >
              Initialize Cockpit <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2: Settings Config */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-accent-cyan/15 border border-accent-cyan/30 flex items-center justify-center mx-auto">
              <Calendar className="w-5 h-5 text-accent-cyan" />
            </div>
            <h2 className="text-lg font-bold text-white">Establish Boot Parameters</h2>
            <p className="text-xs text-slate-400">Configure parameters to map timeline dates correctly.</p>

            <div className="space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Bootcamp Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="input-base w-full text-sm font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">Target Study Hours per Week</label>
                <select
                  value={hours}
                  onChange={(e) => setHours(e.target.value)}
                  className="input-base w-full text-sm"
                >
                  <option value="15-20">15-20 Hours / Week (Standard)</option>
                  <option value="20-25">20-25 Hours / Week (Disciplined)</option>
                  <option value="25-30">25-30 Hours / Week (Extreme)</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleNext}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-3"
            >
              Save Parameters <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 3: Roadmap Selection */}
        {step === 3 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto">
              <Upload className="w-5 h-5 text-purple-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Load Mission Instructions</h2>
            <p className="text-xs text-slate-400">Choose roadmap data to power the cockpit.</p>

            <div className="grid gap-3 text-left">
              <button
                onClick={handleUseSample}
                className="p-4 bg-navy-800 border border-navy-400 hover:border-accent-primary/50 rounded-xl text-left transition-all hover:bg-navy-700 w-full"
              >
                <p className="text-sm font-bold text-white">Use Sample Roadmap (Built-in)</p>
                <p className="text-xs text-slate-500 mt-1">Loads the default 6-month JavaScript skeleton — hello.js, React capstones, React Native builds, and Elliot V1.</p>
              </button>

              <button
                onClick={handleUploadCustom}
                className="p-4 bg-navy-800 border border-navy-400 hover:border-accent-cyan/50 rounded-xl text-left transition-all hover:bg-navy-700 w-full"
              >
                <div className="flex items-start gap-2">
                  <Upload className="w-4 h-4 text-accent-cyan mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-white">Upload roadmap-data.json</p>
                    <p className="text-xs text-slate-500 mt-1">Navigate to the Import page to load your custom XcelerateAI mission taskbook JSON.</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Disciplined Progression Confirmation */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="w-12 h-12 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h2 className="text-lg font-bold text-white">Disciplined Progression Active</h2>
            <p className="text-xs text-slate-400">Command Center follows structured study locks by default.</p>

            <div className="bg-navy-950 border border-navy-400 rounded-xl p-4 text-left text-xs text-slate-300 space-y-2">
              {[
                'Week 1 is available immediately. Future weeks unlock only when preceding requirements are resolved.',
                'Study resources first → Skill Check → Build Practicals → Submit Proof → Reflect → Unlock.',
                'A manual override toggle is available in Settings in case you need to debug or skip a lockout.',
              ].map((msg, i) => (
                <div key={i} className="flex gap-2">
                  <span className="text-accent-primary flex-shrink-0">✓</span>
                  <p>{msg}</p>
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirmOnboarding}
              className="btn-primary w-full flex items-center justify-center gap-1.5 py-3 shadow-primary-glow"
            >
              <Check className="w-4 h-4" /> Start Week 1 Mission
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
