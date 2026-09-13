CREATE TABLE IF NOT EXISTS public.evidence_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculum_id VARCHAR(64) NOT NULL CHECK (char_length(trim(curriculum_id)) BETWEEN 1 AND 64),
  curriculum_revision INTEGER NOT NULL CHECK (curriculum_revision > 0),
  evidence_schema_version INTEGER NOT NULL DEFAULT 1 CHECK (evidence_schema_version > 0),
  week_id VARCHAR(160) NOT NULL,
  build_id VARCHAR(160) NOT NULL,
  proof_id VARCHAR(160) NOT NULL,
  submission_revision INTEGER NOT NULL CHECK (submission_revision > 0),
  supersedes_submission_id UUID REFERENCES public.evidence_submissions(id) ON DELETE RESTRICT,
  status VARCHAR(16) NOT NULL CHECK (status IN ('submitted', 'superseded', 'withdrawn')),
  client_submission_id UUID NOT NULL,
  withdraw_client_mutation_id UUID,
  request_hash CHAR(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status_changed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, client_submission_id),
  UNIQUE (user_id, withdraw_client_mutation_id),
  UNIQUE (user_id, curriculum_id, proof_id, submission_revision),
  CHECK (supersedes_submission_id IS NULL OR supersedes_submission_id <> id)
);

CREATE UNIQUE INDEX IF NOT EXISTS evidence_submissions_current_idx
ON public.evidence_submissions (user_id, curriculum_id, proof_id)
WHERE status = 'submitted';

CREATE INDEX IF NOT EXISTS evidence_submissions_history_idx
ON public.evidence_submissions (user_id, curriculum_id, proof_id, submission_revision DESC);

CREATE TABLE IF NOT EXISTS public.evidence_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  submission_id UUID NOT NULL REFERENCES public.evidence_submissions(id) ON DELETE CASCADE,
  evidence_requirement_id VARCHAR(160) NOT NULL,
  kind VARCHAR(32) NOT NULL CHECK (kind IN ('text', 'url', 'repository', 'file', 'self_attestation')),
  payload JSONB NOT NULL CHECK (jsonb_typeof(payload) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (submission_id, evidence_requirement_id)
);

CREATE TABLE IF NOT EXISTS public.evidence_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  client_asset_id UUID NOT NULL,
  curriculum_id VARCHAR(64) NOT NULL,
  curriculum_revision INTEGER NOT NULL CHECK (curriculum_revision > 0),
  proof_id VARCHAR(160) NOT NULL,
  evidence_requirement_id VARCHAR(160) NOT NULL,
  status VARCHAR(24) NOT NULL CHECK (status IN ('upload_pending', 'ready', 'abandoned')),
  bucket_id VARCHAR(64) NOT NULL,
  object_key VARCHAR(512) NOT NULL,
  original_filename VARCHAR(255) NOT NULL,
  declared_mime_type VARCHAR(128) NOT NULL,
  detected_mime_type VARCHAR(128),
  declared_byte_size BIGINT NOT NULL CHECK (declared_byte_size BETWEEN 1 AND 6291456),
  byte_size BIGINT CHECK (byte_size BETWEEN 1 AND 6291456),
  sha256 CHAR(64) CHECK (sha256 IS NULL OR sha256 ~ '^[0-9a-f]{64}$'),
  intent_request_hash CHAR(64) NOT NULL CHECK (intent_request_hash ~ '^[0-9a-f]{64}$'),
  evidence_item_id UUID UNIQUE REFERENCES public.evidence_items(id) ON DELETE RESTRICT,
  intent_expires_at TIMESTAMPTZ NOT NULL,
  ready_at TIMESTAMPTZ,
  abandoned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, client_asset_id),
  UNIQUE (bucket_id, object_key)
);

CREATE INDEX IF NOT EXISTS evidence_assets_cleanup_idx
ON public.evidence_assets (status, intent_expires_at)
WHERE evidence_item_id IS NULL;

CREATE OR REPLACE FUNCTION public.set_evidence_asset_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS evidence_assets_set_updated_at ON public.evidence_assets;
CREATE TRIGGER evidence_assets_set_updated_at
BEFORE UPDATE ON public.evidence_assets
FOR EACH ROW
EXECUTE FUNCTION public.set_evidence_asset_updated_at();

REVOKE ALL ON public.evidence_submissions FROM anon, authenticated;
REVOKE ALL ON public.evidence_items FROM anon, authenticated;
REVOKE ALL ON public.evidence_assets FROM anon, authenticated;
