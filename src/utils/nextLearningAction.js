import { getActiveWeekData } from './progressCalculator.js';
import {
  getRequiredPracticals,
  getRequiredResources,
  getWeekStepStatus,
} from './unlockChecker.js';
import { getRoadmapIdentity } from './resourceActivity.js';

const STAGE_DETAILS = {
  study: { label: 'Study', position: 1 },
  skillCheck: { label: 'Skill Check', position: 2 },
  build: { label: 'Build', position: 3 },
  proof: { label: 'Proof', position: 4 },
  reflect: { label: 'Reflect', position: 5 },
  complete: { label: 'Complete', position: 6 },
};

function textFrom(value, fallback = '') {
  if (!value) return fallback;
  if (typeof value === 'string') return value;
  return value.title || value.name || value.label || value.text || fallback;
}

function buildAction({
  stage,
  description,
  destination = '/missions',
  week,
  missionId = null,
  completed = false,
  ctaLabel = 'Continue Mission',
  activeSession = false,
}) {
  const details = STAGE_DETAILS[stage] || STAGE_DETAILS.study;

  return {
    stage,
    stageLabel: details.label,
    stagePosition: details.position,
    totalStages: 6,
    description,
    destination: activeSession ? '/missions?focus=session' : destination,
    ctaLabel: activeSession ? 'Resume Session' : ctaLabel,
    weekNumber: week?.weekNumber ?? null,
    weekTitle: week?.title || week?.displayLabel || week?.goal || '',
    missionId,
    completed,
    activeSession,
  };
}

export function getNextLearningAction({
  roadmap,
  progress,
  settings,
  resourcesStatus,
  skillChecks,
  practicalMissions,
  weekProofs,
  weekReflections,
  sessionTimer,
  skillCheckAttempts,
}) {
  const activeWeekData = getActiveWeekData(roadmap, settings?.activeWeek);
  const week = activeWeekData?.week;
  const activeSession = Boolean(sessionTimer?.activeSessionId);

  if (!week) {
    return buildAction({
      stage: 'study',
      description: roadmap
        ? 'No active week is available. Review your course settings.'
        : 'Choose a course before starting your next mission.',
      destination: '/settings',
      week: null,
      ctaLabel: 'Open Settings',
    });
  }

  const weekNum = week.weekNumber;
  const monthNum = activeWeekData?.month?.monthNumber || week.monthNumber || settings?.activeMonth || 1;
  const stepStatus = getWeekStepStatus({
    week,
    weekNum,
    monthNum,
    progress,
    resourcesStatus,
    skillChecks,
    practicalMissions,
    weekProofs,
    weekReflections,
    settings,
    skillCheckAttempts,
    roadmapId: getRoadmapIdentity(roadmap, settings?.activeRoadmapId),
  });

  const requiredResources = getRequiredResources(week);
  const nextResource = requiredResources.find((resource) => {
    const title = textFrom(resource);
    return title && resourcesStatus?.[title] !== 'Studied';
  });

  if (requiredResources.length > 0 && !stepStatus.resourcesDone) {
    const resourceTitle = textFrom(nextResource);
    return buildAction({
      stage: 'study',
      description: resourceTitle
        ? `Study “${resourceTitle}”.`
        : 'Complete the required study resources.',
      week,
      activeSession,
    });
  }

  const hasSkillCheck = Boolean(
    (Array.isArray(week.skillCheck) && week.skillCheck.length > 0) ||
    (!Array.isArray(week.skillCheck) && week.skillCheck) ||
    week.checkpoint ||
    week.skillChecks ||
    week.quiz
  );

  if (hasSkillCheck && !stepStatus.skillCheckDone) {
    return buildAction({
      stage: 'skillCheck',
      description: `Complete the Week ${weekNum} skill check.`,
      week,
      activeSession,
    });
  }

  const requiredPracticals = getRequiredPracticals(week);
  const nextPractical = requiredPracticals.find((mission) => {
    const missionId = mission?.missionId || mission?.id || (mission?.title ? `pm_${mission.title}` : null);
    return missionId && practicalMissions?.[missionId]?.status !== 'Completed';
  });

  if (requiredPracticals.length > 0 && !stepStatus.practicalsDone) {
    const missionId = nextPractical?.missionId || nextPractical?.id || null;
    const missionTitle = textFrom(nextPractical, 'the required build');
    return buildAction({
      stage: 'build',
      description: `Continue ${missionTitle}.`,
      destination: missionId ? `/mission/${missionId}` : '/missions',
      week,
      missionId,
      activeSession,
    });
  }

  if (!stepStatus.proofDone) {
    return buildAction({
      stage: 'proof',
      description: `Submit the required proof for Week ${weekNum}.`,
      week,
      activeSession,
    });
  }

  if (!stepStatus.reflectionDone) {
    return buildAction({
      stage: 'reflect',
      description: `Write your Week ${weekNum} reflection.`,
      week,
      activeSession,
    });
  }

  const completedWeeks = Array.isArray(progress?.completedWeeks) ? progress.completedWeeks : [];
  const weekIsComplete = completedWeeks.includes(weekNum);

  if (!weekIsComplete) {
    return buildAction({
      stage: 'complete',
      description: `Complete Week ${weekNum} to unlock what comes next.`,
      week,
      activeSession,
    });
  }

  const totalWeeks = Array.isArray(roadmap?.months)
    ? roadmap.months.reduce((total, month) => total + (month.weeks?.length || 0), 0)
    : roadmap?.weeks?.length || 0;
  const courseComplete = totalWeeks > 0 && completedWeeks.length >= totalWeeks;

  return buildAction({
    stage: 'complete',
    description: courseComplete
      ? 'You have completed every week in this course.'
      : `Week ${weekNum} is complete. Continue in Missions when you are ready.`,
    destination: courseComplete ? '/progress' : '/missions',
    week,
    completed: courseComplete,
    ctaLabel: courseComplete ? 'View Progress' : 'Continue Mission',
    activeSession,
  });
}
