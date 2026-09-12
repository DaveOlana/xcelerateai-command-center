import type { QueryResultRow } from 'pg';
import type { Database, TransactionDatabase } from '../../db/database.js';
import { EVIDENCE_SCHEMA_VERSION } from './curriculumContract.js';
import { itemPayload, type EvidenceItemInput, type EvidenceSubmissionInput, type UploadIntentInput } from './schema.js';

export type SubmissionStatus = 'submitted' | 'superseded' | 'withdrawn';
export type AssetStatus = 'upload_pending' | 'ready' | 'abandoned';

export interface EvidenceAsset {
  id: string; userId: string; clientAssetId: string; curriculumId: string; curriculumRevision: number;
  proofId: string; evidenceRequirementId: string; status: AssetStatus; bucketId: string; objectKey: string;
  originalFilename: string; declaredMimeType: string; detectedMimeType: string | null; declaredByteSize: number;
  byteSize: number | null; sha256: string | null; intentRequestHash: string; evidenceItemId: string | null;
  intentExpiresAt: string; readyAt: string | null; abandonedAt: string | null; createdAt: string; updatedAt: string;
}
export interface EvidenceItem { id: string; evidenceRequirementId: string; kind: EvidenceItemInput['kind']; payload: Record<string, unknown>; assets: EvidenceAsset[] }
export interface EvidenceSubmission {
  id: string; curriculumId: string; curriculumRevision: number; evidenceSchemaVersion: number; weekId: string;
  buildId: string; proofId: string; submissionRevision: number; supersedesSubmissionId: string | null;
  status: SubmissionStatus; clientSubmissionId: string; submittedAt: string; statusChangedAt: string;
  items: EvidenceItem[];
}

export type UploadIntentResult =
  | { kind: 'created'; asset: EvidenceAsset }
  | { kind: 'duplicate'; asset: EvidenceAsset }
  | { kind: 'idempotency_key_reused' };
export type SubmissionResult =
  | { kind: 'created'; submission: EvidenceSubmission }
  | { kind: 'duplicate'; submission: EvidenceSubmission }
  | { kind: 'idempotency_key_reused' }
  | { kind: 'current_submission_conflict' }
  | { kind: 'asset_unavailable' };
export type WithdrawResult =
  | { kind: 'withdrawn'; submission: EvidenceSubmission }
  | { kind: 'duplicate'; submission: EvidenceSubmission }
  | { kind: 'not_found' }
  | { kind: 'not_current' }
  | { kind: 'idempotency_key_reused' };

export interface EvidenceRepository {
  list(userId: string, curriculumId: string, revision: number, proofId: string): Promise<EvidenceSubmission[]>;
  get(userId: string, submissionId: string): Promise<EvidenceSubmission | null>;
  getAsset(userId: string, assetId: string): Promise<EvidenceAsset | null>;
  createUploadIntent(userId: string, input: UploadIntentInput, bucketId: string, objectKey: string, requestHash: string, expiresAt: string): Promise<UploadIntentResult>;
  markAssetReady(userId: string, assetId: string, details: { mimeType: string; byteSize: number; sha256: string }): Promise<EvidenceAsset | null>;
  abandonAsset(userId: string, assetId: string): Promise<EvidenceAsset | null>;
  createSubmission(userId: string, input: EvidenceSubmissionInput, requestHash: string): Promise<SubmissionResult>;
  withdraw(userId: string, submissionId: string, clientMutationId: string): Promise<WithdrawResult>;
}

interface SubmissionRow extends QueryResultRow {
  id: string; curriculum_id: string; curriculum_revision: number; evidence_schema_version: number; week_id: string;
  build_id: string; proof_id: string; submission_revision: number; supersedes_submission_id: string | null;
  status: SubmissionStatus; client_submission_id: string; request_hash: string; withdraw_client_mutation_id: string | null;
  submitted_at: Date | string; status_changed_at: Date | string;
}
interface ItemRow extends QueryResultRow { id: string; submission_id: string; evidence_requirement_id: string; kind: EvidenceItemInput['kind']; payload: Record<string, unknown> }
interface AssetRow extends QueryResultRow {
  id: string; user_id: string; client_asset_id: string; curriculum_id: string; curriculum_revision: number; proof_id: string;
  evidence_requirement_id: string; status: AssetStatus; bucket_id: string; object_key: string; original_filename: string;
  declared_mime_type: string; detected_mime_type: string | null; declared_byte_size: string | number; byte_size: string | number | null;
  sha256: string | null; intent_request_hash: string; evidence_item_id: string | null; intent_expires_at: Date | string;
  ready_at: Date | string | null; abandoned_at: Date | string | null; created_at: Date | string; updated_at: Date | string;
}

