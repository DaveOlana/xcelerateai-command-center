import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const expectedColumns = ['user_id', 'display_name', 'created_at', 'updated_at'];
const prohibitedTables = ['learning_instances', 'progress_state', 'evidence', 'analytics'];
const migrationName = '0001_create_profiles.sql';
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: 'xcelerateai-schema-verification',
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  const columns = await pool.query(
    `SELECT column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = 'profiles'
     ORDER BY ordinal_position`,
  );
  const prohibited = await pool.query(
    `SELECT table_name
     FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])
     ORDER BY table_name`,
    [prohibitedTables],
  );
  const ledger = await pool.query(
    'SELECT checksum FROM public.schema_migrations WHERE name = $1',
    [migrationName],
  );
  const migration = await readFile(new URL(`../migrations/${migrationName}`, import.meta.url), 'utf8');
  const checksum = createHash('sha256').update(migration).digest('hex');
  const actualColumns = columns.rows.map(({ column_name: name }) => name);
  const report = {
    columns: columns.rows,
    exactColumns: JSON.stringify(actualColumns) === JSON.stringify(expectedColumns),
    prohibitedTables: prohibited.rows.map(({ table_name: name }) => name),
    ledgerRecognized: ledger.rowCount === 1,
    checksumMatches: ledger.rows[0]?.checksum === checksum,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.exactColumns || report.prohibitedTables.length || !report.ledgerRecognized || !report.checksumMatches) {
    process.exitCode = 1;
  }
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
  console.error(`Schema verification failed (${code}).`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
