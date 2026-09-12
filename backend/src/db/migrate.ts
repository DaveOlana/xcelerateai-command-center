import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { parseBackendEnvironment } from '../config/env.js';
import { checksumForNewMigration, matchMigrationChecksum } from './migrationIntegrity.js';

const { Pool } = pg;
const migrationsDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../migrations');
const config = parseBackendEnvironment(process.env);
const pool = new Pool({ connectionString: config.DATABASE_URL, application_name: 'xcelerateai-migrations', max: 1 });

try {
  const client = await pool.connect();
  try {
    await client.query('SELECT pg_advisory_lock($1)', [884_201_001]);
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.schema_migrations (
        name TEXT PRIMARY KEY,
        checksum TEXT NOT NULL,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);

    const files = (await readdir(migrationsDirectory))
      .filter((name) => /^\d+_[a-z0-9_]+\.sql$/.test(name))
      .sort();

    for (const name of files) {
      const migrationBytes = await readFile(path.join(migrationsDirectory, name));
      const sql = migrationBytes.toString('utf8');
      const checksum = checksumForNewMigration(migrationBytes);
      const existing = await client.query<{ checksum: string }>(
        'SELECT checksum FROM public.schema_migrations WHERE name = $1',
        [name],
      );

      if (existing.rowCount) {
        const match = matchMigrationChecksum(name, migrationBytes, existing.rows[0]?.checksum ?? '');
        if (match === 'mismatch') throw new Error(`Applied migration changed: ${name}`);
        if (match === 'historical_terminal_newline') {
          console.log(`already applied (historical terminal-newline representation): ${name}`);
          continue;
        }
        console.log(`already applied: ${name}`);
        continue;
      }

      await client.query('BEGIN');
      try {
        await client.query(sql);
        await client.query(
          'INSERT INTO public.schema_migrations (name, checksum) VALUES ($1, $2)',
          [name, checksum],
        );
        await client.query('COMMIT');
        console.log(`applied: ${name}`);
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
  } finally {
    await client.query('SELECT pg_advisory_unlock($1)', [884_201_001]).catch(() => undefined);
    client.release();
  }
} catch (error) {
  console.error(error instanceof Error ? error.message : 'Migration failed');
  process.exitCode = 1;
} finally {
  await pool.end();
}
