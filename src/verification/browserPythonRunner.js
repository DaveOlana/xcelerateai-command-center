const MAX_SOURCE_BYTES = 256 * 1024;
const MAX_RESULT_BYTES = 16 * 1024;
const DEFAULT_TIMEOUT_MS = 45_000;

export async function sourceSha256(source, cryptoImpl = globalThis.crypto) {
  if (!cryptoImpl?.subtle) throw new Error('Secure source hashing is unavailable in this browser.');
  const digest = await cryptoImpl.subtle.digest('SHA-256', new TextEncoder().encode(source));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('');
}

export function runBrowserPythonVerification({ source, spec, workerFactory = defaultWorkerFactory, timeoutMs = DEFAULT_TIMEOUT_MS }) {
  if (typeof source !== 'string' || !source.trim()) return Promise.reject(new Error('Choose a non-empty Python source file.'));
  if (new TextEncoder().encode(source).byteLength > MAX_SOURCE_BYTES) return Promise.reject(new Error('Python source cannot exceed 256 KiB.'));
  if (!spec?.id || !Array.isArray(spec.checkIds)) return Promise.reject(new Error('Browser verifier specification is malformed.'));

  return new Promise((resolve, reject) => {
    const worker = workerFactory();
    const finish = (callback, value) => { clearTimeout(timer); worker.terminate(); callback(value); };
    const timer = setTimeout(() => finish(reject, new Error('Automated checks timed out. The isolated worker was stopped.')), timeoutMs);
    worker.onmessage = (event) => {
      try {
        const serialized = JSON.stringify(event.data);
        if (serialized.length > MAX_RESULT_BYTES) throw new Error('Automated-check output exceeded the safe display limit.');
        const result = validateResult(event.data, spec);
        finish(resolve, result);
      } catch (error) { finish(reject, error); }
    };
    worker.onerror = () => finish(reject, new Error('The isolated Python verifier could not run.'));
    worker.postMessage({ type: 'run', source, specId: spec.id, expectedCheckIds: spec.checkIds });
  });
}

function validateResult(result, spec) {
  if (!result || !['passed', 'failed', 'error'].includes(result.outcome) || !Array.isArray(result.checks)) throw new Error('The browser verifier returned a malformed result.');
  const ids = result.checks.map((check) => check?.id);
  if (ids.length !== spec.checkIds.length || ids.some((id, index) => id !== spec.checkIds[index])) throw new Error('The browser verifier returned unexpected checks.');
  if (result.checks.some((check) => typeof check.passed !== 'boolean' || typeof check.message !== 'string')) throw new Error('The browser verifier returned malformed checks.');
  return result;
}

function defaultWorkerFactory() {
  return new Worker(new URL('./pyodideWorker.js', import.meta.url), { type: 'module', name: 'xcelerate-python-verifier' });
}
