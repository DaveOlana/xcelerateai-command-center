import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sampleRoadmap } from '../data/sampleRoadmap';
import { getTodayString, getYesterdayString } from '../utils/dateUtils';
import { normalizeRoadmap, getRoadmapId } from '../utils/normalizeRoadmap';
import { recordResourceOpened } from '../utils/resourceActivity.js';
import { resolveCurriculumMode } from '../utils/learningExperience.js';
import {
  applyRecoveryInsight,
  applyRecoveryResourceReview,
  applySubmittedAttempt,
  getAssessmentRecord,
  setAssessmentRecord,
} from '../utils/skillCheckUtils.js';
import { curriculumCatalog } from '../curriculum-v2/catalog/catalog.js';
import {
  completeV2Resource as completeV2ResourceState,
  completeV2Week as completeV2WeekState,
  EMPTY_V2_STATE_STORE,
  getCurriculumState,
  normalizeV2StateStore,
  reconcileCurriculumState,
  recordV2RecoveryInsight as recordV2RecoveryInsightState,
  recordV2ResourceOpened as recordV2ResourceOpenedState,
  resetCurriculumState,
  setActiveWeek as setActiveV2WeekState,
  setV2BuildCompleted as setV2BuildCompletedState,
  setV2ProofEvidence as setV2ProofEvidenceState,
  setV2ReflectionResponse as setV2ReflectionResponseState,
  submitV2SkillCheckAttempt as submitV2SkillCheckAttemptState,
} from '../curriculum-v2/state/learnerState.js';
import {
  activateCurriculumSelection,
  resolveActiveCurriculumId,
} from '../curriculum-v2/state/curriculumSelection.js';
import {
  createV2BackupSlice,
  restoreV2BackupSlice,
} from '../curriculum-v2/state/backupReconciliation.js';

// =============================================
// STORAGE KEYS
// =============================================
export const STORAGE_KEYS = {
  ROADMAP: 'xca_roadmap',
  PROGRESS: 'xca_progress',
  NOTES: 'xca_notes',
  CHECKPOINTS: 'xca_checkpoints',
  SETTINGS: 'xca_settings',
  STREAK: 'xca_streak',
  RESOURCES_STATUS: 'xca_resources_status',
  SKILL_CHECKS: 'xca_skill_checks',
  PRACTICAL_MISSIONS: 'xca_practical_missions',
  SESSION_TIMER: 'xca_session_timer',
  BLOCKERS: 'xca_blockers',
  WEEK_PROOFS: 'xca_week_proofs',
  SKILL_CHECK_ATTEMPTS: 'xca_skill_check_attempts_v1',
  RESOURCE_ACTIVITY: 'xca_resource_activity_v1',
  V2_LEARNER_STATE: 'xca_v2_learner_state_v1',
  V2_ACTIVE_CURRICULUM: 'xca_v2_active_curriculum_id',
};

// =============================================
// DEFAULTS
// =============================================
const DEFAULT_SETTINGS = {
  startDate: new Date().toISOString().split('T')[0], // Default start date to today
  mentorName: 'Mentor',
  activeWeek: 1,
  activeMonth: 1,
  usingCustomRoadmap: false,
  onboardingCompleted: false,
  weeklyHours: '20-25',
  manualOverrideEnabled: false,
  overrideReason: '',
  lastBackupDate: null,
  sidebarCollapsed: false,
  activeRoadmapId: null, // tracks which roadmap is currently active
  appearanceMode: 'system',
};

const DEFAULT_PROGRESS = {
  completedTasks: {},              // { 'm1_w1': [0, 2, 3] }
  completedWeeks: [],              // [1, 2, 3]
  completedProjectMilestones: {},  // { '0': [0, 1] }
  projectGithubLinks: {},          // { '0': 'https://github.com/...' }
  projectNotes: {},                // { '0': 'note text' }
};

const DEFAULT_STREAK = {
  currentStreak: 0,
  lastStudyDate: null,
  longestStreak: 0,
  totalStudyDays: 0,
};

const DEFAULT_SESSION_TIMER = {
  activeSessionId: null,
  type: null,
  title: null,
  durationMinutes: 0,
  timeLeftSeconds: 0,
  isRunning: false,
  isBreak: false,
  startedAt: null,
  endTime: null,
  pausedAt: null,
  remainingSeconds: 0,
  accumulatedActiveSeconds: 0,
  maxContinuousMinutes: 75,
  recommendedBreakMinutes: 10,
  context: null,
};

// =============================================
// CONTEXT
// =============================================
const AppContext = createContext(null);

// =============================================
// HELPERS
// =============================================
function loadFromStorage(key, fallback) {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn('localStorage save failed:', e);
  }
}

