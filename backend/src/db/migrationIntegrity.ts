import { createHash } from 'node:crypto';

const HISTORICAL_TERMINAL_NEWLINE_MIGRATION = '0002_create_learning_instances.sql';
const LINE_FEED = Buffer.from('\n', 'utf8');

export type MigrationChecksumMatch = 'exact' | 'historical_terminal_newline' | 'mismatch';

function sha256(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

export function matchMigrationChecksum(
  migrationName: string,
  repositoryBytes: Uint8Array,
  storedChecksum: string,
): MigrationChecksumMatch {
  if (sha256(repositoryBytes) === storedChecksum) return 'exact';

  if (migrationName !== HISTORICAL_TERMINAL_NEWLINE_MIGRATION) return 'mismatch';

  const historicalBytes = Buffer.concat([repositoryBytes, LINE_FEED]);
  return sha256(historicalBytes) === storedChecksum
    ? 'historical_terminal_newline'
    : 'mismatch';
}

export function checksumForNewMigration(repositoryBytes: Uint8Array): string {
  return sha256(repositoryBytes);
}
