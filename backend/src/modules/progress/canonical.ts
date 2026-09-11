import { createHash } from 'node:crypto';

function canonicalize(value: unknown): unknown {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON does not support non-finite numbers.');
    return value;
  }
  if (Array.isArray(value)) return value.map(canonicalize);
  if (typeof value === 'object') {
    const source = value as Record<string, unknown>;
    return Object.fromEntries(
      Object.keys(source)
        .sort()
        .filter((key) => source[key] !== undefined)
        .map((key) => [key, canonicalize(source[key])]),
    );
  }
  throw new TypeError(`Canonical JSON does not support ${typeof value}.`);
}

export function canonicalStringify(value: unknown): string {
  return JSON.stringify(canonicalize(value));
}

export function sha256Canonical(value: unknown): string {
  return createHash('sha256').update(canonicalStringify(value), 'utf8').digest('hex');
}
