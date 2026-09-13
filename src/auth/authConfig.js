export function resolveAuthConfig(environment = {}) {
  const supabaseUrl = environment.VITE_SUPABASE_URL?.trim();
  const publishableKey = environment.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
  const apiBaseUrl = environment.VITE_API_BASE_URL?.trim();
  const missing = [
    ['VITE_SUPABASE_URL', supabaseUrl],
    ['VITE_SUPABASE_PUBLISHABLE_KEY', publishableKey],
    ['VITE_API_BASE_URL', apiBaseUrl],
  ].filter(([, value]) => !value).map(([name]) => name);

  return missing.length
    ? { configured: false, missing }
    : {
        configured: true,
        supabaseUrl: normalizeBaseUrl(supabaseUrl),
        publishableKey,
        apiBaseUrl: normalizeBaseUrl(apiBaseUrl),
      };
}

export function authRedirect(origin, path) {
  return new URL(path, origin).toString();
}

function normalizeBaseUrl(value) {
  const url = new URL(value);
  return url.toString().replace(/\/$/, '');
}
