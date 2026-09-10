export function getRoadmapIdentity(roadmap, fallback = 'default-roadmap') {
  return String(
    roadmap?.id ||
    roadmap?.roadmapId ||
    roadmap?.slug ||
    fallback
  );
}

export function getWeekIdentity(week) {
  return String(week?.weekId || week?.id || `week-${week?.weekNumber ?? 'unknown'}`);
}

export function getResourceIdentity(resource, week) {
  const explicitId = resource?.id || resource?.resourceId;
  if (explicitId) return String(explicitId);
  const title = resource?.title || resource?.name || resource?.label || 'untitled-resource';
  return `${getWeekIdentity(week)}::${title}`;
}

export function getResourceActivity(store, roadmapId, weekId, resourceId) {
  return store?.[roadmapId]?.[weekId]?.[resourceId] || null;
}

export function recordResourceOpened(store, {
  roadmapId,
  weekId,
  resourceId,
  title,
  openedAt = new Date().toISOString(),
}) {
  return {
    ...(store || {}),
    [roadmapId]: {
      ...(store?.[roadmapId] || {}),
      [weekId]: {
        ...(store?.[roadmapId]?.[weekId] || {}),
        [resourceId]: {
          ...(store?.[roadmapId]?.[weekId]?.[resourceId] || {}),
          title: title || store?.[roadmapId]?.[weekId]?.[resourceId]?.title || '',
          lastOpenedAt: openedAt,
        },
      },
    },
  };
}

export function getStudyRequirementStatus(week, resourcesStatus = {}) {
  const resources = Array.isArray(week?.studyResources)
    ? week.studyResources
    : Array.isArray(week?.resources)
      ? week.resources
      : [];
  const minimum = week?.studyRequirement?.minimumCoreResources;
  const usesCoreMinimum = Number.isInteger(minimum) && minimum >= 1;

  if (!usesCoreMinimum) {
    const explicitlyRequired = resources.filter((resource) => resource?.required === true);
    const requiredResources = explicitlyRequired.length > 0 ? explicitlyRequired : resources;
    const completed = requiredResources.filter((resource) => {
      const title = typeof resource === 'string'
        ? resource
        : resource?.title || resource?.name || resource?.label || '';
      return title && resourcesStatus[title] === 'Studied';
    }).length;
    return {
      mode: 'legacy',
      resources,
      coreResources: requiredResources,
      optionalResources: explicitlyRequired.length > 0
        ? resources.filter((resource) => resource?.required !== true)
        : [],
      minimumRequired: requiredResources.length,
      completedCore: completed,
      satisfied: requiredResources.length === 0 || completed >= requiredResources.length,
    };
  }

  const coreResources = resources.filter((resource) => resource?.required === true);
  const optionalResources = resources.filter((resource) => resource?.required !== true);
  const completedCore = coreResources.filter((resource) => {
    const title = resource?.title || resource?.name || resource?.label || '';
    return title && resourcesStatus[title] === 'Studied';
  }).length;

  return {
    mode: 'core-minimum',
    resources,
    coreResources,
    optionalResources,
    minimumRequired: minimum,
    completedCore,
    satisfied: completedCore >= minimum,
  };
}

export function canMarkResourceComplete({
  week,
  resource,
  resourcesStatus = {},
  resourceActivity = {},
  roadmapId,
}) {
  const title = resource?.title || resource?.name || resource?.label || '';
  if (title && resourcesStatus[title] === 'Studied') return true;
  if (!week?.studyRequirement) return true;

  const weekId = getWeekIdentity(week);
  const resourceId = getResourceIdentity(resource, week);
  return Boolean(getResourceActivity(resourceActivity, roadmapId, weekId, resourceId)?.lastOpenedAt);
}
