import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { describe, expect, test } from 'vitest';
import { checksumForNewMigration, matchMigrationChecksum } from '../src/db/migrationIntegrity.js';

const migrationRunnerUrl = new URL('../src/db/migrate.ts', import.meta.url);
const name = '0002_create_learning_instances.sql';
const sql = Buffer.from('CREATE TABLE example (id INTEGER);\n', 'utf8');
const hash = (bytes: Uint8Array) => createHash('sha256').update(bytes).digest('hex');

describe('migration checksum integrity', () => {
  test('accepts exact repository bytes', () => {
    expect(matchMigrationChecksum(name, sql, hash(sql))).toBe('exact');
  });

  test('accepts only the known migration with one additional terminal line feed', () => {
    const historical = Buffer.concat([sql, Buffer.from('\n')]);
    expect(matchMigrationChecksum(name, sql, hash(historical))).toBe('historical_terminal_newline');
  });

  test.each([
    ['changed statement', Buffer.from('CREATE TABLE example (id TEXT);\n')],
    ['added statement', Buffer.from('CREATE TABLE example (id INTEGER);\nSELECT 1;\n')],
    ['removed statement', Buffer.from('CREATE TABLE example ();\n')],
    ['internal whitespace', Buffer.from('CREATE  TABLE example (id INTEGER);\n')],
    ['changed comment', Buffer.from('-- changed\nCREATE TABLE example (id INTEGER);\n')],
    ['arbitrary trailing spaces', Buffer.from('CREATE TABLE example (id INTEGER);\n ')],
    ['two additional terminal line feeds', Buffer.from('CREATE TABLE example (id INTEGER);\n\n\n')],
  ])('rejects %s', (_label, changedBytes) => {
    expect(matchMigrationChecksum(name, sql, hash(changedBytes))).toBe('mismatch');
  });

  test('does not extend compatibility to future migrations', () => {
    const historical = Buffer.concat([sql, Buffer.from('\n')]);
    expect(matchMigrationChecksum('0004_future.sql', sql, hash(historical))).toBe('mismatch');
  });

  test('records new migrations from their exact repository bytes', () => {
    expect(checksumForNewMigration(sql)).toBe(hash(sql));
  });

  test('never rewrites the migration ledger during compatibility acceptance', async () => {
    const runner = await readFile(migrationRunnerUrl, 'utf8');
    expect(runner).not.toMatch(/UPDATE\s+public\.schema_migrations/i);
    expect(runner).not.toMatch(/DELETE\s+FROM\s+public\.schema_migrations/i);
    expect(runner).toMatch(/INSERT INTO public\.schema_migrations/);
  });
});
