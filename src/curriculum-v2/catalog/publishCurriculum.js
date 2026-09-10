import { compileCurriculum } from '../compiler/compileCurriculum.js';
import { CurriculumValidationError } from '../validation/findings.js';
import { validateRuntimeCurriculum } from '../validation/validateRuntimeCurriculum.js';

export function publishCurriculumSource(source, { status = 'published' } = {}) {
  const runtime = compileCurriculum(source);
  const report = validateRuntimeCurriculum(runtime);
  if (report.status !== 'PASS') throw new CurriculumValidationError(report);
  return createCatalogEntry(runtime, status);
}
export function createCatalogEntry(runtime, status = 'published') {
  const report = validateRuntimeCurriculum(runtime);
  if (report.status !== 'PASS') throw new CurriculumValidationError(report);
  if (!['published', 'draft'].includes(status)) throw new Error(`Unsupported curriculum catalog status: ${status}`);
  return {
    curriculumId: runtime.curriculumId,
    revision: runtime.revision,
    title: runtime.metadata.title,
    shortTitle: runtime.metadata.shortTitle,
    professionalOutcome: runtime.metadata.target.professionalOutcome,
    estimatedWeeks: runtime.metadata.workload.estimatedWeeks,
    status,
    runtime,
  };
}

export function createCurriculumCatalog(entries) {
  const byCurriculum = new Map();
  for (const entry of entries) {
    const validated = createCatalogEntry(entry.runtime, entry.status);
    if (validated.curriculumId !== entry.curriculumId || validated.revision !== entry.revision) {
      throw new Error(`Catalog metadata does not match runtime curriculum "${entry.curriculumId}".`);
    }
    const revisions = byCurriculum.get(entry.curriculumId) || new Set();
    if (revisions.has(entry.revision)) throw new Error(`Duplicate catalog entry for ${entry.curriculumId} revision ${entry.revision}.`);
    revisions.add(entry.revision);
    byCurriculum.set(entry.curriculumId, revisions);
  }
  const published = entries.filter((entry) => entry.status === 'published');
  const latest = new Map();
  published.forEach((entry) => {
    const current = latest.get(entry.curriculumId);
    if (!current || entry.revision > current.revision) latest.set(entry.curriculumId, entry);
  });
  return {
    listPublished() {
      return [...latest.values()].map(({ runtime, ...metadata }) => metadata).sort((a, b) => a.title.localeCompare(b.title));
    },
    getLatest(curriculumId) {
      return latest.get(curriculumId)?.runtime || null;
    },
    has(curriculumId) {
      return latest.has(curriculumId);
    },
  };
}
