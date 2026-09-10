import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { CurriculumValidationError } from '../validation/findings.js';
import { validateRuntimeCurriculum } from '../validation/validateRuntimeCurriculum.js';

export function loadCurriculumSource(source) {
  const runtime = compileCurriculum(source);
  const report = validateRuntimeCurriculum(runtime);
  if (report.status !== 'PASS') throw new CurriculumValidationError(report);
  return runtime;
}
export function loadPublishedRuntime(runtime) {
  const report = validateRuntimeCurriculum(runtime);
  if (report.status !== 'PASS') throw new CurriculumValidationError(report);
  return runtime;
}
