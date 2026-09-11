import pg from 'pg';
import type { BackendEnvironment } from '../config/env.js';
import type { Database } from './database.js';

const { Pool } = pg;

export function createPostgresDatabase(config: BackendEnvironment): Database {
  const pool = new Pool({
    connectionString: config.DATABASE_URL,
    application_name: 'xcelerateai-api',
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 30_000,
  });

  return {
    query: (text, values) => pool.query(text, values as unknown[] | undefined),
    transaction: async (work) => {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        const result = await work({
          query: (text, values) => client.query(text, values as unknown[] | undefined),
        });
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    close: () => pool.end(),
  };
}