// =============================================
// PROVIDER
// =============================================
export function AppProvider({ children }) {
  const [isBooting, setIsBooting] = useState(true);
  const [isDataReady, setIsDataReady] = useState(false);

  const [roadmap, setRoadmap] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.ROADMAP, null);
    if (!loaded) {
      // First boot: normalize the sampleRoadmap
      try { return normalizeRoadmap(sampleRoadmap); } catch { return sampleRoadmap; }
    }
    // If already a normalized roadmap (has .id), check if it needs re-normalization
    if (loaded.id && loaded.weeks) {
      // Migration: if _normalizedSchemaVersion is missing or outdated, re-normalize
      if (!loaded._normalizedSchemaVersion || loaded._normalizedSchemaVersion < 1) {
        try {
          // Back up current data before migration
          saveToStorage('xca_pre_migration_backup', loaded);
          // Re-normalize from the raw bootcamp source if available, otherwise from stored data
          const rawSource = loaded.bootcamp ? { ...loaded, bootcamp: loaded.bootcamp } : loaded;
          return normalizeRoadmap(rawSource);
        } catch {
          return loaded; // Migration failed, use as-is
        }
      }
      return loaded;
    }
    // Otherwise normalize it
    try { return normalizeRoadmap(loaded); } catch { return loaded; }
  });
  const [activeV2CurriculumId, setActiveV2CurriculumIdState] = useState(() => (
    resolveActiveCurriculumId(curriculumCatalog, loadFromStorage(STORAGE_KEYS.V2_ACTIVE_CURRICULUM, null))
  ));
  const [v2LearnerState, setV2LearnerState] = useState(() => {
    const stored = normalizeV2StateStore(loadFromStorage(STORAGE_KEYS.V2_LEARNER_STATE, EMPTY_V2_STATE_STORE));
    const selected = resolveActiveCurriculumId(curriculumCatalog, loadFromStorage(STORAGE_KEYS.V2_ACTIVE_CURRICULUM, null));
    const runtime = selected ? curriculumCatalog.getLatest(selected) : null;
    return runtime ? reconcileCurriculumState(stored, runtime) : stored;
  });
  const activeV2Curriculum = activeV2CurriculumId ? curriculumCatalog.getLatest(activeV2CurriculumId) : null;
  const activeV2Learner = activeV2CurriculumId ? getCurriculumState(v2LearnerState, activeV2CurriculumId) : null;
  const [progress, setProgress] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS);
    if (Array.isArray(loaded)) return { ...DEFAULT_PROGRESS, completedWeeks: loaded };
    return { ...DEFAULT_PROGRESS, ...loaded };
  });
  const [notes, setNotesState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.NOTES, [])
  );
  const [checkpointStatuses, setCheckpointStatusesState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.CHECKPOINTS, {})
  );
  const [settings, setSettingsState] = useState(() => {
    const loaded = loadFromStorage(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    // Ensure default values are filled in if settings existed before the update
    const merged = { ...DEFAULT_SETTINGS, ...loaded };
    if (!['system', 'light', 'dark'].includes(merged.appearanceMode)) {
      merged.appearanceMode = 'system';
    }
    return merged;
  });
  const curriculumMode = resolveCurriculumMode({
    activeV2Curriculum,
    usingCustomRoadmap: settings.usingCustomRoadmap,
  });
  const [streak, setStreakState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.STREAK, DEFAULT_STREAK)
  );

  // ── User Profile state ──
  const [userProfile, setUserProfileState] = useState(() => {
    const loaded = loadFromStorage('xcelerate.userProfile', null);
    if (loaded) return loaded;
    return {
      name: '',
      displayName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });

  const updateUserProfile = useCallback((profileData) => {
    setUserProfileState((prev) => ({
      ...prev,
      ...profileData,
      updatedAt: new Date().toISOString()
    }));
  }, []);

  // ── Onboarding state ──
  const [onboardingCompleted, setOnboardingCompletedState] = useState(() => {
    if (typeof localStorage !== 'undefined') {
      const completed = localStorage.getItem('xcelerate.onboarding.completed');
      if (completed === 'true') return true;
      if (localStorage.getItem('xai_setup_completed_v1') === 'true') return true;
    }
    const settingsLoaded = loadFromStorage(STORAGE_KEYS.SETTINGS, {});
    return settingsLoaded.onboardingCompleted || false;
  });

  const completeOnboarding = useCallback((nameVal, displayNameVal) => {
    if (nameVal !== undefined) {
      setUserProfileState((prev) => ({
        ...prev,
        name: nameVal,
        displayName: displayNameVal || nameVal,
        updatedAt: new Date().toISOString()
      }));
    }
    setOnboardingCompletedState(true);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('xcelerate.onboarding.completed', 'true');
    }
    setSettingsState((prev) => ({ ...(prev || DEFAULT_SETTINGS), onboardingCompleted: true }));
  }, []);

  const replayOnboarding = useCallback(() => {
    setOnboardingCompletedState(false);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('xcelerate.onboarding.completed', 'false');
    }
    setSettingsState((prev) => ({ ...prev, onboardingCompleted: false }));
  }, []);

  // ── Active roadmap progress reset ──
  const resetProgressForActiveRoadmap = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setResourcesStatus({});
    setSkillChecks({});
    setSkillCheckAttempts({});
    setResourceActivity({});
    setPracticalMissions({});
    setWeekProofs({});
    setWeekReflections({});
    setSettingsState((prev) => ({
      ...prev,
      activeWeek: 1,
      activeMonth: 1,
    }));
  }, []);

  useEffect(() => {
    saveToStorage('xcelerate.userProfile', userProfile);
  }, [userProfile]);

  // New States for rich schema & new features
  const [resourcesStatus, setResourcesStatus] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RESOURCES_STATUS, {})
  );
  const [skillChecks, setSkillChecks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SKILL_CHECKS, {})
  );
  const [skillCheckAttempts, setSkillCheckAttempts] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SKILL_CHECK_ATTEMPTS, {})
  );
  const [resourceActivity, setResourceActivity] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RESOURCE_ACTIVITY, {})
  );
  const [practicalMissions, setPracticalMissions] = useState(() =>
    loadFromStorage(STORAGE_KEYS.PRACTICAL_MISSIONS, {})
  );
  const [sessionTimer, setSessionTimer] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SESSION_TIMER, DEFAULT_SESSION_TIMER)
  );
  const [blockers, setBlockers] = useState(() =>
    loadFromStorage(STORAGE_KEYS.BLOCKERS, [])
  );
  const [weekProofs, setWeekProofs] = useState(() =>
    loadFromStorage(STORAGE_KEYS.WEEK_PROOFS, {})
  );
  const [weekReflections, setWeekReflections] = useState(() =>
    loadFromStorage('xca_week_reflections', {})
  );
  const [timerHistory, setTimerHistory] = useState(() =>
    loadFromStorage('xca_timer_history', [])
  );
  const [pendingTimerParams, setPendingTimerParams] = useState(null);
  const [showSwitchConfirmation, setShowSwitchConfirmation] = useState(false);

  // ── Persist all state to localStorage on change ──
  useEffect(() => { saveToStorage('xca_timer_history', timerHistory); }, [timerHistory]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.ROADMAP, roadmap); }, [roadmap]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PROGRESS, progress); }, [progress]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.NOTES, notes); }, [notes]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.CHECKPOINTS, checkpointStatuses); }, [checkpointStatuses]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SETTINGS, settings); }, [settings]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.STREAK, streak); }, [streak]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RESOURCES_STATUS, resourcesStatus); }, [resourcesStatus]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SKILL_CHECKS, skillChecks); }, [skillChecks]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SKILL_CHECK_ATTEMPTS, skillCheckAttempts); }, [skillCheckAttempts]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.RESOURCE_ACTIVITY, resourceActivity); }, [resourceActivity]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.PRACTICAL_MISSIONS, practicalMissions); }, [practicalMissions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SESSION_TIMER, sessionTimer); }, [sessionTimer]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BLOCKERS, blockers); }, [blockers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WEEK_PROOFS, weekProofs); }, [weekProofs]);
  useEffect(() => { saveToStorage('xca_week_reflections', weekReflections); }, [weekReflections]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.V2_LEARNER_STATE, v2LearnerState); }, [v2LearnerState]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.V2_ACTIVE_CURRICULUM, activeV2CurriculumId); }, [activeV2CurriculumId]);

  useEffect(() => {
    const preference = ['system', 'light', 'dark'].includes(settings?.appearanceMode)
      ? settings.appearanceMode
      : 'system';
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const applyTheme = () => {
      const resolvedTheme = preference === 'system'
        ? (media.matches ? 'dark' : 'light')
        : preference;
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.dataset.themePreference = preference;
      document.querySelector('meta[name="theme-color"]')?.setAttribute(
        'content',
        resolvedTheme === 'dark' ? '#0B1020' : '#F5F7FC'
      );
    };

    applyTheme();
    if (preference !== 'system') return undefined;

    media.addEventListener?.('change', applyTheme);
    return () => media.removeEventListener?.('change', applyTheme);
  }, [settings?.appearanceMode]);

  // =============================================
  // BOOT & NORMALIZATION
  // =============================================
  useEffect(() => {
    // Check if we have valid roadmap data synchronously to prevent flicker on import
    const isValid = Boolean(
      activeV2Curriculum
      || (curriculumMode === 'legacy' && roadmap && roadmap.months && roadmap.months.length > 0)
    );
    setIsDataReady(isValid);

    // Simulate a brief boot phase ONCE
    if (isBooting) {
      const bootTimer = setTimeout(() => {
        setIsBooting(false);
      }, 400);
      return () => clearTimeout(bootTimer);
    }
  }, [activeV2Curriculum, curriculumMode, roadmap, isBooting]);

  const hasImport = Boolean(
    activeV2Curriculum
    || (curriculumMode === 'legacy' && roadmap && roadmap.months && roadmap.months.length > 0)
  );

  // =============================================
  // SAVE TO LOCALSTORAGE
  // =============================================
  const markStudyToday = useCallback(() => {
    const today = getTodayString();
    const yesterday = getYesterdayString();

    setStreakState((prev) => {
      if (prev.lastStudyDate === today) return prev; // Already marked

      const isConsecutive = prev.lastStudyDate === yesterday;
      const newStreak = isConsecutive ? prev.currentStreak + 1 : 1;

      return {
        currentStreak: newStreak,
        lastStudyDate: today,
        longestStreak: Math.max(prev.longestStreak, newStreak),
        totalStudyDays: (prev.totalStudyDays || 0) + 1,
      };
    });
  }, []);

  // =============================================
  // ROADMAP ACTIONS
  // =============================================
  const importRoadmap = useCallback((rawData) => {
    // Normalize the raw JSON before storing if not already normalized
    let normalized;
    if (rawData && rawData.id && Array.isArray(rawData.weeks)) {
      normalized = rawData;
    } else {
      try {
        normalized = normalizeRoadmap(rawData);
      } catch (e) {
        console.error('normalizeRoadmap failed, storing raw data:', e);
        normalized = rawData;
      }
    }

    // Create a backup of current roadmap + progress before replacing
    // (only if we currently have a valid roadmap)
    try {
      const currentRoadmap = loadFromStorage(STORAGE_KEYS.ROADMAP, null);
      if (currentRoadmap && currentRoadmap.id) {
        const backup = {
          backupDate: new Date().toISOString(),
          roadmap: currentRoadmap,
          progress: loadFromStorage(STORAGE_KEYS.PROGRESS, DEFAULT_PROGRESS),
          checkpointStatuses: loadFromStorage(STORAGE_KEYS.CHECKPOINTS, {}),
          resourcesStatus: loadFromStorage(STORAGE_KEYS.RESOURCES_STATUS, {}),
          skillChecks: loadFromStorage(STORAGE_KEYS.SKILL_CHECKS, {}),
          skillCheckAttempts: loadFromStorage(STORAGE_KEYS.SKILL_CHECK_ATTEMPTS, {}),
          resourceActivity: loadFromStorage(STORAGE_KEYS.RESOURCE_ACTIVITY, {}),
          practicalMissions: loadFromStorage(STORAGE_KEYS.PRACTICAL_MISSIONS, {}),
          weekProofs: loadFromStorage(STORAGE_KEYS.WEEK_PROOFS, {}),
          weekReflections: loadFromStorage('xca_week_reflections', {}),
        };
        // Rotate: move current backup to slot 2, save new to slot 1
        const existingBackup1 = loadFromStorage('xca_import_backup_1', null);
        if (existingBackup1) {
          saveToStorage('xca_import_backup_2', existingBackup1);
        }
        saveToStorage('xca_import_backup_1', backup);
      }
    } catch (e) {
      console.warn('Pre-import backup failed (non-blocking):', e);
    }

    setRoadmap(normalized);
    setActiveV2CurriculumIdState(null);
    setSettingsState((prev) => ({
      ...prev,
      startDate: new Date().toISOString().split('T')[0],
      usingCustomRoadmap: true,
      activeWeek: 1,
      activeMonth: 1,
      activeRoadmapId: normalized.id || getRoadmapId(rawData),
    }));
    // Reset progress when importing new roadmap
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setResourcesStatus({});
    setSkillChecks({});
    setSkillCheckAttempts({});
    setResourceActivity({});
    setPracticalMissions({});
    setWeekProofs({});
    setWeekReflections({});
  }, []);

  const resetToSampleRoadmap = useCallback(() => {
    let normalizedSample;
    try { normalizedSample = normalizeRoadmap(sampleRoadmap); } catch { normalizedSample = sampleRoadmap; }
    setRoadmap(normalizedSample);
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setResourcesStatus({});
    setSkillChecks({});
    setSkillCheckAttempts({});
    setResourceActivity({});
    setPracticalMissions({});
    setWeekProofs({});
    setWeekReflections({});
    setSettingsState((prev) => ({
      ...DEFAULT_SETTINGS,
      startDate: new Date().toISOString().split('T')[0],
      onboardingCompleted: prev?.onboardingCompleted || false,
      sidebarCollapsed: prev?.sidebarCollapsed || false,
      activeRoadmapId: normalizedSample.id || null
    }));
  }, []);

  // =============================================
  // TASK ACTIONS
  // =============================================
  const toggleTask = useCallback((monthNumber, weekNumber, taskIndex) => {
    const key = `m${monthNumber}_w${weekNumber}`;
    setProgress((prev) => {
      const current = prev.completedTasks[key] || [];
      const updated = current.includes(taskIndex)
        ? current.filter((i) => i !== taskIndex)
        : [...current, taskIndex];
      return {
        ...prev,
        completedTasks: { ...prev.completedTasks, [key]: updated },
      };
    });
    markStudyToday();
  }, [markStudyToday]);

  const getTasksForWeek = useCallback((monthNumber, weekNumber) => {
    const key = `m${monthNumber}_w${weekNumber}`;
    return progress.completedTasks[key] || [];
  }, [progress]);

  const isTaskComplete = useCallback((monthNumber, weekNumber, taskIndex) => {
    const key = `m${monthNumber}_w${weekNumber}`;
    return (progress.completedTasks[key] || []).includes(taskIndex);
  }, [progress]);

  // =============================================
  // WEEK ACTIONS
  // =============================================
  const markWeekComplete = useCallback((weekNumber) => {
    setProgress((prev) => {
      const weeks = Array.isArray(prev.completedWeeks) ? prev.completedWeeks : [];
      return {
        ...prev,
        completedWeeks: weeks.includes(weekNumber) ? weeks : [...weeks, weekNumber],
      };
    });
    // Auto-advance to next week
    setSettingsState((prev) => {
      const nextWeek = weekNumber + 1;
      const totalWeeks = roadmap?.months?.reduce(
        (acc, m) => acc + (m.weeks?.length || 0), 0
      ) || 24;
      if (nextWeek <= totalWeeks) {
        // Find which month the next week belongs to
        let newMonth = prev.activeMonth;
        if (roadmap?.months) {
          for (const month of roadmap.months) {
            for (const week of month.weeks || []) {
              if (week.weekNumber === nextWeek) {
                newMonth = month.monthNumber;
                break;
              }
            }
          }
        }
        return { ...prev, activeWeek: nextWeek, activeMonth: newMonth };
      }
      return prev;
    });
    markStudyToday();
  }, [roadmap, markStudyToday]);

  const isWeekComplete = useCallback((weekNumber) => {
    return (Array.isArray(progress.completedWeeks) ? progress.completedWeeks : []).includes(weekNumber);
  }, [progress]);

  // =============================================
  // PROJECT ACTIONS
  // =============================================
  const toggleProjectMilestone = useCallback((projectIndex, milestoneIndex) => {
    setProgress((prev) => {
      const current = prev.completedProjectMilestones[projectIndex] || [];
      const updated = current.includes(milestoneIndex)
        ? current.filter((i) => i !== milestoneIndex)
        : [...current, milestoneIndex];
      return {
        ...prev,
        completedProjectMilestones: {
          ...prev.completedProjectMilestones,
          [projectIndex]: updated,
        },
      };
    });
    markStudyToday();
  }, [markStudyToday]);

  const setProjectGithubLink = useCallback((projectIndex, url) => {
    setProgress((prev) => ({
      ...prev,
      projectGithubLinks: { ...prev.projectGithubLinks, [projectIndex]: url },
    }));
  }, []);

  const setProjectNote = useCallback((projectIndex, note) => {
    setProgress((prev) => ({
      ...prev,
      projectNotes: { ...prev.projectNotes, [projectIndex]: note },
    }));
  }, []);

  const setProjectLiveDemoLink = useCallback((projectIndex, url) => {
    setProgress((prev) => ({
      ...prev,
      projectLiveDemoLinks: { ...(prev.projectLiveDemoLinks || {}), [projectIndex]: url },
    }));
  }, []);

  // =============================================
  // NOTES ACTIONS
  // =============================================
  const addNote = useCallback((noteData) => {
    const newNote = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      ...noteData,
    };
    setNotesState((prev) => [newNote, ...prev]);
    markStudyToday();
    return newNote.id;
  }, [markStudyToday]);

  const deleteNote = useCallback((noteId) => {
    setNotesState((prev) => prev.filter((n) => n.id !== noteId));
  }, []);

  const updateNote = useCallback((noteId, updates) => {
    setNotesState((prev) =>
      prev.map((n) => (n.id === noteId ? { ...n, ...updates } : n))
    );
  }, []);



  // ── Session Timer Tick Effect ──
  useEffect(() => {
    let timer;
    if (sessionTimer.isRunning) {
      timer = setInterval(() => {
        setSessionTimer((prev) => {
          if (prev.timeLeftSeconds <= 1) {
            clearInterval(timer);
            return {
              ...prev,
              timeLeftSeconds: 0,
              isRunning: false,
              showExpiredPrompt: true,
              accumulatedActiveSeconds: prev.accumulatedActiveSeconds + prev.timeLeftSeconds,
              hasJustCompleted: true,
            };
          }
          const nextTimeLeft = prev.timeLeftSeconds - 1;
          return {
            ...prev,
            timeLeftSeconds: nextTimeLeft,
            accumulatedActiveSeconds: prev.accumulatedActiveSeconds + 1,
          };
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [sessionTimer.isRunning]);

  // ── Session Timer Expiration check on Mount ──
  useEffect(() => {
    if (sessionTimer.isRunning && sessionTimer.endTime) {
      const now = Date.now();
      if (now >= sessionTimer.endTime) {
        const secondsPassed = Math.floor((now - sessionTimer.startedAt) / 1000);
        setSessionTimer((prev) => ({
          ...prev,
          timeLeftSeconds: 0,
          isRunning: false,
          showExpiredPrompt: true,
          accumulatedActiveSeconds: prev.accumulatedActiveSeconds + Math.min(secondsPassed, prev.durationMinutes * 60),
          hasJustCompleted: true,
        }));
      } else {
        const remaining = Math.max(0, Math.floor((sessionTimer.endTime - now) / 1000));
        setSessionTimer((prev) => ({
          ...prev,
          timeLeftSeconds: remaining,
        }));
      }
    }
  }, []);

  // ── Session Timer Completion History recorder ──
  useEffect(() => {
    if (sessionTimer.hasJustCompleted && sessionTimer.activeSessionId) {
      const endedAt = Date.now();
      const newHistoryItem = {
        sessionId: sessionTimer.activeSessionId,
        startedAt: new Date(sessionTimer.startedAt || Date.now()).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        mode: sessionTimer.isBreak ? 'Break' : 'Focus',
        durationSeconds: sessionTimer.durationMinutes * 60,
        completedTimeBlock: true,
        status: 'completed',
        context: sessionTimer.context || null,
      };
      setTimerHistory((prev) => [newHistoryItem, ...prev]);
      
      // Reset the flag
      setSessionTimer((prev) => ({
        ...prev,
        hasJustCompleted: false
      }));
    }
  }, [sessionTimer.hasJustCompleted, sessionTimer.activeSessionId, sessionTimer.startedAt, sessionTimer.isBreak, sessionTimer.durationMinutes, sessionTimer.context]);

  // =============================================
  // RESOURCE STATUS ACTIONS
  // =============================================
  const updateResourceStatus = useCallback((resourceKey, status) => {
    setResourcesStatus((prev) => ({ ...prev, [resourceKey]: status }));
    if (status === 'Studying' || status === 'Studied') {
      markStudyToday();
    }
  }, [markStudyToday]);

  // =============================================
  // SKILL CHECK ACTIONS
  // =============================================
  const submitSkillCheck = useCallback((weekNum, answers, confidence, confirmed) => {
    setSkillChecks((prev) => ({
      ...prev,
      [weekNum]: { answers, confidence, confirmed, submittedDate: new Date().toISOString() }
    }));
    markStudyToday();
  }, [markStudyToday]);

  const submitQuizAttempt = useCallback(({ roadmapId, skillCheckId, attempt }) => {
    if (!roadmapId || !skillCheckId || !attempt) return;
    setSkillCheckAttempts((prev) => {
      const record = getAssessmentRecord(prev, roadmapId, skillCheckId);
      return setAssessmentRecord(
        prev,
        roadmapId,
        skillCheckId,
        applySubmittedAttempt(record, attempt)
      );
    });
    markStudyToday();
  }, [markStudyToday]);

  const recordResourceOpen = useCallback(({
    roadmapId,
    weekId,
    resourceId,
    title,
    skillCheckId = null,
    openedAt = new Date().toISOString(),
  }) => {
    if (!roadmapId || !weekId || !resourceId) return;
    setResourceActivity((prev) => recordResourceOpened(prev, {
      roadmapId,
      weekId,
      resourceId,
      title,
      openedAt,
    }));

    if (skillCheckId) {
      setSkillCheckAttempts((prev) => {
        const record = getAssessmentRecord(prev, roadmapId, skillCheckId);
        const nextRecord = applyRecoveryResourceReview(record, { resourceId, reviewedAt: openedAt });
        return nextRecord === record
          ? prev
          : setAssessmentRecord(prev, roadmapId, skillCheckId, nextRecord);
      });
    }
    markStudyToday();
  }, [markStudyToday]);

  const addStudyInsight = useCallback(({
    roadmapId,
    skillCheckId = null,
    insightScope = 'study',
    ...noteData
  }) => {
    const createdAt = new Date().toISOString();
    const note = {
      ...noteData,
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt,
      noteType: 'study_insight',
      insightScope,
      roadmapId,
      focusStage: 'Study',
      linkedResource: insightScope === 'study' ? '' : (noteData.linkedResource || ''),
    };
    setNotesState((prev) => [note, ...prev]);

    if (skillCheckId && insightScope === 'study') {
      setSkillCheckAttempts((prev) => {
        const record = getAssessmentRecord(prev, roadmapId, skillCheckId);
        const nextRecord = applyRecoveryInsight(record, note);
        return nextRecord === record
          ? prev
          : setAssessmentRecord(prev, roadmapId, skillCheckId, nextRecord);
      });
    }
    markStudyToday();
    return note.id;
  }, [markStudyToday]);

  // =============================================
  // PRACTICAL MISSION ACTIONS
  // =============================================
  const startPracticalMission = useCallback((missionId) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      return {
        ...prev,
        [missionId]: {
          ...existing,
          status: 'In Progress',
          startedAt: existing.startedAt || new Date().toISOString(),
        }
      };
    });
    markStudyToday();
  }, [markStudyToday]);

  const updatePracticalMissionProof = useCallback((missionId, proofField, value) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      const proof = existing.proof || {};
      return {
        ...prev,
        [missionId]: {
          ...existing,
          proof: {
            ...proof,
            [proofField]: value
          }
        }
      };
    });
  }, []);

  const updatePracticalMissionReflection = useCallback((missionId, qIndex, answer) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      const reflections = existing.reflections || {};
      return {
        ...prev,
        [missionId]: {
          ...existing,
          reflections: {
            ...reflections,
            [qIndex]: answer
          }
        }
      };
    });
  }, []);

  const completePracticalMission = useCallback((missionId) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      return {
        ...prev,
        [missionId]: {
          ...existing,
          status: 'Completed',
          completedAt: new Date().toISOString(),
        }
      };
    });
    markStudyToday();
  }, [markStudyToday]);

  const blockPracticalMission = useCallback((missionId) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      return {
        ...prev,
        [missionId]: {
          ...existing,
          status: 'Blocked',
        }
      };
    });
  }, []);

  const togglePracticalMissionTask = useCallback((missionId, stepIndex) => {
    setPracticalMissions((prev) => {
      const existing = prev[missionId] || {};
      const completedSteps = existing.completedSteps || [];
      const updated = completedSteps.includes(stepIndex)
        ? completedSteps.filter((i) => i !== stepIndex)
        : [...completedSteps, stepIndex];
      return {
        ...prev,
        [missionId]: {
          ...existing,
          completedSteps: updated
        }
      };
    });
    markStudyToday();
  }, [markStudyToday]);

  // =============================================
  // TIMER ACTIONS
  // =============================================
  const startTimer = useCallback((sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes, context = null) => {
    if (sessionTimer.activeSessionId && sessionTimer.timeLeftSeconds > 0) {
      setPendingTimerParams({ sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes, context });
      setShowSwitchConfirmation(true);
      return;
    }
    const now = Date.now();
    const durSeconds = durationMinutes * 60;
    setSessionTimer({
      activeSessionId: sessionId,
      type,
      title,
      durationMinutes,
      timeLeftSeconds: durSeconds,
      isRunning: true,
      isBreak: false,
      startedAt: now,
      endTime: now + durSeconds * 1000,
      pausedAt: null,
      remainingSeconds: durSeconds,
      accumulatedActiveSeconds: 0,
      maxContinuousMinutes: maxContinuousMinutes || 75,
      recommendedBreakMinutes: recommendedBreakMinutes || 10,
      showExpiredPrompt: false,
      context,
    });
    markStudyToday();
  }, [sessionTimer.activeSessionId, sessionTimer.timeLeftSeconds, markStudyToday]);

  const confirmSwitchTimer = useCallback(() => {
    if (!pendingTimerParams) return;
    if (sessionTimer.activeSessionId && sessionTimer.timeLeftSeconds > 0) {
      const endedAt = Date.now();
      const newHistoryItem = {
        sessionId: sessionTimer.activeSessionId,
        startedAt: new Date(sessionTimer.startedAt || Date.now()).toISOString(),
        endedAt: new Date(endedAt).toISOString(),
        mode: sessionTimer.isBreak ? 'Break' : 'Focus',
        durationSeconds: sessionTimer.durationMinutes * 60,
        completedTimeBlock: false,
        status: 'interrupted',
        context: sessionTimer.context || null,
      };
      setTimerHistory((prev) => [newHistoryItem, ...prev]);
    }
    const { sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes, context } = pendingTimerParams;
    const now = Date.now();
    const durSeconds = durationMinutes * 60;
    setSessionTimer({
      activeSessionId: sessionId,
      type,
      title,
      durationMinutes,
      timeLeftSeconds: durSeconds,
      isRunning: true,
      isBreak: false,
      startedAt: now,
      endTime: now + durSeconds * 1000,
      pausedAt: null,
      remainingSeconds: durSeconds,
      accumulatedActiveSeconds: 0,
      maxContinuousMinutes: maxContinuousMinutes || 75,
      recommendedBreakMinutes: recommendedBreakMinutes || 10,
      showExpiredPrompt: false,
      context: context || null,
    });
    setPendingTimerParams(null);
    setShowSwitchConfirmation(false);
    markStudyToday();
  }, [pendingTimerParams, sessionTimer, markStudyToday]);

  const cancelSwitchTimer = useCallback(() => {
    setPendingTimerParams(null);
    setShowSwitchConfirmation(false);
  }, []);

  const endSessionTimer = useCallback((status = 'ended') => {
    if (!sessionTimer.activeSessionId) return;
    const endedAt = Date.now();
    const newHistoryItem = {
      sessionId: sessionTimer.activeSessionId,
      startedAt: new Date(sessionTimer.startedAt || Date.now()).toISOString(),
      endedAt: new Date(endedAt).toISOString(),
      mode: sessionTimer.isBreak ? 'Break' : 'Focus',
      durationSeconds: sessionTimer.durationMinutes * 60,
      completedTimeBlock: false,
      status: status,
      context: sessionTimer.context || null,
    };
    setTimerHistory((prev) => [newHistoryItem, ...prev]);
    setSessionTimer(DEFAULT_SESSION_TIMER);
  }, [sessionTimer]);

  const pauseTimer = useCallback(() => {
    setSessionTimer((prev) => {
      if (!prev.isRunning) return prev;
      return {
        ...prev,
        isRunning: false,
        pausedAt: Date.now(),
        remainingSeconds: prev.timeLeftSeconds,
      };
    });
  }, []);

  const resumeTimer = useCallback(() => {
    setSessionTimer((prev) => {
      if (prev.isRunning) return prev;
      const now = Date.now();
      const nextEndTime = now + prev.timeLeftSeconds * 1000;
      return {
        ...prev,
        isRunning: true,
        pausedAt: null,
        endTime: nextEndTime,
      };
    });
  }, []);

  const startBreakTimer = useCallback((breakMinutes) => {
    const now = Date.now();
    const min = breakMinutes || sessionTimer.recommendedBreakMinutes || 10;
    const durSeconds = min * 60;
    setSessionTimer((prev) => ({
      ...prev,
      isBreak: true,
      durationMinutes: min,
      timeLeftSeconds: durSeconds,
      isRunning: true,
      startedAt: now,
      endTime: now + durSeconds * 1000,
      pausedAt: null,
    }));
  }, [sessionTimer.recommendedBreakMinutes]);

  const resetTimer = useCallback(() => {
    setSessionTimer(DEFAULT_SESSION_TIMER);
  }, []);

  const acknowledgeExpiredPrompt = useCallback(() => {
    setSessionTimer((prev) => ({ ...prev, showExpiredPrompt: false }));
  }, []);

  // =============================================
  // BLOCKERS ACTIONS
  // =============================================
  const addBlocker = useCallback((blockerData) => {
    const newBlocker = {
      id: Date.now().toString(),
      dateCreated: new Date().toISOString(),
      status: 'Open',
      solutionNotes: '',
      dateSolved: null,
      ...blockerData,
    };
    setBlockers((prev) => [newBlocker, ...prev]);
    markStudyToday();
    return newBlocker;
  }, [markStudyToday]);

  const solveBlocker = useCallback((blockerId, solutionNotes) => {
    setBlockers((prev) =>
      prev.map((b) =>
        b.id === blockerId
          ? { ...b, status: 'Solved', solutionNotes, dateSolved: new Date().toISOString() }
          : b
      )
    );
  }, []);

  const updateBlocker = useCallback((blockerId, updates) => {
    setBlockers((prev) =>
      prev.map((b) => (b.id === blockerId ? { ...b, ...updates } : b))
    );
  }, []);

  const deleteBlocker = useCallback((blockerId) => {
    setBlockers((prev) => prev.filter((b) => b.id !== blockerId));
  }, []);

  // =============================================
  // WEEK PROOF & REFLECTION ACTIONS
  // =============================================
  const submitWeekProof = useCallback((weekNum, proofData) => {
    setWeekProofs((prev) => ({
      ...prev,
      [weekNum]: {
        ...prev[weekNum],
        ...proofData,
        submittedDate: new Date().toISOString()
      }
    }));
    markStudyToday();
  }, [markStudyToday]);

  const saveWeekReflection = useCallback((weekNum, reflectionData) => {
    setWeekReflections((prev) => ({
      ...prev,
      [weekNum]: {
        ...prev[weekNum],
        ...reflectionData,
        savedDate: new Date().toISOString()
      }
    }));
    markStudyToday();
  }, [markStudyToday]);

  // =============================================
  // CHECKPOINT ACTIONS
  // =============================================
  const setCheckpointStatus = useCallback((skill, status, evidence = {}) => {
    setCheckpointStatusesState((prev) => ({
      ...prev,
      [skill]: { status, ...evidence, dateMarked: new Date().toISOString() }
    }));
    if (status === 'Confident' || status === 'Learning') {
      markStudyToday();
    }
  }, [markStudyToday]);

  // =============================================
  // SETTINGS ACTIONS
  // =============================================
  const updateSettings = useCallback((updates) => {
    setSettingsState((prev) => ({ ...prev, ...updates }));
  }, []);

  const setActiveWeek = useCallback((weekNum) => {
    let activeMonth = settings.activeMonth;
    if (roadmap?.months) {
      for (const month of roadmap.months) {
        for (const week of month.weeks || []) {
          if (week.weekNumber === weekNum) {
            activeMonth = month.monthNumber;
            break;
          }
        }
      }
    }
    setSettingsState((prev) => ({ ...prev, activeWeek: weekNum, activeMonth }));
  }, [roadmap, settings.activeMonth]);

  // =============================================
  // EXPORT / IMPORT PROGRESS
  // =============================================
  const exportProgress = useCallback(() => {
    const data = {
      exportedAt: new Date().toISOString(),
      version: '2.0',
      roadmap,
      progress,
      notes,
      checkpointStatuses,
      settings: {
        ...settings,
        lastBackupDate: new Date().toISOString()
      },
      streak,
      resourcesStatus,
      skillChecks,
      skillCheckAttempts,
      resourceActivity,
      practicalMissions,
      blockers,
      weekProofs,
      weekReflections,
      timerHistory,
      ...createV2BackupSlice(v2LearnerState, activeV2CurriculumId),
    };
    setSettingsState(prev => ({ ...prev, lastBackupDate: new Date().toISOString() }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xca-progress-v2-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [roadmap, progress, notes, checkpointStatuses, settings, streak, resourcesStatus, skillChecks, skillCheckAttempts, resourceActivity, practicalMissions, blockers, weekProofs, weekReflections, timerHistory, v2LearnerState, activeV2CurriculumId]);

  const importProgress = useCallback((data) => {
    if (data.roadmap) setRoadmap(data.roadmap);
    if (data.progress) setProgress(data.progress);
    if (data.notes) setNotesState(data.notes);
    if (data.checkpointStatuses) setCheckpointStatusesState(data.checkpointStatuses);
    if (data.settings) setSettingsState(data.settings);
    if (data.streak) setStreakState(data.streak);
    if (data.resourcesStatus) setResourcesStatus(data.resourcesStatus);
    if (data.skillChecks) setSkillChecks(data.skillChecks);
    setSkillCheckAttempts(data.skillCheckAttempts || {});
    setResourceActivity(data.resourceActivity || {});
    if (data.practicalMissions) setPracticalMissions(data.practicalMissions);
    if (data.blockers) setBlockers(data.blockers);
    if (data.weekProofs) setWeekProofs(data.weekProofs);
    if (data.weekReflections) setWeekReflections(data.weekReflections);
    if (data.timerHistory) setTimerHistory(data.timerHistory);
    if (data.v2LearnerState) {
      const restored = restoreV2BackupSlice(data, curriculumCatalog);
      setV2LearnerState(restored.stateStore);
      setActiveV2CurriculumIdState(restored.activeCurriculumId);
      if (restored.activeCurriculumId) {
        setSettingsState((current) => ({ ...current, usingCustomRoadmap: false }));
      }
    }
  }, []);

  const resetAllProgress = useCallback(() => {
    let normalizedSample;
    try { normalizedSample = normalizeRoadmap(sampleRoadmap); } catch { normalizedSample = sampleRoadmap; }
    setRoadmap(normalizedSample);
    setActiveV2CurriculumIdState(null);
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setStreakState(DEFAULT_STREAK);
    setSettingsState({ ...DEFAULT_SETTINGS });
    setNotesState([]);
    setResourcesStatus({});
    setSkillChecks({});
    setSkillCheckAttempts({});
    setResourceActivity({});
    setPracticalMissions({});
    setSessionTimer(DEFAULT_SESSION_TIMER);
    setTimerHistory([]);
    setBlockers([]);
    setWeekProofs({});
    setWeekReflections({});
    setV2LearnerState(EMPTY_V2_STATE_STORE);
    setActiveV2CurriculumIdState(null);
    setUserProfileState({
      name: '',
      displayName: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    setOnboardingCompletedState(false);
    localStorage.removeItem('xcelerate.userProfile');
    localStorage.removeItem('xcelerate.onboarding.completed');
    localStorage.removeItem('xai_setup_completed_v1');
    localStorage.removeItem('xai_onboarding_seen_v1');
    localStorage.removeItem('xca_import_backup_1');
    localStorage.removeItem('xca_import_backup_2');
    localStorage.removeItem('xca_pre_migration_backup');
    localStorage.removeItem(STORAGE_KEYS.V2_LEARNER_STATE);
    localStorage.removeItem(STORAGE_KEYS.V2_ACTIVE_CURRICULUM);
  }, []);

  // =============================================
  // V2 CATALOG + STABLE LEARNER STATE
  // =============================================
  const selectV2Curriculum = useCallback((curriculumId) => {
    if (!curriculumCatalog.getLatest(curriculumId)) return false;
    setV2LearnerState((current) => {
      const selection = activateCurriculumSelection(curriculumCatalog, current, curriculumId);
      return selection.stateStore;
    });
    setActiveV2CurriculumIdState(curriculumId);
    setSettingsState((current) => ({ ...current, usingCustomRoadmap: false }));
    return true;
  }, []);

  const leaveV2Curriculum = useCallback(() => {
    setActiveV2CurriculumIdState(null);
  }, []);

  const resetActiveV2Curriculum = useCallback(() => {
    if (!activeV2CurriculumId) return;
    setV2LearnerState((current) => resetCurriculumState(current, activeV2CurriculumId));
    const runtime = curriculumCatalog.getLatest(activeV2CurriculumId);
    if (runtime) setV2LearnerState((current) => reconcileCurriculumState(current, runtime));
  }, [activeV2CurriculumId]);

  const setActiveV2Week = useCallback((weekId) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => setActiveV2WeekState(current, activeV2Curriculum, weekId));
  }, [activeV2Curriculum]);

  const openV2Resource = useCallback((weekId, resourceId, skillCheckId = null) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => recordV2ResourceOpenedState(current, activeV2Curriculum, weekId, resourceId, { skillCheckId }));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const completeV2Resource = useCallback((weekId, resourceId) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => completeV2ResourceState(current, activeV2Curriculum, weekId, resourceId));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const submitV2SkillCheckAttempt = useCallback((weekId, skillCheckId, attempt) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => submitV2SkillCheckAttemptState(current, activeV2Curriculum, weekId, skillCheckId, attempt));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const addV2RecoveryInsight = useCallback((skillCheckId, content) => {
    if (!activeV2Curriculum) return null;
    const createdAt = new Date().toISOString();
    const note = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt,
      noteType: 'study_insight',
      insightScope: 'study',
      content,
      roadmapId: activeV2Curriculum.curriculumId,
      focusStage: 'Study',
      linkedResource: '',
    };
    setNotesState((current) => [note, ...current]);
    setV2LearnerState((current) => recordV2RecoveryInsightState(current, activeV2Curriculum, skillCheckId, note));
    markStudyToday();
    return note.id;
  }, [activeV2Curriculum, markStudyToday]);

  const setV2BuildCompleted = useCallback((weekId, buildId, completed) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => setV2BuildCompletedState(current, activeV2Curriculum, weekId, buildId, completed));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const setV2ProofEvidence = useCallback((weekId, proofId, evidenceId, value) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => setV2ProofEvidenceState(current, activeV2Curriculum, weekId, proofId, evidenceId, value));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const setV2ReflectionResponse = useCallback((weekId, promptId, response) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => setV2ReflectionResponseState(current, activeV2Curriculum, weekId, promptId, response));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  const completeV2Week = useCallback((weekId) => {
    if (!activeV2Curriculum) return;
    setV2LearnerState((current) => completeV2WeekState(current, activeV2Curriculum, weekId));
    markStudyToday();
  }, [activeV2Curriculum, markStudyToday]);

  // =============================================
  // CONTEXT VALUE
  // =============================================
  const value = {
    // Hydration State
    isBooting,
    isDataReady,
    hasImport,

    // State
    roadmap,
    curriculumMode,
    curriculumCatalog,
    publishedV2Curricula: curriculumCatalog.listPublished(),
    activeV2CurriculumId,
    activeV2Curriculum,
    activeV2Learner,
    v2LearnerState,
    progress,
    notes,
    checkpointStatuses,
    settings,
    streak,
    resourcesStatus,
    skillChecks,
    skillCheckAttempts,
    resourceActivity,
    practicalMissions,
    sessionTimer,
    blockers,
    weekProofs,
    weekReflections,
    timerHistory,
    pendingTimerParams,
    showSwitchConfirmation,

    // Active roadmap ID (for namespaced progress / filtering notes+blockers)
    activeRoadmapId: settings.activeRoadmapId || roadmap?.id || null,

    // Roadmap
    importRoadmap,
    resetToSampleRoadmap,
    selectV2Curriculum,
    leaveV2Curriculum,
    resetActiveV2Curriculum,
    setActiveV2Week,
    openV2Resource,
    completeV2Resource,
    submitV2SkillCheckAttempt,
    addV2RecoveryInsight,
    setV2BuildCompleted,
    setV2ProofEvidence,
    setV2ReflectionResponse,
    completeV2Week,

    // Tasks
    toggleTask,
    getTasksForWeek,
    isTaskComplete,

    // Weeks
    markWeekComplete,
    isWeekComplete,

    // Projects
    toggleProjectMilestone,
    setProjectGithubLink,
    setProjectNote,
    setProjectLiveDemoLink,

    // Notes
    addNote,
    deleteNote,
    updateNote,

    // Resources
    updateResourceStatus,
    recordResourceOpen,
    addStudyInsight,

    // Skill Checks
    submitSkillCheck,
    submitQuizAttempt,

    // Practical Missions
    startPracticalMission,
    updatePracticalMissionProof,
    updatePracticalMissionReflection,
    completePracticalMission,
    blockPracticalMission,
    togglePracticalMissionTask,

    // Session Timer
    startTimer,
    pauseTimer,
    resumeTimer,
    startBreakTimer,
    resetTimer,
    acknowledgeExpiredPrompt,
    confirmSwitchTimer,
    cancelSwitchTimer,
    endSessionTimer,

    // Blockers
    addBlocker,
    solveBlocker,
    updateBlocker,
    deleteBlocker,

    // Proofs
    submitWeekProof,
    saveWeekReflection,

    // Checkpoints
    setCheckpointStatus,

    // Settings
    updateSettings,
    setActiveWeek,

    // Streak
    markStudyToday,

    // Export/Import
    exportProgress,
    importProgress,
    resetAllProgress,

    // Onboarding & Profile
    userProfile,
    updateUserProfile,
    onboardingCompleted,
    completeOnboarding,
    replayOnboarding,
    resetProgressForActiveRoadmap,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

// =============================================
// HOOK
// =============================================
export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
