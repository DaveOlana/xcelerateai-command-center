import {
  getCurriculumState,
  hasCurriculumProgress,
  normalizeV2StateStore,
  reconcileCurriculumState,
} from './learnerState.js';

export function resolveActiveCurriculumId(catalog, selectedCurriculumId) {
  return selectedCurriculumId && catalog.has(selectedCurriculumId) ? selectedCurriculumId : null;
}

export function getCurriculumLaunchLabel(stateStore, curriculumId) {
  return hasCurriculumProgress(getCurriculumState(stateStore, curriculumId)) ? 'Continue' : 'Start';
}

export function activateCurriculumSelection(catalog, stateStore, curriculumId) {
  const runtime = catalog.getLatest(curriculumId);
  if (!runtime) {
    return {
      accepted: false,
      activeCurriculumId: null,
      stateStore: normalizeV2StateStore(stateStore),
    };
  }
  return {
    accepted: true,
    activeCurriculumId: curriculumId,
    stateStore: reconcileCurriculumState(stateStore, runtime),
  };
}
