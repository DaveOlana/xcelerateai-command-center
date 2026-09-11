function canonicalize(value) {
  if (value === null || typeof value === 'string' || typeof value === 'boolean') return value;
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) throw new TypeError('Canonical JSON does not support non-finite numbers.');
    return value;
  }
  if (Array.isArray(value)) return value.map((item) => canonicalize(item));
  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.keys(value)
        .sort()
        .filter((key) => value[key] !== undefined)
        .map((key) => [key, canonicalize(value[key])]),
    );
  }
  throw new TypeError(`Canonical JSON does not support ${typeof value}.`);
}

export function canonicalStringify(value) {
  return JSON.stringify(canonicalize(value));
}

export async function sha256Canonical(value, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.subtle) throw new Error('Web Crypto is unavailable.');
  const bytes = new TextEncoder().encode(canonicalStringify(value));
  const digest = await cryptoImpl.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}
