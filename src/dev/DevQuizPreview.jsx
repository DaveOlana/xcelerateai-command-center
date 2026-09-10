import React from 'react';
import QuizAssessment from '../components/missions/QuizAssessment';
import SkillCheckResults from '../components/missions/SkillCheckResults';
import RecoveryPrompt from '../components/missions/RecoveryPrompt';
import {
  applyRecoveryInsight,
  applyRecoveryResourceReview,
  applySubmittedAttempt,
  createSubmittedAttempt,
  isRecoveryLocked,
} from '../utils/skillCheckUtils.js';
import { quizPreviewFixture } from './quizPreviewFixture.js';

const EMPTY_RECORD = { attempts: [], consecutiveFailures: 0, recovery: null };

export default function DevQuizPreview() {
  const [record, setRecord] = React.useState(EMPTY_RECORD);
  const [active, setActive] = React.useState(false);
  const [selectedAttempt, setSelectedAttempt] = React.useState(null);

  const submit = (answers) => {
    const attempt = createSubmittedAttempt({
      definition: quizPreviewFixture,
      answers,
      attemptNumber: record.attempts.length + 1,
    });
    setRecord((current) => applySubmittedAttempt(current, attempt));
    setSelectedAttempt(attempt);
    setActive(false);
  };

  const simulateResourceReview = () => {
    const reviewedAt = new Date(Date.parse(record.recovery.lockedAt) + 1000).toISOString();
    setRecord((current) => applyRecoveryResourceReview(current, { resourceId: 'dev-resource', reviewedAt }));
  };

  const simulateInsight = () => {
    const createdAt = new Date(Date.parse(record.recovery.lockedAt) + 2000).toISOString();
    setRecord((current) => applyRecoveryInsight(current, {
      id: 'dev-insight',
      createdAt,
      noteType: 'study_insight',
      insightScope: 'study',
      linkedResource: '',
      content: 'Development-only recovery insight.',
    }));
  };

  const locked = isRecoveryLocked(record);
  return (
    <div className="space-y-4" data-dev-quiz-preview>
      <div className="rounded-2xl border border-brand-amber/30 bg-brand-amber/5 p-4 text-sm text-text-secondary">
        <p className="font-bold text-text-primary">Development preview · in memory only</p>
        <p className="mt-1">This fixture never changes curriculum, learner progress, unlock state, localStorage, or backups.</p>
        <button type="button" onClick={() => { setRecord(EMPTY_RECORD); setSelectedAttempt(null); setActive(false); }} className="btn-secondary mt-3 px-3 py-2 text-xs">Reset preview</button>
      </div>

      {active ? (
        <QuizAssessment definition={quizPreviewFixture} onSubmit={submit} onLeave={() => setActive(false)} />
      ) : selectedAttempt ? (
        <SkillCheckResults
          attempt={selectedAttempt}
          canRetry={!selectedAttempt.passed && record.consecutiveFailures < 2}
          onRetry={() => { setSelectedAttempt(null); setActive(true); }}
          onReturnToStudy={() => setSelectedAttempt(null)}
          onContinueToBuild={() => setSelectedAttempt(null)}
        />
      ) : locked ? (
        <div className="space-y-4">
          <RecoveryPrompt recovery={record.recovery} />
          <div className="surface-card surface-card--compact p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-text-muted">Development-only recovery controls</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" onClick={simulateResourceReview} className="btn-secondary px-3 py-2 text-xs">Simulate resource review</button>
              <button type="button" onClick={simulateInsight} className="btn-secondary px-3 py-2 text-xs">Simulate Study insight</button>
            </div>
          </div>
        </div>
      ) : (
        <section className="surface-card p-7">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-violet">Skill Check preview</p>
          <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary">{quizPreviewFixture.title}</h2>
          {record.recovery?.recoveredAt && <p className="mt-2 text-sm font-semibold text-emerald-500">Recovery complete. A fresh two-attempt cycle is available.</p>}
          <button type="button" onClick={() => setActive(true)} className="btn-primary mt-5 px-5 py-2.5 text-sm">Take Skill Check</button>
        </section>
      )}
    </div>
  );
}
