CREATE TABLE IF NOT EXISTS public.learning_instances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curriculum_id VARCHAR(64) NOT NULL CHECK (char_length(trim(curriculum_id)) BETWEEN 1 AND 64),
  curriculum_revision INTEGER NOT NULL CHECK (curriculum_revision > 0),
  state_schema_version INTEGER NOT NULL CHECK (state_schema_version > 0),
  learner_state JSONB NOT NULL CHECK (jsonb_typeof(learner_state) = 'object'),
  state_hash CHAR(64) NOT NULL CHECK (state_hash ~ '^[0-9a-f]{64}$'),
  version BIGINT NOT NULL DEFAULT 1 CHECK (version > 0),
  generation BIGINT NOT NULL DEFAULT 0 CHECK (generation >= 0),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, curriculum_id)
);

CREATE TABLE IF NOT EXISTS public.learning_instance_mutations (
  learning_instance_id UUID NOT NULL REFERENCES public.learning_instances(id) ON DELETE CASCADE,
  client_mutation_id UUID NOT NULL,
  request_hash CHAR(64) NOT NULL CHECK (request_hash ~ '^[0-9a-f]{64}$'),
  resulting_version BIGINT NOT NULL CHECK (resulting_version > 0),
  resulting_generation BIGINT NOT NULL CHECK (resulting_generation >= 0),
  outcome VARCHAR(16) NOT NULL CHECK (outcome IN ('applied', 'no_change')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (learning_instance_id, client_mutation_id)
);

CREATE INDEX IF NOT EXISTS learning_instance_mutations_created_at_idx
ON public.learning_instance_mutations (created_at);

CREATE OR REPLACE FUNCTION public.set_learning_instance_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS learning_instances_set_updated_at ON public.learning_instances;
CREATE TRIGGER learning_instances_set_updated_at
BEFORE UPDATE ON public.learning_instances
FOR EACH ROW
EXECUTE FUNCTION public.set_learning_instance_updated_at();

REVOKE ALL ON public.learning_instances FROM anon, authenticated;
REVOKE ALL ON public.learning_instance_mutations FROM anon, authenticated;
