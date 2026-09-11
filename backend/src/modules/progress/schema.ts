import { z } from 'zod';

export const CLOUD_ENABLED_CURRICULA = Object.freeze({ PYAE: { revision: 3 } });
export const SUPPORTED_STATE_SCHEMA_VERSION = 1;
export const SYNC_BODY_LIMIT = 1024 * 1024;

const identifier = z.string().trim().min(1).max(160).regex(/^[A-Za-z0-9][A-Za-z0-9._:-]*$/);
const ISO_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/;
const isTimestamp = (value: unknown): value is string => typeof value === 'string'
  && value.length <= 40
  && ISO_TIMESTAMP.test(value)
  && Number.isFinite(Date.parse(value));
const timestamp = z.string().refine(isTimestamp, 'Invalid timestamp');
const idArray = z.array(identifier).max(500);
const limitedRecord = <T extends z.ZodTypeAny>(value: T, maximum: number) => z.record(identifier, value)
  .refine((record) => Object.keys(record).length <= maximum, `At most ${maximum} records are allowed`);

const stageRecord = z.object({
  satisfied: z.literal(true),
  satisfiedAt: timestamp,
  competencyIds: idArray.optional(),
  completedBuildIds: idArray.optional(),
  skillCheckId: identifier.optional(),
}).strict();

const resourceRecord = z.object({
  openedAt: timestamp,
  completedAt: timestamp.optional(),
  competencyIds: idArray.optional(),
}).strict();

const attempt = z.object({
  attemptId: identifier,
  attemptNumber: z.number().int().positive().max(100_000),
  questionIds: idArray.max(100),
  answers: limitedRecord(z.string().max(500).nullable(), 100),
  score: z.number().int().nonnegative().max(100),
  total: z.number().int().positive().max(100),
  percentage: z.number().int().min(0).max(100),
  passed: z.boolean(),
  submittedAt: timestamp,
}).strict().superRefine((value, context) => {
  if (value.score > value.total) context.addIssue({ code: 'custom', message: 'Attempt score exceeds total.' });
  if (value.questionIds.length !== value.total) context.addIssue({ code: 'custom', message: 'Question count must match total.' });
  if (Math.round((value.score / value.total) * 100) !== value.percentage) context.addIssue({ code: 'custom', message: 'Attempt percentage is inconsistent.' });
});

const recovery = z.object({
  lockedAt: timestamp,
  afterAttemptId: identifier,
  resourceId: identifier.nullable(),
  resourceReviewedAt: timestamp.nullable(),
  insightNoteId: identifier.nullable(),
  insightCreatedAt: timestamp.nullable(),
  recoveredAt: timestamp.nullable(),
}).strict();

const skillCheckRecord = z.object({
  attempts: z.array(attempt).max(1000).superRefine((attempts, context) => {
    const ids = attempts.map((item) => item.attemptId);
    if (new Set(ids).size !== ids.length) context.addIssue({ code: 'custom', message: 'Attempt IDs must be unique.' });
  }),
  consecutiveFailures: z.number().int().nonnegative().max(1000),
  recovery: recovery.nullable(),
}).strict();

const buildRecord = z.object({ completedAt: timestamp, competencyIds: idArray.optional() }).strict();
const proofValue = z.union([z.boolean(), z.string().max(50_000)]);
const proofRecord = z.object({ evidence: limitedRecord(z.object({ value: proofValue, updatedAt: timestamp }).strict(), 500) }).strict();
const reflectionRecord = z.object({ response: z.string().max(50_000), savedAt: timestamp }).strict();

const curriculumState = z.object({
  curriculumId: identifier,
  lastSeenRevision: z.number().int().positive(),
  activeWeekId: identifier.nullable(),
  completedWeekIds: idArray,
  stageSatisfaction: limitedRecord(limitedRecord(stageRecord, 10), 250),
  resources: limitedRecord(limitedRecord(resourceRecord, 500), 250),
  skillChecks: limitedRecord(skillCheckRecord, 250),
  builds: limitedRecord(buildRecord, 500),
  proofs: limitedRecord(proofRecord, 250),
  reflections: limitedRecord(limitedRecord(reflectionRecord, 100), 250),
}).strict();

