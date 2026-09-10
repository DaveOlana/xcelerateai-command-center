import { normalizeV2StateStore, reconcileCurriculumState } from './learnerState.js';
import { resolveActiveCurriculumId } from './curriculumSelection.js';

export function createV2BackupSlice(stateStore, activeCurriculumId) {
  return {
    v2LearnerState: normalizeV2StateStore(stateStore),
    activeV2CurriculumId: activeCurriculumId || null,
  };
}

export function restoreV2BackupSlice(data, catalog) {
  let stateStore = normalizeV2StateStore(data?.v2LearnerState);
  const activeCurriculumId = resolveActiveCurriculumId(catalog, data?.activeV2CurriculumId);
  const runtime = activeCurriculumId ? catalog.getLatest(activeCurriculumId) : null;
  if (runtime) stateStore = reconcileCurriculumState(stateStore, runtime);
  return { stateStore, activeCurriculumId };
}
