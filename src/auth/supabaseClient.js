import { createClient } from '@supabase/supabase-js';
import { resolveAuthConfig } from './authConfig.js';

let singleton;

export function getSupabaseAuthClient(environment = import.meta.env) {
  const config = resolveAuthConfig(environment);
  if (!config.configured) return { client: null, config };

  singleton ??= createClient(config.supabaseUrl, config.publishableKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: true,
      flowType: 'pkce',
    },
  });
  return { client: singleton, config };
}

export function resetSupabaseClientForTests() {
  singleton = undefined;
}
