import test from 'node:test';
import assert from 'node:assert/strict';
import { defaultTemplates } from '../config/defaultTemplates.js';
import { normalizeRoadmap, normalizeProject } from './normalizeRoadmap.js';
import { validateRoadmapJSON } from './jsonValidator.js';
import {
  getTemplateValidationErrors,
  requiresReadmeScaffold,
  resolveTemplates,
  writeTemplateToClipboard,
} from './templateUtils.js';

const customReadme = { id: 'readme', label: 'Custom README.md', content: '# Custom\n' };
const envTemplate = { id: 'env-example', label: '.env.example', content: 'API_URL=\n' };

function roadmapWith(entity, location = 'mission') {
  const week = { weekNumber: 1, title: 'Build week', practicalMissions: [] };
  const roadmap = { title: 'Template fixture', months: [{ monthNumber: 1, title: 'Month 1', weeks: [week] }] };
  if (location === 'mission') week.practicalMissions.push({ missionId: 'mission-1', title: 'Build', ...entity });
  if (location === 'week') Object.assign(week, entity);
  if (location === 'project') roadmap.projects = [{ id: 'project-1', title: 'Project', milestones: [], ...entity }];
  return roadmap;
}

test('README fallback is conservative and explicit', () => {
  assert.deepEqual(resolveTemplates({ description: 'Write useful documentation for this work.' }), []);
  assert.equal(requiresReadmeScaffold({ filesToCreate: ['src/index.js', 'README.md'] }), true);
  assert.equal(requiresReadmeScaffold({ readmePrompt: 'Explain how to run the project.' }), true);
  assert.equal(resolveTemplates({ filesToCreate: ['README.md'] })[0].content, defaultTemplates.readme.content);
});

test('custom README overrides fallback without duplication', () => {
  const resolved = resolveTemplates({ filesToCreate: ['README.md'], templates: [customReadme] });
  assert.deepEqual(resolved, [customReadme]);
});

test('generic templates resolve alongside a custom README', () => {
  assert.deepEqual(resolveTemplates({ templates: [customReadme, envTemplate] }), [customReadme, envTemplate]);
  assert.deepEqual(resolveTemplates({ templates: [envTemplate] }), [envTemplate]);
});

test('template validation accepts omission and unique templates', () => {
  assert.deepEqual(getTemplateValidationErrors(undefined), []);
  assert.deepEqual(getTemplateValidationErrors([customReadme]), []);
  assert.deepEqual(getTemplateValidationErrors([customReadme, envTemplate]), []);
});

test('template validation rejects malformed structures and duplicate IDs', () => {
  assert.equal(getTemplateValidationErrors({}).some((error) => error.includes('array')), true);
  assert.equal(getTemplateValidationErrors([customReadme, { ...customReadme }]).some((error) => error.includes('duplicate')), true);
  for (const entry of [
    { id: '', label: 'Label', content: 'Content' },
    { id: 'id', label: '', content: 'Content' },
    { id: 'id', label: 'Label', content: '' },
  ]) {
    assert.equal(getTemplateValidationErrors([entry]).length > 0, true);
  }
});

test('curriculum validator conditionally validates authored templates', () => {
  assert.equal(validateRoadmapJSON(roadmapWith({})).valid, true);
  assert.equal(validateRoadmapJSON(roadmapWith({ templates: [customReadme] })).valid, true);
  assert.equal(validateRoadmapJSON(roadmapWith({ templates: [customReadme, envTemplate] })).valid, true);
  assert.equal(validateRoadmapJSON(roadmapWith({ templates: 'invalid' })).valid, false);
  assert.equal(validateRoadmapJSON(roadmapWith({ templates: [customReadme, customReadme] })).valid, false);
  for (const entry of [
    { id: '', label: 'Label', content: 'Content' },
    { id: 'id', label: '', content: 'Content' },
    { id: 'id', label: 'Label', content: '' },
  ]) {
    assert.equal(validateRoadmapJSON(roadmapWith({ templates: [entry] })).valid, false);
  }
});

test('templates survive mission, project, and week normalization without mutating input', () => {
  const input = roadmapWith({ templates: [customReadme], legacyField: 'preserved' });
  input.projects = [{ id: 'project-1', title: 'Project', milestones: ['Start'], templates: [envTemplate], filesToCreate: ['README.md'] }];
  input.months[0].weeks[0].templates = [envTemplate];
  const before = structuredClone(input);
  const normalized = normalizeRoadmap(input);
  assert.deepEqual(normalized.weeks[0].practicalMissions[0].templates, [customReadme]);
  assert.equal(normalized.weeks[0].practicalMissions[0].legacyField, 'preserved');
  assert.deepEqual(normalized.projects[0].templates, [envTemplate]);
  assert.deepEqual(normalized.weeks[0].templates, [envTemplate]);
  assert.deepEqual(input, before);
  assert.deepEqual(normalizeProject({ title: 'No templates' }, 0).templates, []);
});

test('clipboard helper preserves exact content and reports failure', async () => {
  let copied = null;
  const success = await writeTemplateToClipboard('# Exact\n\nText\n', { writeText: async (content) => { copied = content; } });
  assert.equal(success.ok, true);
  assert.equal(copied, '# Exact\n\nText\n');
  const rejected = await writeTemplateToClipboard('Text', { writeText: async () => { throw new Error('Denied'); } });
  assert.equal(rejected.ok, false);
  assert.match(rejected.error, /Denied/);
  assert.equal((await writeTemplateToClipboard('Text', null)).ok, false);
});
