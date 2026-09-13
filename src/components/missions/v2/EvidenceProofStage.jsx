import React from 'react';
import { Archive, CheckCircle2, Cloud, CloudOff, Code2, FileText, Link2, Loader2, RotateCcw, Upload, X } from 'lucide-react';
import { useEvidence } from '../../../context/EvidenceContext.jsx';
import { EVIDENCE_TOTAL_FILE_LIMIT } from '../../../evidence/evidenceStore.js';
import { browserPythonSpecFor } from '../../../verification/registry.js';
import { runBrowserPythonVerification, sourceSha256 } from '../../../verification/browserPythonRunner.js';

const kindOptions = (evidence) => {
  if (evidence.type === 'confirmation') return [{ id: 'self_attestation', label: 'Confirmation' }];
  if (evidence.id.endsWith('-E01')) return [
    { id: evidence.type === 'link' ? 'url' : 'text', label: evidence.type === 'link' ? 'Link' : 'Text' },
    ...(evidence.type === 'link' ? [{ id: 'repository', label: 'Repository' }, { id: 'text', label: 'Text' }] : [{ id: 'url', label: 'Link' }, { id: 'repository', label: 'Repository' }]),
    { id: 'file', label: 'File' },
  ];
  return [{ id: 'text', label: 'Text' }, { id: 'file', label: 'File' }];
};

