export const SOURCE_SCHEMA_VERSION = '2.0';
export const RUNTIME_CONTRACT_VERSION = '2.0';

export const COMPETENCY_IMPORTANCE = Object.freeze(['core', 'supporting']);
export const RESOURCE_FORMATS = Object.freeze([
  'video', 'article', 'documentation', 'course', 'lab', 'exercise', 'book', 'repository', 'other',
]);
export const RESOURCE_COSTS = Object.freeze(['free', 'paid', 'mixed']);
export const STUDY_ROLES = Object.freeze(['core', 'optional']);
export const STUDY_LEARNING_ROLES = Object.freeze(['learn', 'practice', 'reference']);
export const BUILD_SESSION_TIME_TOLERANCE = 0.20;
export const PROOF_EVIDENCE_TYPES = Object.freeze(['link', 'text', 'confirmation']);

// These names identify obsolete V1 structures whose presence makes a V2
// source ambiguous. The V2 validator reports them and never removes them.
export const REJECTED_LEGACY_FIELDS = Object.freeze(new Set([
  'months',
  'monthNumber',
  'weekNumber',
  'unlockCriteria',
  'practicalMissions',
  'proofOfWork',
  'checkpoints',
  'readinessCategories',
  'bossMission',
]));
