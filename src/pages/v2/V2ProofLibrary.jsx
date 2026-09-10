import React from 'react';
import { CheckCircle2, ExternalLink, FileText } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { WorkspaceEmptyState, WorkspaceSectionHeader } from '../../components/workspace/WorkspacePrimitives';

export default function V2ProofLibrary() {
  const { activeV2Curriculum: curriculum, activeV2Learner: learner } = useApp();
  const entries = curriculum.weeks.flatMap((week) => {
    const records = learner?.proofs?.[week.proof.id]?.evidence || {};
    return week.proof.evidence.filter((item) => records[item.id]?.value === true || String(records[item.id]?.value || '').trim()).map((item) => ({ week, proof: week.proof, item, value: records[item.id].value }));
  });
  return <div className="space-y-7"><WorkspaceSectionHeader title="Proof" description="Evidence submitted through authored curriculum requirements." />{entries.length === 0 ? <WorkspaceEmptyState title="No proof recorded yet" description="Completed Proof items from Missions will appear here." /> : <div className="grid gap-4">{entries.map(({ week, proof, item, value }) => <article key={item.id} className="surface-card p-5"><div className="flex items-start gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl border border-brand-green/25 bg-brand-green/10 text-brand-green">{item.type === 'confirmation' ? <CheckCircle2 className="h-4 w-4" /> : <FileText className="h-4 w-4" />}</span><div className="min-w-0 flex-1"><p className="text-xs font-bold uppercase tracking-wider text-text-muted">Week {week.sequence} · {proof.id}</p><h2 className="mt-1 text-sm font-bold text-text-primary">{item.label}</h2>{item.type === 'link' ? <a href={value} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-1 break-all text-sm text-brand-blue">{value}<ExternalLink className="h-3.5 w-3.5 shrink-0" /></a> : item.type === 'text' ? <p className="mt-2 whitespace-pre-wrap text-sm text-text-secondary">{value}</p> : <p className="mt-2 text-sm text-text-secondary">Confirmed</p>}</div></div></article>)}</div>}</div>;
}