export default function EvidenceProofStage({ curriculum, week, learner, status, inspectionOnly, onDraftChange }) {
  const evidence = useEvidence();
  const context = React.useMemo(() => ({
    curriculumId: curriculum.curriculumId,
    curriculumRevision: curriculum.revision,
    weekId: week.id,
    buildId: week.builds.find((build) => build.required)?.id || week.builds[0]?.id,
    proofId: week.proof.id,
  }), [curriculum.curriculumId, curriculum.revision, week]);
  const [kinds, setKinds] = React.useState({});
  const [busyRequirement, setBusyRequirement] = React.useState(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [feedback, setFeedback] = React.useState(null);
  const [verificationResults, setVerificationResults] = React.useState([]);
  const [checking, setChecking] = React.useState(false);
  const current = evidence.getCurrentSubmission(week.proof.id);
  const history = evidence.getHistory(context);
  const pending = evidence.outbox.operations.some((operation) => operation.type === 'submit' && operation.payload?.proofId === week.proof.id);
  const browserRequirement = React.useMemo(() => week.proof.evidence.map((item) => ({
    item,
    spec: browserPythonSpecFor({ ...context, requirementId: item.id }),
  })).find((entry) => entry.spec) || null, [context, week.proof.evidence]);

  React.useEffect(() => {
    setKinds(Object.fromEntries(week.proof.evidence.map((item) => [item.id, item.type === 'confirmation' ? 'self_attestation' : item.type === 'link' ? 'url' : 'text'])));
    setFeedback(null);
    evidence.loadHistory(context).catch((error) => setFeedback({ type: 'error', text: error.message || 'Evidence history could not be loaded.' }));
  }, [context, week.proof.evidence]); // Evidence methods are stable for the active account.

  React.useEffect(() => {
    let active = true;
    setVerificationResults([]);
    if (current?.id) evidence.loadVerificationResults(current.id).then((results) => active && setVerificationResults(results)).catch(() => undefined);
    return () => { active = false; };
  }, [current?.id]); // The evidence service is stable for the active account.

  const draftValue = (item) => learner?.proofs?.[week.proof.id]?.evidence?.[item.id]?.value ?? (item.type === 'confirmation' ? false : '');
  const setKind = (item, kind) => {
    setKinds((currentKinds) => ({ ...currentKinds, [item.id]: kind }));
    if (kind !== 'file' && item.type !== 'confirmation' && typeof draftValue(item) !== 'string') onDraftChange(week.id, week.proof.id, item.id, '');
  };
  const attachFile = async (item, file) => {
    if (!file) return;
    setBusyRequirement(item.id);
    setFeedback(null);
    try {
      const asset = await evidence.uploadFile({ context, evidenceRequirementId: item.id, file });
      evidence.stageAsset(context, item.id, asset);
      setKinds((currentKinds) => ({ ...currentKinds, [item.id]: 'file' }));
      setFeedback({ type: 'success', text: `${file.name} uploaded privately and is ready to submit.` });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'The file could not be uploaded.' });
    } finally {
      setBusyRequirement(null);
    }
  };
  const removeFile = async (item) => {
    setBusyRequirement(item.id);
    try { await evidence.removeStagedAsset(context, item.id); }
    catch (error) { setFeedback({ type: 'error', text: error.message || 'The staged file could not be removed.' }); }
    finally { setBusyRequirement(null); }
  };
  const buildItems = () => week.proof.evidence.map((item) => {
    const kind = kinds[item.id] || (item.type === 'confirmation' ? 'self_attestation' : item.type === 'link' ? 'url' : 'text');
    const value = draftValue(item);
    if (kind === 'self_attestation') return { evidenceRequirementId: item.id, kind, attested: value === true };
    if (kind === 'file') return { evidenceRequirementId: item.id, kind, assetId: evidence.getStagedAsset(context, item.id)?.id };
    if (kind === 'repository') return { evidenceRequirementId: item.id, kind, repositoryUrl: String(value || '').trim(), provider: providerFor(value), commitSha: null, branch: null };
    if (kind === 'url') return { evidenceRequirementId: item.id, kind, url: String(value || '').trim() };
    return { evidenceRequirementId: item.id, kind: 'text', text: String(value || '').trim() };
  });
  const items = buildItems();
  const totalFileBytes = items.filter((item) => item.kind === 'file').reduce((total, item) => total + (evidence.getStagedAsset(context, item.evidenceRequirementId)?.byteSize || 0), 0);
  const draftComplete = totalFileBytes <= EVIDENCE_TOTAL_FILE_LIMIT && items.every((item) => item.kind === 'self_attestation' ? item.attested === true : item.kind === 'file' ? Boolean(item.assetId) : Boolean(item.text || item.url || item.repositoryUrl));

  const submit = async () => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const result = await evidence.submitEvidence({
        clientSubmissionId: createId(), expectedCurrentSubmissionId: current?.id || null,
        ...context, items,
      });
      if (result.submission) {
        await Promise.allSettled(items.map((item) => evidence.recordStructuralVerification({
          evidenceSubmissionId: result.submission.id,
          requirementId: item.evidenceRequirementId,
          clientRunId: createId(),
        })));
      }
      setFeedback(result.outcome === 'queued'
        ? { type: 'pending', text: 'Submission pending — saved locally and will retry when cloud service returns.' }
        : { type: 'success', text: 'Evidence submitted. It has not been verified.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Evidence could not be submitted.' });
    } finally {
      setSubmitting(false);
    }
  };

  const runAutomatedChecks = async (file) => {
    if (!file || !browserRequirement || !current) return;
    setChecking(true);
    setFeedback(null);
    try {
      if (!file.name.toLowerCase().endsWith('.py')) throw new Error('Choose a local .py source file.');
      const source = await file.text();
      const [result, hash] = await Promise.all([
        runBrowserPythonVerification({ source, spec: browserRequirement.spec }),
        sourceSha256(source),
      ]);
      const recorded = await evidence.recordBrowserPythonVerification({
        evidenceSubmissionId: current.id,
        requirementId: browserRequirement.item.id,
        clientRunId: createId(),
        verifierSpecId: browserRequirement.spec.id,
        verifierVersion: browserRequirement.spec.version,
        sourceSha256: hash,
        outcome: result.outcome,
        checks: result.checks,
      });
      setVerificationResults((prior) => [recorded.result, ...prior]);
      setFeedback({ type: result.outcome === 'passed' ? 'success' : 'error', text: result.outcome === 'passed' ? 'Automated checks passed. This is advisory learning feedback, not verified competency.' : 'Automated checks need attention. Your submission and progress are unchanged.' });
    } catch (error) {
      setFeedback({ type: 'error', text: error.message || 'Automated checks could not run.' });
    } finally { setChecking(false); }
  };

  const withdraw = async () => {
    setSubmitting(true);
    try {
      const result = await evidence.withdrawSubmission(current.id);
      setFeedback(result.outcome === 'queued'
        ? { type: 'pending', text: 'Withdrawal pending — saved locally for retry.' }
        : { type: 'success', text: 'Submission withdrawn. Its immutable history remains available.' });
    } catch (error) { setFeedback({ type: 'error', text: error.message || 'The submission could not be withdrawn.' }); }
    finally { setSubmitting(false); }
  };

  return (
    <section className="surface-card p-6 sm:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div><p className="text-xs font-bold uppercase tracking-wider text-brand-violet">Stage 4</p><h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">Proof</h2><p className="mt-2 max-w-3xl text-sm leading-relaxed text-text-secondary">{week.proof.prompt}</p></div>
        <EvidenceStatus current={current} pending={pending} loading={evidence.isHistoryLoading(context)} />
      </div>

      <div className="mt-6 space-y-5">
        {week.proof.evidence.map((item) => {
          const choices = kindOptions(item);
          const kind = kinds[item.id] || choices[0].id;
          const value = draftValue(item);
          const asset = evidence.getStagedAsset(context, item.id);
          const disabled = inspectionOnly || !status.proof.unlocked || submitting;
          return <div key={item.id} className="rounded-2xl border border-border-default bg-bg-soft p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><p className="text-sm font-bold text-text-primary">{item.label}{item.required && <span className="text-brand-amber"> *</span>}</p><p className="mt-1 text-xs text-text-muted">Draft changes save with your private learning record. Submission is a separate action.</p></div>{choices.length > 1 && <div className="flex flex-wrap gap-1 rounded-xl border border-border-default bg-bg-surface p-1" aria-label={`Evidence method for ${item.label}`}>{choices.map((choice) => <button key={choice.id} type="button" disabled={disabled} onClick={() => setKind(item, choice.id)} className={`rounded-lg px-3 py-1.5 text-xs font-bold ${kind === choice.id ? 'bg-brand-violet text-white' : 'text-text-muted hover:text-text-primary'}`}>{choice.label}</button>)}</div>}</div>
            {kind === 'self_attestation' && <label className="mt-4 flex items-start gap-3"><input type="checkbox" checked={value === true} disabled={disabled} onChange={(event) => onDraftChange(week.id, week.proof.id, item.id, event.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-violet" /><span className="text-sm text-text-secondary">I confirm this statement is accurate.</span></label>}
            {kind === 'text' && <textarea rows={4} value={typeof value === 'string' ? value : ''} disabled={disabled} onChange={(event) => onDraftChange(week.id, week.proof.id, item.id, event.target.value)} placeholder="Describe the artifact, result, or evidence…" className="input-base mt-4 w-full text-sm" />}
            {(kind === 'url' || kind === 'repository') && <div className="relative mt-4"><Link2 className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-text-muted" /><input type="url" value={typeof value === 'string' ? value : ''} disabled={disabled} onChange={(event) => onDraftChange(week.id, week.proof.id, item.id, event.target.value)} placeholder={kind === 'repository' ? 'https://github.com/you/project' : 'https://…'} className="input-base w-full pl-10 text-sm" /></div>}
            {kind === 'file' && <div className="mt-4">{asset ? <div className="flex items-center gap-3 rounded-xl border border-brand-green/25 bg-brand-green/5 p-3"><Archive className="h-5 w-5 text-brand-green" /><div className="min-w-0 flex-1"><p className="truncate text-sm font-bold text-text-primary">{asset.originalFilename}</p><p className="text-xs text-text-muted">{formatBytes(asset.byteSize || asset.declaredByteSize)} · Uploaded privately · Ready to submit</p></div><button type="button" disabled={disabled || busyRequirement === item.id} onClick={() => removeFile(item)} aria-label={`Remove ${asset.originalFilename}`} className="rounded-lg p-2 text-text-muted hover:bg-bg-surface hover:text-text-primary"><X className="h-4 w-4" /></button></div> : <label className={`flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-border-strong bg-bg-surface px-4 py-5 text-sm font-bold text-text-secondary ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-brand-violet hover:text-text-primary'}`}>{busyRequirement === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} {busyRequirement === item.id ? 'Uploading privately…' : 'Attach ZIP, TXT, MD, LOG, or JSON'}<input type="file" className="sr-only" disabled={disabled || busyRequirement === item.id} accept=".zip,.txt,.md,.log,.json,application/zip,application/x-zip-compressed,text/plain,application/json" onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void attachFile(item, file); }} /></label>}<p className="mt-2 text-xs text-text-muted">Maximum 6 MiB per file. Files require a connection and are never stored in browser backups.</p></div>}
          </div>;
        })}
      </div>

      {feedback && <p role="status" className={`mt-5 rounded-xl border p-3 text-sm font-semibold ${feedback.type === 'error' ? 'border-brand-red/25 bg-brand-red/5 text-brand-red' : feedback.type === 'pending' ? 'border-brand-amber/25 bg-brand-amber/5 text-brand-amber' : 'border-brand-green/25 bg-brand-green/5 text-brand-green'}`}>{feedback.text}</p>}
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button type="button" disabled={inspectionOnly || !status.proof.unlocked || !draftComplete || submitting} onClick={submit} className="btn-primary gap-2 px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-40">{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : current ? <RotateCcw className="h-4 w-4" /> : <Cloud className="h-4 w-4" />}{current ? 'Submit new revision' : 'Submit evidence'}</button>
        {current && <button type="button" disabled={submitting} onClick={withdraw} className="btn-secondary px-4 py-2.5 text-sm disabled:opacity-40">Withdraw current submission</button>}
        {!draftComplete && <span className="text-xs text-text-muted">{totalFileBytes > EVIDENCE_TOTAL_FILE_LIMIT ? 'Combined files cannot exceed 10 MiB.' : 'Complete every required evidence item before submitting.'}</span>}
      </div>

      {current && browserRequirement && <div className="mt-7 rounded-2xl border border-brand-violet/25 bg-brand-violet/5 p-5">
        <div className="flex items-start gap-3"><Code2 className="mt-0.5 h-5 w-5 text-brand-violet" /><div><h3 className="text-sm font-extrabold text-text-primary">Automated browser checks</h3><p className="mt-1 text-xs leading-relaxed text-text-muted">Choose <strong>{browserRequirement.spec.filenameHint}</strong>. XcelerateAI loads Python automatically in an isolated Web Worker. Your source stays in this tab, is never uploaded or saved, and only an advisory result plus SHA-256 fingerprint is recorded.</p></div></div>
        <label className={`mt-4 inline-flex items-center gap-2 rounded-xl bg-brand-violet px-4 py-2.5 text-sm font-bold text-white ${checking || inspectionOnly ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:opacity-90'}`}>{checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Code2 className="h-4 w-4" />}{checking ? 'Loading isolated Python…' : 'Run automated checks'}<input type="file" accept=".py,text/x-python" className="sr-only" disabled={checking || inspectionOnly} onChange={(event) => { const file = event.target.files?.[0]; event.target.value = ''; void runAutomatedChecks(file); }} /></label>
        <p className="mt-3 text-[11px] text-text-muted">First use requires a connection to download the cached browser runtime. Client-side checks are inspectable and not certification-grade.</p>
        {verificationResults.find((result) => result.verifierType === 'browser_python') && <VerificationSummary result={verificationResults.find((result) => result.verifierType === 'browser_python')} />}
      </div>}

      {history.length > 0 && <details className="mt-7 border-t border-border-default pt-5"><summary className="cursor-pointer text-sm font-bold text-text-secondary">Submission history ({history.length})</summary><div className="mt-4 space-y-2">{history.map((submission) => <div key={submission.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-default bg-bg-soft p-3"><div><p className="text-sm font-bold text-text-primary">Revision {submission.submissionRevision}</p><p className="text-xs text-text-muted">Submitted {new Date(submission.submittedAt).toLocaleString()} · Curriculum revision {submission.curriculumRevision}</p></div><span className="rounded-full border border-border-default px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-text-secondary">{submission.status}</span></div>)}</div></details>}
    </section>
  );
}

function VerificationSummary({ result }) {
  const passed = result.outcome === 'passed';
  return <div className={`mt-4 rounded-xl border p-3 ${passed ? 'border-brand-green/25 bg-brand-green/5' : 'border-brand-amber/25 bg-brand-amber/5'}`}><p className={`text-sm font-bold ${passed ? 'text-brand-green' : 'text-brand-amber'}`}>{passed ? 'Automated checks passed' : 'Automated checks need attention'}</p><p className="mt-1 text-xs text-text-muted">Advisory client-side result · Not verified competency</p></div>;
}

function EvidenceStatus({ current, pending, loading }) {
  if (loading) return <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-soft px-3 py-1.5 text-xs font-bold text-text-muted"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking submissions</span>;
  if (current) return <span className="inline-flex items-center gap-2 rounded-full border border-brand-green/25 bg-brand-green/5 px-3 py-1.5 text-xs font-bold text-brand-green"><CheckCircle2 className="h-3.5 w-3.5" /> Submitted · Not yet verified</span>;
  if (pending) return <span className="inline-flex items-center gap-2 rounded-full border border-brand-amber/25 bg-brand-amber/5 px-3 py-1.5 text-xs font-bold text-brand-amber"><CloudOff className="h-3.5 w-3.5" /> Submission pending</span>;
  return <span className="inline-flex items-center gap-2 rounded-full border border-border-default bg-bg-soft px-3 py-1.5 text-xs font-bold text-text-muted"><FileText className="h-3.5 w-3.5" /> Draft · Not submitted</span>;
}

function providerFor(value) {
  try {
    const host = new URL(String(value)).hostname.toLowerCase();
    if (host === 'github.com' || host.endsWith('.github.com')) return 'github';
    if (host === 'gitlab.com' || host.endsWith('.gitlab.com')) return 'gitlab';
    if (host === 'bitbucket.org' || host.endsWith('.bitbucket.org')) return 'bitbucket';
  } catch { /* Backend performs authoritative URL validation. */ }
  return 'other';
}
function createId() { return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`; }
function formatBytes(bytes) { return bytes >= 1024 * 1024 ? `${(bytes / (1024 * 1024)).toFixed(1)} MiB` : `${Math.max(1, Math.round(bytes / 1024))} KiB`; }
