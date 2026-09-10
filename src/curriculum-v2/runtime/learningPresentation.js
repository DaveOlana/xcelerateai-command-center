const LEARNING_ROLE_PRESENTATION = Object.freeze({
  learn: { label: 'Learn', description: 'Primary explanation and teaching' },
  practice: { label: 'Practice', description: 'Active exercise or guided application' },
  reference: { label: 'Reference', description: 'Authoritative material for consultation and precision' },
});

export function getLearningRolePresentation(role) {
  return LEARNING_ROLE_PRESENTATION[role] || null;
}

export function formatResourceFormat(format) {
  if (typeof format !== 'string' || !format.trim()) return 'Resource';
  return format.replace(/[-_]/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function formatMinutes(minutes) {
  if (!Number.isFinite(minutes) || minutes <= 0) return null;
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  if (remainder === 0) return `${hours}h`;
  return `${hours}h ${remainder}m`;
}

export function formatEstimatedEffort(estimatedMinutes, sessionCount = 0) {
  if (!Number.isFinite(estimatedMinutes) || estimatedMinutes <= 0) return null;
  const hours = estimatedMinutes / 60;
  const hourLabel = Number.isInteger(hours) ? String(hours) : hours.toFixed(1).replace(/\.0$/, '');
  return {
    primary: `About ${hourLabel} hour${hours === 1 ? '' : 's'}`,
    secondary: sessionCount > 0 ? `Across ${sessionCount} focused session${sessionCount === 1 ? '' : 's'}` : null,
    exact: `${estimatedMinutes} minutes`,
  };
}

export function resolvePriorKnowledge(competencyIds, competenciesById) {
  return (Array.isArray(competencyIds) ? competencyIds : [])
    .map((id) => competenciesById?.[id])
    .filter(Boolean);
}

export function resolveConceptReferences(conceptRefs, conceptsById) {
  return (Array.isArray(conceptRefs) ? conceptRefs : [])
    .map((reference) => {
      const concept = conceptsById?.[reference.conceptId];
      return concept ? { ...concept, relevance: reference.relevance } : null;
    })
    .filter(Boolean);
}

export function resolveBuildSessions(sessions, steps) {
  const stepsById = Object.fromEntries((Array.isArray(steps) ? steps : []).map((step) => [step.id, step]));
  return (Array.isArray(sessions) ? sessions : []).map((session) => ({
    ...session,
    steps: session.stepIds.map((stepId) => stepsById[stepId]).filter(Boolean),
  }));
}
