export const ONBOARDING_DESTINATION = '/curricula';

export const shouldRenderExclusiveOnboarding = (onboardingCompleted) => onboardingCompleted !== true;

export function resolveCurriculumMode({ activeV2Curriculum, usingCustomRoadmap }) {
  if (activeV2Curriculum) return 'v2';
  if (usingCustomRoadmap === true) return 'legacy';
  return 'catalog';
}

const countLegacyWeeks = (roadmap) => {
  if (Array.isArray(roadmap?.months)) {
    return roadmap.months.reduce((total, month) => total + (month.weeks?.length || 0), 0);
  }
  return Array.isArray(roadmap?.weeks) ? roadmap.weeks.length : 0;
};

export function getCurrentCourseDefinition({ curriculumMode, activeV2Curriculum, roadmap }) {
  if (curriculumMode === 'v2' && activeV2Curriculum) {
    return {
      id: activeV2Curriculum.curriculumId,
      title: activeV2Curriculum.metadata?.shortTitle || activeV2Curriculum.metadata?.title || '',
      detail: `Revision ${activeV2Curriculum.revision} · ${activeV2Curriculum.weeks?.length || 0} weeks`,
      totalWeeks: activeV2Curriculum.weeks?.length || 0,
      source: 'Published catalog',
    };
  }

  if (curriculumMode === 'legacy' && roadmap) {
    const totalWeeks = countLegacyWeeks(roadmap);
    return {
      id: roadmap.id || null,
      title: roadmap.shortTitle || roadmap.title || roadmap.bootcampTitle || '',
      detail: `${roadmap.duration || `${totalWeeks} weeks`} · ${totalWeeks || 'Duration not supplied'} weeks`,
      totalWeeks,
      source: 'Imported curriculum',
    };
  }

  return null;
}
