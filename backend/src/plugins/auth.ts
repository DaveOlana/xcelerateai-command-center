import type { FastifyReply, FastifyRequest } from 'fastify';
import {
  createRemoteJWKSet,
  errors as joseErrors,
  jwtVerify,
  type JWTVerifyGetKey,
  type JWTPayload,
} from 'jose';
import type { BackendEnvironment } from '../config/env.js';
import { HttpError, IdentityProviderUnavailableError } from '../types/errors.js';

export interface AuthenticatedIdentity {
  userId: string;
  email?: string;
  displayName?: string;
  verified: true;
}

export interface VerifiedTokenIdentity {
  userId: string;
  email?: string;
  claims: JWTPayload;
}

export type AccessTokenVerifier = (token: string) => Promise<VerifiedTokenIdentity>;
export type VerificationResolver = (
  token: string,
  identity: VerifiedTokenIdentity,
) => Promise<{ verified: boolean; displayName?: string }>;

declare module 'fastify' {
  interface FastifyRequest {
    identity: AuthenticatedIdentity | null;
  }
}

export function createAccessTokenVerifier(
  supabaseUrl: string,
  keyResolver?: JWTVerifyGetKey,
): AccessTokenVerifier {
  const authIssuer = new URL('/auth/v1', ensureTrailingSlash(supabaseUrl)).toString().replace(/\/$/, '');
  const jwks = keyResolver ?? createRemoteJWKSet(new URL(`${authIssuer}/.well-known/jwks.json`));

  return async (token) => {
    const { payload } = await jwtVerify(token, jwks, {
      algorithms: ['ES256'],
      issuer: authIssuer,
      audience: 'authenticated',
    });

    if (!payload.sub || !isUuid(payload.sub) || payload.role !== 'authenticated') {
      throw new joseErrors.JWTClaimValidationFailed('Invalid authenticated subject', payload, 'sub', 'check_failed');
    }

    return {
      userId: payload.sub,
      ...(typeof payload.email === 'string' ? { email: payload.email } : {}),
      claims: payload,
    };
  };
}

export function createVerificationResolver(config: BackendEnvironment): VerificationResolver {
  const endpoint = new URL('/auth/v1/user', ensureTrailingSlash(config.SUPABASE_URL)).toString();

  return async (token, identity) => {
    let response: Response;
    try {
      response = await fetch(endpoint, {
        headers: {
          apikey: config.SUPABASE_PUBLISHABLE_KEY,
          authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(5_000),
      });
    } catch {
      throw new IdentityProviderUnavailableError();
    }

    if (response.status === 401 || response.status === 403) {
      throw new HttpError(401, 'AUTH_INVALID', 'Authentication is invalid or expired.');
    }
    if (!response.ok) throw new IdentityProviderUnavailableError();

    const user = (await response.json()) as {
      id?: string;
      email_confirmed_at?: string | null;
      user_metadata?: { display_name?: unknown; full_name?: unknown };
    };
    if (user.id !== identity.userId) throw new HttpError(401, 'AUTH_INVALID', 'Authentication is invalid or expired.');

    const candidateName = user.user_metadata?.display_name ?? user.user_metadata?.full_name;
    return {
      verified: typeof user.email_confirmed_at === 'string' && user.email_confirmed_at.length > 0,
      ...(typeof candidateName === 'string' ? { displayName: candidateName } : {}),
    };
  };
}

export function createRequireVerifiedIdentity(
  verifyToken: AccessTokenVerifier,
  resolveVerification: VerificationResolver,
) {
  return async function requireVerifiedIdentity(request: FastifyRequest, _reply: FastifyReply): Promise<void> {
    const header = request.headers.authorization;
    if (!header?.startsWith('Bearer ') || header.slice(7).trim().length === 0) {
      throw new HttpError(401, 'AUTH_REQUIRED', 'A valid bearer token is required.');
    }

    const token = header.slice(7).trim();
    let identity: VerifiedTokenIdentity;
    try {
      identity = await verifyToken(token);
    } catch (error) {
      if (error instanceof HttpError || error instanceof IdentityProviderUnavailableError) throw error;
      throw new HttpError(401, 'AUTH_INVALID', 'Authentication is invalid or expired.');
    }

    const verification = await resolveVerification(token, identity);
    if (!verification.verified) {
      throw new HttpError(403, 'EMAIL_VERIFICATION_REQUIRED', 'Email verification is required for cloud features.');
    }

    request.identity = {
      userId: identity.userId,
      ...(identity.email ? { email: identity.email } : {}),
      ...(verification.displayName ? { displayName: verification.displayName } : {}),
      verified: true,
    };
  };
}

function ensureTrailingSlash(value: string): string {
  return value.endsWith('/') ? value : `${value}/`;
}

function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}
