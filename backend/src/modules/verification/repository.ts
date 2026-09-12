import type { QueryResultRow } from 'pg';
import type { Database } from '../../db/database.js';
import type { VerificationCheck } from './structural.js';

export type VerifierType = 'structural' | 'browser_python' | 'future_server_sandbox' | 'future_ai_rubric';
export type TrustLevel = 'server_structural' | 'client_advisory' | 'future_authoritative';
export type VerificationOutcome = 'passed' | 'failed' | 'unavailable' | 'error';
export interface VerificationResult { id: string; evidenceSubmissionId: string; requirementId: string; verifierType: VerifierType; verifierVersion: string; trustLevel: TrustLevel; outcome: VerificationOutcome; criteria: VerificationCheck[]; sourceSha256: string | null; createdAt: string }
interface ResultRow extends QueryResultRow { id: string; evidence_submission_id: string; requirement_id: string; verifier_type: VerifierType; verifier_version: string; trust_level: TrustLevel; outcome: VerificationOutcome; criteria: VerificationCheck[]; source_sha256: string | null; created_at: Date | string }

export class VerificationRepository {
  constructor(private readonly database: Database) {}
  async create(userId: string, input: Omit<VerificationResult, 'id' | 'createdAt'> & { clientRunId: string }): Promise<{ outcome: 'created' | 'duplicate'; result: VerificationResult }> {
    const inserted = await this.database.query<ResultRow>(`INSERT INTO public.verification_results
      (user_id,evidence_submission_id,requirement_id,verifier_type,verifier_version,trust_level,outcome,criteria,source_sha256,client_run_id)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8::jsonb,$9,$10)
      ON CONFLICT (user_id,client_run_id) DO NOTHING RETURNING *`, [userId, input.evidenceSubmissionId, input.requirementId, input.verifierType, input.verifierVersion, input.trustLevel, input.outcome, JSON.stringify(input.criteria), input.sourceSha256, input.clientRunId]);
    if (inserted.rows[0]) return { outcome: 'created', result: mapResult(inserted.rows[0]) };
    const existing = await this.database.query<ResultRow>(`${RESULT_SELECT} WHERE user_id=$1 AND client_run_id=$2`, [userId, input.clientRunId]);
    return { outcome: 'duplicate', result: mapResult(existing.rows[0]!) };
  }
  async list(userId: string, submissionId: string) {
    const result = await this.database.query<ResultRow>(`${RESULT_SELECT} WHERE user_id=$1 AND evidence_submission_id=$2 ORDER BY created_at DESC`, [userId, submissionId]);
    return result.rows.map(mapResult);
  }
}
const RESULT_SELECT = 'SELECT id,evidence_submission_id,requirement_id,verifier_type,verifier_version,trust_level,outcome,criteria,source_sha256,created_at FROM public.verification_results';
function mapResult(row: ResultRow): VerificationResult { return { id: row.id, evidenceSubmissionId: row.evidence_submission_id, requirementId: row.requirement_id, verifierType: row.verifier_type, verifierVersion: row.verifier_version, trustLevel: row.trust_level, outcome: row.outcome, criteria: row.criteria, sourceSha256: row.source_sha256, createdAt: new Date(row.created_at).toISOString() }; }
