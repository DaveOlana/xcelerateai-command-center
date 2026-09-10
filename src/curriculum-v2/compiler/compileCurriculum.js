import { generateCoverage } from '../coverage/generateCoverage.js';
import { RUNTIME_CONTRACT_VERSION } from '../schema/constants.js';
import { CurriculumValidationError } from '../validation/findings.js';
import { validateCurriculumSource } from '../validation/validateCurriculumSource.js';

const clone = (value) => structuredClone(value);
const indexById = (items) => Object.fromEntries(items.map((item) => [item.id, item]));

export function compileCurriculum(source) {
  const report = validateCurriculumSource(source);
  if (report.status !== 'PASS') throw new CurriculumValidationError(report);

  const phases = clone(source.phases);
  const competencies = clone(source.competencies);
  const concepts = clone(source.concepts || []);
  const resources = clone(source.resources);
  const weeks = clone(source.weeks).sort((a, b) => a.sequence - b.sequence);
  const projects = clone(source.projects);
  const coverage = generateCoverage(source);
  const skillChecks = weeks.map((week) => week.skillCheck);
  const builds = weeks.flatMap((week) => week.builds);
  const proofs = weeks.map((week) => week.proof);

  const runtime = {
    runtimeContractVersion: RUNTIME_CONTRACT_VERSION,
    sourceSchemaVersion: source.schemaVersion,
    curriculumId: source.curriculumId,
    revision: source.revision,
    metadata: {
      title: source.title,
      shortTitle: source.shortTitle,
      target: clone(source.target),
      workload: clone(source.workload),
      assumptions: clone(source.assumptions),
    },
    phases,
    competencies,
    concepts,
    resources,
    weeks,
    projects,
    graduation: clone(source.graduation),
    coverage,
    indexes: {},
  };
  runtime.indexes = {
    phasesById: indexById(runtime.phases),
    competenciesById: indexById(runtime.competencies),
    conceptsById: indexById(runtime.concepts),
    resourcesById: indexById(runtime.resources),
    weeksById: indexById(runtime.weeks),
    skillChecksById: indexById(skillChecks),
    buildsById: indexById(builds),
    proofsById: indexById(proofs),
    projectsById: indexById(runtime.projects),
  };
  return runtime;
}
