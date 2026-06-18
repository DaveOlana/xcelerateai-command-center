import React, { useState } from 'react';
import {
  Settings as SettingsIcon, Trash2, RefreshCw, Download,
  Upload, Calendar, User, MessageSquare, AlertTriangle, CheckCircle2, ShieldAlert
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getTodayISO } from '../utils/dateUtils';
import { PageShell, PageHeader, SectionCard, CommandButton, SecondaryButton, StatusBadge, InfoPill } from '../components/common/UIComponents';

const DEFAULT_PROGRESS = {
  completedTasks: {},
  completedWeeks: [],
  completedProjectMilestones: {},
  projectGithubLinks: {},
  projectNotes: {},
};

const DEFAULT_STREAK = {
  currentStreak: 0,
  lastStudyDate: null,
  longestStreak: 0,
  totalStudyDays: 0,
};

export default function Settings() {
  const {
    settings, updateSettings, setActiveWeek,
    resetAllProgress, exportProgress, importProgress,
    resetToSampleRoadmap, roadmap,
  } = useApp();

  const [saved, setSaved] = useState(false);
  const [activeResetType, setActiveResetType] = useState(null);
  const [importMsg, setImportMsg] = useState('');

  const totalWeeks = roadmap?.months?.reduce((a, m) => a + (m.weeks?.length || 0), 0) || 24;

  const handleSave = () => {
    if (settings.manualOverrideEnabled && !settings.overrideReason?.trim()) {
      alert('Please provide a reason for overriding prerequisites locking in Advanced Controls.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleResetClick = (type) => {
    setActiveResetType(type);
  };

  const executeReset = () => {
    if (activeResetType === 'progress') {
      importProgress({
        roadmap: roadmap,
        settings: {
          ...settings,
          activeWeek: 1,
          activeMonth: 1,
          manualOverrideEnabled: false,
          overrideReason: ''
        },
        progress: DEFAULT_PROGRESS,
        notes: [],
        checkpointStatuses: {},
        streak: DEFAULT_STREAK,
        resourcesStatus: {},
        skillChecks: {},
        practicalMissions: {},
        blockers: [],
        weekProofs: {},
        weekReflections: {}
      });
      alert('Learning progress logs have been reset. Current roadmap config was preserved.');
    } else if (activeResetType === 'roadmap') {
      resetToSampleRoadmap();
      alert('Roadmap reverted to default sample. Progress and settings have been reset.');
    } else if (activeResetType === 'factory') {
      resetAllProgress();
      alert('Factory Reset executed. All browser local storage data has been cleared.');
    }
    setActiveResetType(null);
  };

  const handleProgressImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (!data.version || !data.exportedAt) {
          setImportMsg('error');
          return;
        }
        importProgress(data);
        setImportMsg('success');
      } catch {
        setImportMsg('error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <PageShell className="max-w-2xl">
      <PageHeader
        title="Settings"
        subtitle="Configure your personal learning operating system."
      />

      {/* Bootcamp Configuration */}
      <SectionCard className="space-y-5 border border-navy-400">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Calendar className="w-4 h-4 text-accent-primary" />
          Bootcamp Configuration
        </h2>

        {/* Start Date */}
        <div>
          <label className="section-label mb-1.5 block">Bootcamp Start Date</label>
          <input
            type="date"
            value={settings.startDate || ''}
            max={getTodayISO()}
            onChange={(e) => updateSettings({ startDate: e.target.value || null })}
            className="input-base w-full text-sm"
          />
          <p className="text-xs text-slate-600 mt-1.5">
            Used to show day count trackers relative to target completion dates.
          </p>
        </div>

        {/* Learner Name */}
        <div>
          <label className="section-label mb-1.5 flex items-center gap-1.5 block">
            <User className="w-3 h-3 text-slate-400" /> Learner Name
          </label>
          <p className="text-xs text-slate-500 mb-2">
            Loaded from active roadmap schema configuration (<code className="text-accent-primary text-[13px]">"learner"</code> attribute).
          </p>
          <div className="input-base text-sm text-slate-500 cursor-not-allowed bg-navy-950 border border-navy-400">
            {roadmap?.learner || 'Set in roadmap JSON'}
          </div>
        </div>

        {/* Mentor Name */}
        <div>
          <label className="section-label mb-1.5 flex items-center gap-1.5 block">
            <MessageSquare className="w-3 h-3 text-slate-400" /> Mentor / Accountability Code Name
          </label>
          <input
            type="text"
            placeholder="e.g. Lemont"
            value={settings.mentorName || ''}
            onChange={(e) => updateSettings({ mentorName: e.target.value })}
            className="input-base w-full text-sm"
          />
          <p className="text-xs text-slate-600 mt-1.5">
            This tag customizes mentor-facing prompt templates and journal note guides.
          </p>
        </div>

        {/* Active Week */}
        <div>
          <label className="section-label mb-1.5 block">Active Week Coordinates (Manual Adjustment)</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={totalWeeks}
              value={settings.activeWeek}
              onChange={(e) => {
                const v = Math.min(Math.max(1, Number(e.target.value)), totalWeeks);
                setActiveWeek(v);
              }}
              className="input-base w-24 text-sm text-center font-mono"
            />
            <p className="text-xs text-slate-500">of {totalWeeks} weeks total</p>
          </div>
          <p className="text-xs text-slate-600 mt-1.5">
            Synchronizes timeline indices. Completing weekly missions automatically increments this.
          </p>
        </div>

        <CommandButton onClick={handleSave}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Changes Applied!</> : 'Apply Configurations'}
        </CommandButton>
      </SectionCard>

      {/* Advanced Controls Override */}
      <SectionCard className="space-y-4 border border-navy-400">
        <h2 className="font-bold text-white flex items-center gap-2">
          <SettingsIcon className="w-4 h-4 text-accent-cyan" />
          Advanced Controls
        </h2>
        <p className="text-xs text-slate-500">
          Gating override tools to unlock all weeks and milestones without completing sequential requirements.
        </p>

        <div className="space-y-4">
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.manualOverrideEnabled || false}
              onChange={(e) => {
                const checked = e.target.checked;
                updateSettings({
                  manualOverrideEnabled: checked,
                  overrideReason: checked ? settings.overrideReason : ''
                });
              }}
              className="mt-1 h-4 w-4 rounded border-navy-400 bg-navy-900 text-accent-cyan focus:ring-accent-cyan"
            />
            <div>
              <span className="text-sm font-semibold text-white">Enable Prerequisite Override (Unlock All)</span>
              <p className="text-xs text-slate-500 mt-0.5">
                Temporarily ignore required resources, checkpoints, and mission dependency locks.
              </p>
            </div>
          </label>

          {settings.manualOverrideEnabled && (
            <div className="space-y-2.5 animate-scale-in bg-navy-950 p-4 border border-navy-400 rounded-xl">
              <label className="text-[13px] text-amber-400 font-bold block uppercase tracking-wider">
                Reason for Lock Override *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Log your reasoning (e.g., 'Inspecting Week 6 database structures to plan Backend schema')"
                value={settings.overrideReason || ''}
                onChange={(e) => updateSettings({ overrideReason: e.target.value })}
                className="input-base w-full text-xs resize-none"
              />
              <p className="text-[13px] text-slate-500 italic">
                A valid log reason maintains coding discipline when bypassing systemic guardrails.
              </p>
            </div>
          )}
        </div>
      </SectionCard>

      {/* Progress Export/Import & Backup Logs */}
      <SectionCard className="space-y-4 border border-navy-400">
        <h2 className="font-bold text-white flex items-center gap-2">
          <Download className="w-4 h-4 text-blue-400" />
          Data Backups & Recovery
        </h2>
        <p className="text-xs text-slate-500">
          Save your database as a portable JSON file. Dave recommends backing up before importing new roadmaps.
        </p>

        {settings.lastBackupDate && (
          <div className="text-xs text-slate-400 bg-navy-950 border border-navy-400/50 rounded-lg p-2.5 flex justify-between items-center">
            <span>Last local backup created:</span>
            <span className="font-mono text-accent-primary font-bold">
              {new Date(settings.lastBackupDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        )}

        <div className="flex gap-3 flex-wrap">
          <button
            onClick={exportProgress}
            className="btn-secondary flex items-center gap-2 text-sm border-blue-500/20 text-blue-400 hover:text-white"
          >
            <Download className="w-4 h-4" /> Export Backup file
          </button>

          <label className="btn-secondary flex items-center gap-2 text-sm cursor-pointer border-navy-300 text-slate-400 hover:text-white">
            <Upload className="w-4 h-4" /> Restore Backup
            <input type="file" accept=".json" className="hidden" onChange={handleProgressImport} />
          </label>
        </div>

        {importMsg === 'success' && (
          <div className="flex items-center gap-2 text-sm text-accent-primary bg-accent-primary/5 border border-accent-primary/20 p-2.5 rounded-lg animate-scale-in">
            <CheckCircle2 className="w-4 h-4" /> Backup data restored successfully!
          </div>
        )}
        {importMsg === 'error' && (
          <p className="text-sm text-red-400 bg-red-500/5 border border-red-500/20 p-2.5 rounded-lg animate-scale-in">
            Invalid backup format. Please select a JSON backup file exported from the Command Center.
          </p>
        )}
      </SectionCard>

      {/* Danger Zone Resets */}
      <SectionCard className="border-red-500/25 space-y-5 bg-red-500/5 shadow-red-glow-sm">
        <h2 className="font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-red-400 animate-pulse" />
          Danger Zone Actions
        </h2>

        <div className="space-y-4">
          {/* Reset Progress */}
          <div className="border-b border-navy-400/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Reset Learning Progress only</p>
              <p className="text-xs text-slate-500">
                Wipe tasks, checkpoints, practical logs, and blockers. Preserves current settings and imported roadmap.
              </p>
            </div>
            <button
              onClick={() => handleResetClick('progress')}
              className="btn-danger hover:bg-red-500/20 text-xs py-2 px-3 flex-shrink-0"
            >
              Reset Progress
            </button>
          </div>

          {/* Reset Roadmap */}
          <div className="border-b border-navy-400/50 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Reset Custom Roadmap Schema</p>
              <p className="text-xs text-slate-500">
                Restore the baseline 6-Month JavaScript Mobile Ops sample. Wipes custom roadmap configurations.
              </p>
            </div>
            <button
              onClick={() => handleResetClick('roadmap')}
              className="btn-danger hover:bg-red-500/20 text-xs py-2 px-3 flex-shrink-0"
            >
              Reset Roadmap
            </button>
          </div>

          {/* Complete Factory Reset */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-white">Complete Factory Wipe (Hard Reset)</p>
              <p className="text-xs text-slate-500">
                Clear all settings, logs, streak counters, backups, and notes. Wipes local storage completely.
              </p>
            </div>
            <button
              onClick={() => handleResetClick('factory')}
              className="btn-danger py-2 px-3 flex-shrink-0 text-xs"
            >
              Factory Reset
            </button>
          </div>
        </div>

        {/* Confirmation Modal block */}
        {activeResetType && (
          <div className="bg-navy-950 border border-red-500/35 rounded-xl p-4 animate-scale-in space-y-3">
            <p className="text-xs text-red-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              CONFIRM {activeResetType === 'factory' ? 'COMPLETE FACTORY WIPE' : activeResetType === 'roadmap' ? 'ROADMAP RESET' : 'PROGRESS RESET'}
            </p>
            <p className="text-xs text-slate-400">
              This action is permanent and cannot be undone. Please ensure you have backed up your progress if you wish to recover it later.
            </p>
            <div className="flex gap-2">
              <button
                onClick={executeReset}
                className="btn-danger text-xs py-2 px-4"
              >
                Yes, Execute Reset
              </button>
              <button
                onClick={() => setActiveResetType(null)}
                className="btn-secondary text-xs py-2 px-4"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </SectionCard>

      {/* App Info */}
      <SectionCard className="border-dashed border-navy-400 space-y-3">
        <h2 className="font-bold text-white text-sm">System Information</h2>
        <div className="space-y-2 text-xs text-slate-500">
          <div className="flex justify-between">
            <span>Version Index</span>
            <span className="text-slate-400 font-mono">2.0.0</span>
          </div>
          <div className="flex justify-between">
            <span>Local Database</span>
            <span className="text-slate-400">Indexed localStorage DB</span>
          </div>
          <div className="flex justify-between">
            <span>Status</span>
            <span className="text-accent-primary">Offline Sandbox Gated</span>
          </div>
          <div className="flex justify-between">
            <span>Active Roadmap configuration</span>
            <span className="text-accent-primary font-medium">
              {settings.usingCustomRoadmap ? 'Custom JSON Roadmap' : 'Sample JavaScript Mobile Ops'}
            </span>
          </div>
        </div>
      </SectionCard>
    </PageShell>
  );
}
