import React from 'react';
import { Check, ExternalLink, Save } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import CopyTemplateButton from '../../components/common/CopyTemplateButton';
import { DetailDisclosure, WorkspaceEmptyState, WorkspaceSectionHeader } from '../../components/workspace/WorkspacePrimitives';
import { resolveTemplates } from '../../utils/templateUtils.js';

export default function ProjectsWorkbench() {
  const { roadmap, progress, toggleProjectMilestone, setProjectGithubLink, setProjectLiveDemoLink, setProjectNote } = useApp();
  const projects = roadmap?.projects || [];
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [drafts, setDrafts] = React.useState({});
  const [savedField, setSavedField] = React.useState('');
  const [fieldError, setFieldError] = React.useState({});
  const project = projects[selectedIndex] || projects[0];

  React.useEffect(() => {
    if (selectedIndex >= projects.length) setSelectedIndex(0);
  }, [projects.length, selectedIndex]);

  if (!project) {
    return (
      <div className="space-y-7">
        <WorkspaceSectionHeader title="Projects" description="What you are building and how far each build has progressed." />
        <WorkspaceEmptyState title="No portfolio projects yet" description="This course currently has no portfolio projects. Build work may still be available through Missions." />
      </div>
    );
  }

  const milestones = Array.isArray(project.milestones) ? project.milestones : [];
  const completed = progress.completedProjectMilestones?.[selectedIndex] || [];
  const nextIndex = milestones.findIndex((_, index) => !completed.includes(index));
  const percent = milestones.length ? Math.round((completed.length / milestones.length) * 100) : 0;
  const templates = resolveTemplates(project);
  const github = drafts.github ?? progress.projectGithubLinks?.[selectedIndex] ?? '';
  const demo = drafts.demo ?? progress.projectLiveDemoLinks?.[selectedIndex] ?? '';
  const note = drafts.note ?? progress.projectNotes?.[selectedIndex] ?? '';

  const selectProject = (index) => {
    setSelectedIndex(index);
    setDrafts({});
    setSavedField('');
    setFieldError({});
  };
  const save = (field) => {
    if (field === 'github' && github.trim() && !github.trim().startsWith('https://github.com/')) {
      setFieldError({ github: 'Repository link must start with https://github.com/.' });
      return;
    }
    if (field === 'demo' && demo.trim() && !/^https?:\/\//i.test(demo.trim())) {
      setFieldError({ demo: 'Live demo link must start with http:// or https://.' });
      return;
    }
    setFieldError({});
    if (field === 'github') setProjectGithubLink(selectedIndex, github);
    if (field === 'demo') setProjectLiveDemoLink(selectedIndex, demo);
    if (field === 'note') setProjectNote(selectedIndex, note);
    setSavedField(field);
    window.setTimeout(() => setSavedField(''), 2200);
  };

  return (
    <div className="space-y-7">
      <WorkspaceSectionHeader title="Projects" description="Choose a build, move its milestones forward, and keep the working details close by." />

      {projects.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Choose a project">
          {projects.map((item, index) => {
            const itemDone = progress.completedProjectMilestones?.[index] || [];
            const itemTotal = item.milestones?.length || 0;
            const selected = index === selectedIndex;
            return (
              <button key={item.id || index} type="button" aria-pressed={selected} onClick={() => selectProject(index)} className={`min-w-[210px] rounded-2xl border p-4 text-left transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet ${selected ? 'border-brand-violet/45 bg-brand-violet/10 shadow-primary-glow-sm' : 'border-border-default bg-bg-surface hover:border-border-strong'}`}>
                <span className="block truncate text-sm font-bold text-text-primary">{item.name || item.title || `Project ${index + 1}`}</span>
                <span className="mt-1 block text-xs text-text-muted">{itemDone.length} of {itemTotal} milestones</span>
              </button>
            );
          })}
        </div>
      )}

      <section className="overflow-hidden rounded-[1.75rem] border border-border-default bg-bg-surface shadow-card">
        <div className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold text-brand-violet">{percent === 100 ? 'Completed project' : completed.length ? 'In progress' : 'Ready to begin'}</p>
              <h2 className="mt-2 font-heading text-2xl font-extrabold text-text-primary sm:text-3xl">{project.name || project.title}</h2>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{project.description || 'No project description was supplied.'}</p>
              {nextIndex >= 0 && <p className="mt-4 text-sm text-text-primary"><span className="font-bold">Next milestone:</span> {milestones[nextIndex]?.title || milestones[nextIndex]}</p>}
            </div>
            <div className="w-full max-w-xs">
              <div className="flex items-center justify-between text-sm"><span className="font-semibold text-text-secondary">{completed.length} of {milestones.length} milestones</span><span className="font-mono font-bold text-text-primary">{percent}%</span></div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-bg-soft"><div className="h-full rounded-full bg-brand-violet transition-[width] duration-200 motion-reduce:transition-none" style={{ width: `${percent}%` }} /></div>
            </div>
          </div>

          <div className="mt-8 border-t border-border-divider pt-6">
            <h3 className="font-heading text-lg font-bold text-text-primary">Milestones</h3>
            {milestones.length ? (
              <div className="mt-3 divide-y divide-border-divider">
                {milestones.map((milestone, index) => {
                  const done = completed.includes(index);
                  const title = typeof milestone === 'string' ? milestone : milestone?.title || `Milestone ${index + 1}`;
                  return (
                    <button key={milestone?.id || index} type="button" aria-label={`${done ? 'Mark incomplete' : 'Mark complete'}: ${title}`} onClick={() => toggleProjectMilestone(selectedIndex, index)} className="flex w-full items-center gap-3 py-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-violet">
                      <span className={`flex h-5 w-5 flex-none items-center justify-center rounded-md border transition-all duration-200 ${done ? 'border-emerald-500 bg-emerald-500 text-white' : 'border-border-strong bg-bg-soft'}`}>{done && <Check className="h-3.5 w-3.5" />}</span>
                      <span className={`text-sm ${done ? 'text-text-muted line-through' : 'font-semibold text-text-primary'}`}>{title}</span>
                    </button>
                  );
                })}
              </div>
            ) : <p className="mt-3 text-sm text-text-muted">No milestones were supplied for this project.</p>}
          </div>

          <div className="mt-4">
            <DetailDisclosure title="Repository and live demo" summary={github || demo ? 'Links recorded' : 'Add links'}>
              <div className="grid gap-4 md:grid-cols-2">
                {[{ field: 'github', label: 'Repository', value: github, placeholder: 'https://github.com/username/project' }, { field: 'demo', label: 'Live demo', value: demo, placeholder: 'https://example.com' }].map((item) => (
                  <label key={item.field} className="block text-sm font-bold text-text-primary">{item.label}
                    <div className="mt-2 flex gap-2">
                      <input type="url" value={item.value} onChange={(event) => setDrafts((current) => ({ ...current, [item.field]: event.target.value }))} placeholder={item.placeholder} className="input-base min-w-0 flex-1 font-mono text-xs" />
                      <button type="button" onClick={() => save(item.field)} className="btn-secondary min-h-10 px-3 text-xs"><Save className="h-4 w-4" /><span className="sr-only">Save {item.label}</span></button>
                      {item.value && <a href={item.value} target="_blank" rel="noopener noreferrer" aria-label={`Open ${item.label}`} className="btn-secondary flex min-h-10 items-center px-3"><ExternalLink className="h-4 w-4" /></a>}
                    </div>
                    {savedField === item.field && <span className="mt-1 block text-xs text-emerald-500" role="status">Saved</span>}
                    {fieldError[item.field] && <span className="mt-1 block text-xs text-red-500" role="alert">{fieldError[item.field]}</span>}
                  </label>
                ))}
              </div>
            </DetailDisclosure>

            <DetailDisclosure title="Project notes" summary={note ? 'Notes recorded' : 'Add working notes'}>
              <textarea rows={5} value={note} onChange={(event) => setDrafts((current) => ({ ...current, note: event.target.value }))} placeholder="Capture technical choices, packages, or decisions..." className="input-base w-full resize-y text-sm" />
              <button type="button" onClick={() => save('note')} className="btn-secondary mt-3 px-4 py-2 text-xs">Save project notes</button>
              {savedField === 'note' && <span className="ml-3 text-xs text-emerald-500" role="status">Saved</span>}
            </DetailDisclosure>

            {templates.length > 0 && (
              <DetailDisclosure title="Starter templates" summary={`${templates.length} available`}>
                <div className="space-y-3">{templates.map((template) => <CopyTemplateButton key={template.id} template={template} />)}</div>
              </DetailDisclosure>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
