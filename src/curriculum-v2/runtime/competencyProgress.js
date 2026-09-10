const STATUS_RANK = Object.freeze({ not_started: 0, introduced: 1, practiced: 2, assessed: 3, applied: 4, reinforced: 5 });

export function deriveV2CompetencyProgress(runtime, curriculumState) {
  const weekStatus = Object.fromEntries(runtime.weeks.map((week) => [week.id, curriculumState?.stageSatisfaction?.[week.id] || {}]));
  const buildDone = (buildId) => Boolean(curriculumState?.builds?.[buildId]?.completedAt);
  const stageIncludesCompetency = (weekId, stage, competencyId) => {
    const record = weekStatus[weekId]?.[stage];
    return record?.satisfied && Array.isArray(record.competencyIds) && record.competencyIds.includes(competencyId);
  };
  const completedResourceIncludesCompetency = (weekId, competencyId) => Object.values(curriculumState?.resources?.[weekId] || {})
    .some((record) => record?.completedAt && Array.isArray(record.competencyIds) && record.competencyIds.includes(competencyId));
  const projectMilestoneBuildIds = new Set(runtime.projects.flatMap((project) => project.milestones.map((milestone) => milestone.buildId)));

  return runtime.competencies.map((competency) => {
    const coverage = runtime.coverage.find((item) => item.competencyId === competency.id);
    let status = 'not_started';
    const evidence = [];
    const advance = (candidate, id) => {
      if (STATUS_RANK[candidate] > STATUS_RANK[status]) status = candidate;
      if (id && !evidence.includes(id)) evidence.push(id);
    };
    coverage?.taughtIn.forEach((weekId) => {
      if (stageIncludesCompetency(weekId, 'study', competency.id) || completedResourceIncludesCompetency(weekId, competency.id)) advance('introduced', weekId);
    });
    coverage?.practicedIn.forEach((weekId) => {
      if (stageIncludesCompetency(weekId, 'study', competency.id) || completedResourceIncludesCompetency(weekId, competency.id)) advance('practiced', weekId);
    });
    coverage?.assessedIn.forEach((skillCheckId) => {
      if (curriculumState?.skillChecks?.[skillCheckId]?.attempts?.some((attempt) => attempt.passed)) advance('assessed', skillCheckId);
    });
    coverage?.appliedIn.forEach((buildId) => {
      if (buildDone(buildId)) advance('applied', buildId);
    });
    coverage?.reinforcedIn.forEach((weekId) => {
      const reinforcedBuild = runtime.indexes.weeksById[weekId]?.builds?.find((build) => build.competencyIds.includes(competency.id) && buildDone(build.id));
      if (weekStatus[weekId]?.study?.satisfied || weekStatus[weekId]?.skillCheck?.satisfied || reinforcedBuild || curriculumState?.completedWeekIds?.includes(weekId)) advance('reinforced', weekId);
    });
    const projectUse = coverage?.projectUse.filter((milestoneId) => {
      const milestone = runtime.projects.flatMap((project) => project.milestones).find((item) => item.id === milestoneId);
      return milestone && projectMilestoneBuildIds.has(milestone.buildId) && buildDone(milestone.buildId);
    }) || [];
    return { competencyId: competency.id, name: competency.name, domain: competency.domain, importance: competency.importance, status, evidenceIds: evidence, projectUse };
  });
}
