import React, { useEffect, useState } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  ExternalLink,
  Monitor,
  Moon,
  Settings as SettingsIcon,
  Sun,
  Upload,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { calculateCourseProgress } from '../utils/progressCalculator';
import { getTodayISO } from '../utils/dateUtils';
import { getCurrentCourseDefinition } from '../utils/learningExperience.js';
import { PageShell, ProgressBar } from '../components/common/UIComponents';
import ConfirmAction from '../components/ui/ConfirmAction';
import StatusBanner from '../components/ui/StatusBanner';

const EMPTY_PROGRESS = {
  completedTasks: {},
  completedWeeks: [],
  completedProjectMilestones: {},
  projectGithubLinks: {},
  projectNotes: {},
};

const EMPTY_STREAK = {
  currentStreak: 0,
  lastStudyDate: null,
  longestStreak: 0,
  totalStudyDays: 0,
};

function SettingsSection({ id, title, description, children, className = '' }) {
  return (
    <section id={id} className={`scroll-mt-6 border-t border-border-divider py-8 first:border-0 first:pt-3 sm:py-10 ${className}`}>
      <div className="grid gap-5 md:grid-cols-[minmax(0,190px)_minmax(0,1fr)] md:gap-10">
        <div>
          <h2 className="text-lg font-bold text-text-primary">{title}</h2>
          {description && <p className="mt-1.5 text-xs leading-relaxed text-text-muted">{description}</p>}
        </div>
        <div className="min-w-0">{children}</div>
      </div>
    </section>
  );
}

