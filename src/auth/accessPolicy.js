export const GUEST_SAFE_PATHS = Object.freeze([
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/verify',
  '/auth/recover',
  '/auth/update-password',
  '/curricula',
  '/settings',
]);

export function getCurriculumAction(entitlement) {
  if (entitlement?.allowed) return { allowed: true, label: null, destination: '/' };
  if (entitlement?.mode === 'unverified') {
    return { allowed: false, label: 'Verify email to start', destination: '/auth/verify' };
  }
  if (entitlement?.mode === 'account-conflict') {
    return { allowed: false, label: 'Resolve device access', destination: '/settings' };
  }
  return { allowed: false, label: 'Create account to start', destination: '/auth/register' };
}
