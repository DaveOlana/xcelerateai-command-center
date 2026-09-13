import { X509Certificate } from 'node:crypto';
import { readFileSync } from 'node:fs';
import type { PoolConfig } from 'pg';
import type { BackendEnvironment } from '../config/env.js';

const certificatePattern = /-----BEGIN CERTIFICATE-----[\s\S]*?-----END CERTIFICATE-----/g;
const connectionStringTlsParameters = new Set([
  'sslmode',
  'ssl',
  'sslcert',
  'sslkey',
  'sslrootcert',
  'uselibpqcompat',
]);

export function createPostgresConnectionConfig(
  config: BackendEnvironment,
): Pick<PoolConfig, 'connectionString' | 'ssl'> {
  if (config.NODE_ENV !== 'production') {
    return { connectionString: config.DATABASE_URL };
  }

  const ca = loadVerifiedCertificateAuthority(config.DATABASE_SSL_CA_FILE);
  const databaseUrl = new URL(config.DATABASE_URL);

  for (const key of [...databaseUrl.searchParams.keys()]) {
    if (connectionStringTlsParameters.has(key.toLowerCase())) databaseUrl.searchParams.delete(key);
  }

  return {
    connectionString: databaseUrl.toString(),
    ssl: {
      ca,
      rejectUnauthorized: true,
    },
  };
}

function loadVerifiedCertificateAuthority(filePath: string | undefined): string {
  if (!filePath) throw invalidCaError();

  let ca: string;
  try {
    ca = readFileSync(filePath, 'utf8');
  } catch {
    throw invalidCaError();
  }

  const certificates = ca.match(certificatePattern);
  if (!certificates?.length) throw invalidCaError();

  try {
    const now = Date.now();
    for (const pem of certificates) {
      const certificate = new X509Certificate(pem);
      const validFrom = Date.parse(certificate.validFrom);
      const validTo = Date.parse(certificate.validTo);
      if (!certificate.ca || !Number.isFinite(validFrom) || !Number.isFinite(validTo) || now < validFrom || now > validTo) {
        throw invalidCaError();
      }
    }
  } catch {
    throw invalidCaError();
  }

  return ca;
}

function invalidCaError(): Error {
  return new Error('Invalid backend environment variables: DATABASE_SSL_CA_FILE');
}
