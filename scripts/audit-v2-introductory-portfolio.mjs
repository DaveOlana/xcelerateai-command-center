import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { curriculumCatalog } from '../src/curriculum-v2/catalog/catalog.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const portfolioRoot = path.join(root, 'XcelerateAI Curriculum System', 'v2', 'curricula', 'introductory-computer-science');
const guideRoot = path.join(root, 'public', 'curriculum-guides');
const readJson = (filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8'));
const manifest = readJson(path.join(portfolioRoot, 'portfolio-manifest.json'));
const historicalIds = ['QBAS', 'JAVA', 'CLNG', 'CPPL', 'JSIN', 'PYIN', 'WEBD'];
const activeIds = ['CLNG', 'CPPL', 'JAVA', 'JSIN', 'PYIN', 'WEBD'];
const withdrawnIds = ['QBAS'];

assert.equal(manifest.publicationPolicy, 'individually-reviewed-replacements-only');
assert.equal(manifest.historicalRevisions.length, 7);
assert.deepEqual(new Set(manifest.historicalRevisions.map((course) => course.curriculumId)), new Set(historicalIds));
assert.equal(manifest.activeCourses.length, 6);
assert.deepEqual(new Set(manifest.activeCourses.map((course) => course.curriculumId)), new Set(activeIds));

for (const course of manifest.historicalRevisions) {
  const artifactDirectory = path.join(root, course.artifactPath);
  const source = readJson(path.join(artifactDirectory, 'curriculum-source.json'));
  const runtime = readJson(path.join(artifactDirectory, 'curriculum.json'));
  assert.equal(source.curriculumId, course.curriculumId, `${course.curriculumId} R1 source retained`);
  assert.equal(source.revision, 1, `${course.curriculumId} historical source remains R1`);
  assert.equal(runtime.revision, 1, `${course.curriculumId} historical runtime remains R1`);
  assert.equal(fs.existsSync(path.join(artifactDirectory, 'content-integrity-audit.json')), true, `${course.curriculumId} audit retained`);
  assert.equal(fs.existsSync(path.join(guideRoot, `${course.slug}.html`)), false, `${course.curriculumId} public R1 guide removed`);
}

for (const active of manifest.activeCourses) {
  const activeDirectory = path.join(root, active.artifactPath);
  const activeSource = readJson(path.join(activeDirectory, 'curriculum-source.json'));
  const activeRuntime = readJson(path.join(activeDirectory, 'curriculum.json'));
  assert.equal(active.revision, 2, `${active.curriculumId} active revision`);
  assert.equal(activeSource.curriculumId, active.curriculumId, `${active.curriculumId} source ID`);
  assert.equal(activeSource.revision, 2, `${active.curriculumId} source revision`);
  assert.equal(activeRuntime.revision, 2, `${active.curriculumId} runtime revision`);
  assert.equal(activeSource.weeks.length, 8, `${active.curriculumId} eight-week contract`);
  assert.equal(curriculumCatalog.has(active.curriculumId), true, `${active.curriculumId} published`);
  assert.equal(curriculumCatalog.getLatest(active.curriculumId).revision, 2, `${active.curriculumId} catalog revision`);
}

withdrawnIds.forEach((curriculumId) => {
  assert.equal(curriculumCatalog.has(curriculumId), false, `${curriculumId} remains withdrawn`);
});

for (const filename of [
  'javascriptIntroduction.js',
  'javascriptProgrammingFoundations.js',
  'pythonIntroduction.js',
  'pythonProgrammingFoundations.js',
  'javaIntroduction.js',
  'javaProgrammingFoundations.js',
  'cIntroduction.js',
  'cppIntroduction.js',
  'cppProgrammingFoundations.js',
  'webDevelopmentIntroduction.js',
  'webDevelopmentFoundations.js',
]) {
  assert.equal(fs.existsSync(path.join(root, 'src', 'curriculum-v2', 'catalog', 'published', filename)), true, `${filename} retained`);
}

console.log('Introductory portfolio audit: seven R1 references retained; CLNG R2, CPPL R2, JAVA R2, JSIN R2, PYIN R2, and WEBD R2 are published; QBAS remains blocked and withdrawn.');
