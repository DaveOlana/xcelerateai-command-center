const asArray = (value) => Array.isArray(value) ? value : [];

export function generateCoverage(source) {
  const records = new Map(asArray(source?.competencies).map((competency) => [competency.id, {
    competencyId: competency.id,
    taughtIn: [],
    practicedIn: [],
    assessedIn: [],
    appliedIn: [],
    projectUse: [],
    reinforcedIn: [],
    intermediateReinforcedIn: [],
    capstoneIntegration: [],
  }]));
  const resources = new Map(asArray(source?.resources).map((resource) => [resource.id, resource]));
  const firstTeachingSequence = new Map();
  const laterOccurrences = new Map();

  const addUnique = (competencyId, field, value) => {
    const record = records.get(competencyId);
    if (record && value && !record[field].includes(value)) record[field].push(value);
  };
  const markOccurrence = (competencyId, week) => {
    if (!records.has(competencyId)) return;
    if (!laterOccurrences.has(competencyId)) laterOccurrences.set(competencyId, []);
    const items = laterOccurrences.get(competencyId);
    if (!items.some((item) => item.weekId === week.id)) items.push({ weekId: week.id, sequence: week.sequence });
  };

  const weeks = [...asArray(source?.weeks)].sort((a, b) => a.sequence - b.sequence);
  weeks.forEach((week) => {
    asArray(week.study?.resources).forEach((assignment) => {
      asArray(assignment.competencyIds).forEach((competencyId) => {
        addUnique(competencyId, 'taughtIn', week.id);
        markOccurrence(competencyId, week);
        if (!firstTeachingSequence.has(competencyId)) firstTeachingSequence.set(competencyId, week.sequence);
        const format = resources.get(assignment.resourceId)?.format;
        if (assignment.learningRole === 'practice' || format === 'lab' || format === 'exercise') {
          addUnique(competencyId, 'practicedIn', week.id);
        }
      });
    });
    asArray(week.skillCheck?.questions).forEach((question) => {
      asArray(question.competencyIds).forEach((competencyId) => {
        addUnique(competencyId, 'assessedIn', week.skillCheck.id);
        markOccurrence(competencyId, week);
      });
    });
    asArray(week.builds).forEach((build) => {
      asArray(build.competencyIds).forEach((competencyId) => {
        addUnique(competencyId, 'appliedIn', build.id);
        markOccurrence(competencyId, week);
      });
    });
  });

  asArray(source?.projects).forEach((project) => {
    asArray(project.milestones).forEach((milestone) => {
      const week = weeks.find((item) => item.id === milestone.weekId);
      const build = asArray(week?.builds).find((item) => item.id === milestone.buildId);
      asArray(build?.competencyIds).forEach((competencyId) => addUnique(competencyId, 'projectUse', milestone.id));
    });
  });

  const capstoneWeekId = weeks.length > 0 ? weeks[weeks.length - 1]?.id : null;

  records.forEach((record, competencyId) => {
    const taughtAt = firstTeachingSequence.get(competencyId);
    if (taughtAt === undefined) return;
    asArray(laterOccurrences.get(competencyId)).forEach((occurrence) => {
      if (occurrence.sequence > taughtAt) {
        addUnique(competencyId, 'reinforcedIn', occurrence.weekId);
        if (capstoneWeekId && occurrence.weekId === capstoneWeekId) {
          addUnique(competencyId, 'capstoneIntegration', occurrence.weekId);
        } else {
          addUnique(competencyId, 'intermediateReinforcedIn', occurrence.weekId);
        }
      }
    });
  });

  return [...records.values()];
}
