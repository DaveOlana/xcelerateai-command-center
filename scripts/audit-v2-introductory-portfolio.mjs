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
const curriculumIds = ['QBAS', 'JAVA', 'CLNG', 'CPPL', 'JSIN', 'PYIN', 'WEBD'];
const historicalModules = [
  'pythonIntroduction.js',
  'javascriptIntroduction.js',
  'javaIntroduction.js',
  'cIntroduction.js',
  'cppIntroduction.js',
  'webDevelopmentIntroduction.js',
];

assert.equal(manifest.courses.length, 7);
assert.deepEqual(new Set(manifest.courses.map((course) => course.curriculumId)), new Set(curriculumIds));

for (const course of manifest.courses) {
  const artifactDirectory = path.join(root, course.artifactPath);
  assert.equal(fs.existsSync(path.join(artifactDirectory, 'curriculum-source.json')), true, `${course.curriculumId} source retained`);
  assert.equal(fs.existsSync(path.join(artifactDirectory, 'curriculum.json')), true, `${course.curriculumId} runtime retained`);
  assert.equal(fs.existsSync(path.join(artifactDirectory, 'content-integrity-audit.json')), true, `${course.curriculumId} audit retained`);
  assert.equal(curriculumCatalog.has(course.curriculumId), false, `${course.curriculumId} absent from production catalog`);
  assert.equal(fs.existsSync(path.join(guideRoot, `${course.slug}.html`)), false, `${course.curriculumId} public guide removed`);
}

for (const filename of historicalModules) {
  assert.equal(
    fs.existsSync(path.join(root, 'src', 'curriculum-v2', 'catalog', 'published', filename)),
    true,
    `${filename} historical runtime retained`,
  );
}

console.log('Introductory portfolio containment audit: seven R1 artifacts retained; no introductory curriculum or guide is published.');