function SettingsRow({ label, description, children, className = '' }) {
  return (
    <div className={`flex flex-col gap-3 py-5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between ${className}`}>
      <div className="min-w-0 sm:max-w-sm">
        <p className="text-sm font-semibold text-text-primary">{label}</p>
        {description && <p className="mt-1 text-xs leading-relaxed text-text-muted">{description}</p>}
      </div>
      <div className="shrink-0 sm:max-w-[55%]">{children}</div>
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const {
    settings,
    updateSettings,
    setActiveWeek,
    resetAllProgress,
    exportProgress,
    importProgress,
    resetProgressForActiveRoadmap,
    roadmap,
    progress,
    userProfile,
    updateUserProfile,
    curriculumMode,
    activeV2Curriculum,
    activeV2Learner,
    resetActiveV2Curriculum,
    leaveV2Curriculum,
  } = useApp();
  const [displayName, setDisplayName] = useState(userProfile?.displayName || userProfile?.name || '');
  const [advancedOpen, setAdvancedOpen] = useState(() => window.location.hash === '#advanced-settings');
  const [feedback, setFeedback] = useState(null);
  const [pendingBackup, setPendingBackup] = useState(null);
  const [pendingReset, setPendingReset] = useState(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setDisplayName(userProfile?.displayName || userProfile?.name || '');
  }, [userProfile]);

  const legacyTotalWeeks = Array.isArray(roadmap?.months)
    ? roadmap.months.reduce((total, month) => total + (month.weeks?.length || 0), 0)
    : roadmap?.weeks?.length || 0;
  const currentCourse = getCurrentCourseDefinition({ curriculumMode, activeV2Curriculum, roadmap });
  const totalWeeks = currentCourse?.totalWeeks || 0;
  const legacyCourseProgress = curriculumMode === 'legacy'
    ? calculateCourseProgress(roadmap, progress)
    : { percent: 0 };
  const courseProgress = curriculumMode === 'v2'
    ? { percent: totalWeeks ? Math.round(((activeV2Learner?.completedWeekIds?.length || 0) / totalWeeks) * 100) : 0 }
    : curriculumMode === 'legacy' ? legacyCourseProgress : { percent: 0 };

  const saveProfile = (event) => {
    event.preventDefault();
    const value = displayName.trim();
    if (!value) return;
    updateUserProfile({ name: value, displayName: value });
    setFeedback({ type: 'success', text: 'Display name saved.' });
  };

  const restoreFileSelected = (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => {
      try {
        const data = JSON.parse(loadEvent.target.result);
        if (!data.version || !data.exportedAt) throw new Error('Invalid backup');
        setPendingBackup(data);
      } catch {
        setFeedback({ type: 'error', text: 'That file is not a compatible XcelerateAI backup.' });
      }
    };
    reader.onerror = () => setFeedback({ type: 'error', text: 'The backup file could not be read.' });
    reader.readAsText(file);
  };

  const restoreBackup = () => {
    setBusy(true);
    importProgress(pendingBackup);
    setPendingBackup(null);
    setBusy(false);
    setFeedback({ type: 'success', text: 'Backup restored.' });
  };

  const executeReset = () => {
    setBusy(true);
    if (pendingReset === 'progress') {
      importProgress({
        roadmap,
        settings: { ...settings, startDate: new Date().toISOString().split('T')[0], activeWeek: 1, activeMonth: 1, manualOverrideEnabled: false, overrideReason: '' },
        progress: EMPTY_PROGRESS,
        notes: [],
        checkpointStatuses: {},
        streak: EMPTY_STREAK,
        resourcesStatus: {},
        skillChecks: {},
        practicalMissions: {},
        blockers: [],
        weekProofs: {},
        weekReflections: {},
      });
      setFeedback({ type: 'success', text: 'Learning progress and learning records reset.' });
    } else if (pendingReset === 'course-progress') {
      if (curriculumMode === 'v2') resetActiveV2Curriculum();
      else if (curriculumMode === 'legacy') resetProgressForActiveRoadmap();
      setFeedback(curriculumMode === 'catalog'
        ? { type: 'error', text: 'Choose a curriculum before resetting course progress.' }
        : { type: 'success', text: 'Progress for the current course reset.' });
    } else if (pendingReset === 'course') {
      if (curriculumMode === 'v2') leaveV2Curriculum();
      if (curriculumMode === 'legacy') updateSettings({ usingCustomRoadmap: false });
      setFeedback({ type: 'success', text: 'Choose a published curriculum from the catalog.' });
      navigate('/curricula');
    } else if (pendingReset === 'factory') {
      resetAllProgress();
      setFeedback({ type: 'success', text: 'Local XcelerateAI data reset.' });
    }
    setPendingReset(null);
    setBusy(false);
  };

  const resetCopy = {
    progress: { title: 'Reset all learning records?', description: 'Removes task progress, skill checks, notes, problems, proof, reflections, and streaks. The current course and basic settings are preserved.' },
    'course-progress': { title: 'Reset current course progress?', description: 'Removes progress, skill checks, resources, practical missions, proof, and reflections for the current course. Notes, problems, and profile settings remain.' },
    course: { title: 'Choose another curriculum?', description: 'Returns to the curriculum catalog without deleting saved curriculum progress.' },
    factory: { title: 'Reset all local data?', description: 'Removes locally stored settings, progress, courses, notes, problems, timer history, and onboarding completion from this browser.' },
  };

  return (
    <PageShell className="max-w-4xl">
      <header className="pb-5">
        <h1 className="text-3xl font-extrabold tracking-tight text-text-primary">Settings</h1>
        <p className="mt-2 text-sm text-text-secondary">Personalize your learning environment and manage your course data.</p>
      </header>

      {feedback && <StatusBanner type={feedback.type} message={feedback.text} onClose={() => setFeedback(null)} />}

      <SettingsSection title="Profile" description="How XcelerateAI addresses you.">
        <form onSubmit={saveProfile}>
          <label htmlFor="profile-display-name" className="block text-sm font-semibold text-text-primary">Display name</label>
          <p className="mt-1 text-xs text-text-muted">Used in greetings throughout your learning environment.</p>
          <div className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input id="profile-display-name" required value={displayName} onChange={(event) => setDisplayName(event.target.value)} className="input-base min-w-0 flex-1 text-sm" placeholder="How you want to be addressed" />
            <button type="submit" className="btn-primary justify-center px-5 py-2.5 text-sm">Save</button>
          </div>
        </form>
      </SettingsSection>

      <SettingsSection title="Appearance" description="Choose how XcelerateAI looks on this device.">
        <div className="grid grid-cols-3 gap-1 rounded-2xl border border-border-default bg-bg-soft p-1" role="radiogroup" aria-label="Appearance">
          {[
            { value: 'system', label: 'System', icon: Monitor },
            { value: 'light', label: 'Light', icon: Sun },
            { value: 'dark', label: 'Dark', icon: Moon },
          ].map(({ value, label, icon: Icon }) => {
            const selected = (settings?.appearanceMode || 'system') === value;
            return (
              <button
                key={value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => updateSettings({ appearanceMode: value })}
                className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold transition-all duration-200 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue ${selected ? 'bg-bg-surface text-text-primary shadow-sm ring-1 ring-border-default' : 'text-text-muted hover:text-text-primary'}`}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                <span>{label}</span>
                {selected && <span className="sr-only">selected</span>}
              </button>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-text-muted">System follows your device preference and responds when it changes.</p>
      </SettingsSection>

      <SettingsSection title="Learning" description="Everyday preferences used during your course.">
        <SettingsRow label="Course start date" description="Used for course-day and schedule information.">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-brand-blue" aria-hidden="true" />
            <input id="start-date" aria-label="Course start date" type="date" max={getTodayISO()} value={settings?.startDate || ''} onChange={(event) => updateSettings({ startDate: event.target.value || null })} className="input-base w-full text-sm sm:w-44" />
          </div>
        </SettingsRow>
      </SettingsSection>

      <SettingsSection title="Course and data" description="Your active course and local backup controls.">
        {currentCourse ? (
          <div className="rounded-2xl border border-border-default bg-bg-soft p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-text-muted">Current course</p>
                <h3 className="mt-1.5 text-base font-bold text-text-primary">{currentCourse.title}</h3>
                <p className="mt-2 text-xs text-text-muted">{currentCourse.detail}</p>
              </div>
              <span className="shrink-0 text-sm font-bold text-brand-blue">{courseProgress.percent}% complete</span>
            </div>
            <ProgressBar percent={courseProgress.percent} className="mt-5 h-1.5" />
          </div>
        ) : (
          <div className="rounded-2xl border border-border-default bg-bg-soft p-5">
            <p className="text-sm font-bold text-text-primary">No curriculum selected</p>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">Choose a published curriculum before beginning the learner experience.</p>
            <Link to="/curricula" className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:opacity-80">Choose curriculum <ExternalLink className="h-3.5 w-3.5" /></Link>
          </div>
        )}

        <div className="mt-6 divide-y divide-border-divider">
          <SettingsRow label="Curriculum catalog" description="Choose or continue another published learning path.">
            <Link to="/curricula" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:opacity-80">Open catalog <ExternalLink className="h-3.5 w-3.5" /></Link>
          </SettingsRow>
          <SettingsRow label="Download backup" description="Saves your course, learning progress, and local learning data.">
            <button type="button" onClick={() => { exportProgress(); setFeedback({ type: 'success', text: 'Backup downloaded.' }); }} className="btn-secondary w-full justify-center gap-2 px-4 py-2.5 text-sm sm:w-auto"><Download className="h-4 w-4" /> Download</button>
          </SettingsRow>
          <SettingsRow label="Restore from backup" description="Replaces current local course and learning data after confirmation.">
            <label className="btn-secondary flex w-full cursor-pointer items-center justify-center gap-2 px-4 py-2.5 text-sm sm:w-auto"><Upload className="h-4 w-4" /> Choose backup<input type="file" accept=".json,application/json" onChange={restoreFileSelected} className="sr-only" aria-label="Choose an XcelerateAI backup file" /></label>
          </SettingsRow>
        </div>
        {settings?.lastBackupDate && <p className="mt-4 text-xs text-text-muted">Last backup: {new Date(settings.lastBackupDate).toLocaleString()}</p>}
      </SettingsSection>

      <section id="advanced-settings" className="scroll-mt-6 border-t border-border-divider py-8 sm:py-10">
        <button type="button" onClick={() => setAdvancedOpen((open) => !open)} aria-expanded={advancedOpen} aria-controls="advanced-settings-content" className="flex w-full items-center justify-between gap-4 rounded-xl py-2 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
          <div>
            <h2 className="text-lg font-bold text-text-primary">Advanced</h2>
            <p className="mt-1.5 text-xs leading-relaxed text-text-muted">These controls can change how course progression behaves.</p>
          </div>
          <span className="inline-flex items-center gap-2 text-xs font-semibold text-text-secondary">{advancedOpen ? 'Hide' : 'Show'} advanced settings <ChevronDown className={`h-4 w-4 transition-transform duration-200 motion-reduce:transition-none ${advancedOpen ? 'rotate-180' : ''}`} /></span>
        </button>

        {advancedOpen && (
          <div id="advanced-settings-content" className="mt-6 rounded-2xl border border-border-default bg-bg-soft px-5">
            <SettingsRow label="Curriculum import" description="Validate and load a custom course curriculum.">
              <Link to="/import" className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-blue hover:opacity-80">Open import <ExternalLink className="h-3.5 w-3.5" /></Link>
            </SettingsRow>
            <div className="border-t border-border-divider">
              <SettingsRow label="Mentor name" description="Used in help prompts and mentor-question labels.">
                <input id="mentor-name" aria-label="Mentor name" value={settings?.mentorName || ''} onChange={(event) => updateSettings({ mentorName: event.target.value })} className="input-base w-full text-sm sm:w-52" placeholder="Mentor" />
              </SettingsRow>
            </div>
            {curriculumMode === 'legacy' && <div className="border-t border-border-divider">
              <SettingsRow label="Active week" description="For course recovery or testing. Normal progression updates this automatically.">
                <div className="flex items-center gap-2"><input id="active-week" aria-label="Set active week manually" type="number" min="1" max={Math.max(1, totalWeeks)} value={settings?.activeWeek || 1} onChange={(event) => setActiveWeek(Math.min(Math.max(1, Number(event.target.value)), Math.max(1, totalWeeks)))} className="input-base w-20 text-center text-sm" /><span className="text-xs text-text-muted">of {totalWeeks || 0}</span></div>
              </SettingsRow>
            </div>}
            <div className="border-t border-border-divider py-5">
              <label className="flex cursor-pointer items-start gap-3">
                <input type="checkbox" checked={settings?.manualOverrideEnabled || false} onChange={(event) => updateSettings({ manualOverrideEnabled: event.target.checked, overrideReason: event.target.checked ? settings?.overrideReason || '' : '' })} className="mt-0.5 h-4 w-4 rounded border-border-strong bg-bg-surface text-brand-blue" />
                <span><span className="text-sm font-semibold text-text-primary">Inspect locked stages</span><span className="mt-1 block text-xs leading-relaxed text-text-muted">Allows inspection of future content. It cannot satisfy requirements, complete a week, advance progress, or bypass Skill Check recovery.</span></span>
              </label>
              {settings?.manualOverrideEnabled && <div className="ml-7 mt-4"><label htmlFor="override-reason" className="text-xs font-semibold text-text-secondary">Reason</label><textarea id="override-reason" rows="2" required value={settings?.overrideReason || ''} onChange={(event) => updateSettings({ overrideReason: event.target.value })} className="input-base mt-1.5 w-full resize-none text-sm" placeholder="Why are you bypassing prerequisites?" /></div>}
            </div>
            <div className="border-t border-border-divider py-5">
              <h3 className="flex items-center gap-2 text-sm font-semibold text-text-primary"><SettingsIcon className="h-4 w-4 text-text-muted" /> System information</h3>
              <dl className="mt-3 grid gap-3 text-xs sm:grid-cols-3">
                <div><dt className="text-text-muted">Version</dt><dd className="mt-1 font-semibold text-text-secondary">2.0.0</dd></div>
                <div><dt className="text-text-muted">Data storage</dt><dd className="mt-1 font-semibold text-text-secondary">This browser</dd></div>
                <div><dt className="text-text-muted">Course source</dt><dd className="mt-1 font-semibold text-text-secondary">{currentCourse?.source || 'No course selected'}</dd></div>
              </dl>
            </div>
          </div>
        )}
      </section>

      <SettingsSection title="Danger zone" description="These existing actions remove locally stored learning data." className="border-t border-red-500/20">
        <div className="rounded-2xl border border-red-500/20 bg-red-500/[0.03] px-5">
          {[
            ['course-progress', 'Reset current course progress', 'Keeps your profile, notes, problems, and current course.'],
            ['progress', 'Reset all learning records', 'Keeps the current course and basic settings.'],
            ['course', 'Choose another curriculum', 'Returns to the catalog without deleting saved curriculum progress.'],
            ['factory', 'Reset all local data', 'Removes all XcelerateAI data stored in this browser.'],
          ].filter(([id]) => currentCourse || id !== 'course-progress').map(([id, label, description]) => (
            <div key={id} className="flex flex-col gap-3 border-b border-red-500/10 py-5 last:border-0 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="text-sm font-semibold text-text-primary">{label}</p><p className="mt-1 text-xs text-text-muted">{description}</p></div>
              <button type="button" onClick={() => setPendingReset(id)} className={`shrink-0 rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${id === 'factory' ? 'border-red-500/35 bg-red-500/10 text-red-500 hover:bg-red-500/15' : 'border-border-default bg-bg-surface text-text-secondary hover:border-red-500/30 hover:text-red-500'}`}>{label}</button>
            </div>
          ))}
        </div>
      </SettingsSection>

      {pendingBackup && <ConfirmAction title="Restore this backup?" description="Your current course, settings, and learning data will be replaced by the compatible data contained in this backup." confirmLabel="Restore backup" cancelLabel="Cancel" onConfirm={restoreBackup} onCancel={() => setPendingBackup(null)} isLoading={busy} />}
      {pendingReset && <ConfirmAction title={resetCopy[pendingReset].title} description={<div className="space-y-3"><p>{resetCopy[pendingReset].description}</p><p className="text-brand-amber">Download a backup first if you may need to recover this data.</p></div>} confirmLabel="Confirm reset" cancelLabel="Cancel" onConfirm={executeReset} onCancel={() => setPendingReset(null)} isLoading={busy} />}
    </PageShell>
  );
}