const artifactScalar = z.union([z.string().max(50_000), z.number().finite(), z.boolean(), z.null()]);
const artifact = z.object({ id: identifier, roadmapId: identifier }).catchall(artifactScalar).superRefine((value, context) => {
  for (const forbidden of ['questionSnapshot', 'questions', 'resources', 'buildInstructions', 'user_id', 'userId']) {
    if (forbidden in value) context.addIssue({ code: 'custom', path: [forbidden], message: 'Curriculum content is not accepted.' });
  }
  for (const field of ['createdAt', 'updatedAt', 'dateCreated', 'dateSolved', 'resolvedAt', 'closedAt', 'timestamp']) {
    if (value[field] != null && !isTimestamp(value[field])) context.addIssue({ code: 'custom', path: [field], message: 'Invalid timestamp.' });
  }
});
const tombstone = z.object({ id: identifier, recordType: z.enum(['note', 'blocker']), curriculumId: identifier, deletedAt: timestamp }).strict();
const artifactGroup = (recordType: 'note' | 'blocker') => z.object({
  records: z.array(artifact).max(5000),
  tombstones: z.array(tombstone.refine((item) => item.recordType === recordType, `Expected a ${recordType} tombstone`)).max(5000),
}).strict().superRefine((value, context) => {
  const recordIds = value.records.map((item) => item.id);
  const tombstoneIds = value.tombstones.map((item) => item.id);
  if (new Set(recordIds).size !== recordIds.length) context.addIssue({ code: 'custom', path: ['records'], message: 'Artifact IDs must be unique.' });
  if (new Set(tombstoneIds).size !== tombstoneIds.length) context.addIssue({ code: 'custom', path: ['tombstones'], message: 'Tombstone IDs must be unique.' });
  if (recordIds.some((id) => tombstoneIds.includes(id))) context.addIssue({ code: 'custom', message: 'An artifact cannot be both active and deleted.' });
});

export const cloudLearnerStateSchema = z.object({
  curriculumState,
  notes: artifactGroup('note'),
  blockers: artifactGroup('blocker'),
}).strict().superRefine((value, context) => {
  const curriculumId = value.curriculumState.curriculumId;
  for (const [groupName, group] of [['notes', value.notes], ['blockers', value.blockers]] as const) {
    group.records.forEach((record, index) => {
      if (record.roadmapId !== curriculumId) context.addIssue({ code: 'custom', path: [groupName, 'records', index, 'roadmapId'], message: 'Artifact curriculum association does not match.' });
    });
    group.tombstones.forEach((record, index) => {
      if (record.curriculumId !== curriculumId) context.addIssue({ code: 'custom', path: [groupName, 'tombstones', index, 'curriculumId'], message: 'Tombstone curriculum association does not match.' });
    });
  }
});

export type CloudLearnerState = z.infer<typeof cloudLearnerStateSchema>;

export const syncParamsSchema = z.object({ curriculumId: identifier }).strict();
export const syncMutationSchema = z.object({
  expectedVersion: z.number().int().nonnegative(),
  expectedGeneration: z.number().int().nonnegative(),
  clientMutationId: z.uuid(),
  mutationType: z.enum(['sync', 'reset']),
  curriculumRevision: z.number().int().positive(),
  stateSchemaVersion: z.number().int().positive(),
  learnerState: cloudLearnerStateSchema,
}).strict();

export type SyncMutation = z.infer<typeof syncMutationSchema>;

export function isCloudEnabledCurriculum(curriculumId: string): curriculumId is keyof typeof CLOUD_ENABLED_CURRICULA {
  return curriculumId in CLOUD_ENABLED_CURRICULA;
}
