import type { QueryResultRow } from 'pg';
import type { Database, TransactionDatabase } from '../../db/database.js';
import type { CloudLearnerState, SyncMutation } from './schema.js';

interface LearningInstanceRow extends QueryResultRow {
  id: string;
  curriculum_id: string;
  curriculum_revision: number;
  state_schema_version: number;
  learner_state: CloudLearnerState;
  state_hash: string;
  version: string | number;
  generation: string | number;
  created_at: Date | string;
  updated_at: Date | string;
}

interface MutationRow extends QueryResultRow {
  request_hash: string;
  resulting_version: string | number;
  resulting_generation: string | number;
  outcome: 'applied' | 'no_change';
}

export interface LearningInstance {
  id: string;
  curriculumId: string;
  curriculumRevision: number;
  stateSchemaVersion: number;
  learnerState: CloudLearnerState;
  stateHash: string;
  version: number;
  generation: number;
  createdAt: string;
  updatedAt: string;
}

export type MutationResult =
  | { kind: 'applied' | 'created' | 'no_change'; instance: LearningInstance }
  | { kind: 'duplicate'; instance: LearningInstance; acknowledgedVersion: number; acknowledgedGeneration: number }
  | { kind: 'version_conflict' | 'generation_conflict'; instance: LearningInstance }
  | { kind: 'idempotency_key_reused'; instance: LearningInstance }
  | { kind: 'reset_without_instance' };

export class LearningInstanceRepository {
  constructor(private readonly database: Database) {}

  async get(userId: string, curriculumId: string): Promise<LearningInstance | null> {
    const result = await this.database.query<LearningInstanceRow>(
      `SELECT id, curriculum_id, curriculum_revision, state_schema_version, learner_state,
              state_hash, version, generation, created_at, updated_at
       FROM public.learning_instances
       WHERE user_id = $1 AND curriculum_id = $2`,
      [userId, curriculumId],
    );
    return result.rows[0] ? mapInstance(result.rows[0]) : null;
  }

  async mutate(userId: string, curriculumId: string, mutation: SyncMutation, requestHash: string, stateHash: string): Promise<MutationResult> {
    return this.database.transaction(async (transaction) => {
      let current = await selectForUpdate(transaction, userId, curriculumId);
      if (!current) {
        if (mutation.mutationType === 'reset') return { kind: 'reset_without_instance' };
        if (mutation.expectedVersion !== 0 || mutation.expectedGeneration !== 0) return { kind: 'reset_without_instance' };
        const inserted = await transaction.query<LearningInstanceRow>(
          `INSERT INTO public.learning_instances
             (user_id, curriculum_id, curriculum_revision, state_schema_version, learner_state, state_hash, version, generation)
           VALUES ($1, $2, $3, $4, $5::jsonb, $6, 1, 0)
           ON CONFLICT (user_id, curriculum_id) DO NOTHING
           RETURNING id, curriculum_id, curriculum_revision, state_schema_version, learner_state,
                     state_hash, version, generation, created_at, updated_at`,
          [userId, curriculumId, mutation.curriculumRevision, mutation.stateSchemaVersion, JSON.stringify(mutation.learnerState), stateHash],
        );
        if (inserted.rows[0]) {
          current = mapInstance(inserted.rows[0]);
          await recordMutation(transaction, current.id, mutation.clientMutationId, requestHash, current.version, current.generation, 'applied');
          return { kind: 'created', instance: current };
        }
        current = await selectForUpdate(transaction, userId, curriculumId);
        if (!current) throw new Error('Learning instance unavailable after concurrent creation.');
      }

      const prior = await transaction.query<MutationRow>(
        `SELECT request_hash, resulting_version, resulting_generation, outcome
         FROM public.learning_instance_mutations
         WHERE learning_instance_id = $1 AND client_mutation_id = $2`,
        [current.id, mutation.clientMutationId],
      );
      if (prior.rows[0]) {
        if (prior.rows[0].request_hash !== requestHash) return { kind: 'idempotency_key_reused', instance: current };
        return {
          kind: 'duplicate',
          instance: current,
          acknowledgedVersion: Number(prior.rows[0].resulting_version),
          acknowledgedGeneration: Number(prior.rows[0].resulting_generation),
        };
      }
      if (mutation.expectedGeneration !== current.generation) return { kind: 'generation_conflict', instance: current };
      if (mutation.expectedVersion !== current.version) return { kind: 'version_conflict', instance: current };

      if (mutation.mutationType === 'sync' && stateHash === current.stateHash
        && mutation.curriculumRevision === current.curriculumRevision
        && mutation.stateSchemaVersion === current.stateSchemaVersion) {
        await recordMutation(transaction, current.id, mutation.clientMutationId, requestHash, current.version, current.generation, 'no_change');
        return { kind: 'no_change', instance: current };
      }

      const nextGeneration = mutation.mutationType === 'reset' ? current.generation + 1 : current.generation;
      const updated = await transaction.query<LearningInstanceRow>(
        `UPDATE public.learning_instances
         SET curriculum_revision = $3, state_schema_version = $4, learner_state = $5::jsonb,
             state_hash = $6, version = version + 1, generation = $7
         WHERE user_id = $1 AND curriculum_id = $2 AND version = $8 AND generation = $9
         RETURNING id, curriculum_id, curriculum_revision, state_schema_version, learner_state,
                   state_hash, version, generation, created_at, updated_at`,
        [userId, curriculumId, mutation.curriculumRevision, mutation.stateSchemaVersion, JSON.stringify(mutation.learnerState), stateHash, nextGeneration, current.version, current.generation],
      );
      if (!updated.rows[0]) throw new Error('Conditional learning-instance update failed inside locked transaction.');
      const instance = mapInstance(updated.rows[0]);
      await recordMutation(transaction, instance.id, mutation.clientMutationId, requestHash, instance.version, instance.generation, 'applied');
      return { kind: 'applied', instance };
    });
  }
}

async function selectForUpdate(database: TransactionDatabase, userId: string, curriculumId: string): Promise<LearningInstance | null> {
  const result = await database.query<LearningInstanceRow>(
    `SELECT id, curriculum_id, curriculum_revision, state_schema_version, learner_state,
            state_hash, version, generation, created_at, updated_at
     FROM public.learning_instances
     WHERE user_id = $1 AND curriculum_id = $2
     FOR UPDATE`,
    [userId, curriculumId],
  );
  return result.rows[0] ? mapInstance(result.rows[0]) : null;
}

async function recordMutation(database: TransactionDatabase, instanceId: string, mutationId: string, requestHash: string, version: number, generation: number, outcome: 'applied' | 'no_change'): Promise<void> {
  await database.query(
    `INSERT INTO public.learning_instance_mutations
       (learning_instance_id, client_mutation_id, request_hash, resulting_version, resulting_generation, outcome)
     VALUES ($1, $2, $3, $4, $5, $6)`,
    [instanceId, mutationId, requestHash, version, generation, outcome],
  );
}

function mapInstance(row: LearningInstanceRow): LearningInstance {
  return {
    id: row.id,
    curriculumId: row.curriculum_id,
    curriculumRevision: row.curriculum_revision,
    stateSchemaVersion: row.state_schema_version,
    learnerState: row.learner_state,
    stateHash: row.state_hash,
    version: Number(row.version),
    generation: Number(row.generation),
    createdAt: new Date(row.created_at).toISOString(),
    updatedAt: new Date(row.updated_at).toISOString(),
  };
}
