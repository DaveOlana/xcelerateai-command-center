import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';

const migrationUrl = new URL('../migrations/0001_create_profiles.sql', import.meta.url);

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
