import React, { useState, useCallback, useMemo } from 'react';
import { Upload, CheckCircle2, AlertCircle, FileJson, Trash2, RefreshCw, Info, ChevronDown, ChevronUp, ChevronRight, Calendar, Clock, BookOpen, CheckSquare, Target, FileText, Zap, Coffee, BarChart2, Award, Shield } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { validateRoadmapJSON } from '../utils/jsonValidator';
import { PageShell, PageHeader, SectionCard, CommandButton, SecondaryButton, StatusBadge, InfoPill } from '../components/common/UIComponents';

export default function ImportRoadmap() {
  const { importRoadmap, resetToSampleRoadmap, settings } = useApp();
  const [dragOver, setDragOver] = useState(false);
  const [validationResult, setValidationResult] = useState(null);
  const [pendingData, setPendingData] = useState(null);
  const [imported, setImported] = useState(false);
  const [error, setError] = useState('');
  const [showSummary, setShowSummary] = useState(true);

  const processFile = useCallback((file) => {
    setError('');
    setValidationResult(null);
    setPendingData(null);
    setImported(false);

    if (!file) return;
    if (!file.name.endsWith('.json')) {
      setError('Please upload a .json file. PDFs and other formats are not supported in Version 1.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        const result = validateRoadmapJSON(data);
        setValidationResult(result);
        if (result.valid) {
          // Store the raw JSON; AppContext.importRoadmap will normalize it
          setPendingData(result.normalizedData);
        }
        setShowSummary(true);
      } catch (err) {
        setError('Invalid JSON file. Please check that the file is properly formatted.');
      }
    };
    reader.onerror = () => setError('Failed to read the file. Please try again.');
    reader.readAsText(file);
  }, []);

  const handleFileInput = (e) => {
    processFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFile(e.dataTransfer.files?.[0]);
  };

  const handleConfirmImport = () => {
    if (!pendingData) return;
    importRoadmap(pendingData);
    setImported(true);
    setPendingData(null);
    setValidationResult(null);
  };

  const handleReset = () => {
    if (window.confirm('This will reset to the sample roadmap and clear all your progress. Are you sure?')) {
      resetToSampleRoadmap();
      setImported(false);
      setValidationResult(null);
      setPendingData(null);
    }
  };

  // ── EXTRACT UNKNOWN TOP LEVEL FIELDS ──
  const unknownTopLevelFields = useMemo(() => {
    if (!pendingData) return {};
    const knownFields = ['bootcampTitle', 'learner', 'duration', 'weeklyHours', 'months', 'projects', 'checkpoints'];
    const fields = {};
    Object.keys(pendingData).forEach((key) => {
      if (!knownFields.includes(key)) {
        fields[key] = pendingData[key];
      }
    });
    return fields;
  }, [pendingData]);

  return (
    <PageShell className="max-w-2xl">
      <PageHeader
        title="Import Roadmap"
        subtitle={
          <span>
            Upload your <code className="text-accent-primary bg-navy-700 px-1.5 py-0.5 rounded font-mono text-xs">roadmap-data.json</code> file to load your custom learning track.
          </span>
        }
      />

      {/* Status banner */}
      <div className="card flex items-center gap-3">
        <div className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${settings.usingCustomRoadmap ? 'bg-accent-primary animate-pulse' : 'bg-amber-400'}`} />
        <div>
          <p className="text-sm font-medium text-white">
            {settings.usingCustomRoadmap ? 'Custom roadmap loaded' : 'Using sample roadmap'}
          </p>
          <p className="text-xs text-slate-500">
            {settings.usingCustomRoadmap
              ? 'Your imported roadmap-data.json is active.'
              : 'Import your roadmap-data.json to configure custom tracks, missions, and checkpoints.'}
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative border-2 border-dashed rounded-2xl p-10 text-center transition-all duration-300 cursor-pointer
          ${dragOver
            ? 'border-accent-primary bg-accent-primary/10'
            : 'border-navy-400 hover:border-accent-primary/50 hover:bg-navy-700/50'
          }`}
        onClick={() => document.getElementById('json-upload').click()}
      >
        <input
          id="json-upload"
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleFileInput}
        />

        <div className="flex flex-col items-center gap-3">
          <div className={`w-16 h-16 rounded-2xl border-2 flex items-center justify-center transition-all duration-300
            ${dragOver ? 'border-accent-primary bg-accent-primary/20' : 'border-navy-300 bg-navy-700'}`}
          >
            <FileJson className={`w-8 h-8 ${dragOver ? 'text-accent-primary' : 'text-slate-400'}`} />
          </div>

          <div>
            <p className="text-white font-semibold text-lg">
              {dragOver ? 'Drop your JSON file here' : 'Drop roadmap-data.json here'}
            </p>
            <p className="text-slate-500 text-sm mt-1">or click to browse your files</p>
          </div>

          <div className="flex items-center gap-2">
            <span className="badge-blue">JSON only</span>
            <span className="badge-slate">Version 1</span>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/30 rounded-xl animate-scale-in">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-red-400 font-medium text-sm">Import Failed</p>
            <p className="text-red-400/70 text-sm mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Validation Result */}
      {validationResult && (
        <div className={`card animate-scale-in ${validationResult.valid ? 'border-accent-primary/30' : 'border-red-500/30'}`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              {validationResult.valid
                ? <CheckCircle2 className="w-5 h-5 text-accent-primary" />
                : <AlertCircle className="w-5 h-5 text-red-400" />
              }
              <h3 className="font-semibold text-white">
                {validationResult.valid ? 'Validation Passed ✓' : 'Validation Failed ✗'}
              </h3>
            </div>
            <button
              onClick={() => setShowSummary(!showSummary)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              {showSummary ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {showSummary && (
            <div className="space-y-4">
              {/* Summary Grid */}
              {validationResult.valid && (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: 'Months', value: validationResult.summary.months, color: 'text-accent-primary', icon: Calendar },
                    { label: 'Weeks', value: validationResult.summary.weeks, color: 'text-blue-400', icon: Clock },
                    { label: 'Study Resources', value: validationResult.summary.studyResources ?? validationResult.summary.resources, color: 'text-amber-400', icon: BookOpen },
                    { label: 'Skill Check Qs', value: validationResult.summary.skillCheckQuestions ?? 0, color: 'text-cyan-400', icon: CheckSquare },
                    { label: 'Practical Missions', value: validationResult.summary.practicalMissions, color: 'text-pink-400', icon: Target },
                    { label: 'Proof Items', value: validationResult.summary.proofItems ?? 0, color: 'text-purple-400', icon: FileText },
                    { label: 'Reflection Prompts', value: validationResult.summary.reflectionPrompts ?? 0, color: 'text-teal-400', icon: Zap },
                    { label: 'Scheduled Sessions', value: validationResult.summary.scheduledSessions ?? validationResult.summary.sessions, color: 'text-orange-400', icon: Coffee },
                    { label: 'Readiness Categories', value: validationResult.summary.readinessCategories, color: 'text-rose-400', icon: BarChart2 },
                    { label: 'Projects', value: validationResult.summary.projects, color: 'text-emerald-400', icon: Award },
                    { label: 'Checkpoints', value: validationResult.summary.checkpoints, color: 'text-blue-400', icon: Shield },
                  ].map(({ label, value, color, icon: Icon }) => (
                    <div key={label} className="bg-navy-850/60 border border-navy-750/30 rounded-xl p-3 flex flex-col items-center justify-center text-center shadow-sm hover:border-navy-450 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-navy-900 border border-navy-750/50 flex items-center justify-center mb-1.5">
                        <Icon className={`w-4 h-4 ${color}`} />
                      </div>
                      <p className={`text-lg font-mono font-bold text-white`}>{value ?? '—'}</p>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-slate-500 mt-0.5">{label}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Learner info */}
              {validationResult.valid && (
                <div className="bg-navy-800 rounded-lg p-3 border border-navy-400">
                  <p className="text-xs text-slate-500">Bootcamp Target</p>
                  <p className="text-sm font-semibold text-white">{validationResult.summary.bootcampTitle}</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Learner: <span className="text-white font-bold">{validationResult.summary.learner}</span>
                  </p>
                </div>
              )}

              {/* Unknown Fields Accordion */}
              {validationResult.valid && Object.keys(unknownTopLevelFields).length > 0 && (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-3">
                  <details className="group">
                    <summary className="flex items-center justify-between text-xs font-bold text-amber-400 cursor-pointer select-none">
                      <span className="flex items-center gap-1.5">
                         ADDITIONAL ROADMAP DATA ({Object.keys(unknownTopLevelFields).length} Custom Attribute{Object.keys(unknownTopLevelFields).length !== 1 ? 's' : ''})
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-3 border-t border-navy-400/50 pt-2 space-y-3">
                      {Object.entries(unknownTopLevelFields).map(([key, val]) => (
                        <div key={key} className="text-xs">
                          <span className="font-bold text-slate-300 block uppercase tracking-wider">{key}:</span>
                          {typeof val === 'object' ? (
                            <pre className="bg-navy-950 font-mono text-[13px] text-slate-400 rounded p-2 overflow-x-auto mt-1 max-w-full">
                              <code>{JSON.stringify(val, null, 2)}</code>
                            </pre>
                          ) : (
                            <p className="text-slate-300 mt-0.5">{val.toString()}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Errors */}
              {validationResult.errors && validationResult.errors.length > 0 && (
                <div className="border border-red-500/25 bg-red-500/5 rounded-xl p-3.5">
                  <details className="group" open={true}>
                    <summary className="flex items-center justify-between text-xs font-bold text-red-400 cursor-pointer select-none">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        Errors (Must Fix) ({validationResult.errors.length})
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-3 border-t border-navy-400/50 pt-2.5 space-y-2">
                      {validationResult.errors.map((err, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-red-300">
                          <span className="text-red-500 mt-0.5">✗</span>
                          <span>{err}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Warnings */}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <div className="border border-amber-500/20 bg-amber-500/5 rounded-xl p-3.5">
                  <details className="group" open={validationResult.warnings.length < 3}>
                    <summary className="flex items-center justify-between text-xs font-bold text-amber-400 cursor-pointer select-none">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        Warnings (Optional) ({validationResult.warnings.length})
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-3 border-t border-navy-400/50 pt-2.5 space-y-2">
                      {validationResult.warnings.map((w, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-amber-300/80">
                          <span className="text-amber-500 mt-0.5">⚠</span>
                          <span>{w}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}

              {/* Auto-fixed / Info */}
              {validationResult.info && validationResult.info.length > 0 && (
                <div className="border border-blue-500/20 bg-blue-500/5 rounded-xl p-3.5">
                  <details className="group" open={validationResult.info.length < 3}>
                    <summary className="flex items-center justify-between text-xs font-bold text-blue-450 cursor-pointer select-none">
                      <span className="flex items-center gap-1.5 uppercase tracking-wider">
                        Auto-Fixed / Info ({validationResult.info.length})
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-500 group-open:rotate-90 transition-transform" />
                    </summary>
                    <div className="mt-3 border-t border-navy-400/50 pt-2.5 space-y-2">
                      {validationResult.info.map((inf, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs text-blue-300/80">
                          <span className="text-blue-500 mt-0.5">✓</span>
                          <span>{inf}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                </div>
              )}
            </div>
          )}

          {/* Confirm Button */}
          {validationResult.valid && pendingData && (
            <div className="mt-4 pt-4 border-t border-navy-400">
              <p className="text-xs text-slate-500 mb-3">
                Importing will replace the current roadmap layout and reset your progress files.
              </p>
              <button onClick={handleConfirmImport} className="btn-primary w-full flex items-center justify-center gap-2 py-3">
                <Upload className="w-4 h-4" />
                Confirm Import
              </button>
            </div>
          )}
        </div>
      )}

      {/* Success */}
      {imported && (
        <div className="flex items-start gap-3 p-4 bg-accent-primary/10 border border-accent-primary/30 rounded-xl animate-scale-in">
          <CheckCircle2 className="w-5 h-5 text-accent-primary flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-accent-primary font-semibold">Roadmap imported successfully!</p>
            <p className="text-accent-primary/70 text-sm mt-0.5">Your dashboard is now loaded with the custom roadmap configuration.</p>
          </div>
        </div>
      )}

      {/* Reset to Sample */}
      <div className="card border-dashed">
        <div className="flex items-start gap-3">
          <RefreshCw className="w-5 h-5 text-slate-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-white text-sm">Reset to Sample Roadmap</h3>
            <p className="text-xs text-slate-500 mt-1">
              Wipe custom configurations and restore the built-in sample roadmap.
            </p>
            <button
              onClick={handleReset}
              className="btn-danger text-sm mt-3 flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              Reset to Sample
            </button>
          </div>
        </div>
      </div>

      {/* JSON Structure Reference */}
      <div className="card">
        <div className="flex items-center gap-2 mb-3">
          <Info className="w-4 h-4 text-blue-400" />
          <h3 className="font-semibold text-white text-sm">Expected JSON Structure</h3>
        </div>
        <p className="text-xs text-slate-500 mb-3">
          Your custom roadmap schema should adhere to the following JSON blueprint:
        </p>
        <pre className="bg-navy-900 rounded-lg p-4 text-xs text-slate-300 overflow-x-auto font-mono leading-relaxed">
{`{
  "bootcampTitle": "Your bootcamp name",
  "learner": "Your name",
  "duration": "6 months",
  "weeklyHours": "15-20 hours",
  "months": [ { ... } ],
  "projects": [ { ... } ],
  "checkpoints": [ { ... } ]
}`}
        </pre>
        <p className="text-xs text-slate-500 mt-3">
          A templates list is available in <code className="text-accent-primary bg-navy-800 px-1 rounded">/public/roadmap-data.json</code> of this workspace.
        </p>
      </div>

      {/* AI PDF Future Section */}
      <div className="card border-dashed border-slate-700 opacity-60">
        <div className="flex items-center gap-3 mb-3">
          <div className="badge-slate">Coming in Version 2</div>
        </div>
        <h3 className="font-semibold text-slate-400 text-sm">AI PDF Import</h3>
        <p className="text-xs text-slate-600 mt-2">
          Upload any text or image-based PDF syllabus. The AI will translate it into sequential weeks, missions, and deliverables.
        </p>
      </div>
    </PageShell>
  );
}
