import { authRedirect } from './authConfig.js';

export function createAuthService(client, origin) {
  return {
    initialize: () => client.auth.getSession(),
    subscribe: (listener) => client.auth.onAuthStateChange((event, session) => listener(session, event)),
    login: (email, password) => client.auth.signInWithPassword({ email, password }),
    signup: (displayName, email, password) => client.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
        emailRedirectTo: authRedirect(origin, '/auth/verify'),
      },
    }),
    logout: () => client.auth.signOut(),
    resendVerification: (email) => client.auth.resend({
      type: 'signup',
      email,
      options: { emailRedirectTo: authRedirect(origin, '/auth/verify') },
    }),
    requestPasswordRecovery: (email) => client.auth.resetPasswordForEmail(email, {
      redirectTo: authRedirect(origin, '/auth/update-password'),
    }),
    updatePassword: (password) => client.auth.updateUser({ password }),
  };
}

export function isEmailVerified(user) {
  return Boolean(user?.email_confirmed_at || user?.confirmed_at);
}

export function deriveIdentityState(configured, user) {
  const verified = isEmailVerified(user);
  return {
    mode: !configured ? 'unconfigured' : !user ? 'anonymous' : verified ? 'verified' : 'unverified',
    localLearningAvailable: verified,
    cloudProfileAvailable: Boolean(configured && user && verified),
    verified,
  };
}
