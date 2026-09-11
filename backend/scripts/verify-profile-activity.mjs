import pg from 'pg';

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: 'xcelerateai-profile-verification',
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  const result = await pool.query(`
    SELECT
      COUNT(*)::int AS profile_count,
      COALESCE(bool_and(char_length(trim(display_name)) BETWEEN 1 AND 100), false) AS names_valid,
      COALESCE(bool_or(updated_at > created_at), false) AS update_observed
    FROM public.profiles
  `);
  const report = result.rows[0];
  console.log(JSON.stringify(report, null, 2));
  if (!report || report.profile_count < 1 || !report.names_valid || !report.update_observed) process.exitCode = 1;
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
  console.error(`Profile activity verification failed (${code}).`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
