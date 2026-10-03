import assert from 'node:assert/strict';
import test from 'node:test';
import fs from 'node:fs';
import { validateLearnerExperience } from './validateLearnerExperience.js';
import { validateStudioActivities } from './validateStudioActivities.js';

const make = ({ providers = ['Independent'], destinationType = 'direct', consume = 'Read the section Product design roles.', deterministicPath, focusVendor = 'Figma', output = 'One named mobile login screen', proof = true } = {}) => {
  const resources = providers.map((provider, index) => ({ id: `R${index + 1}`, provider }));
  const assignments = resources.map((resource, index) => ({ resourceId: resource.id, role: 'core', learningRole: index ? 'practice' : 'learn' }));
  const source = { curriculumId: 'TEST', resources, weeks: [{ id: 'W1', study: { resources: assignments }, builds: [{ id: 'B1', required: true, learnerGuide: { finishedResult: output } }], proof: { evidence: proof ? [{ label: 'Submit a screenshot.' }] : [] } }] };
  const audit = { focusVendor: focusVendor ? { name: focusVendor } : undefined, resourceAudits: resources.map((resource) => ({ resourceId: resource.id, learnerAssignment: { destinationType, deterministicPath, start: 'Start at the first heading.', consume, stop: 'Stop after the worked example.', accountRequirement: 'No account is required.', expectedOutcome: 'Explain the idea and complete the example.', nextAction: 'Open the Studio activity.' } })) };
  return { source, audit };
};

test('one focus-vendor Study card passes', () => assert.equal(validateLearnerExperience(make({ providers: ['Figma', 'Independent'] }).audit, make({ providers: ['Figma', 'Independent'] }).source).status, 'PASS'));
test('two focus-vendor Study cards fail', () => { const x = make({ providers: ['Figma', 'Figma'] }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'FAIL'); });
test('focus-vendor contextual links outside Study do not count', () => { const x = make(); x.source.weeks[0].builds[0].steps = [{ text: 'Use https://figma.com/help here.' }]; assert.equal(validateLearnerExperience(x.audit, x.source).status, 'PASS'); });
test('no focus vendor disables the cap', () => { const x = make({ providers: ['Figma', 'Figma'], focusVendor: '' }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'PASS'); });
test('direct resource with bounded section passes', () => { const x = make(); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'PASS'); });
test('vague Core hub fails', () => { const x = make({ destinationType: 'hub' }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'FAIL'); });
test('hub with deterministic path passes', () => { const x = make({ destinationType: 'hub', deterministicPath: 'Select Learn, then Frames, then Introduction.' }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'PASS'); });
test('relevance judgment wording fails', () => { const x = make({ consume: 'Read the relevant sections.' }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'FAIL'); });
test('concrete Studio output passes', () => { const x = make(); const studio = { activities: [{ weekId: 'W1', contract: { doing: 'Recreate a login screen.', why: 'Practice hierarchy.', output: 'One mobile login screen', tools: 'Figma Starter', estimatedMinutes: 45, prerequisites: 'Basic computer use.', finished: 'A frame with heading, fields, and button.', submission: 'One PNG screenshot.' }, steps: ['Create a file.'], checklist: ['The screen has one frame.'], stuck: 'Use the supplied example.', prerequisiteReview: { unresolvedTerms: [] } }] }; assert.equal(validateStudioActivities(studio, x.source).status, 'PASS'); });
test('vague Studio artifact fails', () => { const x = make(); const studio = { activities: [{ weekId: 'W1', contract: { doing: 'Design.', why: 'Practice.', output: 'an artifact', tools: 'Figma', estimatedMinutes: 45, prerequisites: 'None.', finished: 'Done.', submission: 'Link.' }, steps: ['Work.'], checklist: ['Done.'], stuck: 'Review.' }] }; assert.equal(validateStudioActivities(studio, x.source).status, 'FAIL'); });
test('Build without concrete output fails', () => { const x = make({ output: 'professional evidence' }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'FAIL'); });
test('practical work without proof fails', () => { const x = make({ proof: false }); assert.equal(validateLearnerExperience(x.audit, x.source).status, 'FAIL'); });
test('generated Studio selects one requested Week instead of rendering the workbook', () => {
  const html = fs.readFileSync(new URL('../../../public/curriculum/product-design-studio.html', import.meta.url), 'utf8');
  assert.match(html, /const activity=activities\.find/);
  assert.match(html, /document\.querySelector\('#studio'\)\.innerHTML/);
  assert.doesNotMatch(html, /activities\.map\([^)]*=>[^;]*innerHTML/);
  assert.doesNotMatch(html, /<section[^>]+data-week=/);
});
