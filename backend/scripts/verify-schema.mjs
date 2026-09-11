import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import pg from 'pg';

const expectedProfileColumns = ['user_id', 'display_name', 'created_at', 'updated_at'];
const expectedInstanceColumns = ['id', 'user_id', 'curriculum_id', 'curriculum_revision', 'state_schema_version', 'learner_state', 'state_hash', 'version', 'generation', 'created_at', 'updated_at'];
const expectedMutationColumns = ['learning_instance_id', 'client_mutation_id', 'request_hash', 'resulting_version', 'resulting_generation', 'outcome', 'created_at'];
const migrationNames = ['0001_create_profiles.sql', '0002_create_learning_instances.sql'];
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  application_name: 'xcelerateai-schema-verification',
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  const columns = await pool.query(
    `SELECT table_name, column_name, data_type, is_nullable
     FROM information_schema.columns
     WHERE table_schema = 'public' AND table_name = ANY($1::text[])
     ORDER BY table_name, ordinal_position`,
    [['profiles', 'learning_instances', 'learning_instance_mutations']],
  );
  const constraints = await pool.query(
    `SELECT c.conrelid::regclass::text AS table_name, c.contype, pg_get_constraintdef(c.oid) AS definition
     FROM pg_constraint c
     WHERE c.conrelid IN ('public.learning_instances'::regclass, 'public.learning_instance_mutations'::regclass)`,
  );
  const indexes = await pool.query(
    `SELECT tablename, indexname, indexdef
     FROM pg_indexes
     WHERE schemaname = 'public' AND tablename = ANY($1::text[])`,
    [['learning_instances', 'learning_instance_mutations']],
  );
  const directPrivileges = await pool.query(
    `SELECT grantee, table_name, privilege_type
     FROM information_schema.role_table_grants
     WHERE table_schema = 'public'
       AND table_name = ANY($1::text[])
       AND grantee = ANY($2::text[])`,
    [['learning_instances', 'learning_instance_mutations'], ['anon', 'authenticated']],
  );
  const triggers = await pool.query(
    `SELECT trigger_name
     FROM information_schema.triggers
     WHERE event_object_schema = 'public' AND event_object_table = 'learning_instances'`,
  );
  const ledger = await pool.query(
    'SELECT name, checksum FROM public.schema_migrations WHERE name = ANY($1::text[]) ORDER BY name',
    [migrationNames],
  );
  const expectedChecksums = new Map(await Promise.all(migrationNames.map(async (name) => {
    const migration = await readFile(new URL(`../migrations/${name}`, import.meta.url), 'utf8');
    return [name, createHash('sha256').update(migration).digest('hex')];
  })));
  const byTable = Map.groupBy(columns.rows, ({ table_name }) => table_name);
  const names = (table) => (byTable.get(table) || []).map(({ column_name }) => column_name);
  const ledgerValid = ledger.rows.length === migrationNames.length
    && ledger.rows.every(({ name, checksum }) => expectedChecksums.get(name) === checksum);
  const hasConstraint = (table, type, fragments) => constraints.rows.some(({ table_name, contype, definition }) => (
    table_name.endsWith(table) && contype === type && fragments.every((fragment) => definition.includes(fragment))
  ));
  const constraintsValid = hasConstraint('learning_instances', 'u', ['UNIQUE (user_id, curriculum_id)'])
    && hasConstraint('learning_instances', 'f', ['FOREIGN KEY (user_id)', 'auth.users(id)', 'ON DELETE CASCADE'])
    && hasConstraint('learning_instances', 'c', ['jsonb_typeof(learner_state)', "'object'"])
    && hasConstraint('learning_instances', 'c', ['version > 0'])
    && hasConstraint('learning_instances', 'c', ['generation >= 0'])
    && hasConstraint('learning_instance_mutations', 'p', ['PRIMARY KEY (learning_instance_id, client_mutation_id)'])
    && hasConstraint('learning_instance_mutations', 'f', ['FOREIGN KEY (learning_instance_id)', 'learning_instances(id)', 'ON DELETE CASCADE']);
  const indexesValid = indexes.rows.some(({ tablename, indexdef }) => tablename === 'learning_instances' && indexdef.includes('(user_id, curriculum_id)'))
    && indexes.rows.some(({ indexname, indexdef }) => indexname === 'learning_instance_mutations_created_at_idx' && indexdef.includes('(created_at)'));
  const triggerValid = triggers.rows.some(({ trigger_name }) => trigger_name === 'learning_instances_set_updated_at');
  const report = {
    profileColumns: names('profiles'),
    learningInstanceColumns: names('learning_instances'),
    mutationColumns: names('learning_instance_mutations'),
    profilesUnchanged: JSON.stringify(names('profiles')) === JSON.stringify(expectedProfileColumns),
    instancesValid: JSON.stringify(names('learning_instances')) === JSON.stringify(expectedInstanceColumns),
    mutationsValid: JSON.stringify(names('learning_instance_mutations')) === JSON.stringify(expectedMutationColumns),
    constraintsValid,
    indexesValid,
    triggerValid,
    directRolesRevoked: directPrivileges.rows.length === 0,
    migrationLedgerValid: ledgerValid,
  };
  console.log(JSON.stringify(report, null, 2));
  if (!report.profilesUnchanged || !report.instancesValid || !report.mutationsValid || !report.constraintsValid
    || !report.indexesValid || !report.triggerValid || !report.directRolesRevoked || !report.migrationLedgerValid) {
    process.exitCode = 1;
  }
} catch (error) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : 'UNKNOWN';
  console.error(`Schema verification failed (${code}).`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
