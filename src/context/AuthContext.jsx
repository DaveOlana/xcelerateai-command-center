import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { createApiClient } from '../auth/apiClient.js';
import { createAuthService, deriveIdentityState } from '../auth/authService.js';
import {
  claimDeviceOwnership,
  deriveLearnerEntitlement,
  markDeviceSignedOut,
  readDeviceOwnership,
  VERIFIED_DEVICE_KEY,
} from '../auth/deviceOwnership.js';
import { getSupabaseAuthClient } from '../auth/supabaseClient.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [{ client, config }] = useState(() => getSupabaseAuthClient());
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(Boolean(client));
  const [profileLoading, setProfileLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deviceOwnership, setDeviceOwnership] = useState(() => readDeviceOwnership());
  const [explicitlySignedOut, setExplicitlySignedOut] = useState(() => readDeviceOwnership()?.access === 'signed-out');
  const [networkUnavailable, setNetworkUnavailable] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);

  const service = useMemo(
    () => client ? createAuthService(client, window.location.origin) : null,
    [client],
  );
  const api = useMemo(() => {
    if (!client || !config.configured) return null;
    return createApiClient({
      baseUrl: config.apiBaseUrl,
      getAccessToken: async () => (await client.auth.getSession()).data.session?.access_token ?? null,
    });
  }, [client, config]);

  const identityState = deriveIdentityState(config.configured, session?.user);
  const verified = identityState.verified;
  const learnerEntitlement = useMemo(() => deriveLearnerEntitlement({
    configured: config.configured,
    user: session?.user ?? null,
    verified,
    ownership: deviceOwnership,
    networkUnavailable,
  }), [config.configured, deviceOwnership, networkUnavailable, session?.user, verified]);

  useEffect(() => {
    if (!verified || !session?.user?.id || explicitlySignedOut) return;
    const result = claimDeviceOwnership(
      session.user.id,
      session.user.email_confirmed_at || session.user.confirmed_at,
    );
    setDeviceOwnership(result.ownership);
  }, [explicitlySignedOut, session?.user?.confirmed_at, session?.user?.email_confirmed_at, session?.user?.id, verified]);

  useEffect(() => {
    const online = () => setNetworkUnavailable(false);
    const offline = () => setNetworkUnavailable(true);
    const ownershipChanged = (event) => {
      if (event.key === VERIFIED_DEVICE_KEY) setDeviceOwnership(readDeviceOwnership());
    };
    window.addEventListener('online', online);
    window.addEventListener('offline', offline);
    window.addEventListener('storage', ownershipChanged);
    return () => {
      window.removeEventListener('online', online);
      window.removeEventListener('offline', offline);
      window.removeEventListener('storage', ownershipChanged);
    };
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!api || learnerEntitlement.mode !== 'verified') {
      setProfile(null);
      return null;
    }
    setProfileLoading(true);
    try {
      const result = await api.getProfile();
      setProfile(result.profile);
      return result.profile;
    } catch (requestError) {
      if (typeof navigator !== 'undefined' && !navigator.onLine) setNetworkUnavailable(true);
      setError(requestError.message);
      return null;
    } finally {
      setProfileLoading(false);
    }
  }, [api, learnerEntitlement.mode]);

  useEffect(() => {
    if (!service) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    service.initialize()
      .then(({ data, error: sessionError }) => {
        if (!active) return;
        if (sessionError) setError(sessionError.message);
        setSession(data.session ?? null);
      })
      .catch((sessionError) => {
        if (!active) return;
        setError(sessionError.message);
        if (typeof navigator !== 'undefined' && !navigator.onLine) setNetworkUnavailable(true);
      })
      .finally(() => active && setLoading(false));
    const { data } = service.subscribe((nextSession, event) => {
      if (active) {
        if (event === 'SIGNED_IN') setExplicitlySignedOut(false);
        setSession(nextSession ?? null);
        setError(null);
      }
    });
    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [service]);

  useEffect(() => {
    if (learnerEntitlement.mode === 'verified') void refreshProfile();
    else setProfile(null);
  }, [learnerEntitlement.mode, session?.user?.id, refreshProfile]);

  const run = useCallback(async (operation) => {
    setError(null);
    const result = await operation();
    if (result.error) {
      setError(result.error.message);
      throw result.error;
    }
    return result.data;
  }, []);

  const value = useMemo(() => ({
    configured: config.configured,
    missingConfiguration: config.configured ? [] : config.missing,
    loading,
    profileLoading,
    session,
    user: session?.user ?? null,
    verified,
    identityState,
    hasLearnerAccess: learnerEntitlement.allowed,
    accessMode: learnerEntitlement.mode,
    ownershipConflict: learnerEntitlement.ownershipConflict,
    learnerEntitlement,
    networkUnavailable,
    progressApi: api ? {
      getLearningInstance: api.getLearningInstance,
      putLearningInstance: api.putLearningInstance,
    } : null,
    evidenceApi: api ? {
      listSubmissions: api.listEvidenceSubmissions,
      getSubmission: api.getEvidenceSubmission,
      createUploadIntent: api.createEvidenceUploadIntent,
      finalizeAsset: api.finalizeEvidenceAsset,
      accessAsset: api.accessEvidenceAsset,
      abandonAsset: api.abandonEvidenceAsset,
      createSubmission: api.createEvidenceSubmission,
      withdrawSubmission: api.withdrawEvidenceSubmission,
      listVerificationResults: api.listVerificationResults,
      createStructuralVerification: api.createStructuralVerification,
      createBrowserPythonVerification: api.createBrowserPythonVerification,
      uploadSignedAsset: async ({ bucket, path, token, file, contentType }) => {
        const { error: uploadError } = await client.storage.from(bucket).uploadToSignedUrl(path, token, file, {
          contentType,
          upsert: false,
        });
        if (uploadError) throw uploadError;
      },
    } : null,
    profile,
    error,
    clearError: () => setError(null),
    login: async (email, password) => {
      const data = await run(() => service.login(email, password));
      setExplicitlySignedOut(false);
      return data;
    },
    signup: (displayName, email, password) => run(() => service.signup(displayName, email, password)),
    logout: async () => {
      setExplicitlySignedOut(true);
      setDeviceOwnership(markDeviceSignedOut(session?.user?.id || deviceOwnership?.userId));
      setSession(null);
      setProfile(null);
      await run(() => service.logout());
    },
    resendVerification: (email) => run(() => service.resendVerification(email)),
    requestPasswordRecovery: (email) => run(() => service.requestPasswordRecovery(email)),
    updatePassword: (password) => run(() => service.updatePassword(password)),
    refreshProfile,
    updateProfile: async (displayName) => {
      const result = await api.updateProfile(displayName);
      setProfile(result.profile);
      return result.profile;
    },
  }), [api, config, deviceOwnership, error, identityState, learnerEntitlement, loading, networkUnavailable, profile, profileLoading, refreshProfile, run, service, session, verified]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
