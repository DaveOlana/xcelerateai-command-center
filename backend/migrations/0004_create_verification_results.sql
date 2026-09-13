CREATE TABLE IF NOT EXISTS public.verification_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  evidence_submission_id UUID NOT NULL REFERENCES public.evidence_submissions(id) ON DELETE CASCADE,
  requirement_id VARCHAR(160) NOT NULL,
  verifier_type VARCHAR(32) NOT NULL CHECK (verifier_type IN ('structural', 'browser_python', 'future_server_sandbox', 'future_ai_rubric')),
  verifier_version VARCHAR(32) NOT NULL,
  trust_level VARCHAR(32) NOT NULL CHECK (trust_level IN ('server_structural', 'client_advisory', 'future_authoritative')),
  outcome VARCHAR(16) NOT NULL CHECK (outcome IN ('passed', 'failed', 'unavailable', 'error')),
  criteria JSONB NOT NULL CHECK (jsonb_typeof(criteria) = 'array'),
  source_sha256 CHAR(64) CHECK (source_sha256 IS NULL OR source_sha256 ~ '^[0-9a-f]{64}$'),
  client_run_id UUID NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, client_run_id)
);

CREATE INDEX IF NOT EXISTS verification_results_submission_created_idx
ON public.verification_results (evidence_submission_id, created_at DESC);

REVOKE ALL ON public.verification_results FROM anon, authenticated;
