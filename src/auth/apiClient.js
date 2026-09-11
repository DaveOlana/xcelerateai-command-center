export class ApiClientError extends Error {
  constructor(code, message, status) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
  }
}

export function createApiClient({ baseUrl, getAccessToken, fetchImpl = fetch }) {
  const normalizedBaseUrl = baseUrl.replace(/\/$/, '');

  async function request(path, options = {}) {
    const token = await getAccessToken();
    const headers = { Accept: 'application/json', ...options.headers };
    if (options.body) headers['Content-Type'] = 'application/json';
    if (token) headers.Authorization = `Bearer ${token}`;

    let response;
    try {
      response = await fetchImpl(`${normalizedBaseUrl}${path}`, { ...options, headers });
    } catch {
      throw new ApiClientError('NETWORK_ERROR', 'Cloud services are currently unreachable.', 0);
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new ApiClientError(
        payload?.error?.code || 'API_ERROR',
        payload?.error?.message || 'The cloud request could not be completed.',
        response.status,
      );
    }
    return payload;
  }

  return {
    getProfile: () => request('/api/v1/profile/me'),
    updateProfile: (displayName) => request('/api/v1/profile/me', {
      method: 'PATCH',
      body: JSON.stringify({ display_name: displayName }),
    }),
  };
}
