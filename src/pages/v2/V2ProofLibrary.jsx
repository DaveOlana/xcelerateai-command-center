import React from 'react';
import { Archive, CheckCircle2, Download, ExternalLink, FileText, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useEvidence } from '../../context/EvidenceContext.jsx';
import { requiresServerProofSubmission } from '../../curriculum-v2/runtime/progression.js';
import { getLocalProofEntries } from '../../curriculum-v2/runtime/proofPresentation.js';
import { WorkspaceEmptyState, WorkspaceSectionHeader } from '../../components/workspace/WorkspacePrimitives';

export default function V2ProofLibrary() {
  const { activeV2Curriculum: curriculum, activeV2Learner: learner } = useApp();
  return requiresServerProofSubmission(curriculum)
    ? <ServerProofLibrary curriculum={curriculum} />
    : <LocalProofLibrary curriculum={curriculum} learner={learner} />;
}

function LocalProofLibrary({ curriculum, learner }) {
  const entries = getLocalProofEntries(curriculum, learner);
  return <div className="space-y-7">
    <WorkspaceSectionHeader title="Proof" description="Proof recorded with learning progress for human review. These records are not separate evidence submissions or automatic verification." />
    {entries.length === 0
      ? <div className="space-y-4"><WorkspaceEmptyState title="No proof recorded yet" description="Complete the Proof stage in Missions to save the requested text, links, and confirmations here." /><Link to="/missions?stage=proof" className="btn-primary inline-flex px-5 py-2.5 text-sm">Go to Missions Proof</Link></div>
      : <div className="grid gap-5">{entries.map(({ week, items, complete, updatedAt }) => <article key={week.proof.id} className="surface-card p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-text-muted">Week {week.sequence} · Learning record</p><h2 className="mt-1 text-base font-bold text-text-primary">{week.title}</h2></div><span className={`rounded-full border px-3 py-1.5 text-xs font-bold ${complete ? 'border-brand-green/25 bg-brand-green/5 text-brand-green' : 'border-brand-amber/25 bg-brand-amber/5 text-brand-amber'}`}>{complete ? 'Proof recorded · Ready for human review' : 'Draft · In progress'}</span></div>
        <div className="mt-5 grid gap-3">{items.map(({ definition, record }) => <div key={definition.id} className="rounded-xl border border-border-default bg-bg-soft p-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-surface text-text-secondary">{definition.type === 'confirmation' ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-text-muted">{definition.label}</p><LocalEvidenceItem definition={definition} record={record} /></div></div></div>)}</div>
        {updatedAt && <p className="mt-4 text-xs text-text-muted">Last saved {new Date(updatedAt).toLocaleString()} · Curriculum revision {curriculum.revision}</p>}
      </article>)}</div>}
  </div>;
}

function LocalEvidenceItem({ definition, record }) {
  const value = record?.value;
  if (definition.type === 'confirmation') return <p className="mt-1 text-sm text-text-secondary">{value === true ? 'Learner confirmation recorded.' : 'Not confirmed.'}</p>;
  if (definition.type === 'link' && typeof value === 'string' && value.trim()) return <a href={value.trim()} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sm text-brand-blue">{value.trim()}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>;
  return <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{String(value || '')}</p>;
}

function ServerProofLibrary({ curriculum }) {
  const evidence = useEvidence();
  const [loading, setLoading] = React.useState(true);
  const [feedback, setFeedback] = React.useState('');

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    Promise.all(curriculum.weeks.map((week) => evidence.loadHistory({ curriculumId: curriculum.curriculumId, curriculumRevision: curriculum.revision, proofId: week.proof.id })))
      .catch((error) => active && setFeedback(error.message || 'Some evidence history could not be loaded.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, [curriculum.curriculumId, curriculum.revision]); // Load metadata only; binary artifacts remain private and on demand.

  const entries = curriculum.weeks.flatMap((week) => {
    const submission = evidence.currentByProof[week.proof.id];
    return submission ? [{ week, submission }] : [];
  });
  const openAsset = async (assetId) => {
    setFeedback('');
    try {
      if (!evidence.enabled) throw new Error('A verified account is required.');
      const response = await evidence.accessAsset(assetId);
      window.open(response.download.url, '_blank', 'noopener,noreferrer');
    } catch (error) { setFeedback(error.message || 'The private file could not be opened.'); }
  };

  return <div className="space-y-7">
    <WorkspaceSectionHeader title="Proof" description="Server-acknowledged evidence submissions. Submitted does not mean verified." />
    {feedback && <p role="status" className="rounded-xl border border-brand-amber/25 bg-brand-amber/5 p-3 text-sm text-brand-amber">{feedback}</p>}
    {loading && entries.length === 0 ? <div className="surface-card flex items-center gap-3 p-5 text-sm text-text-muted"><Loader2 className="h-4 w-4 animate-spin" /> Loading private submission metadata…</div>
      : entries.length === 0 ? <WorkspaceEmptyState title="No evidence submitted yet" description="Draft Proof fields stay in Missions until you explicitly submit them." />
        : <div className="grid gap-5">{entries.map(({ week, submission }) => <article key={submission.id} className="surface-card p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-bold uppercase tracking-wider text-text-muted">Week {week.sequence} · Curriculum revision {submission.curriculumRevision}</p><h2 className="mt-1 text-base font-bold text-text-primary">{week.title}</h2></div><span className="rounded-full border border-brand-green/25 bg-brand-green/5 px-3 py-1.5 text-xs font-bold text-brand-green">Submitted · Not yet verified</span></div><div className="mt-5 grid gap-3">{submission.items.map((item) => <div key={item.id} className="rounded-xl border border-border-default bg-bg-soft p-4"><div className="flex items-start gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-default bg-bg-surface text-text-secondary">{item.kind === 'self_attestation' ? <CheckCircle2 className="h-4 w-4" /> : item.kind === 'file' ? <Archive className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wide text-text-muted">{item.evidenceRequirementId}</p><EvidenceItem item={item} onOpenAsset={openAsset} /></div></div></div>)}</div><p className="mt-4 text-xs text-text-muted">Submission revision {submission.submissionRevision} · {new Date(submission.submittedAt).toLocaleString()}</p></article>)}</div>}
  </div>;
}

function EvidenceItem({ item, onOpenAsset }) {
  if (item.kind === 'self_attestation') return <p className="mt-1 text-sm text-text-secondary">Learner self-attestation recorded.</p>;
  if (item.kind === 'text') return <p className="mt-1 whitespace-pre-wrap text-sm text-text-secondary">{item.payload.text}</p>;
  if (item.kind === 'url' || item.kind === 'repository') {
    const url = item.payload.url || item.payload.repositoryUrl;
    return <a href={url} target="_blank" rel="noopener noreferrer" className="mt-1 inline-flex items-center gap-1 break-all text-sm text-brand-blue">{url}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a>;
  }
  const asset = item.assets?.[0];
  return asset ? <button type="button" onClick={() => onOpenAsset(asset.id)} className="mt-1 inline-flex items-center gap-2 text-sm font-bold text-brand-blue"><Download className="h-4 w-4" /> {asset.originalFilename}</button> : <p className="mt-1 text-sm text-text-muted">Private file metadata unavailable.</p>;
}
