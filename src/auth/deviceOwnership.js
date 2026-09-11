export const VERIFIED_DEVICE_KEY = 'xcelerate.auth.verified-device.v1';

const ACTIVE = 'active';
const SIGNED_OUT = 'signed-out';

function resolveStorage(storage) {
  if (storage) return storage;
  if (typeof window === 'undefined') return null;
  return window.localStorage;
}

export function readDeviceOwnership(storage) {
  const target = resolveStorage(storage);
  if (!target) return null;
  try {
    const parsed = JSON.parse(target.getItem(VERIFIED_DEVICE_KEY));
    if (!parsed || typeof parsed.userId !== 'string' || !parsed.userId) return null;
    return {
      userId: parsed.userId,
      verifiedAt: typeof parsed.verifiedAt === 'string' ? parsed.verifiedAt : null,
      access: parsed.access === SIGNED_OUT ? SIGNED_OUT : ACTIVE,
    };
  } catch {
    return null;
  }
}

export function claimDeviceOwnership(userId, verifiedAt, storage) {
  if (!userId) return { status: 'invalid', ownership: readDeviceOwnership(storage) };
  const target = resolveStorage(storage);
  if (!target) return { status: 'unavailable', ownership: null };
  const current = readDeviceOwnership(target);
  if (current && current.userId !== userId) {
    return { status: 'conflict', ownership: current };
  }
  const ownership = {
    userId,
    verifiedAt: current?.verifiedAt || verifiedAt || new Date().toISOString(),
    access: ACTIVE,
  };
  target.setItem(VERIFIED_DEVICE_KEY, JSON.stringify(ownership));
  return { status: current ? 'restored' : 'claimed', ownership };
}

export function markDeviceSignedOut(userId, storage) {
  const target = resolveStorage(storage);
  if (!target) return null;
  const current = readDeviceOwnership(target);
  if (!current || current.userId !== userId) return current;
  const ownership = { ...current, access: SIGNED_OUT };
  target.setItem(VERIFIED_DEVICE_KEY, JSON.stringify(ownership));
  return ownership;
}

export function deriveLearnerEntitlement({ configured, user, verified, ownership, networkUnavailable }) {
  if (user && verified) {
    if (!ownership) return { allowed: false, mode: 'claiming', ownershipConflict: false };
    if (ownership.userId !== user.id) return { allowed: false, mode: 'account-conflict', ownershipConflict: true };
    return { allowed: ownership.access === ACTIVE, mode: ownership.access === ACTIVE ? 'verified' : 'guest', ownershipConflict: false };
  }
  if (!user && networkUnavailable && ownership?.access === ACTIVE) {
    return { allowed: true, mode: 'offline-verified', ownershipConflict: false };
  }
  if (user && !verified) return { allowed: false, mode: 'unverified', ownershipConflict: false };
  return { allowed: false, mode: configured ? 'guest' : 'unconfigured', ownershipConflict: false };
}
