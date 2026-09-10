import React, { useCallback, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Download,
  FileJson,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { validateRoadmapJSON } from '../utils/jsonValidator';
import { PageShell } from '../components/common/UIComponents';
import ConfirmAction from '../components/ui/ConfirmAction';
import StatusBanner from '../components/ui/StatusBanner';

function ValidationGroup({ title, items, tone = 'neutral', open = false }) {
  if (!Array.isArray(items) || items.length === 0) return null;
  const tones = {
    error: 'border-red-500/20 bg-red-500/5 text-red-500',
    warning: 'border-brand-amber/20 bg-brand-amber/5 text-brand-amber',
    info: 'border-brand-blue/20 bg-brand-blue/5 text-brand-blue',
    neutral: 'border-border-default bg-bg-soft text-text-secondary',
  };
  return (
    <details open={open} className={`group rounded-xl border p-4 ${tones[tone]}`}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-blue">
        <span>{title} ({items.length})</span>
        <ChevronRight className="h-4 w-4 transition-transform duration-200 group-open:rotate-90 motion-reduce:transition-none" aria-hidden="true" />
      </summary>
      <ul className="mt-3 space-y-2 border-t border-current/10 pt-3">
        {items.map((item, index) => <li key={`${index}-${item}`} className="text-xs leading-relaxed text-text-secondary">{item}</li>)}
      </ul>
    </details>
  );
}

export default function ImportRoadmap() {
  const { importRoadmap, resetToSampleRoadmap, settings, exportProgress } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [busy, setBusy] = useState(false);

  const processFile = useCallback((file) => {
    setFeedback(null);
    setValidationResult(null);
    setPendingData(null);
    setShowImportConfirm(false);
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.json')) {
      setFeedback({ type: 'error', text: 'Choose a JSON curriculum file.' });
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (parsed?.schemaVersion === '2.0') {
          setFeedback({ type: 'error', text: 'V2 Curriculum Source must be validated, compiled, runtime-validated, and published through the V2 catalog pipeline. This legacy import utility cannot activate raw V2 source.' });
          return;
        }
        if (parsed?.runtimeContractVersion === '2.0') {
          setFeedback({ type: 'error', text: 'Compiled V2 runtime files cannot be activated directly. Published V2 curricula are loaded only from the embedded catalog.' });
          return;
        }
        const result = validateRoadmapJSON(parsed);
        setValidationResult(result);
        if (result.valid) setPendingData(result.normalizedData);
      } catch {
        setFeedback({ type: 'error', text: 'This file is not valid JSON. Check its formatting and try again.' });
      }
    };
    reader.onerror = () => setFeedback({ type: 'error', text: 'The curriculum file could not be read.' });
    reader.readAsText(file);
  }, []);

  const unknownTopLevelFields = useMemo(() => {
    if (!pendingData) return {};
    const knownFields = ['bootcampTitle', 'title', 'shortTitle', 'learner', 'duration', 'weeklyHours', 'months', 'weeks', 'projects', 'checkpoints', 'templates'];
    return Object.fromEntries(Object.entries(pendingData).filter(([key]) => !knownFields.includes(key)));
  }, [pendingData]);

  const confirmImport = () => {
    if (!pendingData) return;
    setBusy(true);
    importRoadmap(pendingData);
    setBusy(false);
    setShowImportConfirm(false);
    setPendingData(null);
    setValidationResult(null);
    setFeedback({ type: 'success', text: 'Curriculum imported and activated.' });
  };

  const confirmReset = () => {
    setBusy(true);
    resetToSampleRoadmap();
    setBusy(false);
    setShowResetConfirm(false);
    setPendingData(null);
    setValidationResult(null);
    setFeedback({ type: 'success', text: 'The bundled curriculum is now active.' });
  };

  const summary = validationResult?.summary || {};
  const summaryFacts = [
    ['Months', summary.months],
    ['Weeks', summary.weeks],
    ['Study resources', summary.studyResources ?? summary.resources],
    ['Skill Check questions', summary.skillCheckQuestions ?? 0],
    ['Practical missions', summary.practicalMissions],
    ['Projects', summary.projects],
    ['Checkpoints', summary.checkpoints],
  ];

  return (
    <PageShell className="max-w-3xl">
      <header>
        <Link to="/settings#advanced-settings" className="inline-flex items-center gap-1.5 text-xs font-semibold text-text-muted hover:text-text-primary"><ArrowLeft className="h-3.5 w-3.5" /> Back to Settings</Link>
        <p className="mt-7 text-xs font-bold uppercase tracking-[0.15em] text-brand-violet">Advanced</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-text-primary">Import curriculum</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-secondary">Validate a curriculum file, review its result, and confirm before replacing your active course.</p>
      </header>

      {feedback && <StatusBanner type={feedback.type} message={feedback.text} onClose={() => setFeedback(null)} />}

      <section className="border-y border-border-divider py-5">
        <div className="flex items-center gap-3">
          <span className={`h-2.5 w-2.5 rounded-full ${settings?.usingCustomRoadmap ? 'bg-brand-green' : 'bg-text-muted'}`} aria-hidden="true" />
          <div><h2 className="text-sm font-semibold text-text-primary">{settings?.usingCustomRoadmap ? 'Imported curriculum active' : 'Bundled curriculum active'}</h2><p className="mt-0.5 text-xs text-text-muted">Import is optional and intended for custom-course management.</p></div>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-bold text-text-primary">1. Choose curriculum</h2>
        <label
          htmlFor="curriculum-file"
          onDragOver={(event) => { event.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => { event.preventDefault(); setDragOver(false); processFile(event.dataTransfer.files?.[0]); }}
          className={`mt-4 flex cursor-pointer flex-col items-center rounded-[22px] border border-dashed p-8 text-center transition-colors duration-200 motion-reduce:transition-none ${dragOver ? 'border-brand-blue bg-brand-blue/10' : 'border-border-strong bg-bg-soft hover:border-brand-blue/50'}`}
        >
          <FileJson className="h-7 w-7 text-brand-blue" aria-hidden="true" />
          <span className="mt-3 text-sm font-semibold text-text-primary">Drop a curriculum JSON file here</span>
          <span className="mt-1 text-xs text-text-muted">or choose a file from your device</span>
          <span className="btn-secondary mt-4 px-4 py-2 text-xs"><Upload className="h-3.5 w-3.5" /> Choose file</span>
          <input id="curriculum-file" type="file" accept=".json,application/json" className="sr-only" onChange={(event) => { processFile(event.target.files?.[0]); event.target.value = ''; }} />
        </label>
      </section>

      {validationResult && (
        <section className="border-t border-border-divider pt-8">
          <div className="flex items-start gap-3">
            {validationResult.valid ? <CheckCircle2 className="mt-0.5 h-5 w-5 text-brand-green" /> : <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />}
            <div><h2 className="text-lg font-bold text-text-primary">2. {validationResult.valid ? 'Validation passed' : 'Validation needs attention'}</h2><p className="mt-1 text-sm text-text-secondary">{validationResult.valid ? 'Review the curriculum summary before importing.' : 'Resolve the blocking errors in the file, then validate it again.'}</p></div>
          </div>

          {validationResult.valid && (
            <div className="mt-6 rounded-2xl border border-border-default bg-bg-soft p-5">
              <h3 className="text-base font-bold text-text-primary">{summary.bootcampTitle || pendingData?.title || pendingData?.bootcampTitle || 'Curriculum summary'}</h3>
              <dl className="mt-5 grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-4">
                {summaryFacts.map(([label, value]) => <div key={label}><dt className="text-[11px] text-text-muted">{label}</dt><dd className="mt-1 text-lg font-bold text-text-primary">{value ?? '—'}</dd></div>)}
              </dl>
            </div>
          )}

          <div className="mt-5 space-y-3">
            <ValidationGroup title="Blocking errors" items={validationResult.errors} tone="error" open />
            <ValidationGroup title="Warnings" items={validationResult.warnings} tone="warning" open={(validationResult.warnings?.length || 0) < 3} />
            <ValidationGroup title="Validation information" items={validationResult.info} tone="info" />
            {Object.keys(unknownTopLevelFields).length > 0 && (
              <details className="group rounded-xl border border-border-default bg-bg-soft p-4">
                <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-text-secondary"><span>Additional curriculum fields ({Object.keys(unknownTopLevelFields).length})</span><ChevronRight className="h-4 w-4 transition-transform group-open:rotate-90" /></summary>
                <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-border-default bg-bg-surface p-3 text-xs text-text-secondary"><code>{JSON.stringify(unknownTopLevelFields, null, 2)}</code></pre>
              </details>
            )}
          </div>

          {validationResult.valid && pendingData && (
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => setShowImportConfirm(true)} className="btn-primary justify-center px-5 py-2.5 text-sm">Confirm import</button>
              <button type="button" onClick={() => { setPendingData(null); setValidationResult(null); }} className="btn-secondary justify-center px-5 py-2.5 text-sm">Cancel</button>
            </div>
          )}
        </section>
      )}

      <section className="border-t border-border-divider pt-8">
        <h2 className="text-lg font-bold text-text-primary">Course recovery</h2>
        <p className="mt-1 text-sm text-text-secondary">Restore the bundled curriculum using the application’s existing reset behavior.</p>
        <button type="button" onClick={() => setShowResetConfirm(true)} className="btn-secondary mt-4 justify-center gap-2 px-4 py-2.5 text-sm"><RefreshCw className="h-4 w-4" /> Restore bundled curriculum</button>
      </section>

      {showImportConfirm && (
        <ConfirmAction
          title="Import this curriculum?"
          description={<div className="space-y-3"><p>This replaces the active curriculum and resets its associated progress using the existing import behavior.</p><button type="button" onClick={exportProgress} className="btn-secondary inline-flex gap-2 px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" /> Download backup first</button></div>}
          confirmLabel="Import curriculum"
          onConfirm={confirmImport}
          onCancel={() => setShowImportConfirm(false)}
          isLoading={busy}
        />
      )}
      {showResetConfirm && (
        <ConfirmAction
          title="Restore the bundled curriculum?"
          description={<div className="space-y-3"><p>This replaces the current curriculum and removes progress associated with it.</p><button type="button" onClick={exportProgress} className="btn-secondary inline-flex gap-2 px-3 py-2 text-xs"><Download className="h-3.5 w-3.5" /> Download backup first</button></div>}
          confirmLabel="Restore curriculum"
          onConfirm={confirmReset}
          onCancel={() => setShowResetConfirm(false)}
          isLoading={busy}
        />
      )}
    </PageShell>
  );
}
