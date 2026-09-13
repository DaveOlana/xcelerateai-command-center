import assert from 'node:assert/strict';
import { createHash, webcrypto } from 'node:crypto';
import test from 'node:test';
import { runBrowserPythonVerification, sourceSha256 } from './browserPythonRunner.js';
import { browserPythonSpecFor, verificationAvailability } from './registry.js';

const context = { curriculumId: 'PYAE', curriculumRevision: 3, weekId: 'PYAE-W03', proofId: 'PYAE-PR-W03', requirementId: 'PYAE-PR-W03-E01' };
const spec = browserPythonSpecFor(context);
const result = (passed = true) => ({ outcome: passed ? 'passed' : 'failed', checks: spec.checkIds.map((id) => ({ id, passed, message: passed ? 'Passed.' : 'Needs attention.' })) });
function fakeWorker(payload, delay = 0) { return () => { const worker = { terminated: false, terminate() { this.terminated = true; }, postMessage() { setTimeout(() => worker.onmessage?.({ data: payload }), delay); } }; return worker; }; }

test('registry selects only the stable supported PYAE requirement and keeps future adapters unavailable', () => {
  assert.equal(spec.verifierType, 'browser_python');
  assert.equal(spec.trustLevel, 'client_advisory');
  assert.equal(browserPythonSpecFor({ ...context, weekId: 'PYAE-W04' }), null);
  assert.deepEqual(verificationAvailability({ ...context, weekId: 'PYAE-W04' }), { structural: 'available', browserPython: 'unsupported', futureServerSandbox: 'unavailable', futureAiRubric: 'unavailable' });
});
test('passing and failing worker results remain advisory structured checks', async () => {
  assert.equal((await runBrowserPythonVerification({ source: 'pass', spec, workerFactory: fakeWorker(result(true)) })).outcome, 'passed');
  assert.equal((await runBrowserPythonVerification({ source: 'fail', spec, workerFactory: fakeWorker(result(false)) })).outcome, 'failed');
  assert.equal(spec.trustLevel, 'client_advisory');
});
test('malformed spec and malformed worker protocol fail closed', async () => {
  await assert.rejects(runBrowserPythonVerification({ source: 'x', spec: {}, workerFactory: fakeWorker(result()) }), /malformed/);
  await assert.rejects(runBrowserPythonVerification({ source: 'x', spec, workerFactory: fakeWorker({ outcome: 'passed', checks: [] }) }), /unexpected/);
});
test('timeout terminates a non-responsive worker without weakening the limit', async () => {
  const worker = { terminated: false, terminate() { this.terminated = true; }, postMessage() {} };
  await assert.rejects(runBrowserPythonVerification({ source: 'x', spec, workerFactory: () => worker, timeoutMs: 5 }), /timed out/);
  assert.equal(worker.terminated, true);
});
test('worker runtime errors are bounded and learner source hashing is deterministic', async () => {
  const errorResult = { outcome: 'error', checks: spec.checkIds.map((id) => ({ id, passed: false, message: 'Runtime unavailable.' })) };
  assert.equal((await runBrowserPythonVerification({ source: 'x', spec, workerFactory: fakeWorker(errorResult) })).outcome, 'error');
  assert.equal(await sourceSha256('hello', webcrypto), createHash('sha256').update('hello').digest('hex'));
});
test('oversized source and output are rejected', async () => {
  await assert.rejects(runBrowserPythonVerification({ source: 'x'.repeat(256 * 1024 + 1), spec, workerFactory: fakeWorker(result()) }), /256 KiB/);
  const huge = result(); huge.checks[0].message = 'x'.repeat(20 * 1024);
  await assert.rejects(runBrowserPythonVerification({ source: 'x', spec, workerFactory: fakeWorker(huge) }), /output exceeded/);
});
