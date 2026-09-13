import { z } from 'zod';
import path from 'node:path';

const environmentNames = [
  'NODE_ENV',
  'HOST',
  'PORT',
  'DATABASE_URL',
  'DATABASE_SSL_CA_FILE',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
  'EVIDENCE_BUCKET',
  'CORS_ORIGINS',
] as const;

const conflictingDatabaseTlsParameters = new Set([
  'ssl',
  'sslcert',
  'sslkey',
  'sslrootcert',
  'uselibpqcompat',
]);

const backendEnvironmentSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']),
    HOST: z.string().trim().min(1),
    PORT: z.coerce.number().int().min(1).max(65_535),
    DATABASE_URL: z.string().trim().url(),
    DATABASE_SSL_CA_FILE: z.string().trim().min(1).optional(),
    SUPABASE_URL: z.string().trim().url().refine((value) => value.startsWith('https://'), 'must use HTTPS'),
    SUPABASE_PUBLISHABLE_KEY: z.string().trim().min(1),
    SUPABASE_SECRET_KEY: z.string().trim().regex(/^sb_secret_[A-Za-z0-9_-]+$/, 'must be a Supabase secret key').optional(),
    EVIDENCE_BUCKET: z.string().trim().min(1).max(100).regex(/^[a-z0-9][a-z0-9._-]*$/).optional(),
    CORS_ORIGINS: z
      .string()
      .trim()
      .min(1)
      .transform((value, context) => {
        const origins = value.split(',').map((origin) => origin.trim());

        if (origins.some((origin) => origin === '*' || !isHttpOrigin(origin))) {
          context.addIssue({
            code: 'custom',
            message: 'must contain only comma-separated HTTP(S) origins and cannot use *',
          });
          return z.NEVER;
        }

        return origins;
      }),
  })
  .strict()
  .superRefine((value, context) => {
    if (value.NODE_ENV !== 'production') return;

    const databaseUrl = new URL(value.DATABASE_URL);
    const sslModes = databaseUrl.searchParams.getAll('sslmode');
    const usesPostgres = databaseUrl.protocol === 'postgres:' || databaseUrl.protocol === 'postgresql:';
    const hasAmbiguousTlsParameter = [...databaseUrl.searchParams.keys()].some((key) => {
      const normalizedKey = key.toLowerCase();
      return (normalizedKey === 'sslmode' && key !== 'sslmode') || conflictingDatabaseTlsParameters.has(normalizedKey);
    });

    if (!usesPostgres || sslModes.length !== 1 || sslModes[0] !== 'verify-full' || hasAmbiguousTlsParameter) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_URL'],
        message: 'production DATABASE_URL must use exactly one unambiguous sslmode=verify-full',
      });
    }

    if (!value.DATABASE_SSL_CA_FILE || !path.isAbsolute(value.DATABASE_SSL_CA_FILE)) {
      context.addIssue({
        code: 'custom',
        path: ['DATABASE_SSL_CA_FILE'],
        message: 'production DATABASE_SSL_CA_FILE must be an absolute path',
      });
    }
  });

export type BackendEnvironment = z.infer<typeof backendEnvironmentSchema>;

export function parseBackendEnvironment(source: NodeJS.ProcessEnv): BackendEnvironment {
  const candidate = Object.fromEntries(environmentNames.map((name) => [name, source[name]]));
  const result = backendEnvironmentSchema.safeParse(candidate);

  if (!result.success) {
    const invalidNames = [...new Set(result.error.issues.map((issue) => String(issue.path[0])))]
      .filter(Boolean)
      .sort();
    throw new Error(`Invalid backend environment variables: ${invalidNames.join(', ')}`);
  }

  return result.data;
}

function isHttpOrigin(value: string): boolean {
  try {
    const url = new URL(value);
    return (url.protocol === 'http:' || url.protocol === 'https:') && url.origin === value;
  } catch {
    return false;
  }
}
