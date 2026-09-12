export class ApiClientError extends Error {
  constructor(code, message, status, payload = null) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.payload = payload;
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
        payload,
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
    getLearningInstance: (curriculumId) => request(`/api/v1/v2/learning-instances/${encodeURIComponent(curriculumId)}`),
    putLearningInstance: (curriculumId, mutation) => request(`/api/v1/v2/learning-instances/${encodeURIComponent(curriculumId)}`, {
      method: 'PUT',
      body: JSON.stringify(mutation),
    }),
    listEvidenceSubmissions: ({ curriculumId, revision, proofId }) => request(`/api/v1/evidence/proofs/${encodeURIComponent(proofId)}/submissions?curriculumId=${encodeURIComponent(curriculumId)}&revision=${encodeURIComponent(revision)}`),
    getEvidenceSubmission: (submissionId) => request(`/api/v1/evidence/submissions/${encodeURIComponent(submissionId)}`),
    createEvidenceUploadIntent: (intent) => request('/api/v1/evidence/upload-intents', {
      method: 'POST', body: JSON.stringify(intent),
    }),
    finalizeEvidenceAsset: (assetId) => request(`/api/v1/evidence/assets/${encodeURIComponent(assetId)}/finalize`, { method: 'POST' }),
    accessEvidenceAsset: (assetId) => request(`/api/v1/evidence/assets/${encodeURIComponent(assetId)}/access`, { method: 'POST' }),
    abandonEvidenceAsset: (assetId) => request(`/api/v1/evidence/assets/${encodeURIComponent(assetId)}/abandon`, { method: 'POST' }),
    createEvidenceSubmission: (submission) => request('/api/v1/evidence/submissions', {
      method: 'POST', body: JSON.stringify(submission),
    }),
    withdrawEvidenceSubmission: (submissionId, clientMutationId) => request(`/api/v1/evidence/submissions/${encodeURIComponent(submissionId)}/withdraw`, {
      method: 'POST', body: JSON.stringify({ clientMutationId }),
    }),
  };
}
