export function getV2ProjectProgress(runtime, curriculumState, projectId) {
  const project = runtime?.indexes?.projectsById?.[projectId];
  if (!project) return null;
  const milestones = project.milestones.map((milestone) => ({
    ...milestone,
    completed: Boolean(curriculumState?.builds?.[milestone.buildId]?.completedAt),
  }));
  const completedCount = milestones.filter((milestone) => milestone.completed).length;
  return {
    project,
    milestones,
    completedCount,
    totalCount: milestones.length,
    completed: milestones.length > 0 && completedCount === milestones.length,
    percent: milestones.length > 0 ? Math.round((completedCount / milestones.length) * 100) : 0,
  };
}
export function getAllV2ProjectProgress(runtime, curriculumState) {
  return (runtime?.projects || []).map((project) => getV2ProjectProgress(runtime, curriculumState, project.id));
}
