import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

const migrationUrl = new URL('../migrations/0001_create_profiles.sql', import.meta.url);
const progressMigrationUrl = new URL('../migrations/0002_create_learning_instances.sql', import.meta.url);
const evidenceMigrationUrl = new URL('../migrations/0003_create_evidence_submissions.sql', import.meta.url);

describe('minimal profile migration', () => {
  test('owns only the required profile fields and JWT-subject foreign key', async () => {
    const sql = await readFile(migrationUrl, 'utf8');
    expect(sql).toMatch(/user_id UUID PRIMARY KEY REFERENCES auth\.users\(id\)/);
    expect(sql).toMatch(/display_name VARCHAR\(100\) NOT NULL/);
    expect(sql).toMatch(/created_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
    expect(sql).toMatch(/updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW\(\)/);
    expect(sql).not.toMatch(/phone|country|timezone|experience_level|career_goal|learning_instances/i);
  });

  test('keeps direct browser database roles out of the profile boundary', async () => {
    const sql = await readFile(migrationUrl, 'utf8');
    expect(sql).toMatch(/REVOKE ALL ON public\.profiles FROM anon, authenticated/);
    expect(sql).not.toMatch(/DROP TABLE|TRUNCATE|DELETE FROM/i);
  });
});

describe('Phase 2 progress migration', () => {
  test('adds identity-bound versioned instances and reset generations without altering profiles', async () => {
    const sql = await readFile(progressMigrationUrl, 'utf8');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.learning_instances/);
    expect(sql).toMatch(/user_id UUID NOT NULL REFERENCES auth\.users\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/UNIQUE \(user_id, curriculum_id\)/);
    expect(sql).toMatch(/learner_state JSONB NOT NULL/);
    expect(sql).toMatch(/version BIGINT NOT NULL DEFAULT 1/);
    expect(sql).toMatch(/generation BIGINT NOT NULL DEFAULT 0/);
    expect(sql).toMatch(/PRIMARY KEY \(learning_instance_id, client_mutation_id\)/);
    expect(sql).toMatch(/REVOKE ALL ON public\.learning_instances FROM anon, authenticated/);
    expect(sql).not.toMatch(/ALTER TABLE public\.profiles|DROP TABLE|TRUNCATE|DELETE FROM/i);
  });
});

describe('Phase 3 evidence migration', () => {
  test('adds immutable account-owned submission history and private asset metadata additively', async () => {
    const sql = await readFile(evidenceMigrationUrl, 'utf8');
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.evidence_submissions/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.evidence_items/);
    expect(sql).toMatch(/CREATE TABLE IF NOT EXISTS public\.evidence_assets/);
    expect(sql).toMatch(/user_id UUID NOT NULL REFERENCES auth\.users\(id\) ON DELETE CASCADE/);
    expect(sql).toMatch(/status IN \('submitted', 'superseded', 'withdrawn'\)/);
    expect(sql).toMatch(/supersedes_submission_id UUID REFERENCES public\.evidence_submissions\(id\) ON DELETE RESTRICT/);
    expect(sql).toMatch(/WHERE status = 'submitted'/);
    expect(sql).toMatch(/declared_byte_size BETWEEN 1 AND 6291456/);
    expect(sql).toMatch(/REVOKE ALL ON public\.evidence_submissions FROM anon, authenticated/);
    expect(sql).toMatch(/REVOKE ALL ON public\.evidence_assets FROM anon, authenticated/);
    expect(sql).not.toMatch(/ALTER TABLE public\.(profiles|learning_instances|learning_instance_mutations)|DROP TABLE|TRUNCATE|DELETE FROM/i);
  });
});