export class PostgresEvidenceRepository implements EvidenceRepository {
  constructor(private readonly database: Database) {}

  async list(userId: string, curriculumId: string, revision: number, proofId: string) {
    const result = await this.database.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id = $1 AND curriculum_id = $2 AND curriculum_revision = $3 AND proof_id = $4 ORDER BY submission_revision DESC`, [userId, curriculumId, revision, proofId]);
    return loadSubmissions(this.database, result.rows);
  }

  async get(userId: string, submissionId: string) {
    const result = await this.database.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id = $1 AND id = $2`, [userId, submissionId]);
    return result.rows[0] ? loadSubmission(this.database, result.rows[0]) : null;
  }

  async getAsset(userId: string, assetId: string) {
    const result = await this.database.query<AssetRow>(`${ASSET_SELECT} WHERE user_id = $1 AND id = $2`, [userId, assetId]);
    return result.rows[0] ? mapAsset(result.rows[0]) : null;
  }

  async createUploadIntent(userId: string, input: UploadIntentInput, bucketId: string, objectKey: string, requestHash: string, expiresAt: string): Promise<UploadIntentResult> {
    return this.database.transaction(async (tx) => {
      await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [`${userId}:${input.clientAssetId}`]);
      const existing = await tx.query<AssetRow>(`${ASSET_SELECT} WHERE user_id = $1 AND client_asset_id = $2 FOR UPDATE`, [userId, input.clientAssetId]);
      if (existing.rows[0]) return existing.rows[0].intent_request_hash === requestHash ? { kind: 'duplicate', asset: mapAsset(existing.rows[0]) } : { kind: 'idempotency_key_reused' };
      const inserted = await tx.query<AssetRow>(`INSERT INTO public.evidence_assets
        (user_id, client_asset_id, curriculum_id, curriculum_revision, proof_id, evidence_requirement_id, status, bucket_id, object_key, original_filename, declared_mime_type, declared_byte_size, intent_request_hash, intent_expires_at)
        VALUES ($1,$2,$3,$4,$5,$6,'upload_pending',$7,$8,$9,$10,$11,$12,$13)
        RETURNING *`, [userId, input.clientAssetId, input.curriculumId, input.curriculumRevision, input.proofId, input.evidenceRequirementId, bucketId, objectKey, input.originalFilename, input.mimeType, input.byteSize, requestHash, expiresAt]);
      return { kind: 'created', asset: mapAsset(inserted.rows[0]!) };
    });
  }

  async markAssetReady(userId: string, assetId: string, details: { mimeType: string; byteSize: number; sha256: string }) {
    const result = await this.database.query<AssetRow>(`UPDATE public.evidence_assets SET status='ready', detected_mime_type=$3, byte_size=$4, sha256=$5, ready_at=COALESCE(ready_at,NOW()) WHERE user_id=$1 AND id=$2 AND status IN ('upload_pending','ready') RETURNING *`, [userId, assetId, details.mimeType, details.byteSize, details.sha256]);
    return result.rows[0] ? mapAsset(result.rows[0]) : null;
  }

  async abandonAsset(userId: string, assetId: string) {
    const result = await this.database.query<AssetRow>(`UPDATE public.evidence_assets SET status='abandoned', abandoned_at=COALESCE(abandoned_at,NOW()) WHERE user_id=$1 AND id=$2 AND evidence_item_id IS NULL AND status IN ('upload_pending','ready','abandoned') RETURNING *`, [userId, assetId]);
    return result.rows[0] ? mapAsset(result.rows[0]) : null;
  }

  async createSubmission(userId: string, input: EvidenceSubmissionInput, requestHash: string): Promise<SubmissionResult> {
    return this.database.transaction(async (tx) => {
      const duplicate = await tx.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id=$1 AND client_submission_id=$2`, [userId, input.clientSubmissionId]);
      if (duplicate.rows[0]) return duplicate.rows[0].request_hash === requestHash ? { kind: 'duplicate', submission: await loadSubmission(tx, duplicate.rows[0]) } : { kind: 'idempotency_key_reused' };
      await tx.query(`SELECT pg_advisory_xact_lock(hashtextextended($1, 0))`, [`${userId}:${input.curriculumId}:${input.proofId}`]);
      const current = await tx.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id=$1 AND curriculum_id=$2 AND proof_id=$3 AND status='submitted' FOR UPDATE`, [userId, input.curriculumId, input.proofId]);
      const currentRow = current.rows[0] ?? null;
      if ((currentRow?.id ?? null) !== input.expectedCurrentSubmissionId) return { kind: 'current_submission_conflict' };
      const fileItems = input.items.filter((item): item is Extract<EvidenceItemInput, { kind: 'file' }> => item.kind === 'file');
      const assets = fileItems.length ? await tx.query<AssetRow>(`${ASSET_SELECT} WHERE user_id=$1 AND id = ANY($2::uuid[]) FOR UPDATE`, [userId, fileItems.map((item) => item.assetId)]) : { rows: [] as AssetRow[] };
      const readyAssets = new Map(assets.rows.map((row) => [row.id, row]));
      if (fileItems.some((item) => {
        const asset = readyAssets.get(item.assetId);
        return !asset
          || asset.status !== 'ready'
          || asset.evidence_item_id
          || asset.curriculum_id !== input.curriculumId
          || Number(asset.curriculum_revision) !== input.curriculumRevision
          || asset.proof_id !== input.proofId
          || asset.evidence_requirement_id !== item.evidenceRequirementId;
      })) return { kind: 'asset_unavailable' };
      const totalBytes = assets.rows.reduce((total, row) => total + Number(row.byte_size || 0), 0);
      if (totalBytes > 10 * 1024 * 1024) return { kind: 'asset_unavailable' };
      const revision = (currentRow?.submission_revision ?? 0) + 1;
      if (currentRow) await tx.query(`UPDATE public.evidence_submissions SET status='superseded', status_changed_at=NOW() WHERE id=$1`, [currentRow.id]);
      const inserted = await tx.query<SubmissionRow>(`INSERT INTO public.evidence_submissions
        (user_id,curriculum_id,curriculum_revision,evidence_schema_version,week_id,build_id,proof_id,submission_revision,supersedes_submission_id,status,client_submission_id,request_hash)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,'submitted',$10,$11) RETURNING *`, [userId, input.curriculumId, input.curriculumRevision, EVIDENCE_SCHEMA_VERSION, input.weekId, input.buildId, input.proofId, revision, currentRow?.id ?? null, input.clientSubmissionId, requestHash]);
      const submission = inserted.rows[0]!;
      for (const item of input.items) {
        const itemResult = await tx.query<ItemRow>(`INSERT INTO public.evidence_items (submission_id,evidence_requirement_id,kind,payload) VALUES ($1,$2,$3,$4::jsonb) RETURNING *`, [submission.id, item.evidenceRequirementId, item.kind, JSON.stringify(itemPayload(item))]);
        if (item.kind === 'file') await tx.query(`UPDATE public.evidence_assets SET evidence_item_id=$3 WHERE user_id=$1 AND id=$2 AND evidence_item_id IS NULL`, [userId, item.assetId, itemResult.rows[0]!.id]);
      }
      return { kind: 'created', submission: await loadSubmission(tx, submission) };
    });
  }

  async withdraw(userId: string, submissionId: string, clientMutationId: string): Promise<WithdrawResult> {
    return this.database.transaction(async (tx) => {
      const priorMutation = await tx.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id=$1 AND withdraw_client_mutation_id=$2`, [userId, clientMutationId]);
      if (priorMutation.rows[0] && priorMutation.rows[0].id !== submissionId) return { kind: 'idempotency_key_reused' };
      const result = await tx.query<SubmissionRow>(`${SUBMISSION_SELECT} WHERE user_id=$1 AND id=$2 FOR UPDATE`, [userId, submissionId]);
      const row = result.rows[0];
      if (!row) return { kind: 'not_found' };
      if (row.status === 'withdrawn') return row.withdraw_client_mutation_id === clientMutationId ? { kind: 'duplicate', submission: await loadSubmission(tx, row) } : { kind: 'idempotency_key_reused' };
      if (row.status !== 'submitted') return { kind: 'not_current' };
      const updated = await tx.query<SubmissionRow>(`UPDATE public.evidence_submissions SET status='withdrawn', withdraw_client_mutation_id=$3, status_changed_at=NOW() WHERE user_id=$1 AND id=$2 RETURNING *`, [userId, submissionId, clientMutationId]);
      return { kind: 'withdrawn', submission: await loadSubmission(tx, updated.rows[0]!) };
    });
  }
}

const SUBMISSION_SELECT = `SELECT id,curriculum_id,curriculum_revision,evidence_schema_version,week_id,build_id,proof_id,submission_revision,supersedes_submission_id,status,client_submission_id,request_hash,withdraw_client_mutation_id,submitted_at,status_changed_at FROM public.evidence_submissions`;
const ASSET_SELECT = `SELECT id,user_id,client_asset_id,curriculum_id,curriculum_revision,proof_id,evidence_requirement_id,status,bucket_id,object_key,original_filename,declared_mime_type,detected_mime_type,declared_byte_size,byte_size,sha256,intent_request_hash,evidence_item_id,intent_expires_at,ready_at,abandoned_at,created_at,updated_at FROM public.evidence_assets`;

async function loadSubmission(database: Pick<Database, 'query'> | TransactionDatabase, row: SubmissionRow): Promise<EvidenceSubmission> {
  return (await loadSubmissions(database, [row]))[0]!;
}

async function loadSubmissions(database: Pick<Database, 'query'> | TransactionDatabase, rows: SubmissionRow[]): Promise<EvidenceSubmission[]> {
  if (rows.length === 0) return [];
  const submissionIds = rows.map((row) => row.id);
  const items = await database.query<ItemRow>(`SELECT id,submission_id,evidence_requirement_id,kind,payload FROM public.evidence_items WHERE submission_id = ANY($1::uuid[]) ORDER BY evidence_requirement_id`, [submissionIds]);
  const itemIds = items.rows.map((item) => item.id);
  const assets = itemIds.length
    ? await database.query<AssetRow>(`${ASSET_SELECT} WHERE evidence_item_id = ANY($1::uuid[])`, [itemIds])
    : { rows: [] as AssetRow[] };
  const itemsBySubmission = new Map<string, ItemRow[]>();
  for (const item of items.rows) itemsBySubmission.set(item.submission_id, [...(itemsBySubmission.get(item.submission_id) || []), item]);
  const byItem = new Map<string, EvidenceAsset[]>();
  for (const asset of assets.rows) byItem.set(asset.evidence_item_id!, [...(byItem.get(asset.evidence_item_id!) || []), mapAsset(asset)]);
  return rows.map((row) => {
    const submissionItems = itemsBySubmission.get(row.id) || [];
    return mapSubmission(row, submissionItems, byItem);
  });
}

function mapSubmission(row: SubmissionRow, items: ItemRow[], byItem: Map<string, EvidenceAsset[]>): EvidenceSubmission {
  return { id: row.id, curriculumId: row.curriculum_id, curriculumRevision: Number(row.curriculum_revision), evidenceSchemaVersion: Number(row.evidence_schema_version), weekId: row.week_id, buildId: row.build_id, proofId: row.proof_id, submissionRevision: Number(row.submission_revision), supersedesSubmissionId: row.supersedes_submission_id, status: row.status, clientSubmissionId: row.client_submission_id, submittedAt: iso(row.submitted_at)!, statusChangedAt: iso(row.status_changed_at)!, items: items.map((item) => ({ id: item.id, evidenceRequirementId: item.evidence_requirement_id, kind: item.kind, payload: item.payload, assets: byItem.get(item.id) || [] })) };
}

function mapAsset(row: AssetRow): EvidenceAsset {
  return { id: row.id, userId: row.user_id, clientAssetId: row.client_asset_id, curriculumId: row.curriculum_id, curriculumRevision: Number(row.curriculum_revision), proofId: row.proof_id, evidenceRequirementId: row.evidence_requirement_id, status: row.status, bucketId: row.bucket_id, objectKey: row.object_key, originalFilename: row.original_filename, declaredMimeType: row.declared_mime_type, detectedMimeType: row.detected_mime_type, declaredByteSize: Number(row.declared_byte_size), byteSize: row.byte_size == null ? null : Number(row.byte_size), sha256: row.sha256, intentRequestHash: row.intent_request_hash, evidenceItemId: row.evidence_item_id, intentExpiresAt: iso(row.intent_expires_at)!, readyAt: iso(row.ready_at), abandonedAt: iso(row.abandoned_at), createdAt: iso(row.created_at)!, updatedAt: iso(row.updated_at)! };
}
function iso(value: Date | string | null): string | null { return value == null ? null : new Date(value).toISOString(); }
