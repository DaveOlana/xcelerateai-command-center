import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { sampleRoadmap } from '../data/sampleRoadmap';
import { getTodayString, getYesterdayString } from '../utils/dateUtils';

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
};

// =============================================
// DEFAULTS
// =============================================
const DEFAULT_SETTINGS = {
  startDate: new Date().toISOString().split('T')[0], // Default start date to today
  mentorName: 'Lemont',
  activeWeek: 1,
  activeMonth: 1,
  usingCustomRoadmap: false,
  onboardingCompleted: false,
  weeklyHours: '20-25',
  manualOverrideEnabled: false,
  overrideReason: '',
  lastBackupDate: null,
  sidebarCollapsed: false,
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
    const loaded = loadFromStorage(STORAGE_KEYS.ROADMAP, sampleRoadmap);
    return Array.isArray(loaded) ? { months: loaded, checkpoints: [], projects: [] } : loaded || sampleRoadmap;
  });
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
    return { ...DEFAULT_SETTINGS, ...loaded };
  });
  const [streak, setStreakState] = useState(() =>
    loadFromStorage(STORAGE_KEYS.STREAK, DEFAULT_STREAK)
  );

  // New States for rich schema & new features
  const [resourcesStatus, setResourcesStatus] = useState(() =>
    loadFromStorage(STORAGE_KEYS.RESOURCES_STATUS, {})
  );
  const [skillChecks, setSkillChecks] = useState(() =>
    loadFromStorage(STORAGE_KEYS.SKILL_CHECKS, {})
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
  useEffect(() => { saveToStorage(STORAGE_KEYS.PRACTICAL_MISSIONS, practicalMissions); }, [practicalMissions]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.SESSION_TIMER, sessionTimer); }, [sessionTimer]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.BLOCKERS, blockers); }, [blockers]);
  useEffect(() => { saveToStorage(STORAGE_KEYS.WEEK_PROOFS, weekProofs); }, [weekProofs]);
  useEffect(() => { saveToStorage('xca_week_reflections', weekReflections); }, [weekReflections]);

  // =============================================
  // BOOT & NORMALIZATION
  // =============================================
  useEffect(() => {
    // Check if we have valid roadmap data synchronously to prevent flicker on import
    const isValid = Boolean(roadmap && roadmap.months && roadmap.months.length > 0);
    setIsDataReady(isValid);

    // Simulate a brief boot phase ONCE
    if (isBooting) {
      const bootTimer = setTimeout(() => {
        setIsBooting(false);
      }, 400);
      return () => clearTimeout(bootTimer);
    }
  }, [roadmap, isBooting]);

  const hasImport = Boolean(roadmap && roadmap.months && roadmap.months.length > 0);

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
  const importRoadmap = useCallback((data) => {
    setRoadmap(data);
    setSettingsState((prev) => ({ ...prev, usingCustomRoadmap: true, activeWeek: 1, activeMonth: 1 }));
    // Reset progress when importing new roadmap
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
  }, []);

  const resetToSampleRoadmap = useCallback(() => {
    setRoadmap(sampleRoadmap);
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setSettingsState({ ...DEFAULT_SETTINGS });
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
      };
      setTimerHistory((prev) => [newHistoryItem, ...prev]);
      
      // Reset the flag
      setSessionTimer((prev) => ({
        ...prev,
        hasJustCompleted: false
      }));
    }
  }, [sessionTimer.hasJustCompleted, sessionTimer.activeSessionId, sessionTimer.startedAt, sessionTimer.isBreak, sessionTimer.durationMinutes]);

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
  const startTimer = useCallback((sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes) => {
    if (sessionTimer.activeSessionId && sessionTimer.timeLeftSeconds > 0) {
      setPendingTimerParams({ sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes });
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
      };
      setTimerHistory((prev) => [newHistoryItem, ...prev]);
    }
    const { sessionId, type, title, durationMinutes, maxContinuousMinutes, recommendedBreakMinutes } = pendingTimerParams;
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
      practicalMissions,
      blockers,
      weekProofs,
      weekReflections,
      timerHistory
    };
    setSettingsState(prev => ({ ...prev, lastBackupDate: new Date().toISOString() }));
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `xca-progress-v2-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [roadmap, progress, notes, checkpointStatuses, settings, streak, resourcesStatus, skillChecks, practicalMissions, blockers, weekProofs, weekReflections, timerHistory]);

  const importProgress = useCallback((data) => {
    if (data.roadmap) setRoadmap(data.roadmap);
    if (data.progress) setProgress(data.progress);
    if (data.notes) setNotesState(data.notes);
    if (data.checkpointStatuses) setCheckpointStatusesState(data.checkpointStatuses);
    if (data.settings) setSettingsState(data.settings);
    if (data.streak) setStreakState(data.streak);
    if (data.resourcesStatus) setResourcesStatus(data.resourcesStatus);
    if (data.skillChecks) setSkillChecks(data.skillChecks);
    if (data.practicalMissions) setPracticalMissions(data.practicalMissions);
    if (data.blockers) setBlockers(data.blockers);
    if (data.weekProofs) setWeekProofs(data.weekProofs);
    if (data.weekReflections) setWeekReflections(data.weekReflections);
    if (data.timerHistory) setTimerHistory(data.timerHistory);
  }, []);

  const resetAllProgress = useCallback(() => {
    setProgress(DEFAULT_PROGRESS);
    setCheckpointStatusesState({});
    setStreakState(DEFAULT_STREAK);
    setSettingsState({ ...DEFAULT_SETTINGS });
    setNotesState([]);
    setResourcesStatus({});
    setSkillChecks({});
    setPracticalMissions({});
    setSessionTimer(DEFAULT_SESSION_TIMER);
    setTimerHistory([]);
    setBlockers([]);
    setWeekProofs({});
    setWeekReflections({});
    localStorage.removeItem('xai_setup_completed_v1');
    localStorage.removeItem('xai_onboarding_seen_v1');
  }, []);

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
    progress,
    notes,
    checkpointStatuses,
    settings,
    streak,
    resourcesStatus,
    skillChecks,
    practicalMissions,
    sessionTimer,
    blockers,
    weekProofs,
    weekReflections,
    timerHistory,
    pendingTimerParams,
    showSwitchConfirmation,

    // Roadmap
    importRoadmap,
    resetToSampleRoadmap,

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

    // Notes
    addNote,
    deleteNote,
    updateNote,

    // Resources
    updateResourceStatus,

    // Skill Checks
    submitSkillCheck,

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
