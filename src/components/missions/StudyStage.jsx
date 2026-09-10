import React from 'react';
import { Check, CheckCircle2, Lightbulb, LockKeyhole, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import ResourceCard from '../education/learning-kit/ResourceCard';
import {
  canMarkResourceComplete,
  getResourceActivity,
  getResourceIdentity,
  getStudyRequirementStatus,
  getWeekIdentity,
} from '../../utils/resourceActivity.js';

export default function StudyStage({
  roadmap,
  roadmapId,
  week,
  mission,
  skillCheckDefinition,
  assessmentRecord,
  skillCheckUnlocked,
  onSelectStage,
}) {
  const {
    resourcesStatus,
    updateResourceStatus,
    resourceActivity,
    recordResourceOpen,
    addStudyInsight,
  } = useApp();
  const [expandedResource, setExpandedResource] = React.useState(null);
  const [resourceInsights, setResourceInsights] = React.useState({});
  const [generalInsightOpen, setGeneralInsightOpen] = React.useState(false);
  const [generalInsight, setGeneralInsight] = React.useState('');
  const [feedback, setFeedback] = React.useState('');
  const requirement = getStudyRequirementStatus(week, resourcesStatus);
  const weekId = getWeekIdentity(week);
  const skillCheckId = skillCheckDefinition?.mode === 'quiz' ? skillCheckDefinition.skillCheckId : null;
  const recovery = assessmentRecord?.recovery;
  const recoveryActive = Boolean(recovery?.lockedAt && !recovery?.recoveredAt);

  const resourceState = (resource) => {
    const resourceId = getResourceIdentity(resource, week);
    const activity = getResourceActivity(resourceActivity, roadmapId, weekId, resourceId);
    const status = resourcesStatus[resource.title] || 'Not Started';
    return { resourceId, activity, status };
  };

  const openResource = (resource) => {
    const { resourceId, status } = resourceState(resource);
    recordResourceOpen({
      roadmapId,
      weekId,
      resourceId,
      title: resource.title,
      skillCheckId,
    });
    if (status === 'Not Started') updateResourceStatus(resource.title, 'Studying');
  };

  const markComplete = (resource) => {
    const allowed = canMarkResourceComplete({
      week,
      resource,
      resourcesStatus,
      resourceActivity,
      roadmapId,
    });
    if (!allowed) {
      setFeedback('Open the resource before marking it complete.');
      return;
    }
    updateResourceStatus(resource.title, 'Studied');
    setFeedback(`${resource.title} marked complete.`);
  };

  const saveInsight = ({ scope, resource = null }) => {
    const value = scope === 'study' ? generalInsight : resourceInsights[getResourceIdentity(resource, week)] || '';
    if (!value.trim()) return;
    addStudyInsight({
      roadmapId,
      skillCheckId,
      insightScope: scope,
      title: scope === 'study' ? `Study insight — Week ${week.weekNumber}` : `Resource insight — ${resource.title}`,
      content: value.trim(),
      whatLearned: value.trim(),
      linkedWeek: week.weekNumber,
      linkedResource: scope === 'resource' ? resource.title : '',
      roadmapTitle: roadmap?.shortTitle || roadmap?.title || '',
    });
    if (scope === 'study') {
      setGeneralInsight('');
      setGeneralInsightOpen(false);
      setFeedback('Study insight saved.');
    } else {
      const key = getResourceIdentity(resource, week);
      setResourceInsights((current) => ({ ...current, [key]: '' }));
      setFeedback(`Insight saved for ${resource.title}.`);
    }
  };

  const renderResource = (resource, isCore) => {
    const { resourceId, activity, status } = resourceState(resource);
    const canComplete = canMarkResourceComplete({ week, resource, resourcesStatus, resourceActivity, roadmapId });
    const detailsOpen = expandedResource === resourceId;
    return (
      <ResourceCard
        key={resourceId}
        resource={resource}
        onOpen={openResource}
        detailsOpen={detailsOpen}
        onToggleDetails={() => setExpandedResource(detailsOpen ? null : resourceId)}
        className={status === 'Studied' ? 'border-emerald-500/25' : ''}
        headerRight={isCore && requirement.mode === 'core-minimum' ? <span className="rounded-full bg-brand-violet/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-violet">Core</span> : null}
        statusBadge={
          <span className={`flex items-center gap-1.5 text-xs font-semibold ${status === 'Studied' ? 'text-emerald-500' : 'text-text-muted'}`}>
            {status === 'Studied' && <Check className="h-3.5 w-3.5" />}{status}
          </span>
        }
        footer={status === 'Studied' ? (
          <div className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-sm font-bold text-emerald-500">
            <CheckCircle2 className="h-4 w-4" /> Complete
          </div>
        ) : (
          <button type="button" disabled={!canComplete} onClick={() => markComplete(resource)} className="btn-secondary w-full px-4 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-45">
            {canComplete ? 'Mark complete' : <span className="flex items-center justify-center gap-2"><LockKeyhole className="h-4 w-4" /> Open before completing</span>}
          </button>
        )}
        detailsContent={
          <div className="space-y-4">
            {(resource.whatToExpect || resource.missionObjective) && <p className="text-sm leading-relaxed text-text-secondary">{resource.whatToExpect || resource.missionObjective}</p>}
            {(resource.exactLocation || resource.stopPoint) && (
              <div className="rounded-xl border border-border-default bg-bg-surface p-3 text-xs leading-relaxed text-text-secondary">
                {resource.exactLocation && <p><span className="font-bold text-text-primary">Start:</span> {resource.exactLocation}</p>}
                {resource.stopPoint && <p className="mt-1"><span className="font-bold text-text-primary">Stop:</span> {resource.stopPoint}</p>}
              </div>
            )}
            {activity?.lastOpenedAt && <p className="text-xs text-text-muted">Last opened {new Date(activity.lastOpenedAt).toLocaleString()}</p>}
            <div>
              <label htmlFor={`resource-insight-${resourceId}`} className="mb-2 block text-xs font-bold text-text-primary">Optional resource insight</label>
              <textarea id={`resource-insight-${resourceId}`} rows={2} value={resourceInsights[resourceId] || ''} onChange={(event) => setResourceInsights((current) => ({ ...current, [resourceId]: event.target.value }))} className="input-base w-full text-sm" placeholder="What became clearer?" />
              <button type="button" onClick={() => saveInsight({ scope: 'resource', resource })} disabled={!resourceInsights[resourceId]?.trim()} className="btn-secondary mt-2 px-3 py-2 text-xs disabled:opacity-40">Save insight</button>
            </div>
          </div>
        }
      />
    );
  };

  return (
    <div className="space-y-6">
      <section className="surface-card surface-card--hero p-6 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Stage 1 · Study</p>
        <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="font-heading text-2xl font-extrabold text-text-primary">Build enough understanding to move forward.</h2>
            {requirement.mode === 'core-minimum' ? (
              <div className="mt-3">
                <p className="text-sm font-bold text-text-primary">Core resources · {requirement.completedCore} of {requirement.coreResources.length} completed</p>
                <p className="mt-1 text-sm text-text-secondary">Complete any {requirement.minimumRequired} to unlock Skill Check.</p>
              </div>
            ) : (
              <p className="mt-3 text-sm text-text-secondary">Complete the required resources at the depth this week needs.</p>
            )}
          </div>
          {requirement.mode === 'core-minimum' && (
            <div className="w-full max-w-xs">
              <div className="mb-2 flex justify-between text-xs font-semibold text-text-muted"><span>Study progress</span><span>{Math.min(requirement.completedCore, requirement.minimumRequired)}/{requirement.minimumRequired}</span></div>
              <div className="h-2 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-gradient-to-r from-brand-violet to-brand-cyan transition-[width] duration-200" style={{ width: `${Math.min(100, (requirement.completedCore / requirement.minimumRequired) * 100)}%` }} /></div>
            </div>
          )}
        </div>
      </section>

      {recoveryActive && (
        <section className="rounded-2xl border border-brand-violet/25 bg-brand-violet/5 p-5">
          <p className="text-sm font-bold text-text-primary">Recovery Study</p>
          <p className="mt-1 text-sm text-text-secondary">Open one resource and write one new general Study insight.</p>
          <div className="mt-3 flex flex-wrap gap-4 text-xs font-semibold text-text-secondary">
            <span>{recovery.resourceReviewedAt ? '✓' : '○'} Review a resource</span>
            <span>{recovery.insightCreatedAt ? '✓' : '○'} Write a new insight</span>
          </div>
        </section>
      )}

      {feedback && <p className="rounded-xl border border-border-default bg-bg-soft px-4 py-3 text-sm font-semibold text-text-primary" role="status">{feedback}</p>}

      {mission.resources.length === 0 ? (
        <section className="surface-card p-8 text-center text-sm text-text-secondary">No Study resources were supplied for this week.</section>
      ) : (
        <>
          <section>
            <div className="mb-4 flex items-end justify-between gap-4">
              <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">{requirement.mode === 'core-minimum' ? 'Core resources' : 'Study resources'}</p><h2 className="mt-1 font-heading text-xl font-extrabold text-text-primary">Choose your next resource</h2></div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">{requirement.coreResources.map((resource) => renderResource(resource, true))}</div>
          </section>
          {requirement.optionalResources.length > 0 && (
            <section className="rounded-[1.5rem] border border-border-default bg-bg-soft p-5 sm:p-6">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-text-muted">Reinforcement · Optional</p>
              <p className="mt-1 text-sm text-text-secondary">Use these when another format would help the idea click.</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">{requirement.optionalResources.map((resource) => renderResource(resource, false))}</div>
            </section>
          )}
        </>
      )}

      <section className="surface-card surface-card--compact p-5 sm:p-6">
        <button type="button" onClick={() => setGeneralInsightOpen((value) => !value)} aria-expanded={generalInsightOpen} className="flex w-full items-center justify-between gap-4 text-left">
          <span className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-violet/10 text-brand-violet"><Lightbulb className="h-4 w-4" /></span><span><span className="block text-sm font-bold text-text-primary">Add a Study insight</span><span className="block text-xs text-text-muted">Optional during ordinary Study</span></span></span>
          <Sparkles className="h-4 w-4 text-text-muted" />
        </button>
        {generalInsightOpen && (
          <div className="mt-5 border-t border-border-divider pt-5">
            <label htmlFor="general-study-insight" className="mb-2 block text-sm font-bold text-text-primary">What is clearer now?</label>
            <textarea id="general-study-insight" rows={3} value={generalInsight} onChange={(event) => setGeneralInsight(event.target.value)} className="input-base w-full text-sm" placeholder="Capture one useful idea in your own words..." />
            <button type="button" disabled={!generalInsight.trim()} onClick={() => saveInsight({ scope: 'study' })} className="btn-primary mt-3 px-4 py-2.5 text-sm disabled:opacity-40">Save insight</button>
          </div>
        )}
      </section>

      {skillCheckUnlocked && (
        <div className="flex justify-end">
          <button type="button" onClick={() => onSelectStage('skillcheck')} className="btn-primary px-5 py-2.5 text-sm">Take Skill Check</button>
        </div>
      )}
    </div>
  );
}
